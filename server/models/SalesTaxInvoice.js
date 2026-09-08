import mongoose from 'mongoose';

const item=new mongoose.Schema({
  product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},
  description:{type:String,required:true,trim:true,maxLength:500},
  brand:{type:String,trim:true,maxLength:160},
  unit:{type:String,trim:true,default:'No.',maxLength:40},
  quantity:{type:Number,required:true,min:0},
  unitRate:{type:Number,required:true,min:0},
  discount:{type:Number,default:0,min:0},
  taxRate:{type:Number,default:0,min:0,max:100},
  taxableValue:{type:Number,default:0,min:0},
  taxAmount:{type:Number,default:0,min:0},
  lineTotal:{type:Number,default:0,min:0}
});

const schema=new mongoose.Schema({
  invoiceNumber:{type:String,required:true,unique:true,index:true},
  invoiceDate:{type:Date,default:Date.now,index:true},
  dueDate:Date,
  status:{type:String,enum:['Draft','Issued','Partially Paid','Paid','Void'],default:'Draft',index:true},
  clientName:{type:String,required:true,trim:true,maxLength:240},
  clientAddress:{type:String,trim:true,maxLength:1000},
  contactPerson:{type:String,trim:true,maxLength:160},
  sellerNTN:{type:String,trim:true,maxLength:80},
  sellerSTRN:{type:String,trim:true,maxLength:80},
  buyerNTN:{type:String,trim:true,maxLength:80},
  buyerSTRN:{type:String,trim:true,maxLength:80},
  purchaseOrderNumber:{type:String,trim:true,maxLength:160},
  reference:{type:String,trim:true,maxLength:160},
  quotation:{type:mongoose.Schema.Types.ObjectId,ref:'Quotation'},
  challan:{type:mongoose.Schema.Types.ObjectId,ref:'DeliveryChallan'},
  items:{type:[item],validate:{validator:value=>value.length>0,message:'At least one invoice item is required.'}},
  subtotal:{type:Number,default:0,min:0},
  discountTotal:{type:Number,default:0,min:0},
  taxableTotal:{type:Number,default:0,min:0},
  salesTaxTotal:{type:Number,default:0,min:0},
  grandTotal:{type:Number,default:0,min:0},
  paymentTerms:{type:String,trim:true,maxLength:1000},
  notes:{type:String,trim:true,maxLength:4000},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
},{timestamps:true});

export default mongoose.model('SalesTaxInvoice',schema);
