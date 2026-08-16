import {Link} from 'react-router-dom';
import Brand from './Brand';

export default function Footer(){
  return <footer className="site-footer"><div className="container footer-grid"><div><Brand dark/><p>Reliable healthcare supply since 2016. Built around dependable products, professional service and institutional procurement.</p></div><div><h4>Company</h4><Link to="/about">About</Link><Link to="/quality">Quality</Link><Link to="/contact">Contact</Link></div><div><h4>Solutions</h4><Link to="/products">Products</Link><Link to="/institutional-supply">Institutional Supply</Link><Link to="/contact">Request Quote</Link></div><div><h4>Portal</h4><Link to="/staff-login">Authorised Staff</Link><span>Contact details pending verification</span></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Surgicare. All rights reserved.</span><span>Privacy and legal information to be confirmed.</span></div></footer>;
}
