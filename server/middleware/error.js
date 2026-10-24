export function notFound(req,res){res.status(404).json({message:`Not found: ${req.originalUrl}`})}

export function errorHandler(err,req,res,next){
  if (res.headersSent) return next(err);
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({message:Object.values(err.errors).map(item=>item.message).join(' ')});
  }
  if (err.name === 'CastError') return res.status(400).json({message:'Invalid record identifier.'});
  if (err.name === 'VersionError') return res.status(409).json({message:'This record changed while the request was being processed. Refresh and try again.'});
  if (err.code === 11000) return res.status(409).json({message:'A record with that unique value already exists.'});
  res.status(err.status||500).json({message:err.status ? err.message : 'The server could not complete this request.'});
}
