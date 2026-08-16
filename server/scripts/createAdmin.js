import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

async function run(){
  const {ADMIN_NAME,ADMIN_EMAIL,ADMIN_PASSWORD}=process.env;
  if(!ADMIN_NAME||!ADMIN_EMAIL||!ADMIN_PASSWORD)throw new Error('ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required.');
  if(ADMIN_PASSWORD.length<12)throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
  await connectDB();
  const passwordHash=await User.hashPassword(ADMIN_PASSWORD);
  await User.findOneAndUpdate({email:ADMIN_EMAIL.toLowerCase()},{name:ADMIN_NAME,email:ADMIN_EMAIL.toLowerCase(),passwordHash,role:'Admin',isActive:true},{upsert:true,new:true,runValidators:true});
  console.log(`Admin account ready for ${ADMIN_EMAIL.toLowerCase()}`);
  await mongoose.disconnect();
}

run().catch(async error=>{console.error(error.message);await mongoose.disconnect();process.exit(1)});
