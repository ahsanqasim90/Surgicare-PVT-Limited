import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
export default function PublicLayout(){ const {pathname}=useLocation(); useEffect(()=>{window.scrollTo({top:0,behavior:'instant'})},[pathname]); return <><a className="skip-link" href="#main-content">Skip to content</a><Header/><main id="main-content"><Outlet/></main><Footer/></>; }
