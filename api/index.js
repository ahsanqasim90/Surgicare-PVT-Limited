import app from '../server/app.js';
import connectDB from '../server/config/db.js';

let connectionPromise;

export default async function handler(req,res){
  if(req.url?.startsWith('/api/health'))return app(req,res);
  if(!process.env.MONGO_URI)return res.status(503).json({message:'Database configuration is pending for this preview.'});
  try{
    connectionPromise ||= connectDB();
    await connectionPromise;
    return app(req,res);
  }catch(error){
    connectionPromise=null;
    console.error(error.message);
    return res.status(503).json({message:'The database is temporarily unavailable.'});
  }
}
