import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,Clock3,FileCheck2,Pencil,Plus,XCircle} from 'lucide-react';
import api from '../services/api';
import TenderEditor from '../components/TenderEditor';

const filters=['All','Draft','Submitted','Under Evaluation','Approved','Partially Approved','Rejected','Completed'];
const date=value=>value?new Date(value).toLocaleDateString():'—';
const money=value=>Number(value||0).toLocaleString(undefined,{maximumFractionDigits:2});

export default function AdminTenders(){
  const [rows,setRows]=useState([]);const [filter,setFilter]=useState('All');const [editor,setEditor]=useState(null);const [error,setError]=useState('');
  const load=async()=>{setError('');try{setRows(await api.get('/tenders'))}catch(err){setError(err.message)}};
  useEffect(()=>{void load()},[]);
  const visible=useMemo(()=>filter==='All'?rows:rows.filter(row=>row.status===filter),[rows,filter]);
  const save=async values=>{if(editor?.record)await api.put(`/tenders/${editor.record._id}`,values);else await api.post('/tenders',values);setEditor(null);await load()};
  const count=status=>rows.filter(row=>row.status===status).length;

  return <div className="admin-page"><div className="admin-top"><div><span className="eyebrow">TENDER CONTROL</span><h1>Submissions & award results</h1><p>Track every tender from preparation through product-wise approval and completion.</p></div><button className="btn" onClick={()=>setEditor({record:null})}><Plus size={17}/> New tender</button></div>
    {error&&<div className="form-message error">{error}</div>}
    <div className="tender-kpis"><div><FileCheck2/><span>Submitted</span><b>{count('Submitted')}</b></div><div><Clock3/><span>Under evaluation</span><b>{count('Under Evaluation')}</b></div><div><CheckCircle2/><span>Approved / partial</span><b>{count('Approved')+count('Partially Approved')}</b></div><div><XCircle/><span>Rejected</span><b>{count('Rejected')}</b></div></div>
    <div className="record-filters" aria-label="Tender status filters">{filters.map(status=><button key={status} className={filter===status?'active':''} onClick={()=>setFilter(status)}>{status}<span>{status==='All'?rows.length:count(status)}</span></button>)}</div>
    <div className="panel record-panel"><div className="table-wrap"><table><thead><tr><th>Tender</th><th>Institution</th><th>Closing</th><th>Status</th><th>Product result</th><th>Offered value</th><th>Approved value</th><th>Action</th></tr></thead><tbody>{visible.length?visible.map(row=>{
      const approved=row.items?.filter(item=>item.approvalStatus==='Approved').length||0;
      const partial=row.items?.filter(item=>item.approvalStatus==='Partially Approved').length||0;
      const rejected=row.items?.filter(item=>item.approvalStatus==='Rejected').length||0;
      return <tr key={row._id}><td><b>{row.title}</b><small>{row.tenderNumber||'No reference'}</small></td><td>{row.hospitalName}</td><td>{date(row.closingDate)}</td><td><span className={`record-status status-${row.status.toLowerCase().replaceAll(' ','-')}`}>{row.status}</span></td><td><div className="result-summary"><span className="approved-dot">{approved} approved</span>{partial>0&&<span className="partial-dot">{partial} partial</span>}{rejected>0&&<span className="rejected-dot">{rejected} rejected</span>}</div></td><td>PKR {money(row.totalValue)}</td><td>PKR {money(row.approvedValue)}</td><td><button className="table-action" onClick={()=>setEditor({record:row})}><Pencil size={15}/> Open</button></td></tr>;
    }):<tr><td colSpan="8" className="table-empty">No tenders in this view.</td></tr>}</tbody></table></div></div>
    {editor&&<TenderEditor record={editor.record} onClose={()=>setEditor(null)} onSave={save}/>}
  </div>;
}
