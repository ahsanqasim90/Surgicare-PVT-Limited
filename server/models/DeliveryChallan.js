import mongoose from 'mongoose';
const item=new mongoose.Schema({
  product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},
  productName:{type:String,required:true,trim:true,maxLength:300},
  brand:{type:String,trim:true,maxLength:160},
  batchNumber:{type:String,trim:true,maxLength:120},
  manufacturingDate:Date,
  expiryDate:Date,
  orderedQuantity:{type:Number,default:0,min:0},
  quantity:{type:Number,required:true,min:0},
  unit:{type:String,trim:true,default:'No.',maxLength:40},
  condition:{type:String,trim:true,maxLength:160}
});
const schema=new mongoose.Schema({
  challanNumber:{type:String,unique:true,sparse:true,index:true},
  clientName:{type:String,required:true,trim:true,maxLength:240},
  clientAddress:{type:String,trim:true,maxLength:1000},
  contactPerson:{type:String,trim:true,maxLength:160},
  reference:{type:String,trim:true,maxLength:160},
  purchaseOrderNumber:{type:String,trim:true,maxLength:160},
  dispatchDate:Date,
  deliveryDate:{type:Date,default:Date.now},
  items:{type:[item],validate:{validator:value=>value.length>0,message:'At least one delivery item is required.'}},
  transporter:{type:String,trim:true,maxLength:160},
  vehicleNumber:{type:String,trim:true,maxLength:80},
  receiverName:{type:String,trim:true,maxLength:160},
  receiverContact:{type:String,trim:true,maxLength:120},
  receivedAt:Date,
  status:{type:String,enum:['Draft','Ready','Dispatched','Partially Delivered','Delivered','Returned'],default:'Draft',index:true},
  notes:{type:String,trim:true,maxLength:4000},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
},{timestamps:true});
export default mongoose.model('DeliveryChallan',schema);
