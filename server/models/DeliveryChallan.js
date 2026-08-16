import mongoose from 'mongoose';
const item=new mongoose.Schema({productName:String,batchNumber:String,quantity:Number,unit:String},{_id:false});
const schema=new mongoose.Schema({challanNumber:{type:String,unique:true,sparse:true},clientName:{type:String,required:true},reference:String,deliveryDate:{type:Date,default:Date.now},items:[item],receiverName:String,receiverContact:String,status:{type:String,enum:['Draft','Dispatched','Delivered'],default:'Draft'},notes:String},{timestamps:true});
export default mongoose.model('DeliveryChallan',schema);
