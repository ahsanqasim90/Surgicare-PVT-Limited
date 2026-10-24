import mongoose from 'mongoose';

const itemSchema=new mongoose.Schema({
  product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},
  productName:{type:String,required:true,trim:true,maxLength:300},
  sku:{type:String,trim:true,maxLength:100},
  brand:{type:String,trim:true,maxLength:160},
  unit:{type:String,trim:true,maxLength:80},
  quantity:{type:Number,required:true,min:0.001},
  unitCost:{type:Number,required:true,min:0},
  discount:{type:Number,default:0,min:0},
  taxRate:{type:Number,default:0,min:0,max:100},
  taxableAmount:{type:Number,default:0,min:0},
  taxAmount:{type:Number,default:0,min:0},
  lineTotal:{type:Number,default:0,min:0},
  receivedQuantity:{type:Number,default:0,min:0}
},{_id:true});

const schema=new mongoose.Schema({
  poNumber:{type:String,required:true,unique:true,index:true},
  supplier:{type:mongoose.Schema.Types.ObjectId,ref:'Supplier',required:true,index:true},
  supplierName:{type:String,required:true,trim:true,maxLength:240},
  orderDate:{type:Date,default:Date.now,index:true},
  expectedDeliveryDate:Date,
  reference:{type:String,trim:true,maxLength:160},
  items:{type:[itemSchema],validate:{validator:value=>value.length>0,message:'At least one item is required.'}},
  subtotal:{type:Number,default:0,min:0},
  discountTotal:{type:Number,default:0,min:0},
  taxTotal:{type:Number,default:0,min:0},
  grandTotal:{type:Number,default:0,min:0},
  paymentTerms:{type:String,trim:true,maxLength:500},
  deliveryTerms:{type:String,trim:true,maxLength:500},
  deliveryAddress:{type:String,trim:true,maxLength:700},
  notes:{type:String,trim:true,maxLength:2000},
  status:{type:String,enum:['Draft','Submitted','Approved','Ordered','Partially Received','Received','Cancelled'],default:'Draft',index:true},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  submittedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},submittedAt:Date,
  approvedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},approvedAt:Date,
  orderedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},orderedAt:Date
},{timestamps:true,optimisticConcurrency:true});

export default mongoose.model('PurchaseOrder',schema);
