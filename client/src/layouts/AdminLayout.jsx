import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Package, FileCheck2, FileText, Truck, WalletCards, LogOut, Inbox, PanelLeftClose } from 'lucide-react';
import Brand from '../components/Brand';
import {useAuth} from '../context/AuthContext';

const items = [
  ['', 'Overview', LayoutDashboard], ['inventory', 'Inventory', Package], ['tenders', 'Tenders', FileCheck2],
  ['quotations', 'Quotations', FileText], ['challans', 'Delivery Challans', Truck], ['payments', 'Payments', WalletCards], ['enquiries','Enquiries',Inbox]
];

export default function AdminLayout(){
  const {user,logout}=useAuth();
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link to="/" className="brand-link"><Brand dark /></Link>
      <div className="admin-label">OPERATIONS</div>
      <nav>{items.map(([to,label,Icon]) => <NavLink key={label} end={to===''} to={`/admin${to ? '/'+to : ''}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="admin-account"><span>{user?.name}</span><small>{user?.role}</small></div>
      <button className="admin-exit" onClick={logout}><LogOut size={18}/> Sign out</button>
      <Link className="admin-exit public-exit" to="/"><PanelLeftClose size={18}/> Public website</Link>
    </aside>
    <div className="admin-main"><Outlet/></div>
  </div>;
}
