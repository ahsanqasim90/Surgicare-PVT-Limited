import mongoose from 'mongoose';

const settlementSchema=new mongoose.Schema({
  settlementNumber:{type:String,required:true},
  settlementDate:{type:Date,default:Date.now},
  type:{type:String,enum:['Adjustment','Refund'],required:true},
  amount:{type:Number,required:true,min:0.01},
  account:{type:mongoose.Schema.Types.ObjectId,ref:'FinanceAccount',required:true},
  reference:{type:String,trim:true,maxLength:160},
  notes:{type:String,trim:true,maxLength:1000},
  ledgerEntry:{type:mongoose.Schema.Types.ObjectId,ref:'LedgerEntry',required:true},
  recordedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
},{timestamps:{createdAt:true,updatedAt:false}});

const schema=new mongoose.Schema({
  advanceNumber:{type:String,required:true,unique:true,index:true},
  advanceDate:{type:Date,default:Date.now,index:true},
  advanceType:{type:String,enum:['Supplier','Employee','Tender / Project','Travel','Security Deposit','Other'],required:true,index:true},
  recipientName:{type:String,required:true,trim:true,maxLength:240,index:true},
  purpose:{type:String,required:true,trim:true,maxLength:1200},
  amount:{type:Number,required:true,min:0.01},
  paidFromAccount:{type:mongoose.Schema.Types.ObjectId,ref:'FinanceAccount'},
  advanceAccount:{type:mongoose.Schema.Types.ObjectId,ref:'FinanceAccount'},
  paymentMethod:{type:String,enum:['Cash','Bank Transfer','Cheque','Card','Other'],default:'Cash'},
  reference:{type:String,trim:true,maxLength:160},
  projectReference:{type:String,trim:true,maxLength:160},
  expectedSettlementDate:Date,
  status:{type:String,enum:['Draft','Submitted','Approved','Paid','Partially Settled','Settled','Refunded','Cancelled'],default:'Draft',index:true},
  adjustedAmount:{type:Number,default:0,min:0},
  refundedAmount:{type:Number,default:0,min:0},
  outstandingAmount:{type:Number,default:0,min:0},
  paymentLedgerEntry:{type:mongoose.Schema.Types.ObjectId,ref:'LedgerEntry'},
  settlements:[settlementSchema],
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  submittedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},submittedAt:Date,
  approvedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},approvedAt:Date,
  paidBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},paidAt:Date,
  notes:{type:String,trim:true,maxLength:2000}
},{timestamps:true});

export default mongoose.model('Advance',schema);
