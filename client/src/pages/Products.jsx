import {useEffect,useMemo,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {ArrowRight,PackageSearch,Search} from 'lucide-react';
import api from '../services/api';

const catalogue=[
 {name:'Blood-management products',slug:'blood-management-products',category:'Blood Management',description:'Collection, storage and blood-management product enquiries.'},
 {name:'Oxygen masks',slug:'oxygen-masks',category:'Respiratory Care',description:'Oxygen therapy consumables for healthcare environments.'},
 {name:'Airway-management products',slug:'airway-management-products',category:'Airway Management',description:'Airway and related clinical product enquiries.'},
 {name:'Hospital consumables',slug:'hospital-consumables',category:'Hospital Consumables',description:'Everyday medical and surgical consumable requirements.'}
];

export default function Products(){
  const [params]=useSearchParams(); const requestedCategory=params.get('category');
  const [items,setItems]=useState(catalogue); const [query,setQuery]=useState(''); const [category,setCategory]=useState(requestedCategory||'All'); const [source,setSource]=useState('placeholder');
  useEffect(()=>{api.get('/products').then(data=>{if(data?.length){setItems(data);setSource('live')}}).catch(()=>{})},[]);
  const categories=useMemo(()=>['All',...new Set(items.map(item=>item.category).filter(Boolean))],[items]);
  const filtered=items.filter(item=>(category==='All'||item.category===category)&&`${item.name} ${item.description||''}`.toLowerCase().includes(query.toLowerCase()));
  return <><section className="page-hero products-hero"><div className="container"><div className="eyebrow">PRODUCT PORTFOLIO</div><h1>Medical products for institutional care.</h1><p>Explore product areas supported by Surgicare. Verified brands, technical data and packaging information will be published from the approved catalogue.</p></div></section><section className="section"><div className="container"><div className="catalogue-toolbar"><label className="search-field"><Search size={18}/><span className="sr-only">Search products</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the catalogue"/></label><div className="filter-row" aria-label="Product categories">{categories.map(item=><button key={item} onClick={()=>setCategory(item)} className={category===item?'active':''}>{item}</button>)}</div></div>{source==='placeholder'&&<div className="catalogue-notice">Representative product areas are shown until Surgicare's approved catalogue is added.</div>}<div className="product-grid">{filtered.map((product,index)=><article className="product-card" key={product._id||product.slug||index}><div className="product-image"><PackageSearch/></div><span>{product.category}</span><h2>{product.name}</h2><p>{product.description||'Approved product information pending.'}</p>{source==='live'?<Link className="text-link" to={`/products/${product.slug}`}>View product <ArrowRight size={16}/></Link>:<Link className="text-link" to={`/contact?product=${encodeURIComponent(product.name)}`}>Enquire about this area <ArrowRight size={16}/></Link>}</article>)}</div>{!filtered.length&&<div className="empty-page"><PackageSearch/><h2>No matching products</h2><p>Try another term or category.</p></div>}</div></section></>;
}
