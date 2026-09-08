import {Router} from 'express';
import Tender from '../models/Tender.js';
import {authorize} from '../middleware/authorize.js';
import {recordAudit} from '../utils/audit.js';

const router=Router();
const allowedStatuses=['Draft','Prepared','Submitted','Under Evaluation','Approved','Partially Approved','Rejected','Completed'];
const allowedItemStatuses=['Pending','Approved','Partially Approved','Rejected'];

const text=(value,max=1000)=>String(value??'').trim().slice(0,max);
const number=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;

export function tenderPayload(body,user){
  const items=(Array.isArray(body.items)?body.items:[]).map(raw=>({
    ...(raw._id?{_id:raw._id}:{}),
    ...(raw.product?{product:raw.product}:{}),
    productName:text(raw.productName||raw.description,240),
    brand:text(raw.brand,160),
    unit:text(raw.unit||'No.',40),
    quantity:number(raw.quantity),
    quotedRate:number(raw.quotedRate),
    approvalStatus:allowedItemStatuses.includes(raw.approvalStatus)?raw.approvalStatus:'Pending',
    approvedQuantity:Math.min(number(raw.approvedQuantity),number(raw.quantity)),
    approvedRate:number(raw.approvedRate),
    rejectionReason:text(raw.rejectionReason,1000)
  })).filter(item=>item.productName);

  let status=allowedStatuses.includes(body.status)?body.status:'Draft';
  const evaluated=items.filter(item=>item.approvalStatus!=='Pending');
  if(evaluated.length){
    const approved=items.filter(item=>['Approved','Partially Approved'].includes(item.approvalStatus));
    if(evaluated.length<items.length)status='Under Evaluation';
    else if(approved.length===items.length&&items.every(item=>item.approvalStatus==='Approved'))status='Approved';
    else if(approved.length)status='Partially Approved';
    else status='Rejected';
  }
  else if(['Approved','Partially Approved','Rejected'].includes(status))status='Under Evaluation';

  return {
    title:text(body.title,240),
    tenderNumber:text(body.tenderNumber,120),
    hospitalName:text(body.hospitalName,240),
    submissionDate:body.submissionDate||null,
    closingDate:body.closingDate||null,
    evaluationDate:body.evaluationDate||null,
    awardNumber:text(body.awardNumber,120),
    status,
    items,
    totalValue:items.reduce((sum,item)=>sum+(item.quantity*item.quotedRate),0),
    approvedValue:items.reduce((sum,item)=>sum+(item.approvedQuantity*item.approvedRate),0),
    notes:text(body.notes,4000),
    updatedBy:user._id
  };
}

router.use(authorize('Director','Admin','Sales'));

router.get('/',async(req,res,next)=>{try{res.json(await Tender.find().sort({createdAt:-1}).limit(250))}catch(error){next(error)}});
router.get('/:id',async(req,res,next)=>{try{const record=await Tender.findById(req.params.id);if(!record)return res.status(404).json({message:'Tender not found.'});res.json(record)}catch(error){next(error)}});
router.post('/',async(req,res,next)=>{try{
  const payload=tenderPayload(req.body,req.user);
  const record=await Tender.create({...payload,createdBy:req.user._id,history:[{status:payload.status,note:'Tender created',changedBy:req.user._id,changedByName:req.user.name}]});
  await recordAudit(req,'CREATE','Tender',record._id,Object.keys(payload));
  res.status(201).json(record);
}catch(error){next(error)}});
router.put('/:id',async(req,res,next)=>{try{
  const existing=await Tender.findById(req.params.id);if(!existing)return res.status(404).json({message:'Tender not found.'});
  const payload=tenderPayload(req.body,req.user);
  if(existing.status!==payload.status)existing.history.push({status:payload.status,note:text(req.body.statusNote||'Status updated',1000),changedBy:req.user._id,changedByName:req.user.name});
  Object.assign(existing,payload);await existing.save();
  await recordAudit(req,'UPDATE','Tender',existing._id,Object.keys(payload));
  res.json(existing);
}catch(error){next(error)}});
router.delete('/:id',authorize('Director','Admin'),async(req,res,next)=>{try{
  const record=await Tender.findByIdAndDelete(req.params.id);if(!record)return res.status(404).json({message:'Tender not found.'});
  await recordAudit(req,'DELETE','Tender',record._id,[]);
  res.status(204).end();
}catch(error){next(error)}});

export default router;
