import mongoose from 'mongoose';

const schema=new mongoose.Schema({
  code:{type:String,required:true,unique:true,index:true,trim:true,maxLength:30},
  name:{type:String,required:true,trim:true,maxLength:160},
  type:{type:String,enum:['Cash','Bank','Asset','Liability','Equity','Income','Expense','Tax'],required:true,index:true},
  description:{type:String,trim:true,maxLength:500},
  openingBalance:{type:Number,default:0},
  openingSide:{type:String,enum:['Debit','Credit'],default:'Debit'},
  isSystem:{type:Boolean,default:false},
  isActive:{type:Boolean,default:true,index:true},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
},{timestamps:true});

export default mongoose.model('FinanceAccount',schema);
