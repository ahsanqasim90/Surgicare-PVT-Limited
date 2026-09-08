import Counter from '../models/Counter.js';

export async function nextDocumentNumber(model,key,prefix,field){
  const year=new Date().getFullYear();
  for(let attempt=0;attempt<20;attempt+=1){
    const counter=await Counter.findOneAndUpdate(
      {_id:`${key}-${year}`},
      {$inc:{sequence:1}},
      {new:true,upsert:true,setDefaultsOnInsert:true}
    );
    const candidate=`${prefix}-${year}-${String(counter.sequence).padStart(4,'0')}`;
    if(!(await model.exists({[field]:candidate})))return candidate;
  }
  throw new Error(`Unable to allocate a unique ${key} number.`);
}
