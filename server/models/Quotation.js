import mongoose from 'mongoose';

const item=new mongoose.Schema({
  product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},
  description:{type:String,required:true,trim:true,maxLength:500},
  brand:{type:String,trim:true,maxLength:160},
  unit:{type:String,trim:true,default:'No.'},
  quantity:{type:Number,default:1,min:0},
  unitRate:{type:Number,default:0,min:0},
  discount:{type:Number,default:0,min:0},
  taxRate:{type:Number,default:0,min:0,max:100},
  tax:{type:Number,default:0,min:0},
  lineTotal:{type:Number,default:0,min:0}
});

const schema=new mongoose.Schema({
  quotationNumber:{type:String,unique:true,sparse:true,index:true},
  clientName:{type:String,required:true,trim:true,maxLength:240},
  clientAddress:{type:String,trim:true,maxLength:1000},
  contactPerson:{type:String,trim:true,maxLength:160},
  tender:{type:mongoose.Schema.Types.ObjectId,ref:'Tender'},
  reference:{type:String,trim:true,maxLength:160},
  subject:{type:String,trim:true,maxLength:300},
  date:{type:Date,default:Date.now},
  validUntil:Date,
  status:{type:String,enum:['Draft','Sent','Accepted','Rejected','Expired'],default:'Draft',index:true},
  items:{type:[item],validate:{validator:value=>value.length>0,message:'At least one quotation item is required.'}},
  subtotal:{type:Number,default:0,min:0},
  taxTotal:{type:Number,default:0,min:0},
  discountTotal:{type:Number,default:0,min:0},
  grandTotal:{type:Number,default:0,min:0},
  paymentTerms:{type:String,trim:true,maxLength:1000},
  deliveryTerms:{type:String,trim:true,maxLength:1000},
  notes:{type:String,trim:true,maxLength:4000},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
},{timestamps:true});

export default mongoose.model('Quotation',schema);
