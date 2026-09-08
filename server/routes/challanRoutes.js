import {Router} from 'express';
import DeliveryChallan from '../models/DeliveryChallan.js';
import {authorize} from '../middleware/authorize.js';
import {nextDocumentNumber} from '../utils/numbering.js';
import {recordAudit} from '../utils/audit.js';

const router=Router();
const statuses=['Draft','Ready','Dispatched','Partially Delivered','Delivered','Returned'];
const text=(value,max=1000)=>String(value??'').trim().slice(0,max);
const number=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;

export function challanPayload(body,user){
  const items=(Array.isArray(body.items)?body.items:[]).map(raw=>({
    ...(raw._id?{_id:raw._id}:{}),
    ...(raw.product?{product:raw.product}:{}),
    productName:text(raw.productName||raw.description,300),brand:text(raw.brand,160),batchNumber:text(raw.batchNumber,120),
    manufacturingDate:raw.manufacturingDate||null,expiryDate:raw.expiryDate||null,
    orderedQuantity:number(raw.orderedQuantity),quantity:number(raw.quantity),unit:text(raw.unit||'No.',40),condition:text(raw.condition,160)
  })).filter(item=>item.productName);
  return {
    clientName:text(body.clientName,240),clientAddress:text(body.clientAddress,1000),contactPerson:text(body.contactPerson,160),
    reference:text(body.reference,160),purchaseOrderNumber:text(body.purchaseOrderNumber,160),
    dispatchDate:body.dispatchDate||null,deliveryDate:body.deliveryDate||new Date(),items,
    transporter:text(body.transporter,160),vehicleNumber:text(body.vehicleNumber,80),receiverName:text(body.receiverName,160),
    receiverContact:text(body.receiverContact,120),receivedAt:body.receivedAt||null,
    status:statuses.includes(body.status)?body.status:'Draft',notes:text(body.notes,4000),updatedBy:user._id
  };
}

router.use(authorize('Director','Admin','Inventory'));
router.get('/',async(req,res,next)=>{try{res.json(await DeliveryChallan.find().sort({createdAt:-1}).limit(250))}catch(error){next(error)}});
router.get('/:id',async(req,res,next)=>{try{const record=await DeliveryChallan.findById(req.params.id);if(!record)return res.status(404).json({message:'Delivery challan not found.'});res.json(record)}catch(error){next(error)}});
router.post('/',async(req,res,next)=>{try{
  const payload=challanPayload(req.body,req.user);
  const challanNumber=text(req.body.challanNumber,120)||await nextDocumentNumber(DeliveryChallan,'challan','SG-DC','challanNumber');
  const record=await DeliveryChallan.create({...payload,challanNumber,createdBy:req.user._id});
  await recordAudit(req,'CREATE','DeliveryChallan',record._id,Object.keys(payload));
  res.status(201).json(record);
}catch(error){next(error)}});
router.put('/:id',async(req,res,next)=>{try{
  const record=await DeliveryChallan.findById(req.params.id);if(!record)return res.status(404).json({message:'Delivery challan not found.'});
  Object.assign(record,challanPayload(req.body,req.user));await record.save();
  await recordAudit(req,'UPDATE','DeliveryChallan',record._id,Object.keys(req.body));
  res.json(record);
}catch(error){next(error)}});
router.delete('/:id',authorize('Director','Admin'),async(req,res,next)=>{try{
  const record=await DeliveryChallan.findByIdAndDelete(req.params.id);if(!record)return res.status(404).json({message:'Delivery challan not found.'});
  await recordAudit(req,'DELETE','DeliveryChallan',record._id,[]);
  res.status(204).end();
}catch(error){next(error)}});

export default router;
