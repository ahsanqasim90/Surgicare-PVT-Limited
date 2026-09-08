import {useEffect,useMemo,useState} from 'react';
import {Plus,Trash2,X} from 'lucide-react';

const blankItem=()=>({productName:'',brand:'',unit:'No.',quantity:1,quotedRate:0,approvalStatus:'Pending',approvedQuantity:0,approvedRate:0,rejectionReason:''});
const dateValue=value=>value?new Date(value).toISOString().slice(0,10):'';

export default function TenderEditor({record,onClose,onSave}){
  const [form,setForm]=useState(()=>({
    title:record?.title||'',tenderNumber:record?.tenderNumber||'',hospitalName:record?.hospitalName||'',
    closingDate:dateValue(record?.closingDate),submissionDate:dateValue(record?.submissionDate),evaluationDate:dateValue(record?.evaluationDate),
    awardNumber:record?.awardNumber||'',status:record?.status||'Draft',notes:record?.notes||'',statusNote:'',
    items:record?.items?.length?record.items.map(item=>({...blankItem(),...item,productName:item.productName||item.description||''})): [blankItem()]
  }));
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  useEffect(()=>{const previous=document.body.style.overflow;const onKey=event=>event.key==='Escape'&&onClose();document.body.style.overflow='hidden';document.addEventListener('keydown',onKey);return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',onKey)}},[onClose]);
  const total=useMemo(()=>form.items.reduce((sum,item)=>sum+Number(item.quantity||0)*Number(item.quotedRate||0),0),[form.items]);
  const approvedTotal=useMemo(()=>form.items.reduce((sum,item)=>sum+Number(item.approvedQuantity||0)*Number(item.approvedRate||0),0),[form.items]);
  const setField=(name,value)=>setForm(current=>({...current,[name]:value}));
  const setItem=(index,name,value)=>setForm(current=>({...current,items:current.items.map((item,itemIndex)=>itemIndex===index?{...item,[name]:value}:item)}));
  const removeItem=index=>setForm(current=>({...current,items:current.items.filter((_,itemIndex)=>itemIndex!==index)}));
  const submit=async event=>{event.preventDefault();setBusy(true);setError('');try{await onSave(form)}catch(err){setError(err.message)}finally{setBusy(false)}};

  return <div className="modal-backdrop document-backdrop" onMouseDown={event=>event.target===event.currentTarget&&onClose()}>
    <section className="document-editor" role="dialog" aria-modal="true" aria-labelledby="tender-editor-title">
      <header className="document-editor-head"><div><span className="eyebrow">TENDER WORKSPACE</span><h2 id="tender-editor-title">{record?'Update tender':'Create tender'}</h2><p>Track the submission and record the evaluation result for every offered product.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X/></button></header>
      <form onSubmit={submit}>
        <div className="editor-section"><h3>Tender information</h3><div className="editor-grid editor-grid-3">
          <label>Tender title *<input autoFocus required value={form.title} onChange={event=>setField('title',event.target.value)}/></label>
          <label>Tender number<input value={form.tenderNumber} onChange={event=>setField('tenderNumber',event.target.value)}/></label>
          <label>Hospital / organisation *<input required value={form.hospitalName} onChange={event=>setField('hospitalName',event.target.value)}/></label>
          <label>Closing date<input type="date" value={form.closingDate} onChange={event=>setField('closingDate',event.target.value)}/></label>
          <label>Submission date<input type="date" value={form.submissionDate} onChange={event=>setField('submissionDate',event.target.value)}/></label>
          <label>Evaluation date<input type="date" value={form.evaluationDate} onChange={event=>setField('evaluationDate',event.target.value)}/></label>
          <label>Status<select value={form.status} onChange={event=>setField('status',event.target.value)}>{['Draft','Prepared','Submitted','Under Evaluation','Approved','Partially Approved','Rejected','Completed'].map(status=><option key={status}>{status}</option>)}</select></label>
          <label>Award / PO number<input value={form.awardNumber} onChange={event=>setField('awardNumber',event.target.value)}/></label>
          <label>Status note<input value={form.statusNote} onChange={event=>setField('statusNote',event.target.value)} placeholder="Reason or supporting note"/></label>
        </div></div>

        <div className="editor-section"><div className="editor-section-head"><div><h3>Products and evaluation</h3><p>Approval status controls the calculated overall tender result.</p></div><button type="button" className="btn btn-ghost btn-sm" onClick={()=>setField('items',[...form.items,blankItem()])}><Plus size={16}/> Add product</button></div>
          <div className="line-items">{form.items.map((item,index)=><article className="line-item tender-line" key={item._id||index}>
            <div className="line-number">{String(index+1).padStart(2,'0')}</div>
            <label className="span-2">Product name *<input required value={item.productName} onChange={event=>setItem(index,'productName',event.target.value)}/></label>
            <label>Brand / model<input value={item.brand||''} onChange={event=>setItem(index,'brand',event.target.value)}/></label>
            <label>Unit<input value={item.unit||''} onChange={event=>setItem(index,'unit',event.target.value)}/></label>
            <label>Offered qty<input type="number" min="0" step="any" value={item.quantity} onChange={event=>setItem(index,'quantity',event.target.value)}/></label>
            <label>Quoted rate<input type="number" min="0" step="0.01" value={item.quotedRate} onChange={event=>setItem(index,'quotedRate',event.target.value)}/></label>
            <label>Evaluation<select value={item.approvalStatus} onChange={event=>setItem(index,'approvalStatus',event.target.value)}>{['Pending','Approved','Partially Approved','Rejected'].map(status=><option key={status}>{status}</option>)}</select></label>
            <label>Approved qty<input type="number" min="0" step="any" value={item.approvedQuantity} onChange={event=>setItem(index,'approvedQuantity',event.target.value)}/></label>
            <label>Approved rate<input type="number" min="0" step="0.01" value={item.approvedRate} onChange={event=>setItem(index,'approvedRate',event.target.value)}/></label>
            <label className="span-2">Result note / rejection reason<input value={item.rejectionReason||''} onChange={event=>setItem(index,'rejectionReason',event.target.value)}/></label>
            <button type="button" className="line-remove" disabled={form.items.length===1} onClick={()=>removeItem(index)} aria-label={`Remove product ${index+1}`}><Trash2 size={16}/></button>
          </article>)}</div>
        </div>

        <div className="editor-section editor-summary"><label>Internal notes<textarea rows="3" value={form.notes} onChange={event=>setField('notes',event.target.value)}/></label><div className="summary-totals"><span>Offered value <b>PKR {total.toLocaleString()}</b></span><span>Approved value <b>PKR {approvedTotal.toLocaleString()}</b></span></div></div>
        {record?.history?.length>0&&<div className="editor-section"><h3>Status history</h3><div className="status-history">{[...record.history].reverse().map((entry,index)=><div key={`${entry.changedAt}-${index}`}><span className="record-status">{entry.status}</span><p>{entry.note}</p><small>{entry.changedByName||'Authorised user'} · {new Date(entry.changedAt).toLocaleString()}</small></div>)}</div></div>}
        {error&&<div className="form-message error" role="alert">{error}</div>}
        <footer className="editor-actions"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" disabled={busy}>{busy?'Saving secure record…':'Save tender'}</button></footer>
      </form>
    </section>
  </div>;
}
