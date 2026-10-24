import mongoose from 'mongoose';

const schema=new mongoose.Schema({
  supplierCode:{type:String,required:true,unique:true,index:true,trim:true},
  name:{type:String,required:true,trim:true,maxLength:240,index:true},
  contactPerson:{type:String,trim:true,maxLength:160},
  email:{type:String,trim:true,lowercase:true,maxLength:240},
  phone:{type:String,trim:true,maxLength:80},
  ntn:{type:String,trim:true,maxLength:80},
  strn:{type:String,trim:true,maxLength:80},
  address:{type:String,trim:true,maxLength:700},
  city:{type:String,trim:true,maxLength:120},
  paymentTerms:{type:String,trim:true,maxLength:240},
  bankName:{type:String,trim:true,maxLength:160},
  bankAccountTitle:{type:String,trim:true,maxLength:160},
  bankAccountNumber:{type:String,trim:true,maxLength:120},
  iban:{type:String,trim:true,maxLength:80},
  openingBalance:{type:Number,default:0,min:0},
  status:{type:String,enum:['Active','Inactive'],default:'Active',index:true},
  notes:{type:String,trim:true,maxLength:2000},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
},{timestamps:true});

export default mongoose.model('Supplier',schema);
