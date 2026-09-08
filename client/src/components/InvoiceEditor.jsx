import {useEffect,useMemo,useState} from 'react';
import {Plus,Trash2,X} from 'lucide-react';

const blankItem=()=>({description:'',brand:'',unit:'No.',quantity:1,unitRate:0,discount:0,taxRate:0});
const dateValue=value=>value?new Date(value).toISOString().slice(0,10):'';
const money=value=>Number(value||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const calculate=item=>{const subtotal=Number(item.quantity||0)*Number(item.unitRate||0);const discount=Math.min(Number(item.discount||0),subtotal);const taxable=Math.max(0,subtotal-discount);const tax=taxable*Math.min(100,Number(item.taxRate||0))/100;return{subtotal,discount,taxable,tax,total:taxable+tax}};

export default function InvoiceEditor({record,onClose,onSave}){
  const [form,setForm]=useState(() => ({
    invoiceNumber:record?.invoiceNumber||'',invoiceDate:dateValue(record?.invoiceDate)||new Date().toISOString().slice(0,10),dueDate:dateValue(record?.dueDate),status:record?.status||'Draft',
    clientName:record?.clientName||'',clientAddress:record?.clientAddress||'',contactPerson:record?.contactPerson||'',sellerNTN:record?.sellerNTN||'',sellerSTRN:record?.sellerSTRN||'',buyerNTN:record?.buyerNTN||'',buyerSTRN:record?.buyerSTRN||'',
    purchaseOrderNumber:record?.purchaseOrderNumber||'',reference:record?.reference||'',paymentTerms:record?.paymentTerms||'',notes:record?.notes||'',
    items:record?.items?.length?record.items.map(item=>({...item})):[blankItem()]
  }));
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  useEffect(()=>{const previous=document.body.style.overflow;const onKey=event=>event.key==='Escape'&&onClose();document.body.style.overflow='hidden';document.addEventListener('keydown',onKey);return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',onKey)}},[onClose]);
  const totals=useMemo(()=>form.items.map(calculate).reduce((sum,item)=>({subtotal:sum.subtotal+item.subtotal,discount:sum.discount+item.discount,taxable:sum.taxable+item.taxable,tax:sum.tax+item.tax,total:sum.total+item.total}),{subtotal:0,discount:0,taxable:0,tax:0,total:0}),[form.items]);
  const setField=(name,value)=>setForm(current=>({...current,[name]:value}));
  const setItem=(index,name,value)=>setForm(current=>({...current,items:current.items.map((item,itemIndex)=>itemIndex===index?{...item,[name]:value}:item)}));
  const removeItem=index=>setForm(current=>({...current,items:current.items.filter((_,itemIndex)=>itemIndex!==index)}));
  const submit=async event=>{event.preventDefault();setBusy(true);setError('');try{await onSave(form)}catch(err){setError(err.message)}finally{setBusy(false)}};

  return <div className="modal-backdrop document-backdrop" onMouseDown={event=>event.target===event.currentTarget&&onClose()}><section className="document-editor" role="dialog" aria-modal="true" aria-labelledby="invoice-editor-title">
    <header className="document-editor-head"><div><span className="eyebrow">TAX DOCUMENT</span><h2 id="invoice-editor-title">{record?`Edit ${record.invoiceNumber}`:'Create sales tax invoice'}</h2><p>Taxable values and sales tax are recalculated securely by the server.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X/></button></header>
    <form onSubmit={submit}>
      <div className="editor-section"><h3>Invoice and buyer</h3><div className="editor-grid editor-grid-3">
        <label>Client / hospital *<input autoFocus required value={form.clientName} onChange={event=>setField('clientName',event.target.value)}/></label>
        <label>Contact person<input value={form.contactPerson} onChange={event=>setField('contactPerson',event.target.value)}/></label>
        <label>Status<select value={form.status} onChange={event=>setField('status',event.target.value)}>{['Draft','Issued','Partially Paid','Paid','Void'].map(status=><option key={status}>{status}</option>)}</select></label>
        <label>Invoice date *<input required type="date" value={form.invoiceDate} onChange={event=>setField('invoiceDate',event.target.value)}/></label>
        <label>Due date<input type="date" value={form.dueDate} onChange={event=>setField('dueDate',event.target.value)}/></label>
        <label>PO number<input value={form.purchaseOrderNumber} onChange={event=>setField('purchaseOrderNumber',event.target.value)}/></label>
        <label>Reference<input value={form.reference} onChange={event=>setField('reference',event.target.value)}/></label>
        <label>Seller NTN<input value={form.sellerNTN} onChange={event=>setField('sellerNTN',event.target.value)}/></label>
        <label>Seller STRN<input value={form.sellerSTRN} onChange={event=>setField('sellerSTRN',event.target.value)}/></label>
        <label>Buyer NTN<input value={form.buyerNTN} onChange={event=>setField('buyerNTN',event.target.value)}/></label>
        <label>Buyer STRN<input value={form.buyerSTRN} onChange={event=>setField('buyerSTRN',event.target.value)}/></label>
        <label className="span-2">Buyer address<textarea rows="2" value={form.clientAddress} onChange={event=>setField('clientAddress',event.target.value)}/></label>
      </div></div>
      <div className="editor-section"><div className="editor-section-head"><div><h3>Taxable items</h3><p>Enter only verified tax registration details and applicable rates.</p></div><button type="button" className="btn btn-ghost btn-sm" onClick={()=>setField('items',[...form.items,blankItem()])}><Plus size={16}/> Add item</button></div>
        <div className="line-items">{form.items.map((item,index)=>{const result=calculate(item);return <article className="line-item invoice-line" key={item._id||index}><div className="line-number">{String(index+1).padStart(2,'0')}</div>
          <label className="span-2">Product / description *<input required value={item.description} onChange={event=>setItem(index,'description',event.target.value)}/></label>
          <label>Brand / model<input value={item.brand||''} onChange={event=>setItem(index,'brand',event.target.value)}/></label>
          <label>Unit<input value={item.unit||''} onChange={event=>setItem(index,'unit',event.target.value)}/></label>
          <label>Quantity *<input required type="number" min="0" step="any" value={item.quantity} onChange={event=>setItem(index,'quantity',event.target.value)}/></label>
          <label>Unit rate *<input required type="number" min="0" step="0.01" value={item.unitRate} onChange={event=>setItem(index,'unitRate',event.target.value)}/></label>
          <label>Discount<input type="number" min="0" step="0.01" value={item.discount} onChange={event=>setItem(index,'discount',event.target.value)}/></label>
          <label>Sales tax %<input type="number" min="0" max="100" step="0.01" value={item.taxRate} onChange={event=>setItem(index,'taxRate',event.target.value)}/></label>
          <div className="line-total"><span>Tax / total</span><b>{money(result.tax)} / {money(result.total)}</b></div>
          <button type="button" className="line-remove" disabled={form.items.length===1} onClick={()=>removeItem(index)} aria-label={`Remove item ${index+1}`}><Trash2 size={16}/></button>
        </article>})}</div>
      </div>
      <div className="editor-section editor-grid editor-grid-3"><label>Payment terms<textarea rows="3" value={form.paymentTerms} onChange={event=>setField('paymentTerms',event.target.value)}/></label><label className="span-2">Notes<textarea rows="3" value={form.notes} onChange={event=>setField('notes',event.target.value)}/></label></div>
      <div className="quotation-totals"><span>Subtotal <b>PKR {money(totals.subtotal)}</b></span><span>Discount <b>- PKR {money(totals.discount)}</b></span><span>Taxable <b>PKR {money(totals.taxable)}</b></span><span>Sales tax <b>PKR {money(totals.tax)}</b></span><strong>Invoice total <b>PKR {money(totals.total)}</b></strong></div>
      {error&&<div className="form-message error" role="alert">{error}</div>}
      <footer className="editor-actions"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" disabled={busy}>{busy?'Saving secure record…':'Save invoice'}</button></footer>
    </form>
  </section></div>;
}
