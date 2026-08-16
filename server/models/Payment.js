import mongoose from 'mongoose';
const schema=new mongoose.Schema({clientName:{type:String,required:true},reference:String,amount:{type:Number,default:0},receivedAmount:{type:Number,default:0},dueDate:Date,receivedDate:Date,status:{type:String,enum:['Pending','Partially Paid','Paid','Overdue'],default:'Pending'},notes:String},{timestamps:true});
export default mongoose.model('Payment',schema);
