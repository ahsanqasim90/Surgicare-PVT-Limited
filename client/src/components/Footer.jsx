import {Link} from 'react-router-dom';
import Brand from './Brand';
import {ArrowUpRight, ShieldCheck} from 'lucide-react';

export default function Footer(){
  return <footer className="site-footer"><div className="container footer-callout"><div><span className="footer-kicker">INSTITUTIONAL ENQUIRIES</span><h2>Let’s make your next procurement cycle clearer.</h2></div><Link className="footer-cta" to="/contact">Discuss a requirement <ArrowUpRight size={18}/></Link></div><div className="container footer-grid"><div><Brand dark/><p>Reliable healthcare supply since 2016. Built around dependable products, professional service and institutional procurement.</p><div className="footer-assurance"><ShieldCheck size={16}/> Authorised business operations</div></div><div><h4>Company</h4><Link to="/about">About</Link><Link to="/quality">Quality</Link><Link to="/contact">Contact</Link></div><div><h4>Solutions</h4><Link to="/products">Products</Link><Link to="/institutional-supply">Institutional Supply</Link><Link to="/contact">Request Quote</Link></div><div><h4>Workspace</h4><Link to="/staff-login">Authorised Staff</Link><span>Tenders</span><span>Quotations & fulfilment</span></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Surgicare. All rights reserved.</span><span>Medical & surgical supply · Pakistan</span></div></footer>;
}
