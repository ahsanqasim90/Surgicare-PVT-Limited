import {useState} from 'react';
import {Navigate,useLocation,useNavigate,Link} from 'react-router-dom';
import {ArrowLeft,LockKeyhole} from 'lucide-react';
import Brand from '../components/Brand';
import {useAuth} from '../context/AuthContext';

export default function StaffLogin(){
  const {user,login}=useAuth(); const location=useLocation(); const navigate=useNavigate();
  const [form,setForm]=useState({email:'',password:''}); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  if(user)return <Navigate to="/admin" replace/>;
  const submit=async event=>{event.preventDefault();setBusy(true);setError('');try{await login(form);navigate(location.state?.from?.pathname||'/admin',{replace:true})}catch(err){setError(err.message)}finally{setBusy(false)}};
  return <main className="login-page"><section className="login-brand-panel"><Link to="/"><Brand dark/></Link><div><span className="eyebrow">AUTHORISED STAFF</span><h1>Operational clarity for every supply workflow.</h1><p>Secure access to Surgicare's tender, inventory, delivery and receivables workspace.</p></div><small>Access is restricted to authorised team members.</small></section><section className="login-form-panel"><div className="login-card"><Link className="back-link" to="/"><ArrowLeft size={16}/> Public website</Link><div className="login-icon"><LockKeyhole/></div><h2>Welcome back</h2><p>Enter your assigned account details.</p><form onSubmit={submit}><label>Email address<input type="email" autoComplete="username" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Password<input type="password" autoComplete="current-password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>{error&&<div className="form-message error" role="alert">{error}</div>}<button className="btn btn-full" disabled={busy}>{busy?'Signing in…':'Sign in securely'}</button></form></div></section></main>;
}
