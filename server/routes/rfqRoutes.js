import {Router} from 'express';
import RFQ from '../models/RFQ.js';
import {protect} from '../middleware/auth.js';

const router=Router();
router.post('/',async(req,res,next)=>{
  try{
    const {name,organisation,email,phone,product,quantity,message}=req.body;
    const record=await RFQ.create({name,organisation,email,phone,product,quantity,message});
    res.status(201).json({id:record.id,message:'Your enquiry has been received.'});
  }catch(error){next(error)}
});
router.get('/',protect,async(req,res,next)=>{try{res.json(await RFQ.find().sort({createdAt:-1}).limit(250))}catch(error){next(error)}});
router.patch('/:id/status',protect,async(req,res,next)=>{try{const record=await RFQ.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true,runValidators:true});if(!record)return res.status(404).json({message:'Enquiry not found.'});res.json(record)}catch(error){next(error)}});
export default router;
