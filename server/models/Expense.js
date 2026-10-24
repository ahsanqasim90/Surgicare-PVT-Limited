import mongoose from 'mongoose';

const schema=new mongoose.Schema({
  expenseNumber:{type:String,required:true,unique:true,index:true},
  expenseDate:{type:Date,default:Date.now,index:true},
  payee:{type:String,required:true,trim:true,maxLength:240,index:true},
  category:{type:String,required:true,trim:true,maxLength:120,index:true},
  description:{type:String,required:true,trim:true,maxLength:1200},
  amount:{type:Number,required:true,min:0.01},
  taxAmount:{type:Number,default:0,min:0},
  expenseAccount:{type:mongoose.Schema.Types.ObjectId,ref:'FinanceAccount'},
  paidFromAccount:{type:mongoose.Schema.Types.ObjectId,ref:'FinanceAccount'},
  paymentMethod:{type:String,enum:['Cash','Bank Transfer','Cheque','Card','Other'],default:'Cash'},
  reference:{type:String,trim:true,maxLength:160},
  projectReference:{type:String,trim:true,maxLength:160},
  receiptUrl:{type:String,trim:true,maxLength:1000},
  status:{type:String,enum:['Draft','Submitted','Approved','Paid','Cancelled'],default:'Draft',index:true},
  ledgerEntry:{type:mongoose.Schema.Types.ObjectId,ref:'LedgerEntry'},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  submittedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},submittedAt:Date,
  approvedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},approvedAt:Date,
  paidBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},paidAt:Date,
  notes:{type:String,trim:true,maxLength:2000}
},{timestamps:true});

export default mongoose.model('Expense',schema);
