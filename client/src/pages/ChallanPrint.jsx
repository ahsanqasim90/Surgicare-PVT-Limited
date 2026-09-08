import {useEffect,useState} from 'react';
import {ArrowLeft,Printer} from 'lucide-react';
import {Link,useParams} from 'react-router-dom';
import api from '../services/api';

const date=value=>value?new Date(value).toLocaleDateString('en-GB'):'—';
export default function ChallanPrint(){
  const {id}=useParams();const [record,setRecord]=useState(null);const [error,setError]=useState('');
  useEffect(()=>{api.get(`/challans/${id}`).then(setRecord).catch(err=>setError(err.message))},[id]);
  if(error)return <div className="print-error"><h1>Delivery challan unavailable</h1><p>{error}</p><Link to="/admin/challans">Return to challans</Link></div>;
  if(!record)return <div className="route-loader"><span/>Loading delivery challan…</div>;
  return <main className="print-shell"><div className="print-toolbar"><Link to="/admin/challans"><ArrowLeft size={16}/> Back</Link><button className="btn btn-sm" onClick={()=>window.print()}><Printer size={16}/> Print / Save PDF</button></div>
    <article className="quotation-paper"><div className="letterhead-space"><small>PRE-PRINTED SURGICARE LETTERHEAD AREA</small></div><header className="quotation-heading"><div><p>Deliver to:</p><b>{record.clientName}</b><span>{record.clientAddress}</span>{record.contactPerson&&<span>Attention: {record.contactPerson}</span>}</div><div><span>Challan No.</span><b>{record.challanNumber}</b><span>Delivery: {date(record.deliveryDate)}</span><span>Status: {record.status}</span></div></header>
      <div className="quotation-title"><span>PO / Ref: {record.purchaseOrderNumber||record.reference||'—'}</span><h1>DELIVERY CHALLAN</h1><p>Please acknowledge receipt of the following goods.</p></div>
      <table className="quotation-print-table"><thead><tr><th>Sr.</th><th>Description</th><th>Brand</th><th>Batch</th><th>Mfg.</th><th>Expiry</th><th>Ordered</th><th>Delivered</th><th>Unit</th></tr></thead><tbody>{record.items.map((item,index)=><tr key={item._id||index}><td>{String(index+1).padStart(2,'0')}</td><td>{item.productName}</td><td>{item.brand||'—'}</td><td>{item.batchNumber||'—'}</td><td>{date(item.manufacturingDate)}</td><td>{date(item.expiryDate)}</td><td>{item.orderedQuantity||'—'}</td><td>{item.quantity}</td><td>{item.unit}</td></tr>)}</tbody></table>
      {(record.transporter||record.vehicleNumber||record.notes)&&<div className="print-terms"><div><b>Dispatch details</b><p>{[record.transporter,record.vehicleNumber].filter(Boolean).join(' · ')||'—'}</p></div>{record.notes&&<div><b>Notes</b><p>{record.notes}</p></div>}</div>}
      <div className="delivery-acknowledgement"><div><span>Prepared / dispatched by</span><b>For Surgicare</b></div><div><span>Received in good order by</span><b>{record.receiverName||'Name & signature'}</b><small>{record.receiverContact||''} {record.receivedAt?`· ${date(record.receivedAt)}`:''}</small></div></div>
    </article>
  </main>;
}
