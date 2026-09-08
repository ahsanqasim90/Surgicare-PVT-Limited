import {useEffect,useState} from 'react';
import {ExternalLink,Pencil,Plus} from 'lucide-react';
import {Link} from 'react-router-dom';
import api from '../services/api';
import ChallanEditor from '../components/ChallanEditor';

const date=value=>value?new Date(value).toLocaleDateString():'—';
export default function AdminChallans(){
  const [rows,setRows]=useState([]);const [editor,setEditor]=useState(null);const [error,setError]=useState('');
  const load=async()=>{setError('');try{setRows(await api.get('/challans'))}catch(err){setError(err.message)}};
  useEffect(()=>{void load()},[]);
  const save=async values=>{if(editor?.record)await api.put(`/challans/${editor.record._id}`,values);else await api.post('/challans',values);setEditor(null);await load()};
  return <div className="admin-page"><div className="admin-top"><div><span className="eyebrow">DELIVERY CONTROL</span><h1>Delivery challan workspace</h1><p>Trace products, batches, dispatch details and receiving acknowledgement.</p></div><button className="btn" onClick={()=>setEditor({record:null})}><Plus size={17}/> New challan</button></div>
    {error&&<div className="form-message error">{error}</div>}
    <div className="panel record-panel"><div className="panel-head"><h3>Delivery register</h3><span>{rows.length} document{rows.length===1?'':'s'}</span></div><div className="table-wrap"><table><thead><tr><th>Challan</th><th>Client</th><th>PO / reference</th><th>Delivery</th><th>Items</th><th>Batches</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.length?rows.map(row=><tr key={row._id}><td><b>{row.challanNumber}</b><small>{row.vehicleNumber||row.transporter||'No transport detail'}</small></td><td>{row.clientName}</td><td>{row.purchaseOrderNumber||row.reference||'—'}</td><td>{date(row.deliveryDate)}</td><td>{row.items?.length||0}</td><td>{row.items?.filter(item=>item.batchNumber).length||0}</td><td><span className={`record-status status-${row.status.toLowerCase().replaceAll(' ','-')}`}>{row.status}</span></td><td><div className="table-actions"><button className="table-action" onClick={()=>setEditor({record:row})}><Pencil size={15}/> Edit</button><Link className="table-action" to={`/admin/challans/${row._id}/print`}><ExternalLink size={15}/> Print</Link></div></td></tr>):<tr><td colSpan="8" className="table-empty">No delivery challans have been created yet.</td></tr>}</tbody></table></div></div>
    {editor&&<ChallanEditor record={editor.record} onClose={()=>setEditor(null)} onSave={save}/>}
  </div>;
}
