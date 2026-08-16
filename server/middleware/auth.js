import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req,res,next){
  try{
    if(!process.env.JWT_SECRET)throw new Error('JWT_SECRET is missing');
    const token=req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
    if(!token)return res.status(401).json({message:'Authentication is required.'});
    const payload=jwt.verify(token,process.env.JWT_SECRET);
    const user=await User.findById(payload.sub).select('name email role isActive');
    if(!user?.isActive)return res.status(401).json({message:'This account is not available.'});
    req.user=user;
    next();
  }catch(error){
    if(error.name==='TokenExpiredError'||error.name==='JsonWebTokenError')return res.status(401).json({message:'Your session is invalid or has expired.'});
    next(error);
  }
}
