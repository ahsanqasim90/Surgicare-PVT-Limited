import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const port=process.env.PORT||5000;

connectDB()
  .then(()=>app.listen(port,()=>console.log(`Surgicare API running on ${port}`)))
  .catch(error=>{console.error(error.message);process.exit(1)});
