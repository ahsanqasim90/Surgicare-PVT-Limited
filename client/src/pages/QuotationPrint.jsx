import {useEffect,useState} from 'react';
import {ArrowLeft,Printer} from 'lucide-react';
import {Link,useParams} from 'react-router-dom';
import api from '../services/api';

const date=value=>value?new Date(value).toLocaleDateString('en-GB'):'—';
const money=value=>Number(value||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});

export default function QuotationPrint(){
  const {id}=useParams();const [record,setRecord]=useState(null);const [error,setError]=useState('');
  useEffect(()=>{api.get(`/quotations/${id}`).then(setRecord).catch(err=>setError(err.message))},[id]);
  if(error)return <div className="print-error"><h1>Quotation unavailable</h1><p>{error}</p><Link to="/admin/quotations">Return to quotations</Link></div>;
  if(!record)return <div className="route-loader"><span/>Loading quotation…</div>;
  return <main className="print-shell"><div className="print-toolbar"><Link to="/admin/quotations"><ArrowLeft size={16}/> Back</Link><button className="btn btn-sm" onClick={()=>window.print()}><Printer size={16}/> Print / Save PDF</button></div>
    <article className="quotation-paper"><div className="letterhead-space"><small>PRE-PRINTED SURGICARE LETTERHEAD AREA</small></div><header className="quotation-heading"><div><p>To:</p><b>{record.clientName}</b><span>{record.clientAddress}</span>{record.contactPerson&&<span>Attention: {record.contactPerson}</span>}</div><div><span>Quotation No.</span><b>{record.quotationNumber}</b><span>Date: {date(record.date)}</span><span>Valid until: {date(record.validUntil)}</span></div></header>
      <div className="quotation-title"><span>{record.reference&&`Ref: ${record.reference}`}</span><h1>QUOTATION</h1><p>{record.subject||'Quotation for medical supplies'}</p></div>
      <p>Sir,</p><p>We are pleased to quote our rates as per your requirement:</p>
      <table className="quotation-print-table"><thead><tr><th>Sr.</th><th>Description</th><th>Brand / Model</th><th>Unit</th><th>Qty</th><th>Unit Rate</th><th>Tax</th><th>Total (PKR)</th></tr></thead><tbody>{record.items.map((item,index)=><tr key={item._id||index}><td>{String(index+1).padStart(2,'0')}</td><td>{item.description}</td><td>{item.brand||'—'}</td><td>{item.unit}</td><td>{item.quantity}</td><td>{money(item.unitRate)}</td><td>{item.taxRate}%</td><td>{money(item.lineTotal)}</td></tr>)}</tbody></table>
      <div className="print-total-box"><span>Subtotal <b>{money(record.subtotal)}</b></span>{record.discountTotal>0&&<span>Discount <b>- {money(record.discountTotal)}</b></span>}<span>Sales tax <b>{money(record.taxTotal)}</b></span><strong>Grand total <b>PKR {money(record.grandTotal)}</b></strong></div>
      <div className="print-terms">{record.paymentTerms&&<div><b>Payment terms</b><p>{record.paymentTerms}</p></div>}{record.deliveryTerms&&<div><b>Delivery terms</b><p>{record.deliveryTerms}</p></div>}{record.notes&&<div><b>Notes</b><p>{record.notes}</p></div>}</div>
      <footer className="print-signature"><p>Yours sincerely,</p><div/><b>For Surgicare</b><span>Authorized Signatory</span></footer>
    </article>
  </main>;
}
