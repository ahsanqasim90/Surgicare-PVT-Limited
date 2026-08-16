export const list=model=>async(req,res,next)=>{try{res.json(await model.find().sort({createdAt:-1}).limit(250))}catch(e){next(e)}};
export const getOne=model=>async(req,res,next)=>{try{const x=await model.findById(req.params.id);if(!x)return res.status(404).json({message:'Record not found'});res.json(x)}catch(e){next(e)}};
export const create=model=>async(req,res,next)=>{try{res.status(201).json(await model.create(req.body))}catch(e){next(e)}};
export const update=model=>async(req,res,next)=>{try{const x=await model.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!x)return res.status(404).json({message:'Record not found'});res.json(x)}catch(e){next(e)}};
export const remove=model=>async(req,res,next)=>{try{const x=await model.findByIdAndDelete(req.params.id);if(!x)return res.status(404).json({message:'Record not found'});res.status(204).end()}catch(e){next(e)}};
