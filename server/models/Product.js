import mongoose from 'mongoose';
const specification=new mongoose.Schema({label:{type:String,trim:true},value:{type:String,trim:true}},{_id:false});
const schema=new mongoose.Schema({
  name:{type:String,required:true,trim:true},
  slug:{type:String,trim:true,lowercase:true,index:true,unique:true,sparse:true},
  sku:{type:String,trim:true},
  category:{type:String,default:'Uncategorised',trim:true},
  manufacturer:{type:String,trim:true},
  description:{type:String,trim:true},
  fullDescription:{type:String,trim:true},
  images:[String],
  specifications:[specification],
  packagingInformation:{type:String,trim:true},
  availability:{type:String,enum:['Enquire','Available','Limited','Unavailable'],default:'Enquire'},
  unit:String,
  stockQty:{type:Number,default:0,min:0},
  minStock:{type:Number,default:0,min:0},
  purchasePrice:{type:Number,default:0,min:0},
  sellingPrice:{type:Number,default:0,min:0},
  batchNumber:String,
  expiryDate:Date,
  location:String,
  imageUrl:String,
  featured:{type:Boolean,default:false},
  isActive:{type:Boolean,default:true}
},{timestamps:true});
schema.pre('validate',function(next){if(!this.slug&&this.name)this.slug=this.name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');next()});
export default mongoose.model('Product',schema);
