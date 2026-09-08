import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Package, FileCheck2, FileText, Truck, WalletCards, LogOut, Inbox, PanelLeftClose } from 'lucide-react';
import Brand from '../components/Brand';
import {useAuth} from '../context/AuthContext';

const items = [
  {to:'',label:'Overview',Icon:LayoutDashboard},
  {to:'inventory',label:'Inventory',Icon:Package,roles:['Director','Admin','Inventory']},
  {to:'tenders',label:'Tenders',Icon:FileCheck2,roles:['Director','Admin','Sales']},
  {to:'quotations',label:'Quotations',Icon:FileText,roles:['Director','Admin','Sales','Accounts']},
  {to:'challans',label:'Delivery Challans',Icon:Truck,roles:['Director','Admin','Inventory']},
  {to:'payments',label:'Payments',Icon:WalletCards,roles:['Director','Admin','Accounts']},
  {to:'enquiries',label:'Enquiries',Icon:Inbox,roles:['Director','Admin','Sales']}
];

export default function AdminLayout(){
  const {user,logout}=useAuth();
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link to="/" className="brand-link"><Brand dark /></Link>
      <div className="admin-label">OPERATIONS</div>
      <nav>{items.filter(item=>!item.roles||item.roles.includes(user?.role)).map(({to,label,Icon}) => <NavLink key={label} end={to===''} to={`/admin${to ? '/'+to : ''}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="admin-account"><span>{user?.name}</span><small>{user?.role}</small></div>
      <button className="admin-exit" onClick={logout}><LogOut size={18}/> Sign out</button>
      <Link className="admin-exit public-exit" to="/"><PanelLeftClose size={18}/> Public website</Link>
    </aside>
    <div className="admin-main"><Outlet/></div>
  </div>;
}
