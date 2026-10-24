import mongoose from 'mongoose';

const schema=new mongoose.Schema({
  movementNumber:{type:String,required:true,unique:true,index:true},
  movementDate:{type:Date,default:Date.now,index:true},
  product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true,index:true},
  productName:{type:String,required:true,trim:true,maxLength:300},
  movementType:{type:String,enum:['Purchase Receipt','Sales Delivery','Customer Return','Supplier Return','Adjustment In','Adjustment Out','Damaged','Expired','Opening','Reversal'],required:true,index:true},
  quantityIn:{type:Number,default:0,min:0},
  quantityOut:{type:Number,default:0,min:0},
  balanceAfter:{type:Number,required:true,min:0},
  unitCost:{type:Number,default:0,min:0},
  batchNumber:{type:String,trim:true,maxLength:120},
  expiryDate:Date,
  location:{type:String,trim:true,maxLength:160},
  reference:{type:String,trim:true,maxLength:160,index:true},
  sourceType:{type:String,trim:true,maxLength:80,index:true},
  sourceId:{type:mongoose.Schema.Types.ObjectId,index:true},
  status:{type:String,enum:['Posted','Reversed'],default:'Posted',index:true},
  reversalOf:{type:mongoose.Schema.Types.ObjectId,ref:'StockMovement'},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
},{timestamps:true});

schema.index({product:1,movementDate:-1});
export default mongoose.model('StockMovement',schema);
