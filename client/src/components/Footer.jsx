import {Link} from 'react-router-dom';
import Brand from './Brand';
import {ArrowUpRight, ShieldCheck} from 'lucide-react';
import {companyDetails,phoneHref} from '../data/company';

export default function Footer(){
  return <footer className="site-footer"><div className="container footer-callout"><div><span className="footer-kicker">INSTITUTIONAL ENQUIRIES</span><h2>Let’s make your next procurement cycle clearer.</h2></div><Link className="footer-cta" to="/contact">Discuss a requirement <ArrowUpRight size={18}/></Link></div><div className="container footer-grid"><div><Brand dark/><p>Reliable healthcare supply since 2016. Built around dependable products, professional service and institutional procurement.</p><div className="footer-assurance"><ShieldCheck size={16}/> NTN {companyDetails.ntn}</div></div><div><h4>Company</h4><Link to="/about">About</Link><Link to="/quality">Quality</Link><Link to="/contact">Contact</Link><Link to="/staff-login">Authorised Staff</Link></div><div><h4>Solutions</h4><Link to="/products">Products</Link><Link to="/institutional-supply">Institutional Supply</Link><Link to="/contact">Request Quote</Link></div><div className="footer-contact"><h4>Contact</h4><span>{companyDetails.address}</span>{companyDetails.phones.map(phone=><a href={phoneHref(phone)} key={phone}>{phone}</a>)}<a href={`mailto:${companyDetails.email}`}>{companyDetails.email}</a></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Surgicare. All rights reserved.</span><span>Medical & surgical supply · Lahore, Pakistan</span></div></footer>;
}
