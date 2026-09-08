import {Router} from 'express';
import SalesTaxInvoice from '../models/SalesTaxInvoice.js';
import {authorize} from '../middleware/authorize.js';
import {nextDocumentNumber} from '../utils/numbering.js';
import {recordAudit} from '../utils/audit.js';

const router=Router();
const statuses=['Draft','Issued','Partially Paid','Paid','Void'];
const text=(value,max=1000)=>String(value??'').trim().slice(0,max);
const number=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;

export function invoicePayload(body,user){
  const items=(Array.isArray(body.items)?body.items:[]).map(raw=>{
    const quantity=number(raw.quantity);const unitRate=number(raw.unitRate);const subtotal=quantity*unitRate;
    const discount=Math.min(number(raw.discount),subtotal);const taxableValue=Math.max(0,subtotal-discount);
    const taxRate=Math.min(100,number(raw.taxRate));const taxAmount=Number((taxableValue*taxRate/100).toFixed(2));
    return {...(raw._id?{_id:raw._id}:{}),...(raw.product?{product:raw.product}:{}),description:text(raw.description,500),brand:text(raw.brand,160),unit:text(raw.unit||'No.',40),quantity,unitRate,discount,taxRate,taxableValue:Number(taxableValue.toFixed(2)),taxAmount,lineTotal:Number((taxableValue+taxAmount).toFixed(2))};
  }).filter(item=>item.description);
  const subtotal=items.reduce((sum,item)=>sum+(item.quantity*item.unitRate),0);
  const discountTotal=items.reduce((sum,item)=>sum+item.discount,0);
  const taxableTotal=items.reduce((sum,item)=>sum+item.taxableValue,0);
  const salesTaxTotal=items.reduce((sum,item)=>sum+item.taxAmount,0);
  return {
    invoiceDate:body.invoiceDate||new Date(),dueDate:body.dueDate||null,status:statuses.includes(body.status)?body.status:'Draft',
    clientName:text(body.clientName,240),clientAddress:text(body.clientAddress,1000),contactPerson:text(body.contactPerson,160),
    sellerNTN:text(body.sellerNTN,80),sellerSTRN:text(body.sellerSTRN,80),buyerNTN:text(body.buyerNTN,80),buyerSTRN:text(body.buyerSTRN,80),
    purchaseOrderNumber:text(body.purchaseOrderNumber,160),reference:text(body.reference,160),
    ...(body.quotation?{quotation:body.quotation}:{quotation:null}),...(body.challan?{challan:body.challan}:{challan:null}),items,
    subtotal:Number(subtotal.toFixed(2)),discountTotal:Number(discountTotal.toFixed(2)),taxableTotal:Number(taxableTotal.toFixed(2)),
    salesTaxTotal:Number(salesTaxTotal.toFixed(2)),grandTotal:Number((taxableTotal+salesTaxTotal).toFixed(2)),
    paymentTerms:text(body.paymentTerms,1000),notes:text(body.notes,4000),updatedBy:user._id
  };
}

router.use(authorize('Director','Admin','Accounts'));
router.get('/',async(req,res,next)=>{try{res.json(await SalesTaxInvoice.find().sort({createdAt:-1}).limit(250))}catch(error){next(error)}});
router.get('/:id',async(req,res,next)=>{try{const record=await SalesTaxInvoice.findById(req.params.id);if(!record)return res.status(404).json({message:'Sales tax invoice not found.'});res.json(record)}catch(error){next(error)}});
router.post('/',async(req,res,next)=>{try{
  const payload=invoicePayload(req.body,req.user);
  const invoiceNumber=text(req.body.invoiceNumber,120)||await nextDocumentNumber(SalesTaxInvoice,'sales-tax-invoice','SG-STI','invoiceNumber');
  const record=await SalesTaxInvoice.create({...payload,invoiceNumber,createdBy:req.user._id});
  await recordAudit(req,'CREATE','SalesTaxInvoice',record._id,Object.keys(payload));
  res.status(201).json(record);
}catch(error){next(error)}});
router.put('/:id',async(req,res,next)=>{try{
  const record=await SalesTaxInvoice.findById(req.params.id);if(!record)return res.status(404).json({message:'Sales tax invoice not found.'});
  Object.assign(record,invoicePayload(req.body,req.user));await record.save();
  await recordAudit(req,'UPDATE','SalesTaxInvoice',record._id,Object.keys(req.body));
  res.json(record);
}catch(error){next(error)}});
router.delete('/:id',authorize('Director','Admin'),async(req,res,next)=>{try{
  const record=await SalesTaxInvoice.findByIdAndDelete(req.params.id);if(!record)return res.status(404).json({message:'Sales tax invoice not found.'});
  await recordAudit(req,'DELETE','SalesTaxInvoice',record._id,[]);
  res.status(204).end();
}catch(error){next(error)}});

export default router;
