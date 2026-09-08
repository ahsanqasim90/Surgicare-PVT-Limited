import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  actor:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
  actorName:{type:String,required:true},
  actorRole:{type:String,required:true},
  action:{type:String,required:true,index:true},
  resourceType:{type:String,required:true,index:true},
  resourceId:{type:mongoose.Schema.Types.ObjectId,index:true},
  changedFields:[String],
  ipAddress:String,
  userAgent:String
},{timestamps:{createdAt:true,updatedAt:false}});

schema.index({resourceType:1,resourceId:1,createdAt:-1});

export default mongoose.model('AuditLog',schema);
