import {Router} from 'express';
import Quotation from '../models/Quotation.js';
import {authorize} from '../middleware/authorize.js';
import {nextDocumentNumber} from '../utils/numbering.js';
import {recordAudit} from '../utils/audit.js';

const router=Router();
const statuses=['Draft','Sent','Accepted','Rejected','Expired'];
const text=(value,max=1000)=>String(value??'').trim().slice(0,max);
const number=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;

export function quotationPayload(body,user){
  const items=(Array.isArray(body.items)?body.items:[]).map(raw=>{
    const quantity=number(raw.quantity);
    const unitRate=number(raw.unitRate);
    const discount=Math.min(number(raw.discount),quantity*unitRate);
    const taxableValue=Math.max(0,quantity*unitRate-discount);
    const taxRate=Math.min(100,number(raw.taxRate));
    const tax=Number((taxableValue*taxRate/100).toFixed(2));
    return {
      ...(raw._id?{_id:raw._id}:{}),
      ...(raw.product?{product:raw.product}:{}),
      description:text(raw.description,500),
      brand:text(raw.brand,160),
      unit:text(raw.unit||'No.',40),
      quantity,unitRate,discount,taxRate,tax,
      lineTotal:Number((taxableValue+tax).toFixed(2))
    };
  }).filter(item=>item.description);
  const subtotal=items.reduce((sum,item)=>sum+(item.quantity*item.unitRate),0);
  const discountTotal=items.reduce((sum,item)=>sum+item.discount,0);
  const taxTotal=items.reduce((sum,item)=>sum+item.tax,0);
  return {
    clientName:text(body.clientName,240),
    clientAddress:text(body.clientAddress,1000),
    contactPerson:text(body.contactPerson,160),
    ...(body.tender?{tender:body.tender}:{tender:null}),
    reference:text(body.reference,160),
    subject:text(body.subject,300),
    date:body.date||new Date(),
    validUntil:body.validUntil||null,
    status:statuses.includes(body.status)?body.status:'Draft',
    items,
    subtotal:Number(subtotal.toFixed(2)),
    discountTotal:Number(discountTotal.toFixed(2)),
    taxTotal:Number(taxTotal.toFixed(2)),
    grandTotal:Number((subtotal-discountTotal+taxTotal).toFixed(2)),
    paymentTerms:text(body.paymentTerms,1000),
    deliveryTerms:text(body.deliveryTerms,1000),
    notes:text(body.notes,4000),
    updatedBy:user._id
  };
}

router.use(authorize('Director','Admin','Sales','Accounts'));

router.get('/',async(req,res,next)=>{try{res.json(await Quotation.find().sort({createdAt:-1}).limit(250))}catch(error){next(error)}});
router.get('/:id',async(req,res,next)=>{try{const record=await Quotation.findById(req.params.id);if(!record)return res.status(404).json({message:'Quotation not found.'});res.json(record)}catch(error){next(error)}});
router.post('/',async(req,res,next)=>{try{
  const payload=quotationPayload(req.body,req.user);
  const quotationNumber=text(req.body.quotationNumber,120)||await nextDocumentNumber(Quotation,'quotation','SG-Q','quotationNumber');
  const record=await Quotation.create({...payload,quotationNumber,createdBy:req.user._id});
  await recordAudit(req,'CREATE','Quotation',record._id,Object.keys(payload));
  res.status(201).json(record);
}catch(error){next(error)}});
router.put('/:id',async(req,res,next)=>{try{
  const record=await Quotation.findById(req.params.id);if(!record)return res.status(404).json({message:'Quotation not found.'});
  const payload=quotationPayload(req.body,req.user);
  Object.assign(record,payload);await record.save();
  await recordAudit(req,'UPDATE','Quotation',record._id,Object.keys(payload));
  res.json(record);
}catch(error){next(error)}});
router.delete('/:id',authorize('Director','Admin'),async(req,res,next)=>{try{
  const record=await Quotation.findByIdAndDelete(req.params.id);if(!record)return res.status(404).json({message:'Quotation not found.'});
  await recordAudit(req,'DELETE','Quotation',record._id,[]);
  res.status(204).end();
}catch(error){next(error)}});

export default router;
