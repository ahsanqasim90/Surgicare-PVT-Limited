import {Router} from 'express';
import DeliveryChallan from '../models/DeliveryChallan.js';
import {list,getOne,update,remove} from '../controllers/crud.js';
import {nextDocumentNumber} from '../utils/numbering.js';
import {authorize} from '../middleware/authorize.js';
import {recordAudit} from '../utils/audit.js';

const router=Router();
router.use(authorize('Director','Admin','Inventory'));
router.get('/',list(DeliveryChallan));
router.get('/:id',getOne(DeliveryChallan));
router.post('/',async(req,res,next)=>{try{
  const challanNumber=req.body.challanNumber||await nextDocumentNumber(DeliveryChallan,'challan','SG-DC','challanNumber');
  const record=await DeliveryChallan.create({...req.body,challanNumber});
  await recordAudit(req,'CREATE','DeliveryChallan',record._id,Object.keys(req.body));
  res.status(201).json(record);
}catch(error){next(error)}});
router.put('/:id',update(DeliveryChallan));
router.delete('/:id',remove(DeliveryChallan));
export default router;
