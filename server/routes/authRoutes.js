import {Router} from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {protect} from '../middleware/auth.js';

const router=Router();

router.post('/login',async(req,res,next)=>{
  try{
    const {email,password}=req.body;
    if(!email||!password)return res.status(400).json({message:'Email and password are required.'});
    const user=await User.findOne({email:String(email).toLowerCase()}).select('+passwordHash');
    if(!user||!user.isActive||!(await user.verifyPassword(password)))return res.status(401).json({message:'The email or password is incorrect.'});
    if(!process.env.JWT_SECRET)throw new Error('JWT_SECRET is missing');
    user.lastLoginAt=new Date(); await user.save();
    const token=jwt.sign({sub:user.id,role:user.role},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||'8h'});
    res.json({token,user:{id:user.id,name:user.name,email:user.email,role:user.role}});
  }catch(error){next(error)}
});

router.get('/me',protect,(req,res)=>res.json({user:req.user}));

export default router;
