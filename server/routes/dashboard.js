import {Router} from 'express';
import Tender from '../models/Tender.js'; import Product from '../models/Product.js'; import Payment from '../models/Payment.js';
const r=Router();
r.get('/',async(req,res,next)=>{try{
 const [tenders,products,payments]=await Promise.all([Tender.find({},'status'),Product.find({isActive:true},'stockQty minStock'),Payment.find().sort({dueDate:1})]);
 const activeStatuses=['Draft','Prepared','Submitted','Under Evaluation','Approved','Partially Approved'];
 const tenderStatus=tenders.reduce((a,t)=>((a[t.status]=(a[t.status]||0)+1),a),{});
 const outstanding=payments.reduce((s,p)=>s+Math.max(0,(p.amount||0)-(p.receivedAmount||0)),0);
 const revenue=payments.reduce((s,p)=>s+(p.receivedAmount||0),0);
 const upcomingPayments=payments.filter(p=>(p.amount||0)>(p.receivedAmount||0)).slice(0,5).map(payment=>({...payment.toObject(),outstandingAmount:Math.max(0,(payment.amount||0)-(payment.receivedAmount||0))}));
 const lowStockItems=products.filter(product=>(product.stockQty||0)<=(product.minStock||0)).length;
 res.json({revenue,outstanding,activeTenders:tenders.filter(t=>activeStatuses.includes(t.status)).length,inventoryItems:products.length,lowStockItems,tenderStatus,upcomingPayments});
}catch(e){next(e)}});
export default r;
