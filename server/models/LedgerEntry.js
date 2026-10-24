import mongoose from 'mongoose';

const lineSchema=new mongoose.Schema({
  account:{type:mongoose.Schema.Types.ObjectId,ref:'FinanceAccount',required:true,index:true},
  accountCode:{type:String,required:true,trim:true},
  accountName:{type:String,required:true,trim:true},
  description:{type:String,trim:true,maxLength:500},
  debit:{type:Number,default:0,min:0},
  credit:{type:Number,default:0,min:0}
},{_id:false});

const schema=new mongoose.Schema({
  voucherNumber:{type:String,required:true,unique:true,index:true},
  voucherType:{type:String,enum:['Journal','Cash Payment','Cash Receipt','Bank Payment','Bank Receipt','Expense','Advance Payment','Advance Settlement','Advance Refund','Supplier Invoice','Supplier Payment','Reversal'],required:true,index:true},
  postingDate:{type:Date,default:Date.now,index:true},
  partyName:{type:String,trim:true,maxLength:240,index:true},
  reference:{type:String,trim:true,maxLength:160,index:true},
  narration:{type:String,required:true,trim:true,maxLength:1200},
  lines:{type:[lineSchema],validate:{validator:value=>value.length>=2,message:'At least two ledger lines are required.'}},
  totalDebit:{type:Number,required:true,min:0},
  totalCredit:{type:Number,required:true,min:0},
  status:{type:String,enum:['Draft','Submitted','Posted','Reversed'],default:'Draft',index:true},
  sourceType:{type:String,trim:true,maxLength:80},
  sourceId:{type:mongoose.Schema.Types.ObjectId},
  reversalOf:{type:mongoose.Schema.Types.ObjectId,ref:'LedgerEntry'},
  reversalEntry:{type:mongoose.Schema.Types.ObjectId,ref:'LedgerEntry'},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  submittedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  submittedAt:Date,
  approvedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  approvedAt:Date
},{timestamps:true});

schema.index({'lines.account':1,postingDate:-1,status:1});
schema.index({sourceType:1,sourceId:1});

export default mongoose.model('LedgerEntry',schema);
