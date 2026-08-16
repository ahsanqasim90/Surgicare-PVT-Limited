import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Brand from './Brand';

const links = [
  ['/', 'Home'], ['/about', 'About'], ['/products', 'Products'],
  ['/institutional-supply', 'Institutional Supply'], ['/quality', 'Quality'], ['/contact','Contact']
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const onScroll=()=>setScrolled(window.scrollY>18);onScroll();window.addEventListener('scroll',onScroll,{passive:true});return()=>window.removeEventListener('scroll',onScroll)},[]);
  return (
    <header className={`site-header ${scrolled?'is-scrolled':''}`}>
      <div className="container nav-wrap">
        <Link to="/" className="brand-link"><Brand /></Link>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>)}
          <Link to="/staff-login" className="staff-link">Staff access</Link>
          <Link to="/contact" className="btn btn-sm">Request a Quote</Link>
        </nav>
        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
