import {useEffect,useState} from 'react';
import {Plus,Trash2,X} from 'lucide-react';

const blankItem=()=>({productName:'',brand:'',batchNumber:'',manufacturingDate:'',expiryDate:'',orderedQuantity:0,quantity:1,unit:'No.',condition:'Good'});
const dateValue=value=>value?new Date(value).toISOString().slice(0,10):'';

export default function ChallanEditor({record,onClose,onSave}){
  const [form,setForm]=useState(() => ({
    clientName:record?.clientName||'',clientAddress:record?.clientAddress||'',contactPerson:record?.contactPerson||'',
    reference:record?.reference||'',purchaseOrderNumber:record?.purchaseOrderNumber||'',status:record?.status||'Draft',
    dispatchDate:dateValue(record?.dispatchDate),deliveryDate:dateValue(record?.deliveryDate)||new Date().toISOString().slice(0,10),
    transporter:record?.transporter||'',vehicleNumber:record?.vehicleNumber||'',receiverName:record?.receiverName||'',
    receiverContact:record?.receiverContact||'',receivedAt:dateValue(record?.receivedAt),notes:record?.notes||'',
    items:record?.items?.length?record.items.map(item=>({...blankItem(),...item,manufacturingDate:dateValue(item.manufacturingDate),expiryDate:dateValue(item.expiryDate)})):[blankItem()]
  }));
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  useEffect(()=>{const previous=document.body.style.overflow;const onKey=event=>event.key==='Escape'&&onClose();document.body.style.overflow='hidden';document.addEventListener('keydown',onKey);return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',onKey)}},[onClose]);
  const setField=(name,value)=>setForm(current=>({...current,[name]:value}));
  const setItem=(index,name,value)=>setForm(current=>({...current,items:current.items.map((item,itemIndex)=>itemIndex===index?{...item,[name]:value}:item)}));
  const removeItem=index=>setForm(current=>({...current,items:current.items.filter((_,itemIndex)=>itemIndex!==index)}));
  const submit=async event=>{event.preventDefault();setBusy(true);setError('');try{await onSave(form)}catch(err){setError(err.message)}finally{setBusy(false)}};

  return <div className="modal-backdrop document-backdrop" onMouseDown={event=>event.target===event.currentTarget&&onClose()}><section className="document-editor" role="dialog" aria-modal="true" aria-labelledby="challan-editor-title">
    <header className="document-editor-head"><div><span className="eyebrow">DELIVERY DOCUMENT</span><h2 id="challan-editor-title">{record?`Edit ${record.challanNumber}`:'Create delivery challan'}</h2><p>Record delivered quantities, traceable batches and receiving details.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X/></button></header>
    <form onSubmit={submit}>
      <div className="editor-section"><h3>Consignee and dispatch</h3><div className="editor-grid editor-grid-3">
        <label>Client / hospital *<input autoFocus required value={form.clientName} onChange={event=>setField('clientName',event.target.value)}/></label>
        <label>Contact person<input value={form.contactPerson} onChange={event=>setField('contactPerson',event.target.value)}/></label>
        <label>Status<select value={form.status} onChange={event=>setField('status',event.target.value)}>{['Draft','Ready','Dispatched','Partially Delivered','Delivered','Returned'].map(status=><option key={status}>{status}</option>)}</select></label>
        <label>PO number<input value={form.purchaseOrderNumber} onChange={event=>setField('purchaseOrderNumber',event.target.value)}/></label>
        <label>Tender / invoice reference<input value={form.reference} onChange={event=>setField('reference',event.target.value)}/></label>
        <label>Delivery date *<input required type="date" value={form.deliveryDate} onChange={event=>setField('deliveryDate',event.target.value)}/></label>
        <label>Dispatch date<input type="date" value={form.dispatchDate} onChange={event=>setField('dispatchDate',event.target.value)}/></label>
        <label>Transporter<input value={form.transporter} onChange={event=>setField('transporter',event.target.value)}/></label>
        <label>Vehicle number<input value={form.vehicleNumber} onChange={event=>setField('vehicleNumber',event.target.value)}/></label>
        <label className="span-2">Delivery address<textarea rows="2" value={form.clientAddress} onChange={event=>setField('clientAddress',event.target.value)}/></label>
      </div></div>
      <div className="editor-section"><div className="editor-section-head"><div><h3>Delivered products</h3><p>Batch, manufacturing and expiry data support traceability.</p></div><button type="button" className="btn btn-ghost btn-sm" onClick={()=>setField('items',[...form.items,blankItem()])}><Plus size={16}/> Add product</button></div>
        <div className="line-items">{form.items.map((item,index)=><article className="line-item challan-line" key={item._id||index}><div className="line-number">{String(index+1).padStart(2,'0')}</div>
          <label className="span-2">Product / description *<input required value={item.productName} onChange={event=>setItem(index,'productName',event.target.value)}/></label>
          <label>Brand / model<input value={item.brand||''} onChange={event=>setItem(index,'brand',event.target.value)}/></label>
          <label>Batch number<input value={item.batchNumber||''} onChange={event=>setItem(index,'batchNumber',event.target.value)}/></label>
          <label>Mfg. date<input type="date" value={item.manufacturingDate||''} onChange={event=>setItem(index,'manufacturingDate',event.target.value)}/></label>
          <label>Expiry date<input type="date" value={item.expiryDate||''} onChange={event=>setItem(index,'expiryDate',event.target.value)}/></label>
          <label>Ordered qty<input type="number" min="0" step="any" value={item.orderedQuantity} onChange={event=>setItem(index,'orderedQuantity',event.target.value)}/></label>
          <label>Delivered qty *<input required type="number" min="0" step="any" value={item.quantity} onChange={event=>setItem(index,'quantity',event.target.value)}/></label>
          <label>Unit<input value={item.unit||''} onChange={event=>setItem(index,'unit',event.target.value)}/></label>
          <label>Condition<input value={item.condition||''} onChange={event=>setItem(index,'condition',event.target.value)}/></label>
          <button type="button" className="line-remove" disabled={form.items.length===1} onClick={()=>removeItem(index)} aria-label={`Remove product ${index+1}`}><Trash2 size={16}/></button>
        </article>)}</div>
      </div>
      <div className="editor-section"><h3>Receiving acknowledgement</h3><div className="editor-grid editor-grid-3"><label>Receiver name<input value={form.receiverName} onChange={event=>setField('receiverName',event.target.value)}/></label><label>Receiver contact<input value={form.receiverContact} onChange={event=>setField('receiverContact',event.target.value)}/></label><label>Received date<input type="date" value={form.receivedAt} onChange={event=>setField('receivedAt',event.target.value)}/></label><label className="span-2">Notes<textarea rows="3" value={form.notes} onChange={event=>setField('notes',event.target.value)}/></label></div></div>
      {error&&<div className="form-message error" role="alert">{error}</div>}
      <footer className="editor-actions"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" disabled={busy}>{busy?'Saving secure record…':'Save challan'}</button></footer>
    </form>
  </section></div>;
}
