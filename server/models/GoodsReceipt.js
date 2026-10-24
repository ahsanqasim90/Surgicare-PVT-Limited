import mongoose from 'mongoose';

const itemSchema=new mongoose.Schema({
  purchaseOrderItem:{type:mongoose.Schema.Types.ObjectId},
  product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true},
  productName:{type:String,required:true,trim:true,maxLength:300},
  brand:{type:String,trim:true,maxLength:160},
  batchNumber:{type:String,trim:true,maxLength:120},
  manufacturingDate:Date,
  expiryDate:Date,
  orderedQuantity:{type:Number,default:0,min:0},
  receivedQuantity:{type:Number,required:true,min:0.001},
  unit:{type:String,trim:true,maxLength:80},
  unitCost:{type:Number,default:0,min:0},
  condition:{type:String,enum:['Accepted','Damaged','Rejected'],default:'Accepted'},
  notes:{type:String,trim:true,maxLength:500}
},{_id:true});

const schema=new mongoose.Schema({
  grnNumber:{type:String,required:true,unique:true,index:true},
  supplier:{type:mongoose.Schema.Types.ObjectId,ref:'Supplier',required:true,index:true},
  supplierName:{type:String,required:true,trim:true,maxLength:240},
  purchaseOrder:{type:mongoose.Schema.Types.ObjectId,ref:'PurchaseOrder',required:true,index:true},
  purchaseOrderNumber:{type:String,required:true,trim:true,maxLength:80},
  supplierDeliveryNote:{type:String,trim:true,maxLength:160},
  receiptDate:{type:Date,default:Date.now,index:true},
  location:{type:String,trim:true,maxLength:160},
  items:{type:[itemSchema],validate:{validator:value=>value.length>0,message:'At least one received item is required.'}},
  notes:{type:String,trim:true,maxLength:2000},
  status:{type:String,enum:['Draft','Posted','Reversed'],default:'Draft',index:true},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  postedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},postedAt:Date,
  reversedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},reversedAt:Date,reversalReason:String
},{timestamps:true,optimisticConcurrency:true});

export default mongoose.model('GoodsReceipt',schema);
