import {useEffect,useState} from 'react';
import {ExternalLink,Pencil,Plus} from 'lucide-react';
import {Link} from 'react-router-dom';
import api from '../services/api';
import InvoiceEditor from '../components/InvoiceEditor';

const date=value=>value?new Date(value).toLocaleDateString():'—';
const money=value=>Number(value||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
export default function AdminInvoices(){
  const [rows,setRows]=useState([]);const [editor,setEditor]=useState(null);const [error,setError]=useState('');
  const load=async()=>{setError('');try{setRows(await api.get('/invoices'))}catch(err){setError(err.message)}};
  useEffect(()=>{void load()},[]);
  const save=async values=>{if(editor?.record)await api.put(`/invoices/${editor.record._id}`,values);else await api.post('/invoices',values);setEditor(null);await load()};
  return <div className="admin-page"><div className="admin-top"><div><span className="eyebrow">ACCOUNTS</span><h1>Sales tax invoices</h1><p>Create controlled, itemised tax invoices with server-verified calculations.</p></div><button className="btn" onClick={()=>setEditor({record:null})}><Plus size={17}/> New invoice</button></div>
    {error&&<div className="form-message error">{error}</div>}
    <div className="panel record-panel"><div className="panel-head"><h3>Invoice register</h3><span>{rows.length} document{rows.length===1?'':'s'}</span></div><div className="table-wrap"><table><thead><tr><th>Invoice</th><th>Buyer</th><th>Date</th><th>PO / reference</th><th>Items</th><th>Status</th><th>Taxable</th><th>Sales tax</th><th>Total</th><th>Actions</th></tr></thead><tbody>{rows.length?rows.map(row=><tr key={row._id}><td><b>{row.invoiceNumber}</b><small>Due {date(row.dueDate)}</small></td><td>{row.clientName}</td><td>{date(row.invoiceDate)}</td><td>{row.purchaseOrderNumber||row.reference||'—'}</td><td>{row.items?.length||0}</td><td><span className={`record-status status-${row.status.toLowerCase().replaceAll(' ','-')}`}>{row.status}</span></td><td>PKR {money(row.taxableTotal)}</td><td>PKR {money(row.salesTaxTotal)}</td><td><b>PKR {money(row.grandTotal)}</b></td><td><div className="table-actions"><button className="table-action" onClick={()=>setEditor({record:row})}><Pencil size={15}/> Edit</button><Link className="table-action" to={`/admin/invoices/${row._id}/print`}><ExternalLink size={15}/> Print</Link></div></td></tr>):<tr><td colSpan="10" className="table-empty">No sales tax invoices have been created yet.</td></tr>}</tbody></table></div></div>
    {editor&&<InvoiceEditor record={editor.record} onClose={()=>setEditor(null)} onSave={save}/>}
  </div>;
}
