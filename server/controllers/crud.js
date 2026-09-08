import {recordAudit} from '../utils/audit.js';

export const list=model=>async(req,res,next)=>{try{res.json(await model.find().sort({createdAt:-1}).limit(250))}catch(e){next(e)}};
export const getOne=model=>async(req,res,next)=>{try{const x=await model.findById(req.params.id);if(!x)return res.status(404).json({message:'Record not found'});res.json(x)}catch(e){next(e)}};
export const create=model=>async(req,res,next)=>{try{const x=await model.create(req.body);await recordAudit(req,'CREATE',model.modelName,x._id,Object.keys(req.body));res.status(201).json(x)}catch(e){next(e)}};
export const update=model=>async(req,res,next)=>{try{const x=await model.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!x)return res.status(404).json({message:'Record not found'});await recordAudit(req,'UPDATE',model.modelName,x._id,Object.keys(req.body));res.json(x)}catch(e){next(e)}};
export const remove=model=>async(req,res,next)=>{try{const x=await model.findByIdAndDelete(req.params.id);if(!x)return res.status(404).json({message:'Record not found'});await recordAudit(req,'DELETE',model.modelName,x._id,[]);res.status(204).end()}catch(e){next(e)}};
