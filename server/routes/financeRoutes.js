import {Router} from 'express';
import mongoose from 'mongoose';
import FinanceAccount from '../models/FinanceAccount.js';
import LedgerEntry from '../models/LedgerEntry.js';
import Expense from '../models/Expense.js';
import Advance from '../models/Advance.js';
import User from '../models/User.js';
import {authorize} from '../middleware/authorize.js';
import {nextDocumentNumber} from '../utils/numbering.js';
import {recordAudit} from '../utils/audit.js';

const router=Router();
const text=(value,max=1000)=>String(value??'').trim().slice(0,max);
const positive=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;
const round=value=>Number(Number(value||0).toFixed(2));
const financeRoles=authorize('Director','Admin','Accounts');
const approvalRoles=authorize('Director','Admin');
router.use(financeRoles);

const defaultAccounts=[
  ['1000','Cash in Hand','Cash'],['1010','Main Bank Account','Bank'],['1100','Accounts Receivable','Asset'],
  ['1200','Inventory','Asset'],['1300','Supplier Advances','Asset'],['1310','Employee Advances','Asset'],
  ['1320','Tender and Project Advances','Asset'],['1330','Security Deposits','Asset'],['2000','Accounts Payable','Liability'],
  ['2100','Sales Tax Payable','Tax'],['4000','Sales Revenue','Income'],['5000','Cost of Goods Sold','Expense'],
  ['6000','General Expenses','Expense'],['6010','Freight and Delivery','Expense'],['6020','Tender Expenses','Expense'],
  ['6030','Travel and Fuel','Expense'],['6040','Utilities','Expense'],['6050','Salaries and Wages','Expense'],
  ['6060','Bank Charges','Expense']
];

let defaultAccountsPromise;
async function ensureDefaultAccounts(userId){
  if(!defaultAccountsPromise)defaultAccountsPromise=Promise.all(defaultAccounts.map(([code,name,type])=>FinanceAccount.updateOne(
    {code},{$setOnInsert:{code,name,type,isSystem:true,isActive:true,createdBy:userId}},{upsert:true}
  ))).catch(error=>{if(error.code===11000)return;defaultAccountsPromise=null;throw error});
  return defaultAccountsPromise;
}

async function accountMap(ids){
  const unique=[...new Set(ids.filter(Boolean).map(String))];
  if(unique.some(id=>!mongoose.isValidObjectId(id)))throw Object.assign(new Error('A selected finance account is invalid.'),{status:400});
  const accounts=await FinanceAccount.find({_id:{$in:unique},isActive:true});
  if(accounts.length!==unique.length)throw Object.assign(new Error('One or more selected finance accounts are unavailable.'),{status:400});
  return new Map(accounts.map(account=>[String(account._id),account]));
}

async function requireAccountType(id,types,label){
  const accounts=await accountMap([id]);const account=accounts.get(String(id));
  if(types&&!types.includes(account.type))throw Object.assign(new Error(`${label} must be ${types.join(' or ')} account.`),{status:400});
  return account;
}

export function calculateLedgerAmounts(rawLines=[]){
  const source=Array.isArray(rawLines)?rawLines:[];
  const lines=source.map(raw=>{
    const debit=round(positive(raw.debit));const credit=round(positive(raw.credit));
    if((debit>0)===(credit>0))throw Object.assign(new Error('Each ledger line must contain either a debit or a credit amount.'),{status:400});
    return {...raw,debit,credit};
  });
  if(lines.length<2)throw Object.assign(new Error('At least two ledger lines are required.'),{status:400});
  const totalDebit=round(lines.reduce((sum,line)=>sum+line.debit,0));
  const totalCredit=round(lines.reduce((sum,line)=>sum+line.credit,0));
  if(totalDebit<=0||Math.abs(totalDebit-totalCredit)>.009)throw Object.assign(new Error('Ledger entry is not balanced. Total debit must equal total credit.'),{status:400});
  return {lines,totalDebit,totalCredit};
}

export async function normaliseLedgerLines(rawLines=[]){
  const calculated=calculateLedgerAmounts(rawLines);
  const accounts=await accountMap(calculated.lines.map(line=>line.account));
  return {...calculated,lines:calculated.lines.map(raw=>{const account=accounts.get(String(raw.account));return {account:account._id,accountCode:account.code,accountName:account.name,description:text(raw.description,500),debit:raw.debit,credit:raw.credit}})};
}

async function createPostedEntry({req,voucherType,postingDate,partyName,reference,narration,lines,sourceType,sourceId}){
  const normalised=await normaliseLedgerLines(lines);
  const voucherNumber=await nextDocumentNumber(LedgerEntry,'ledger-voucher','SG-VCH','voucherNumber');
  const entry=await LedgerEntry.create({voucherNumber,voucherType,postingDate:postingDate||new Date(),partyName:text(partyName,240),reference:text(reference,160),narration:text(narration,1200),...normalised,status:'Posted',sourceType,sourceId,createdBy:req.user._id,approvedBy:req.user._id,approvedAt:new Date()});
  await recordAudit(req,'POST','LedgerEntry',entry._id,['status','lines']);
  return entry;
}

async function assertApprover(req,record){
  if(String(record.createdBy)!==String(req.user._id)||req.user.role==='Director')return;
  const anotherApprover=await User.exists({_id:{$ne:req.user._id},role:{$in:['Director','Admin']},isActive:true});
  if(anotherApprover)throw Object.assign(new Error('A different Admin or Director must approve this record.'),{status:403});
}

function expensePayload(body){
  const amount=round(positive(body.amount));const taxAmount=Math.min(amount,round(positive(body.taxAmount)));
  if(amount<=0)throw Object.assign(new Error('Expense amount must be greater than zero.'),{status:400});
  return {expenseDate:body.expenseDate||new Date(),payee:text(body.payee,240),category:text(body.category,120),description:text(body.description,1200),amount,taxAmount,expenseAccount:body.expenseAccount||null,paidFromAccount:body.paidFromAccount||null,paymentMethod:['Cash','Bank Transfer','Cheque','Card','Other'].includes(body.paymentMethod)?body.paymentMethod:'Cash',reference:text(body.reference,160),projectReference:text(body.projectReference,160),receiptUrl:text(body.receiptUrl,1000),notes:text(body.notes,2000)};
}

function advancePayload(body){
  const amount=round(positive(body.amount));
  if(amount<=0)throw Object.assign(new Error('Advance amount must be greater than zero.'),{status:400});
  const types=['Supplier','Employee','Tender / Project','Travel','Security Deposit','Other'];
  return {advanceDate:body.advanceDate||new Date(),advanceType:types.includes(body.advanceType)?body.advanceType:'Other',recipientName:text(body.recipientName,240),purpose:text(body.purpose,1200),amount,paidFromAccount:body.paidFromAccount||null,advanceAccount:body.advanceAccount||null,paymentMethod:['Cash','Bank Transfer','Cheque','Card','Other'].includes(body.paymentMethod)?body.paymentMethod:'Cash',reference:text(body.reference,160),projectReference:text(body.projectReference,160),expectedSettlementDate:body.expectedSettlementDate||null,notes:text(body.notes,2000),outstandingAmount:amount};
}

export function deriveAdvanceStatus(amount,adjusted,refunded){
  const remaining=round(Math.max(0,positive(amount)-positive(adjusted)-positive(refunded)));
  if(remaining>0&&remaining<positive(amount))return {status:'Partially Settled',outstandingAmount:remaining};
  if(remaining===0&&positive(refunded)>=positive(amount))return {status:'Refunded',outstandingAmount:0};
  if(remaining===0)return {status:'Settled',outstandingAmount:0};
  return {status:'Paid',outstandingAmount:remaining};
}

async function balanceReport(){
  const [accounts,posted]=await Promise.all([FinanceAccount.find({isActive:true}).sort({code:1}).lean(),LedgerEntry.find({status:'Posted'},'lines').lean()]);
  const movements=new Map();
  for(const entry of posted)for(const line of entry.lines){const key=String(line.account);const current=movements.get(key)||{debit:0,credit:0};current.debit+=line.debit||0;current.credit+=line.credit||0;movements.set(key,current)}
  return accounts.map(account=>{const movement=movements.get(String(account._id))||{debit:0,credit:0};const opening=account.openingSide==='Credit'?-account.openingBalance:account.openingBalance;return {...account,totalDebit:round(movement.debit),totalCredit:round(movement.credit),balance:round(opening+movement.debit-movement.credit)}});
}

router.get('/summary',async(req,res,next)=>{try{
  await ensureDefaultAccounts(req.user._id);
  const start=new Date();start.setDate(1);start.setHours(0,0,0,0);
  const [accounts,expenses,advances,pendingExpenses,pendingAdvances,recentEntries]=await Promise.all([
    balanceReport(),Expense.aggregate([{$match:{status:'Paid',expenseDate:{$gte:start}}},{$group:{_id:null,total:{$sum:'$amount'}}}]),
    Advance.aggregate([{$match:{status:{$in:['Paid','Partially Settled']}}},{$group:{_id:null,total:{$sum:'$outstandingAmount'}}}]),
    Expense.countDocuments({status:'Submitted'}),Advance.countDocuments({status:'Submitted'}),
    LedgerEntry.find({status:'Posted'}).sort({postingDate:-1,createdAt:-1}).limit(8).lean()
  ]);
  const liquid=accounts.filter(account=>['Cash','Bank'].includes(account.type)).reduce((sum,account)=>sum+account.balance,0);
  res.json({liquidBalance:round(liquid),monthlyExpenses:round(expenses[0]?.total||0),outstandingAdvances:round(advances[0]?.total||0),pendingApprovals:pendingExpenses+pendingAdvances,accounts:accounts.filter(account=>['Cash','Bank'].includes(account.type)),recentEntries});
}catch(error){next(error)}});

router.get('/accounts',async(req,res,next)=>{try{await ensureDefaultAccounts(req.user._id);res.json(await balanceReport())}catch(error){next(error)}});
router.post('/accounts',approvalRoles,async(req,res,next)=>{try{
  const types=['Cash','Bank','Asset','Liability','Equity','Income','Expense','Tax'];
  const account=await FinanceAccount.create({code:text(req.body.code,30),name:text(req.body.name,160),type:types.includes(req.body.type)?req.body.type:'Expense',description:text(req.body.description,500),openingBalance:round(positive(req.body.openingBalance)),openingSide:req.body.openingSide==='Credit'?'Credit':'Debit',createdBy:req.user._id});
  await recordAudit(req,'CREATE','FinanceAccount',account._id,Object.keys(req.body));res.status(201).json(account);
}catch(error){next(error)}});

router.get('/ledger',async(req,res,next)=>{try{
  const filter={};if(req.query.status)filter.status=req.query.status;if(req.query.account&&mongoose.isValidObjectId(req.query.account))filter['lines.account']=req.query.account;
  if(req.query.from||req.query.to){filter.postingDate={};if(req.query.from)filter.postingDate.$gte=new Date(req.query.from);if(req.query.to){const end=new Date(req.query.to);end.setHours(23,59,59,999);filter.postingDate.$lte=end}}
  res.json(await LedgerEntry.find(filter).sort({postingDate:-1,createdAt:-1}).limit(500).lean());
}catch(error){next(error)}});
router.post('/ledger',async(req,res,next)=>{try{
  const normalised=await normaliseLedgerLines(req.body.lines);const voucherNumber=await nextDocumentNumber(LedgerEntry,'ledger-voucher','SG-VCH','voucherNumber');
  const entry=await LedgerEntry.create({voucherNumber,voucherType:req.body.voucherType||'Journal',postingDate:req.body.postingDate||new Date(),partyName:text(req.body.partyName,240),reference:text(req.body.reference,160),narration:text(req.body.narration,1200),...normalised,status:'Draft',createdBy:req.user._id});
  await recordAudit(req,'CREATE','LedgerEntry',entry._id,Object.keys(req.body));res.status(201).json(entry);
}catch(error){next(error)}});
router.post('/ledger/:id/submit',async(req,res,next)=>{try{const entry=await LedgerEntry.findById(req.params.id);if(!entry)return res.status(404).json({message:'Ledger entry not found.'});if(entry.status!=='Draft')return res.status(409).json({message:'Only a draft entry can be submitted.'});entry.status='Submitted';entry.submittedBy=req.user._id;entry.submittedAt=new Date();await entry.save();await recordAudit(req,'SUBMIT','LedgerEntry',entry._id,['status']);res.json(entry)}catch(error){next(error)}});
router.post('/ledger/:id/approve',approvalRoles,async(req,res,next)=>{try{const entry=await LedgerEntry.findById(req.params.id);if(!entry)return res.status(404).json({message:'Ledger entry not found.'});if(entry.status!=='Submitted')return res.status(409).json({message:'Only a submitted entry can be posted.'});await assertApprover(req,entry);entry.status='Posted';entry.approvedBy=req.user._id;entry.approvedAt=new Date();await entry.save();await recordAudit(req,'APPROVE','LedgerEntry',entry._id,['status']);res.json(entry)}catch(error){next(error)}});
router.post('/ledger/:id/reverse',approvalRoles,async(req,res,next)=>{try{
  const original=await LedgerEntry.findById(req.params.id);if(!original)return res.status(404).json({message:'Ledger entry not found.'});if(original.status!=='Posted')return res.status(409).json({message:'Only a posted entry can be reversed.'});
  const reversal=await createPostedEntry({req,voucherType:'Reversal',postingDate:req.body.postingDate,partyName:original.partyName,reference:original.voucherNumber,narration:text(req.body.reason,700)||`Reversal of ${original.voucherNumber}`,lines:original.lines.map(line=>({account:line.account,debit:line.credit,credit:line.debit,description:`Reversal: ${line.description||original.narration}`})),sourceType:'LedgerReversal',sourceId:original._id});
  reversal.reversalOf=original._id;await reversal.save();original.status='Reversed';original.reversalEntry=reversal._id;await original.save();await recordAudit(req,'REVERSE','LedgerEntry',original._id,['status','reversalEntry']);res.status(201).json({original,reversal});
}catch(error){next(error)}});

router.get('/expenses',async(req,res,next)=>{try{res.json(await Expense.find().populate('expenseAccount paidFromAccount','code name type').sort({expenseDate:-1,createdAt:-1}).limit(500).lean())}catch(error){next(error)}});
router.post('/expenses',async(req,res,next)=>{try{const expenseNumber=await nextDocumentNumber(Expense,'expense','SG-EXP','expenseNumber');const expense=await Expense.create({...expensePayload(req.body),expenseNumber,createdBy:req.user._id});await recordAudit(req,'CREATE','Expense',expense._id,Object.keys(req.body));res.status(201).json(expense)}catch(error){next(error)}});
router.put('/expenses/:id',async(req,res,next)=>{try{const expense=await Expense.findById(req.params.id);if(!expense)return res.status(404).json({message:'Expense not found.'});if(expense.status!=='Draft')return res.status(409).json({message:'Only a draft expense can be edited.'});Object.assign(expense,expensePayload(req.body));await expense.save();await recordAudit(req,'UPDATE','Expense',expense._id,Object.keys(req.body));res.json(expense)}catch(error){next(error)}});
router.post('/expenses/:id/submit',async(req,res,next)=>{try{const expense=await Expense.findById(req.params.id);if(!expense)return res.status(404).json({message:'Expense not found.'});if(expense.status!=='Draft')return res.status(409).json({message:'Only a draft expense can be submitted.'});expense.status='Submitted';expense.submittedBy=req.user._id;expense.submittedAt=new Date();await expense.save();await recordAudit(req,'SUBMIT','Expense',expense._id,['status']);res.json(expense)}catch(error){next(error)}});
router.post('/expenses/:id/approve',approvalRoles,async(req,res,next)=>{try{const expense=await Expense.findById(req.params.id);if(!expense)return res.status(404).json({message:'Expense not found.'});if(expense.status!=='Submitted')return res.status(409).json({message:'Only a submitted expense can be approved.'});await assertApprover(req,expense);expense.status='Approved';expense.approvedBy=req.user._id;expense.approvedAt=new Date();await expense.save();await recordAudit(req,'APPROVE','Expense',expense._id,['status']);res.json(expense)}catch(error){next(error)}});
router.post('/expenses/:id/pay',async(req,res,next)=>{try{
  const expense=await Expense.findById(req.params.id);if(!expense)return res.status(404).json({message:'Expense not found.'});if(expense.status!=='Approved')return res.status(409).json({message:'Only an approved expense can be paid.'});
  await ensureDefaultAccounts(req.user._id);const defaultExpense=await FinanceAccount.findOne({code:'6000'});const expenseAccount=req.body.expenseAccount||expense.expenseAccount||defaultExpense?._id;const paidFrom=req.body.paidFromAccount||expense.paidFromAccount;if(!paidFrom)return res.status(400).json({message:'Select the cash or bank account used for payment.'});
  await requireAccountType(expenseAccount,['Expense'],'Expense account');await requireAccountType(paidFrom,['Cash','Bank'],'Payment account');
  const entry=await createPostedEntry({req,voucherType:'Expense',postingDate:req.body.paymentDate||expense.expenseDate,partyName:expense.payee,reference:expense.reference||expense.expenseNumber,narration:`${expense.category}: ${expense.description}`,lines:[{account:expenseAccount,debit:expense.amount,credit:0},{account:paidFrom,debit:0,credit:expense.amount}],sourceType:'Expense',sourceId:expense._id});
  expense.status='Paid';expense.expenseAccount=expenseAccount;expense.paidFromAccount=paidFrom;expense.ledgerEntry=entry._id;expense.paidBy=req.user._id;expense.paidAt=new Date();await expense.save();await recordAudit(req,'PAY','Expense',expense._id,['status','ledgerEntry']);res.json(expense);
}catch(error){next(error)}});

router.get('/advances',async(req,res,next)=>{try{res.json(await Advance.find().populate('advanceAccount paidFromAccount settlements.account','code name type').sort({advanceDate:-1,createdAt:-1}).limit(500).lean())}catch(error){next(error)}});
router.post('/advances',async(req,res,next)=>{try{const advanceNumber=await nextDocumentNumber(Advance,'advance','SG-ADV','advanceNumber');const advance=await Advance.create({...advancePayload(req.body),advanceNumber,createdBy:req.user._id});await recordAudit(req,'CREATE','Advance',advance._id,Object.keys(req.body));res.status(201).json(advance)}catch(error){next(error)}});
router.put('/advances/:id',async(req,res,next)=>{try{const advance=await Advance.findById(req.params.id);if(!advance)return res.status(404).json({message:'Advance not found.'});if(advance.status!=='Draft')return res.status(409).json({message:'Only a draft advance can be edited.'});Object.assign(advance,advancePayload(req.body));await advance.save();await recordAudit(req,'UPDATE','Advance',advance._id,Object.keys(req.body));res.json(advance)}catch(error){next(error)}});
router.post('/advances/:id/submit',async(req,res,next)=>{try{const advance=await Advance.findById(req.params.id);if(!advance)return res.status(404).json({message:'Advance not found.'});if(advance.status!=='Draft')return res.status(409).json({message:'Only a draft advance can be submitted.'});advance.status='Submitted';advance.submittedBy=req.user._id;advance.submittedAt=new Date();await advance.save();await recordAudit(req,'SUBMIT','Advance',advance._id,['status']);res.json(advance)}catch(error){next(error)}});
router.post('/advances/:id/approve',approvalRoles,async(req,res,next)=>{try{const advance=await Advance.findById(req.params.id);if(!advance)return res.status(404).json({message:'Advance not found.'});if(advance.status!=='Submitted')return res.status(409).json({message:'Only a submitted advance can be approved.'});await assertApprover(req,advance);advance.status='Approved';advance.approvedBy=req.user._id;advance.approvedAt=new Date();await advance.save();await recordAudit(req,'APPROVE','Advance',advance._id,['status']);res.json(advance)}catch(error){next(error)}});
router.post('/advances/:id/pay',async(req,res,next)=>{try{
  const advance=await Advance.findById(req.params.id);if(!advance)return res.status(404).json({message:'Advance not found.'});if(advance.status!=='Approved')return res.status(409).json({message:'Only an approved advance can be paid.'});await ensureDefaultAccounts(req.user._id);
  const accountCode=advance.advanceType==='Employee'||advance.advanceType==='Travel'?'1310':advance.advanceType==='Tender / Project'?'1320':advance.advanceType==='Security Deposit'?'1330':'1300';const defaultAdvance=await FinanceAccount.findOne({code:accountCode});const advanceAccount=req.body.advanceAccount||advance.advanceAccount||defaultAdvance?._id;const paidFrom=req.body.paidFromAccount||advance.paidFromAccount;if(!paidFrom)return res.status(400).json({message:'Select the cash or bank account used for this advance.'});
  await requireAccountType(advanceAccount,['Asset'],'Advance account');await requireAccountType(paidFrom,['Cash','Bank'],'Payment account');
  const entry=await createPostedEntry({req,voucherType:'Advance Payment',postingDate:req.body.paymentDate||advance.advanceDate,partyName:advance.recipientName,reference:advance.reference||advance.advanceNumber,narration:`${advance.advanceType} advance: ${advance.purpose}`,lines:[{account:advanceAccount,debit:advance.amount,credit:0},{account:paidFrom,debit:0,credit:advance.amount}],sourceType:'Advance',sourceId:advance._id});
  advance.status='Paid';advance.advanceAccount=advanceAccount;advance.paidFromAccount=paidFrom;advance.paymentLedgerEntry=entry._id;advance.outstandingAmount=advance.amount;advance.paidBy=req.user._id;advance.paidAt=new Date();await advance.save();await recordAudit(req,'PAY','Advance',advance._id,['status','paymentLedgerEntry']);res.json(advance);
}catch(error){next(error)}});
router.post('/advances/:id/settlements',async(req,res,next)=>{try{
  const advance=await Advance.findById(req.params.id);if(!advance)return res.status(404).json({message:'Advance not found.'});if(!['Paid','Partially Settled'].includes(advance.status))return res.status(409).json({message:'This advance is not available for settlement.'});const amount=round(positive(req.body.amount));if(amount<=0||amount>advance.outstandingAmount+.009)return res.status(400).json({message:'Settlement amount must be within the outstanding advance balance.'});const type=req.body.type==='Refund'?'Refund':'Adjustment';const account=req.body.account;if(!account)return res.status(400).json({message:'Select the settlement or receiving account.'});
  await requireAccountType(account,type==='Refund'?['Cash','Bank']:null,type==='Refund'?'Refund account':'Settlement account');
  const entry=await createPostedEntry({req,voucherType:type==='Refund'?'Advance Refund':'Advance Settlement',postingDate:req.body.settlementDate,partyName:advance.recipientName,reference:text(req.body.reference,160)||advance.advanceNumber,narration:text(req.body.notes,1000)||`${type} against ${advance.advanceNumber}`,lines:type==='Refund'?[{account,debit:amount,credit:0},{account:advance.advanceAccount,debit:0,credit:amount}]:[{account,debit:amount,credit:0},{account:advance.advanceAccount,debit:0,credit:amount}],sourceType:'AdvanceSettlement',sourceId:advance._id});
  const settlementNumber=`${advance.advanceNumber}-S${String(advance.settlements.length+1).padStart(2,'0')}`;advance.settlements.push({settlementNumber,settlementDate:req.body.settlementDate||new Date(),type,amount,account,reference:text(req.body.reference,160),notes:text(req.body.notes,1000),ledgerEntry:entry._id,recordedBy:req.user._id});if(type==='Refund')advance.refundedAmount=round(advance.refundedAmount+amount);else advance.adjustedAmount=round(advance.adjustedAmount+amount);Object.assign(advance,deriveAdvanceStatus(advance.amount,advance.adjustedAmount,advance.refundedAmount));await advance.save();await recordAudit(req,'SETTLE','Advance',advance._id,['settlements','status','outstandingAmount']);res.status(201).json(advance);
}catch(error){next(error)}});

export default router;
