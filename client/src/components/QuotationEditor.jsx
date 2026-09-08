import {useEffect,useMemo,useState} from 'react';
import {Plus,Trash2,X} from 'lucide-react';

const blankItem=()=>({description:'',brand:'',unit:'No.',quantity:1,unitRate:0,discount:0,taxRate:0});
const dateValue=value=>value?new Date(value).toISOString().slice(0,10):'';
const money=value=>Number(value||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const calculate=item=>{const base=Number(item.quantity||0)*Number(item.unitRate||0);const discount=Math.min(Number(item.discount||0),base);const taxable=Math.max(0,base-discount);const tax=taxable*Number(item.taxRate||0)/100;return {base,discount,tax,total:taxable+tax}};

export default function QuotationEditor({record,onClose,onSave}){
  const [form,setForm]=useState(()=>({
    clientName:record?.clientName||'',clientAddress:record?.clientAddress||'',contactPerson:record?.contactPerson||'',
    reference:record?.reference||'',subject:record?.subject||'',date:dateValue(record?.date)||new Date().toISOString().slice(0,10),
    validUntil:dateValue(record?.validUntil),status:record?.status||'Draft',paymentTerms:record?.paymentTerms||'',deliveryTerms:record?.deliveryTerms||'',notes:record?.notes||'',
    items:record?.items?.length?record.items.map(item=>({...item})): [blankItem()]
  }));
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  useEffect(()=>{const previous=document.body.style.overflow;const onKey=event=>event.key==='Escape'&&onClose();document.body.style.overflow='hidden';document.addEventListener('keydown',onKey);return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',onKey)}},[onClose]);
  const totals=useMemo(()=>form.items.map(calculate).reduce((sum,item)=>({subtotal:sum.subtotal+item.base,discount:sum.discount+item.discount,tax:sum.tax+item.tax,total:sum.total+item.total}),{subtotal:0,discount:0,tax:0,total:0}),[form.items]);
  const setField=(name,value)=>setForm(current=>({...current,[name]:value}));
  const setItem=(index,name,value)=>setForm(current=>({...current,items:current.items.map((item,itemIndex)=>itemIndex===index?{...item,[name]:value}:item)}));
  const removeItem=index=>setForm(current=>({...current,items:current.items.filter((_,itemIndex)=>itemIndex!==index)}));
  const submit=async event=>{event.preventDefault();setBusy(true);setError('');try{await onSave(form)}catch(err){setError(err.message)}finally{setBusy(false)}};

  return <div className="modal-backdrop document-backdrop" onMouseDown={event=>event.target===event.currentTarget&&onClose()}>
    <section className="document-editor" role="dialog" aria-modal="true" aria-labelledby="quotation-editor-title">
      <header className="document-editor-head"><div><span className="eyebrow">COMMERCIAL DOCUMENT</span><h2 id="quotation-editor-title">{record?`Edit ${record.quotationNumber}`:'Create quotation'}</h2><p>Build a complete itemised quotation. Final figures are recalculated securely by the server.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X/></button></header>
      <form onSubmit={submit}>
        <div className="editor-section"><h3>Customer and reference</h3><div className="editor-grid editor-grid-3">
          <label>Client / hospital *<input autoFocus required value={form.clientName} onChange={event=>setField('clientName',event.target.value)}/></label>
          <label>Contact person<input value={form.contactPerson} onChange={event=>setField('contactPerson',event.target.value)}/></label>
          <label>Tender / RFQ reference<input value={form.reference} onChange={event=>setField('reference',event.target.value)}/></label>
          <label className="span-2">Subject<input value={form.subject} onChange={event=>setField('subject',event.target.value)} placeholder="Quotation for medical supplies"/></label>
          <label>Status<select value={form.status} onChange={event=>setField('status',event.target.value)}>{['Draft','Sent','Accepted','Rejected','Expired'].map(status=><option key={status}>{status}</option>)}</select></label>
          <label>Quotation date *<input required type="date" value={form.date} onChange={event=>setField('date',event.target.value)}/></label>
          <label>Valid until<input type="date" value={form.validUntil} onChange={event=>setField('validUntil',event.target.value)}/></label>
          <label className="span-2">Client address<textarea rows="2" value={form.clientAddress} onChange={event=>setField('clientAddress',event.target.value)}/></label>
        </div></div>

        <div className="editor-section"><div className="editor-section-head"><div><h3>Quotation items</h3><p>Enter the approved tax treatment only after verification.</p></div><button type="button" className="btn btn-ghost btn-sm" onClick={()=>setField('items',[...form.items,blankItem()])}><Plus size={16}/> Add item</button></div>
          <div className="line-items">{form.items.map((item,index)=>{const result=calculate(item);return <article className="line-item quotation-line" key={item._id||index}>
            <div className="line-number">{String(index+1).padStart(2,'0')}</div>
            <label className="span-2">Product / description *<input required value={item.description} onChange={event=>setItem(index,'description',event.target.value)}/></label>
            <label>Brand / model<input value={item.brand||''} onChange={event=>setItem(index,'brand',event.target.value)}/></label>
            <label>Unit<input value={item.unit||''} onChange={event=>setItem(index,'unit',event.target.value)}/></label>
            <label>Quantity<input type="number" min="0" step="any" value={item.quantity} onChange={event=>setItem(index,'quantity',event.target.value)}/></label>
            <label>Unit rate<input type="number" min="0" step="0.01" value={item.unitRate} onChange={event=>setItem(index,'unitRate',event.target.value)}/></label>
            <label>Discount (PKR)<input type="number" min="0" step="0.01" value={item.discount} onChange={event=>setItem(index,'discount',event.target.value)}/></label>
            <label>Sales tax %<input type="number" min="0" max="100" step="0.01" value={item.taxRate} onChange={event=>setItem(index,'taxRate',event.target.value)}/></label>
            <div className="line-total"><span>Line total</span><b>PKR {money(result.total)}</b></div>
            <button type="button" className="line-remove" disabled={form.items.length===1} onClick={()=>removeItem(index)} aria-label={`Remove item ${index+1}`}><Trash2 size={16}/></button>
          </article>})}</div>
        </div>

        <div className="editor-section editor-grid editor-grid-3"><label>Payment terms<textarea rows="3" value={form.paymentTerms} onChange={event=>setField('paymentTerms',event.target.value)}/></label><label>Delivery terms<textarea rows="3" value={form.deliveryTerms} onChange={event=>setField('deliveryTerms',event.target.value)}/></label><label>Notes<textarea rows="3" value={form.notes} onChange={event=>setField('notes',event.target.value)}/></label></div>
        <div className="quotation-totals"><span>Subtotal <b>PKR {money(totals.subtotal)}</b></span><span>Discount <b>- PKR {money(totals.discount)}</b></span><span>Sales tax <b>PKR {money(totals.tax)}</b></span><strong>Grand total <b>PKR {money(totals.total)}</b></strong></div>
        {error&&<div className="form-message error" role="alert">{error}</div>}
        <footer className="editor-actions"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" disabled={busy}>{busy?'Saving secure record…':'Save quotation'}</button></footer>
      </form>
    </section>
  </div>;
}
