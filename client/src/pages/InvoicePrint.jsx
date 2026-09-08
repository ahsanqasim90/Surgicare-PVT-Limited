import {useEffect,useState} from 'react';
import {ArrowLeft,Printer} from 'lucide-react';
import {Link,useParams} from 'react-router-dom';
import api from '../services/api';

const date=value=>value?new Date(value).toLocaleDateString('en-GB'):'—';
const money=value=>Number(value||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
export default function InvoicePrint(){
  const {id}=useParams();const [record,setRecord]=useState(null);const [error,setError]=useState('');
  useEffect(()=>{api.get(`/invoices/${id}`).then(setRecord).catch(err=>setError(err.message))},[id]);
  if(error)return <div className="print-error"><h1>Sales tax invoice unavailable</h1><p>{error}</p><Link to="/admin/invoices">Return to invoices</Link></div>;
  if(!record)return <div className="route-loader"><span/>Loading sales tax invoice…</div>;
  return <main className="print-shell"><div className="print-toolbar"><Link to="/admin/invoices"><ArrowLeft size={16}/> Back</Link><button className="btn btn-sm" onClick={()=>window.print()}><Printer size={16}/> Print / Save PDF</button></div>
    <article className="quotation-paper"><div className="letterhead-space"><small>PRE-PRINTED SURGICARE LETTERHEAD AREA</small></div><div className="tax-identity-grid"><div><span>Seller NTN</span><b>{record.sellerNTN||'—'}</b><span>Seller STRN</span><b>{record.sellerSTRN||'—'}</b></div><div><span>Buyer NTN</span><b>{record.buyerNTN||'—'}</b><span>Buyer STRN</span><b>{record.buyerSTRN||'—'}</b></div></div>
      <header className="quotation-heading"><div><p>Buyer:</p><b>{record.clientName}</b><span>{record.clientAddress}</span>{record.contactPerson&&<span>Attention: {record.contactPerson}</span>}</div><div><span>Invoice No.</span><b>{record.invoiceNumber}</b><span>Date: {date(record.invoiceDate)}</span><span>Due: {date(record.dueDate)}</span></div></header>
      <div className="quotation-title"><span>PO / Ref: {record.purchaseOrderNumber||record.reference||'—'}</span><h1>SALES TAX INVOICE</h1></div>
      <table className="quotation-print-table invoice-print-table"><thead><tr><th>Sr.</th><th>Description</th><th>Brand</th><th>Unit</th><th>Qty</th><th>Rate</th><th>Taxable value</th><th>Tax %</th><th>Tax</th><th>Total</th></tr></thead><tbody>{record.items.map((item,index)=><tr key={item._id||index}><td>{String(index+1).padStart(2,'0')}</td><td>{item.description}</td><td>{item.brand||'—'}</td><td>{item.unit}</td><td>{item.quantity}</td><td>{money(item.unitRate)}</td><td>{money(item.taxableValue)}</td><td>{item.taxRate}%</td><td>{money(item.taxAmount)}</td><td>{money(item.lineTotal)}</td></tr>)}</tbody></table>
      <div className="print-total-box"><span>Gross value <b>{money(record.subtotal)}</b></span>{record.discountTotal>0&&<span>Discount <b>- {money(record.discountTotal)}</b></span>}<span>Taxable value <b>{money(record.taxableTotal)}</b></span><span>Sales tax <b>{money(record.salesTaxTotal)}</b></span><strong>Invoice total <b>PKR {money(record.grandTotal)}</b></strong></div>
      <div className="print-terms">{record.paymentTerms&&<div><b>Payment terms</b><p>{record.paymentTerms}</p></div>}{record.notes&&<div><b>Notes</b><p>{record.notes}</p></div>}</div>
      <footer className="print-signature"><p>Issued by</p><div/><b>For Surgicare</b><span>Authorized Signatory</span></footer>
    </article>
  </main>;
}
