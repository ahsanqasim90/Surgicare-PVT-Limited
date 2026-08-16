import mongoose from 'mongoose';
const item=new mongoose.Schema({product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},description:String,quantity:Number,quotedRate:Number,approvedQuantity:Number,approvedRate:Number},{_id:false});
const schema=new mongoose.Schema({title:{type:String,required:true},tenderNumber:String,hospitalName:String,submissionDate:Date,closingDate:Date,status:{type:String,enum:['Draft','Prepared','Submitted','Under Evaluation','Approved','Partially Approved','Rejected','Completed'],default:'Draft'},items:[item],totalValue:{type:Number,default:0},notes:String,documents:[String]},{timestamps:true});
export default mongoose.model('Tender',schema);
