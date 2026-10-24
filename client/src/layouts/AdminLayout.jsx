import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Package, FileCheck2, FileText, ReceiptText, Truck, WalletCards, LogOut, Inbox, PanelLeftClose, Landmark } from 'lucide-react';
import Brand from '../components/Brand';
import {useAuth} from '../context/AuthContext';

const items = [
  {to:'',label:'Overview',Icon:LayoutDashboard},
  {to:'inventory',label:'Inventory',Icon:Package,roles:['Director','Admin','Inventory']},
  {to:'tenders',label:'Tenders',Icon:FileCheck2,roles:['Director','Admin','Sales']},
  {to:'quotations',label:'Quotations',Icon:FileText,roles:['Director','Admin','Sales','Accounts']},
  {to:'challans',label:'Delivery Challans',Icon:Truck,roles:['Director','Admin','Inventory']},
  {to:'invoices',label:'Sales Tax Invoices',Icon:ReceiptText,roles:['Director','Admin','Accounts']},
  {to:'finance',label:'Finance Centre',Icon:Landmark,roles:['Director','Admin','Accounts']},
  {to:'payments',label:'Receivables',Icon:WalletCards,roles:['Director','Admin','Accounts']},
  {to:'enquiries',label:'Enquiries',Icon:Inbox,roles:['Director','Admin','Sales']}
];

export default function AdminLayout(){
  const {user,logout}=useAuth();
  const initials=(user?.name||'SC').split(' ').map(part=>part[0]).join('').slice(0,2).toUpperCase();
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <div className="portal-lockup"><Link to="/" className="brand-link"><Brand dark /></Link><span>Operations portal</span></div>
      <div className="admin-system"><i/><span>System connected</span></div>
      <div className="admin-label">WORKSPACE</div>
      <nav>{items.filter(item=>!item.roles||item.roles.includes(user?.role)).map(({to,label,Icon}) => <NavLink key={label} end={to===''} to={`/admin${to ? '/'+to : ''}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="admin-account"><b>{initials}</b><div><span>{user?.name}</span><small>{user?.role} access</small></div></div>
      <div className="admin-footer-actions"><button className="admin-exit" onClick={logout}><LogOut size={18}/> Sign out</button><Link className="admin-exit public-exit" to="/"><PanelLeftClose size={18}/> Public website</Link></div>
    </aside>
    <div className="admin-main"><Outlet/></div>
  </div>;
}
