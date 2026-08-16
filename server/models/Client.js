import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true},type:{type:String,default:'Hospital'},address:String,city:String,contactPerson:String,email:String,phone:String,notes:String},{timestamps:true});
export default mongoose.model('Client',schema);
