import {Router} from 'express'; import {list,getOne,create,update,remove} from '../controllers/crud.js';
export default function resourceRoutes(model,{beforeCreate}={}){const r=Router();r.get('/',list(model));r.get('/:id',getOne(model));r.post('/',beforeCreate||create(model));r.put('/:id',update(model));r.delete('/:id',remove(model));return r}
