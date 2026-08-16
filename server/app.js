import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';
import Tender from './models/Tender.js';
import Payment from './models/Payment.js';
import Client from './models/Client.js';
import resourceRoutes from './routes/resourceRoutes.js';
import productRoutes from './routes/productRoutes.js';
import quotationRoutes from './routes/quotationRoutes.js';
import challanRoutes from './routes/challanRoutes.js';
import dashboardRoutes from './routes/dashboard.js';
import authRoutes from './routes/authRoutes.js';
import rfqRoutes from './routes/rfqRoutes.js';
import {protect} from './middleware/auth.js';
import {notFound,errorHandler} from './middleware/error.js';

const app=express();
app.disable('x-powered-by');
app.set('trust proxy',1);
app.use(helmet());
app.use(cors({origin:process.env.CLIENT_URL||'http://localhost:5173'}));
app.use(express.json({limit:'2mb'}));
app.use(morgan(process.env.NODE_ENV==='production'?'combined':'dev'));

app.get('/api/health',(req,res)=>res.json({ok:true,service:'Surgicare API'}));

const authLimiter=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Too many sign-in attempts. Please try again later.'}});
const enquiryLimiter=rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Too many enquiries were submitted. Please try again later.'}});

app.use('/api/auth/login',authLimiter);
app.use('/api/rfqs',enquiryLimiter,rfqRoutes);
app.use('/api/auth',authRoutes);
app.use('/api/products',productRoutes);
app.use('/api/tenders',protect,resourceRoutes(Tender));
app.use('/api/quotations',protect,quotationRoutes);
app.use('/api/challans',protect,challanRoutes);
app.use('/api/payments',protect,resourceRoutes(Payment));
app.use('/api/clients',protect,resourceRoutes(Client));
app.use('/api/dashboard',protect,dashboardRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
