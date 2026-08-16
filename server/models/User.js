import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const schema = new mongoose.Schema({
  name:{type:String,required:true,trim:true},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  passwordHash:{type:String,required:true,select:false},
  role:{type:String,enum:['Director','Admin','Sales','Inventory','Accounts'],default:'Admin'},
  isActive:{type:Boolean,default:true},
  lastLoginAt:Date
},{timestamps:true});

schema.methods.verifyPassword = function(password){return bcrypt.compare(password,this.passwordHash)};
schema.statics.hashPassword = function(password){return bcrypt.hash(password,12)};

export default mongoose.model('User',schema);
