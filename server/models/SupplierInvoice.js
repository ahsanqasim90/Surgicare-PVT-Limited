import mongoose from 'mongoose';

const itemSchema=new mongoose.Schema({
  product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},
  description:{type:String,required:true,trim:true,maxLength:500},
  quantity:{type:Number,required:true,min:0.001},
  unitCost:{type:Number,required:true,min:0},
  discount:{type:Number,default:0,min:0},
  taxRate:{type:Number,default:0,min:0,max:100},
  taxableAmount:{type:Number,default:0,min:0},
  taxAmount:{type:Number,default:0,min:0},
  lineTotal:{type:Number,default:0,min:0}
},{_id:true});

const paymentSchema=new mongoose.Schema({
  paymentNumber:{type:String,required:true},paymentDate:{type:Date,default:Date.now},amount:{type:Number,required:true,min:0.01},
  paidFromAccount:{type:mongoose.Schema.Types.ObjectId,ref:'FinanceAccount',required:true},paymentMethod:String,reference:String,notes:String,
  ledgerEntry:{type:mongoose.Schema.Types.ObjectId,ref:'LedgerEntry',required:true},paidBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
},{timestamps:true,optimisticConcurrency:true});

const schema=new mongoose.Schema({
  invoiceNumber:{type:String,required:true,unique:true,index:true},
  supplierInvoiceNumber:{type:String,required:true,trim:true,maxLength:160,index:true},
  supplier:{type:mongoose.Schema.Types.ObjectId,ref:'Supplier',required:true,index:true},
  supplierName:{type:String,required:true,trim:true,maxLength:240},
  purchaseOrder:{type:mongoose.Schema.Types.ObjectId,ref:'PurchaseOrder'},
  goodsReceipt:{type:mongoose.Schema.Types.ObjectId,ref:'GoodsReceipt'},
  invoiceDate:{type:Date,default:Date.now,index:true},dueDate:{type:Date,index:true},
  items:{type:[itemSchema],validate:{validator:value=>value.length>0,message:'At least one invoice item is required.'}},
  subtotal:{type:Number,default:0,min:0},discountTotal:{type:Number,default:0,min:0},taxTotal:{type:Number,default:0,min:0},grandTotal:{type:Number,default:0,min:0},
  paidAmount:{type:Number,default:0,min:0},
  status:{type:String,enum:['Draft','Approved','Partially Paid','Paid','Void'],default:'Draft',index:true},
  payableLedgerEntry:{type:mongoose.Schema.Types.ObjectId,ref:'LedgerEntry'},payments:[paymentSchema],
  notes:{type:String,trim:true,maxLength:2000},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  approvedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},approvedAt:Date
},{timestamps:true});

schema.index({supplier:1,supplierInvoiceNumber:1},{unique:true});
export default mongoose.model('SupplierInvoice',schema);
