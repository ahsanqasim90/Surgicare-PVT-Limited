import mongoose from 'mongoose';

const schema=new mongoose.Schema({
  _id:{type:String,required:true},
  sequence:{type:Number,default:0,min:0}
},{timestamps:true});

export default mongoose.model('Counter',schema);
