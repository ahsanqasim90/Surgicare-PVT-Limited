import {Router} from 'express';
import mongoose from 'mongoose';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import GoodsReceipt from '../models/GoodsReceipt.js';
import StockMovement from '../models/StockMovement.js';
import SupplierInvoice from '../models/SupplierInvoice.js';
import Product from '../models/Product.js';
import FinanceAccount from '../models/FinanceAccount.js';
import LedgerEntry from '../models/LedgerEntry.js';
import User from '../models/User.js';
import {authorize} from '../middleware/authorize.js';
import {nextDocumentNumber} from '../utils/numbering.js';
import {recordAudit} from '../utils/audit.js';

const router=Router();
const text=(value,max=1000)=>String(value??'').trim().slice(0,max);
const positive=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;
const round=value=>Number(Number(value||0).toFixed(2));
const roles=authorize('Director','Admin','Inventory','Accounts');
const approvers=authorize('Director','Admin');
const stockUsers=authorize('Director','Admin','Inventory');
const financeUsers=authorize('Director','Admin','Accounts');
router.use(roles);

async function assertApprover(req,record){
  if(String(record.createdBy)!==String(req.user._id)||req.user.role==='Director')return;
  const other=await User.exists({_id:{$ne:req.user._id},role:{$in:['Director','Admin']},isActive:true});
  if(other)throw Object.assign(new Error('A different Admin or Director must approve this record.'),{status:403});
}

export function calculatePurchaseItems(rawItems=[]){
  const items=(Array.isArray(rawItems)?rawItems:[]).map(raw=>{
    const quantity=positive(raw.quantity);const unitCost=round(positive(raw.unitCost));const gross=round(quantity*unitCost);
    const discount=Math.min(gross,round(positive(raw.discount)));const taxableAmount=round(gross-discount);
    const taxRate=Math.min(100,positive(raw.taxRate));const taxAmount=round(taxableAmount*taxRate/100);
    if(!text(raw.productName,300)||quantity<=0)throw Object.assign(new Error('Every purchase item needs a product and quantity.'),{status:400});
    return {product:mongoose.isValidObjectId(raw.product)?raw.product:null,productName:text(raw.productName,300),sku:text(raw.sku,100),brand:text(raw.brand,160),unit:text(raw.unit,80),quantity,unitCost,discount,taxRate,taxableAmount,taxAmount,lineTotal:round(taxableAmount+taxAmount),receivedQuantity:positive(raw.receivedQuantity)};
  });
  if(!items.length)throw Object.assign(new Error('Add at least one purchase item.'),{status:400});
  return {items,subtotal:round(items.reduce((sum,item)=>sum+item.quantity*item.unitCost,0)),discountTotal:round(items.reduce((sum,item)=>sum+item.discount,0)),taxTotal:round(items.reduce((sum,item)=>sum+item.taxAmount,0)),grandTotal:round(items.reduce((sum,item)=>sum+item.lineTotal,0))};
}

export function purchaseOrderPayload(body,supplier){
  return {supplier:supplier._id,supplierName:supplier.name,orderDate:body.orderDate||new Date(),expectedDeliveryDate:body.expectedDeliveryDate||null,reference:text(body.reference,160),...calculatePurchaseItems(body.items),paymentTerms:text(body.paymentTerms,500),deliveryTerms:text(body.deliveryTerms,500),deliveryAddress:text(body.deliveryAddress,700),notes:text(body.notes,2000)};
}

export function goodsReceiptPayload(body,supplier,po){
  const items=(Array.isArray(body.items)?body.items:[]).map(raw=>{
    const receivedQuantity=positive(raw.receivedQuantity);
    if(!mongoose.isValidObjectId(raw.product)||!text(raw.productName,300)||receivedQuantity<=0)throw Object.assign(new Error('Every receipt line needs an inventory product and received quantity.'),{status:400});
    return {purchaseOrderItem:mongoose.isValidObjectId(raw.purchaseOrderItem)?raw.purchaseOrderItem:null,product:raw.product,productName:text(raw.productName,300),brand:text(raw.brand,160),batchNumber:text(raw.batchNumber,120),manufacturingDate:raw.manufacturingDate||null,expiryDate:raw.expiryDate||null,orderedQuantity:positive(raw.orderedQuantity),receivedQuantity,unit:text(raw.unit,80),unitCost:round(positive(raw.unitCost)),condition:['Accepted','Damaged','Rejected'].includes(raw.condition)?raw.condition:'Accepted',notes:text(raw.notes,500)};
  });
  if(!items.length)throw Object.assign(new Error('Add at least one received item.'),{status:400});
  return {supplier:supplier._id,supplierName:supplier.name,purchaseOrder:po._id,purchaseOrderNumber:po.poNumber,supplierDeliveryNote:text(body.supplierDeliveryNote,160),receiptDate:body.receiptDate||new Date(),location:text(body.location,160),items,notes:text(body.notes,2000)};
}

export function supplierInvoicePayload(body,supplier){
  const calculated=calculatePurchaseItems(body.items);
  return {supplier:supplier._id,supplierName:supplier.name,supplierInvoiceNumber:text(body.supplierInvoiceNumber,160),purchaseOrder:mongoose.isValidObjectId(body.purchaseOrder)?body.purchaseOrder:null,goodsReceipt:mongoose.isValidObjectId(body.goodsReceipt)?body.goodsReceipt:null,invoiceDate:body.invoiceDate||new Date(),dueDate:body.dueDate||null,items:calculated.items.map(({product,productName,quantity,unitCost,discount,taxRate,taxableAmount,taxAmount,lineTotal})=>({product,description:productName,quantity,unitCost,discount,taxRate,taxableAmount,taxAmount,lineTotal})),subtotal:calculated.subtotal,discountTotal:calculated.discountTotal,taxTotal:calculated.taxTotal,grandTotal:calculated.grandTotal,notes:text(body.notes,2000)};
}

export function derivePurchaseOrderStatus(items=[]){
  const received=items.reduce((sum,item)=>sum+positive(item.receivedQuantity),0);const ordered=items.reduce((sum,item)=>sum+positive(item.quantity),0);
  if(received<=0)return 'Ordered';if(received+.0001>=ordered)return 'Received';return 'Partially Received';
}

async function supplierFrom(id){
  if(!mongoose.isValidObjectId(id))throw Object.assign(new Error('Select a valid supplier.'),{status:400});
  const supplier=await Supplier.findOne({_id:id,status:'Active'});if(!supplier)throw Object.assign(new Error('The selected supplier is unavailable.'),{status:400});return supplier;
}

async function validateInvoiceLinks(payload){
  if(payload.purchaseOrder){const order=await PurchaseOrder.findOne({_id:payload.purchaseOrder,supplier:payload.supplier});if(!order)throw Object.assign(new Error('The selected purchase order does not belong to this supplier.'),{status:400});}
  if(payload.goodsReceipt){const receipt=await GoodsReceipt.findOne({_id:payload.goodsReceipt,supplier:payload.supplier,status:'Posted'});if(!receipt)throw Object.assign(new Error('The selected posted GRN does not belong to this supplier.'),{status:400});if(payload.purchaseOrder&&String(receipt.purchaseOrder)!==String(payload.purchaseOrder))throw Object.assign(new Error('The selected GRN is not linked to this purchase order.'),{status:400});}
}

async function defaultAccount(code,userId){
  const definitions={1200:['Inventory','Asset'],1210:['Input Sales Tax','Asset'],2000:['Accounts Payable','Liability']};const [name,type]=definitions[code]||[];
  return FinanceAccount.findOneAndUpdate({code},{$setOnInsert:{code,name,type,isSystem:true,isActive:true,createdBy:userId}},{new:true,upsert:true});
}

async function postedEntry({req,voucherType,postingDate,partyName,reference,narration,lines,sourceType,sourceId,session}){
  const accounts=await FinanceAccount.find({_id:{$in:lines.map(line=>line.account)},isActive:true});const map=new Map(accounts.map(account=>[String(account._id),account]));
  if(accounts.length!==new Set(lines.map(line=>String(line.account))).size)throw Object.assign(new Error('A finance account required for posting is unavailable.'),{status:400});
  const totalDebit=round(lines.reduce((sum,line)=>sum+positive(line.debit),0));const totalCredit=round(lines.reduce((sum,line)=>sum+positive(line.credit),0));
  if(totalDebit<=0||Math.abs(totalDebit-totalCredit)>.009)throw Object.assign(new Error('The accounting entry is not balanced.'),{status:400});
  const voucherNumber=await nextDocumentNumber(LedgerEntry,'ledger-voucher','SG-VCH','voucherNumber');
  const entry=new LedgerEntry({voucherNumber,voucherType,postingDate:postingDate||new Date(),partyName,reference,narration,lines:lines.map(line=>{const account=map.get(String(line.account));return {account:account._id,accountCode:account.code,accountName:account.name,description:line.description,debit:round(line.debit),credit:round(line.credit)}}),totalDebit,totalCredit,status:'Posted',sourceType,sourceId,createdBy:req.user._id,approvedBy:req.user._id,approvedAt:new Date()});
  await entry.save({session});return entry;
}

router.get('/summary',async(req,res,next)=>{try{
  const today=new Date();const canSeeFinance=['Director','Admin','Accounts'].includes(req.user.role);const [suppliers,openOrders,pendingReceipts,ap,dueInvoices,lowStock,recentMovements]=await Promise.all([
    Supplier.countDocuments({status:'Active'}),PurchaseOrder.countDocuments({status:{$in:['Approved','Ordered','Partially Received']}}),GoodsReceipt.countDocuments({status:'Draft'}),
    canSeeFinance?SupplierInvoice.aggregate([{$match:{status:{$in:['Approved','Partially Paid']}}},{$group:{_id:null,total:{$sum:{$subtract:['$grandTotal','$paidAmount']}}}}]):Promise.resolve([]),
    canSeeFinance?SupplierInvoice.countDocuments({status:{$in:['Approved','Partially Paid']},dueDate:{$lt:today}}):Promise.resolve(null),Product.countDocuments({isActive:true,$expr:{$lte:['$stockQty','$minStock']}}),
    StockMovement.find().populate('product','name sku').sort({movementDate:-1,createdAt:-1}).limit(8).lean()
  ]);res.json({suppliers,openOrders,pendingReceipts,accountsPayable:canSeeFinance?round(ap[0]?.total||0):null,dueInvoices,lowStock,recentMovements});
}catch(error){next(error)}});

router.get('/suppliers',async(req,res,next)=>{try{res.json(await Supplier.find().sort({name:1}).limit(500).lean())}catch(error){next(error)}});
router.post('/suppliers',async(req,res,next)=>{try{const supplierCode=await nextDocumentNumber(Supplier,'supplier','SG-SUP','supplierCode');const supplier=await Supplier.create({supplierCode,name:text(req.body.name,240),contactPerson:text(req.body.contactPerson,160),email:text(req.body.email,240),phone:text(req.body.phone,80),ntn:text(req.body.ntn,80),strn:text(req.body.strn,80),address:text(req.body.address,700),city:text(req.body.city,120),paymentTerms:text(req.body.paymentTerms,240),bankName:text(req.body.bankName,160),bankAccountTitle:text(req.body.bankAccountTitle,160),bankAccountNumber:text(req.body.bankAccountNumber,120),iban:text(req.body.iban,80),notes:text(req.body.notes,2000),createdBy:req.user._id});await recordAudit(req,'CREATE','Supplier',supplier._id,Object.keys(req.body));res.status(201).json(supplier)}catch(error){next(error)}});
router.put('/suppliers/:id',async(req,res,next)=>{try{const supplier=await Supplier.findById(req.params.id);if(!supplier)return res.status(404).json({message:'Supplier not found.'});for(const key of ['name','contactPerson','email','phone','ntn','strn','address','city','paymentTerms','bankName','bankAccountTitle','bankAccountNumber','iban','notes'])if(key in req.body)supplier[key]=text(req.body[key],key==='notes'?2000:700);if(['Active','Inactive'].includes(req.body.status))supplier.status=req.body.status;supplier.updatedBy=req.user._id;await supplier.save();await recordAudit(req,'UPDATE','Supplier',supplier._id,Object.keys(req.body));res.json(supplier)}catch(error){next(error)}});

router.get('/purchase-orders',async(req,res,next)=>{try{res.json(await PurchaseOrder.find().populate('supplier','supplierCode name').sort({orderDate:-1,createdAt:-1}).limit(500).lean())}catch(error){next(error)}});
router.post('/purchase-orders',async(req,res,next)=>{try{const supplier=await supplierFrom(req.body.supplier);const poNumber=await nextDocumentNumber(PurchaseOrder,'purchase-order','SG-PO','poNumber');const order=await PurchaseOrder.create({...purchaseOrderPayload(req.body,supplier),poNumber,createdBy:req.user._id});await recordAudit(req,'CREATE','PurchaseOrder',order._id,Object.keys(req.body));res.status(201).json(order)}catch(error){next(error)}});
router.put('/purchase-orders/:id',async(req,res,next)=>{try{const order=await PurchaseOrder.findById(req.params.id);if(!order)return res.status(404).json({message:'Purchase order not found.'});if(order.status!=='Draft')return res.status(409).json({message:'Only a draft purchase order can be edited.'});const supplier=await supplierFrom(req.body.supplier);Object.assign(order,purchaseOrderPayload(req.body,supplier),{updatedBy:req.user._id});await order.save();await recordAudit(req,'UPDATE','PurchaseOrder',order._id,Object.keys(req.body));res.json(order)}catch(error){next(error)}});
router.post('/purchase-orders/:id/submit',async(req,res,next)=>{try{const order=await PurchaseOrder.findById(req.params.id);if(!order)return res.status(404).json({message:'Purchase order not found.'});if(order.status!=='Draft')return res.status(409).json({message:'Only a draft purchase order can be submitted.'});order.status='Submitted';order.submittedBy=req.user._id;order.submittedAt=new Date();await order.save();await recordAudit(req,'SUBMIT','PurchaseOrder',order._id,['status']);res.json(order)}catch(error){next(error)}});
router.post('/purchase-orders/:id/approve',approvers,async(req,res,next)=>{try{const order=await PurchaseOrder.findById(req.params.id);if(!order)return res.status(404).json({message:'Purchase order not found.'});if(order.status!=='Submitted')return res.status(409).json({message:'Only a submitted purchase order can be approved.'});await assertApprover(req,order);order.status='Approved';order.approvedBy=req.user._id;order.approvedAt=new Date();await order.save();await recordAudit(req,'APPROVE','PurchaseOrder',order._id,['status']);res.json(order)}catch(error){next(error)}});
router.post('/purchase-orders/:id/order',stockUsers,async(req,res,next)=>{try{const order=await PurchaseOrder.findById(req.params.id);if(!order)return res.status(404).json({message:'Purchase order not found.'});if(order.status!=='Approved')return res.status(409).json({message:'Only an approved purchase order can be issued.'});order.status='Ordered';order.orderedBy=req.user._id;order.orderedAt=new Date();await order.save();await recordAudit(req,'ISSUE','PurchaseOrder',order._id,['status']);res.json(order)}catch(error){next(error)}});

router.get('/goods-receipts',async(req,res,next)=>{try{res.json(await GoodsReceipt.find().populate('supplier','supplierCode name').populate('purchaseOrder','poNumber status').sort({receiptDate:-1,createdAt:-1}).limit(500).lean())}catch(error){next(error)}});
router.post('/goods-receipts',stockUsers,async(req,res,next)=>{try{const supplier=await supplierFrom(req.body.supplier);const po=await PurchaseOrder.findOne({_id:req.body.purchaseOrder,supplier:supplier._id,status:{$in:['Ordered','Partially Received']}});if(!po)return res.status(400).json({message:'Select an issued purchase order for this supplier.'});const grnNumber=await nextDocumentNumber(GoodsReceipt,'goods-receipt','SG-GRN','grnNumber');const receipt=await GoodsReceipt.create({...goodsReceiptPayload(req.body,supplier,po),grnNumber,createdBy:req.user._id});await recordAudit(req,'CREATE','GoodsReceipt',receipt._id,Object.keys(req.body));res.status(201).json(receipt)}catch(error){next(error)}});
router.put('/goods-receipts/:id',stockUsers,async(req,res,next)=>{try{const receipt=await GoodsReceipt.findById(req.params.id);if(!receipt)return res.status(404).json({message:'Goods receipt not found.'});if(receipt.status!=='Draft')return res.status(409).json({message:'Only a draft goods receipt can be edited.'});const supplier=await supplierFrom(req.body.supplier);const po=await PurchaseOrder.findOne({_id:req.body.purchaseOrder,supplier:supplier._id,status:{$in:['Ordered','Partially Received']}});if(!po)return res.status(400).json({message:'Select an issued purchase order for this supplier.'});Object.assign(receipt,goodsReceiptPayload(req.body,supplier,po),{updatedBy:req.user._id});await receipt.save();await recordAudit(req,'UPDATE','GoodsReceipt',receipt._id,Object.keys(req.body));res.json(receipt)}catch(error){next(error)}});
router.post('/goods-receipts/:id/post',stockUsers,async(req,res,next)=>{try{
  const receipt=await GoodsReceipt.findById(req.params.id);if(!receipt)return res.status(404).json({message:'Goods receipt not found.'});if(receipt.status!=='Draft')return res.status(409).json({message:'Only a draft goods receipt can be posted.'});const po=await PurchaseOrder.findById(receipt.purchaseOrder);if(!po)return res.status(409).json({message:'Linked purchase order is unavailable.'});
  for(const line of receipt.items){const poLine=po.items.id(line.purchaseOrderItem);if(!poLine)throw Object.assign(new Error(`Purchase order line missing for ${line.productName}.`),{status:400});const accepted=line.condition==='Accepted'?line.receivedQuantity:0;if(positive(poLine.receivedQuantity)+accepted>positive(poLine.quantity)+.0001)throw Object.assign(new Error(`Received quantity exceeds the remaining order quantity for ${line.productName}.`),{status:400});}
  const session=await mongoose.startSession();try{await session.withTransaction(async()=>{
    for(const line of receipt.items){const accepted=line.condition==='Accepted'?line.receivedQuantity:0;if(accepted<=0)continue;const product=await Product.findOneAndUpdate({_id:line.product,isActive:true},{$inc:{stockQty:accepted},$set:{purchasePrice:line.unitCost,batchNumber:line.batchNumber||'',expiryDate:line.expiryDate||null,location:receipt.location||''}},{new:true,session});if(!product)throw Object.assign(new Error(`Inventory product unavailable for ${line.productName}.`),{status:400});const movementNumber=await nextDocumentNumber(StockMovement,'stock-movement','SG-STK','movementNumber');await StockMovement.create([{movementNumber,movementDate:receipt.receiptDate,product:product._id,productName:product.name,movementType:'Purchase Receipt',quantityIn:accepted,balanceAfter:product.stockQty,unitCost:line.unitCost,batchNumber:line.batchNumber,expiryDate:line.expiryDate,location:receipt.location,reference:receipt.grnNumber,sourceType:'GoodsReceipt',sourceId:receipt._id,createdBy:req.user._id}],{session});const poLine=po.items.id(line.purchaseOrderItem);poLine.receivedQuantity=round(positive(poLine.receivedQuantity)+accepted);}
    po.status=derivePurchaseOrderStatus(po.items);await po.save({session});receipt.status='Posted';receipt.postedBy=req.user._id;receipt.postedAt=new Date();await receipt.save({session});
  })}finally{await session.endSession()}await recordAudit(req,'POST','GoodsReceipt',receipt._id,['status','items']);res.json(receipt);
}catch(error){next(error)}});
router.post('/goods-receipts/:id/reverse',approvers,async(req,res,next)=>{try{
  const receipt=await GoodsReceipt.findById(req.params.id);if(!receipt)return res.status(404).json({message:'Goods receipt not found.'});if(receipt.status!=='Posted')return res.status(409).json({message:'Only a posted goods receipt can be reversed.'});const reason=text(req.body.reason,700);if(!reason)return res.status(400).json({message:'A reversal reason is required.'});const po=await PurchaseOrder.findById(receipt.purchaseOrder);if(!po)return res.status(409).json({message:'Linked purchase order is unavailable.'});
  const session=await mongoose.startSession();try{await session.withTransaction(async()=>{
    for(const line of receipt.items){const accepted=line.condition==='Accepted'?line.receivedQuantity:0;if(accepted<=0)continue;const product=await Product.findOne({_id:line.product,isActive:true}).session(session);if(!product||product.stockQty+.0001<accepted)throw Object.assign(new Error(`Cannot reverse ${line.productName}; available stock is below the received quantity.`),{status:409});product.stockQty=round(product.stockQty-accepted);await product.save({session});const original=await StockMovement.findOne({sourceType:'GoodsReceipt',sourceId:receipt._id,product:line.product,status:'Posted'}).session(session);if(original){original.status='Reversed';await original.save({session})}const movementNumber=await nextDocumentNumber(StockMovement,'stock-movement','SG-STK','movementNumber');await StockMovement.create([{movementNumber,movementDate:new Date(),product:product._id,productName:product.name,movementType:'Reversal',quantityOut:accepted,balanceAfter:product.stockQty,unitCost:line.unitCost,batchNumber:line.batchNumber,expiryDate:line.expiryDate,location:receipt.location,reference:receipt.grnNumber,sourceType:'GoodsReceiptReversal',sourceId:receipt._id,reversalOf:original?._id,createdBy:req.user._id}],{session});const poLine=po.items.id(line.purchaseOrderItem);if(poLine)poLine.receivedQuantity=round(Math.max(0,positive(poLine.receivedQuantity)-accepted));}
    po.status=derivePurchaseOrderStatus(po.items);await po.save({session});receipt.status='Reversed';receipt.reversedBy=req.user._id;receipt.reversedAt=new Date();receipt.reversalReason=reason;await receipt.save({session});
  })}finally{await session.endSession()}await recordAudit(req,'REVERSE','GoodsReceipt',receipt._id,['status','reversalReason']);res.json(receipt);
}catch(error){next(error)}});

router.get('/stock-movements',async(req,res,next)=>{try{const filter={};if(req.query.product&&mongoose.isValidObjectId(req.query.product))filter.product=req.query.product;res.json(await StockMovement.find(filter).populate('product','name sku unit').sort({movementDate:-1,createdAt:-1}).limit(1000).lean())}catch(error){next(error)}});

router.get('/supplier-invoices',financeUsers,async(req,res,next)=>{try{res.json(await SupplierInvoice.find().populate('supplier','supplierCode name').populate('purchaseOrder','poNumber').populate('goodsReceipt','grnNumber').populate('payments.paidFromAccount','code name').sort({invoiceDate:-1,createdAt:-1}).limit(500).lean())}catch(error){next(error)}});
router.post('/supplier-invoices',financeUsers,async(req,res,next)=>{try{const supplier=await supplierFrom(req.body.supplier);if(!text(req.body.supplierInvoiceNumber,160))return res.status(400).json({message:'Supplier invoice number is required.'});const payload=supplierInvoicePayload(req.body,supplier);await validateInvoiceLinks(payload);const invoiceNumber=await nextDocumentNumber(SupplierInvoice,'supplier-invoice','SG-PINV','invoiceNumber');const invoice=await SupplierInvoice.create({...payload,invoiceNumber,createdBy:req.user._id});await recordAudit(req,'CREATE','SupplierInvoice',invoice._id,Object.keys(req.body));res.status(201).json(invoice)}catch(error){next(error)}});
router.put('/supplier-invoices/:id',financeUsers,async(req,res,next)=>{try{const invoice=await SupplierInvoice.findById(req.params.id);if(!invoice)return res.status(404).json({message:'Supplier invoice not found.'});if(invoice.status!=='Draft')return res.status(409).json({message:'Only a draft supplier invoice can be edited.'});const supplier=await supplierFrom(req.body.supplier);const payload=supplierInvoicePayload(req.body,supplier);await validateInvoiceLinks(payload);Object.assign(invoice,payload,{updatedBy:req.user._id});await invoice.save();await recordAudit(req,'UPDATE','SupplierInvoice',invoice._id,Object.keys(req.body));res.json(invoice)}catch(error){next(error)}});
router.post('/supplier-invoices/:id/approve',financeUsers,approvers,async(req,res,next)=>{try{
  const candidate=await SupplierInvoice.findById(req.params.id);if(!candidate)return res.status(404).json({message:'Supplier invoice not found.'});if(candidate.status!=='Draft')return res.status(409).json({message:'Only a draft supplier invoice can be approved.'});await assertApprover(req,candidate);
  const [inventory,inputTax,payable]=await Promise.all([defaultAccount('1200',req.user._id),defaultAccount('1210',req.user._id),defaultAccount('2000',req.user._id)]);let invoice;let entry;const session=await mongoose.startSession();try{await session.withTransaction(async()=>{
    invoice=await SupplierInvoice.findOne({_id:req.params.id,status:'Draft'}).session(session);if(!invoice)throw Object.assign(new Error('This invoice was already processed by another request.'),{status:409});const lines=[{account:inventory._id,debit:round(invoice.subtotal-invoice.discountTotal),credit:0,description:`Inventory purchased from ${invoice.supplierName}`}];if(invoice.taxTotal>0)lines.push({account:inputTax._id,debit:invoice.taxTotal,credit:0,description:`Input tax on ${invoice.supplierInvoiceNumber}`});lines.push({account:payable._id,debit:0,credit:invoice.grandTotal,description:`Payable to ${invoice.supplierName}`});entry=await postedEntry({req,voucherType:'Supplier Invoice',postingDate:invoice.invoiceDate,partyName:invoice.supplierName,reference:invoice.supplierInvoiceNumber,narration:`Supplier invoice ${invoice.supplierInvoiceNumber} (${invoice.invoiceNumber})`,lines,sourceType:'SupplierInvoice',sourceId:invoice._id,session});invoice.status='Approved';invoice.payableLedgerEntry=entry._id;invoice.approvedBy=req.user._id;invoice.approvedAt=new Date();await invoice.save({session});
  })}finally{await session.endSession()}await recordAudit(req,'POST','LedgerEntry',entry._id,['status','lines']);await recordAudit(req,'APPROVE','SupplierInvoice',invoice._id,['status','payableLedgerEntry']);res.json(invoice);
}catch(error){next(error)}});
router.post('/supplier-invoices/:id/payments',financeUsers,async(req,res,next)=>{try{
  const amount=round(positive(req.body.amount));if(amount<=0)return res.status(400).json({message:'Payment amount must be greater than zero.'});const paidFrom=await FinanceAccount.findOne({_id:req.body.paidFromAccount,isActive:true,type:{$in:['Cash','Bank']}});if(!paidFrom)return res.status(400).json({message:'Select an active cash or bank account.'});const payable=await defaultAccount('2000',req.user._id);let invoice;let entry;const session=await mongoose.startSession();try{await session.withTransaction(async()=>{
    invoice=await SupplierInvoice.findById(req.params.id).session(session);if(!invoice)throw Object.assign(new Error('Supplier invoice not found.'),{status:404});if(!['Approved','Partially Paid'].includes(invoice.status))throw Object.assign(new Error('This supplier invoice is not available for payment.'),{status:409});const outstanding=round(invoice.grandTotal-invoice.paidAmount);if(amount>outstanding+.009)throw Object.assign(new Error('Payment amount must be within the outstanding balance.'),{status:400});entry=await postedEntry({req,voucherType:'Supplier Payment',postingDate:req.body.paymentDate,partyName:invoice.supplierName,reference:text(req.body.reference,160)||invoice.supplierInvoiceNumber,narration:text(req.body.notes,1000)||`Payment against ${invoice.invoiceNumber}`,lines:[{account:payable._id,debit:amount,credit:0,description:`Reduce payable ${invoice.invoiceNumber}`},{account:paidFrom._id,debit:0,credit:amount,description:`Payment to ${invoice.supplierName}`}],sourceType:'SupplierPayment',sourceId:invoice._id,session});const paymentNumber=`${invoice.invoiceNumber}-P${String(invoice.payments.length+1).padStart(2,'0')}`;invoice.payments.push({paymentNumber,paymentDate:req.body.paymentDate||new Date(),amount,paidFromAccount:paidFrom._id,paymentMethod:text(req.body.paymentMethod,80),reference:text(req.body.reference,160),notes:text(req.body.notes,1000),ledgerEntry:entry._id,paidBy:req.user._id});invoice.paidAmount=round(invoice.paidAmount+amount);invoice.status=invoice.paidAmount+.009>=invoice.grandTotal?'Paid':'Partially Paid';await invoice.save({session});
  })}finally{await session.endSession()}await recordAudit(req,'POST','LedgerEntry',entry._id,['status','lines']);await recordAudit(req,'PAY','SupplierInvoice',invoice._id,['payments','paidAmount','status']);res.status(201).json(invoice);
}catch(error){next(error)}});

export default router;
