import {useEffect,useState} from 'react';
import {ExternalLink,Pencil,Plus} from 'lucide-react';
import {Link} from 'react-router-dom';
import api from '../services/api';
import QuotationEditor from '../components/QuotationEditor';

const date=value=>value?new Date(value).toLocaleDateString():'—';
const money=value=>Number(value||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});

export default function AdminQuotations(){
  const [rows,setRows]=useState([]);const [editor,setEditor]=useState(null);const [error,setError]=useState('');
  const load=async()=>{setError('');try{setRows(await api.get('/quotations'))}catch(err){setError(err.message)}};
  useEffect(()=>{void load()},[]);
  const save=async values=>{if(editor?.record)await api.put(`/quotations/${editor.record._id}`,values);else await api.post('/quotations',values);setEditor(null);await load()};

  return <div className="admin-page"><div className="admin-top"><div><span className="eyebrow">QUOTATION CONTROL</span><h1>Itemised quotation workspace</h1><p>Create calculated commercial documents and prepare them for controlled issue.</p></div><button className="btn" onClick={()=>setEditor({record:null})}><Plus size={17}/> New quotation</button></div>
    {error&&<div className="form-message error">{error}</div>}
    <div className="panel record-panel"><div className="panel-head"><h3>Quotation register</h3><span>{rows.length} document{rows.length===1?'':'s'}</span></div><div className="table-wrap"><table><thead><tr><th>Quotation</th><th>Client</th><th>Date</th><th>Valid until</th><th>Items</th><th>Status</th><th>Subtotal</th><th>Tax</th><th>Grand total</th><th>Actions</th></tr></thead><tbody>{rows.length?rows.map(row=><tr key={row._id}><td><b>{row.quotationNumber}</b><small>{row.reference||row.subject||'No reference'}</small></td><td>{row.clientName}</td><td>{date(row.date)}</td><td>{date(row.validUntil)}</td><td>{row.items?.length||0}</td><td><span className={`record-status status-${row.status.toLowerCase()}`}>{row.status}</span></td><td>PKR {money(row.subtotal)}</td><td>PKR {money(row.taxTotal)}</td><td><b>PKR {money(row.grandTotal)}</b></td><td><div className="table-actions"><button className="table-action" onClick={()=>setEditor({record:row})}><Pencil size={15}/> Edit</button><Link className="table-action" to={`/admin/quotations/${row._id}/print`}><ExternalLink size={15}/> Print</Link></div></td></tr>):<tr><td colSpan="10" className="table-empty">No quotations have been created yet.</td></tr>}</tbody></table></div></div>
    {editor&&<QuotationEditor record={editor.record} onClose={()=>setEditor(null)} onSave={save}/>}
  </div>;
}
