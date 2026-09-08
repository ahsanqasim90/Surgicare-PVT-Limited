import mongoose from 'mongoose';

const item=new mongoose.Schema({
  product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},
  productName:{type:String,required:true,trim:true,maxLength:240},
  brand:{type:String,trim:true,maxLength:160},
  unit:{type:String,trim:true,default:'No.'},
  quantity:{type:Number,required:true,min:0},
  quotedRate:{type:Number,default:0,min:0},
  approvalStatus:{type:String,enum:['Pending','Approved','Partially Approved','Rejected'],default:'Pending'},
  approvedQuantity:{type:Number,default:0,min:0},
  approvedRate:{type:Number,default:0,min:0},
  rejectionReason:{type:String,trim:true,maxLength:1000}
});

const historyEntry=new mongoose.Schema({
  status:String,
  note:{type:String,trim:true,maxLength:1000},
  changedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  changedByName:String,
  changedAt:{type:Date,default:Date.now}
},{_id:false});

const schema=new mongoose.Schema({
  title:{type:String,required:true,trim:true,maxLength:240},
  tenderNumber:{type:String,trim:true,index:true},
  hospitalName:{type:String,required:true,trim:true,maxLength:240},
  submissionDate:Date,
  closingDate:Date,
  evaluationDate:Date,
  awardNumber:{type:String,trim:true,maxLength:120},
  status:{type:String,enum:['Draft','Prepared','Submitted','Under Evaluation','Approved','Partially Approved','Rejected','Completed'],default:'Draft',index:true},
  items:{type:[item],validate:{validator:value=>value.length>0,message:'At least one tender product is required.'}},
  totalValue:{type:Number,default:0,min:0},
  approvedValue:{type:Number,default:0,min:0},
  notes:{type:String,trim:true,maxLength:4000},
  documents:[String],
  history:[historyEntry],
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
},{timestamps:true});

export default mongoose.model('Tender',schema);
