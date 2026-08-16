import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxLength:120},
  organisation:{type:String,trim:true,maxLength:180},
  email:{type:String,required:true,trim:true,lowercase:true,maxLength:180},
  phone:{type:String,trim:true,maxLength:60},
  product:{type:String,trim:true,maxLength:180},
  quantity:{type:String,trim:true,maxLength:80},
  message:{type:String,required:true,trim:true,maxLength:4000},
  status:{type:String,enum:['New','In Review','Responded','Closed'],default:'New'}
},{timestamps:true});

export default mongoose.model('RFQ',schema);
