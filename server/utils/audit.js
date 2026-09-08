import AuditLog from '../models/AuditLog.js';

export async function recordAudit(req,action,resourceType,resourceId,changedFields=[]){
  if(!req.user)return;
  try{
    await AuditLog.create({
      actor:req.user._id,
      actorName:req.user.name,
      actorRole:req.user.role,
      action,
      resourceType,
      resourceId,
      changedFields:[...new Set(changedFields)].slice(0,100),
      ipAddress:req.ip,
      userAgent:String(req.headers['user-agent']||'').slice(0,500)
    });
  }catch(error){
    console.error(`Audit log failed for ${resourceType} ${resourceId}:`,error.message);
  }
}
