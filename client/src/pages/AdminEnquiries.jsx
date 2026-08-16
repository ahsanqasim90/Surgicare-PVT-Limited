import {useEffect,useState} from 'react';
import {Inbox} from 'lucide-react';
import api from '../services/api';
import AdminTable from '../components/AdminTable';

export default function AdminEnquiries(){
  const [rows,setRows]=useState([]); const [error,setError]=useState('');
  useEffect(()=>{api.get('/rfqs').then(setRows).catch(err=>setError(err.message))},[]);
  return <div className="admin-page"><div className="admin-top"><div><span className="eyebrow">RELATIONSHIPS</span><h1>Quotation enquiries</h1><p>Requests submitted through the public website.</p></div></div>{error&&<div className="form-message error">{error}</div>}<div className="panel"><AdminTable empty="No quotation enquiries have been submitted yet." rows={rows} columns={[{key:'createdAt',label:'Received',render:r=>new Date(r.createdAt).toLocaleDateString()},{key:'name',label:'Contact'},{key:'organisation',label:'Organisation'},{key:'product',label:'Requirement'},{key:'email',label:'Email'},{key:'status',label:'Status'}]}/>{!rows.length&&!error&&<div className="admin-empty-note"><Inbox size={18}/> New website enquiries will appear here.</div>}</div></div>;
}
