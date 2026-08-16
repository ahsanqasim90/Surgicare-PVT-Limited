import {Router} from 'express';
import Product from '../models/Product.js';
import {protect} from '../middleware/auth.js';
import {create,update,remove} from '../controllers/crud.js';

const router=Router();
router.get('/',async(req,res,next)=>{try{res.json(await Product.find({isActive:true}).sort({featured:-1,name:1}).limit(250))}catch(error){next(error)}});
router.get('/slug/:slug',async(req,res,next)=>{try{const product=await Product.findOne({slug:req.params.slug,isActive:true});if(!product)return res.status(404).json({message:'Product not found.'});res.json(product)}catch(error){next(error)}});
router.get('/:id',async(req,res,next)=>{try{const product=await Product.findOne({_id:req.params.id,isActive:true});if(!product)return res.status(404).json({message:'Product not found.'});res.json(product)}catch(error){next(error)}});
router.post('/',protect,create(Product));
router.put('/:id',protect,update(Product));
router.delete('/:id',protect,remove(Product));
export default router;
