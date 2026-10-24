import {useEffect,useMemo,useState} from 'react';
import {Landmark,Receipt,HandCoins,BookOpen,Plus,ArrowUpRight,CheckCircle2,Send,WalletCards,Scale,Building2} from 'lucide-react';
import api from '../services/api';
import AdminTable from '../components/AdminTable';
import QuickCreateModal from '../components/QuickCreateModal';
import {useAuth} from '../context/AuthContext';

const money=value=>`PKR ${Number(value||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const date=value=>value?new Date(value).toLocaleDateString():'—';
const today=()=>new Date().toISOString().slice(0,10);
const statusClass=status=>`record-status status-${String(status||'').toLowerCase().replaceAll(' ','-').replaceAll('/','-')}`;

export default function AdminFinance(){
  const {user}=useAuth();
  const [tab,setTab]=useState('overview');
  const [summary,setSummary]=useState(null);
  const [accounts,setAccounts]=useState([]);
  const [ledger,setLedger]=useState([]);
  const [expenses,setExpenses]=useState([]);
  const [advances,setAdvances]=useState([]);
  const [modal,setModal]=useState(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState('');
  const [ledgerSearch,setLedgerSearch]=useState('');
  const [ledgerDate,setLedgerDate]=useState('');
  const canApprove=['Director','Admin'].includes(user?.role);

  const load=async()=>{
    setError('');
    try{
      const [s,a,l,e,v]=await Promise.all([api.get('/finance/summary'),api.get('/finance/accounts'),api.get('/finance/ledger'),api.get('/finance/expenses'),api.get('/finance/advances')]);
      setSummary(s);setAccounts(a);setLedger(l);setExpenses(e);setAdvances(v);
    }catch(err){setError(err.message)}
  };
  useEffect(()=>{void load()},[]);

  const selectable=useMemo(()=>accounts.filter(account=>account.isActive).map(account=>({value:account._id,label:`${account.code} · ${account.name}`})),[accounts]);
  const liquid=useMemo(()=>accounts.filter(account=>['Cash','Bank'].includes(account.type)).map(account=>({value:account._id,label:`${account.code} · ${account.name} (${money(account.balance)})`})),[accounts]);
  const expenseAccounts=useMemo(()=>accounts.filter(account=>account.type==='Expense').map(account=>({value:account._id,label:`${account.code} · ${account.name}`})),[accounts]);
  const filteredLedger=useMemo(()=>ledger.filter(entry=>{
    const matchesDate=!ledgerDate||new Date(entry.postingDate).toISOString().slice(0,10)===ledgerDate;
    const haystack=`${entry.voucherNumber} ${entry.voucherType} ${entry.partyName||''} ${entry.reference||''} ${entry.narration}`.toLowerCase();
    return matchesDate&&haystack.includes(ledgerSearch.toLowerCase());
  }),[ledger,ledgerDate,ledgerSearch]);
  const action=async(key,fn)=>{setBusy(key);setError('');try{await fn();await load()}catch(err){setError(err.message)}finally{setBusy('')}};

  const submitLedger=async values=>{
    const created=await api.post('/finance/ledger',{voucherType:values.voucherType,postingDate:values.postingDate,partyName:values.partyName,reference:values.reference,narration:values.narration,lines:[{account:values.debitAccount,debit:Number(values.amount),credit:0,description:values.narration},{account:values.creditAccount,debit:0,credit:Number(values.amount),description:values.narration}]});
    await api.post(`/finance/ledger/${created._id}/submit`,{});await load();
  };
  const submitExpense=async values=>{const created=await api.post('/finance/expenses',{...values,amount:Number(values.amount),taxAmount:Number(values.taxAmount||0)});await api.post(`/finance/expenses/${created._id}/submit`,{});await load()};
  const submitAdvance=async values=>{const created=await api.post('/finance/advances',{...values,amount:Number(values.amount)});await api.post(`/finance/advances/${created._id}/submit`,{});await load()};
  const submitAccount=async values=>{await api.post('/finance/accounts',{...values,openingBalance:Number(values.openingBalance||0)});await load()};
  const submitSettlement=async values=>{await api.post(`/finance/advances/${modal.record._id}/settlements`,{...values,amount:Number(values.amount)});await load()};

  const forms={
    ledger:{title:'New ledger voucher',description:'A balanced debit and credit entry will be submitted for approval.',submit:submitLedger,fields:[
      {name:'postingDate',label:'Posting date',type:'date',required:true,defaultValue:today()},
      {name:'voucherType',label:'Voucher type',type:'select',required:true,defaultValue:'Journal',options:['Journal','Cash Payment','Cash Receipt','Bank Payment','Bank Receipt']},
      {name:'partyName',label:'Party / person'},{name:'reference',label:'Reference'},
      {name:'narration',label:'Narration',type:'textarea',required:true},
      {name:'debitAccount',label:'Debit account',type:'select',required:true,placeholder:'Select account',options:selectable},
      {name:'creditAccount',label:'Credit account',type:'select',required:true,placeholder:'Select account',options:selectable},
      {name:'amount',label:'Amount (PKR)',type:'number',min:0.01,step:'0.01',required:true}
    ]},
    expense:{title:'Record expense',description:'The expense will enter the approval queue before payment can be posted.',submit:submitExpense,fields:[
      {name:'expenseDate',label:'Expense date',type:'date',required:true,defaultValue:today()},
      {name:'payee',label:'Paid to / vendor',required:true},
      {name:'category',label:'Expense category',type:'select',required:true,defaultValue:'General',options:['General','Freight & Delivery','Tender Fee','Travel & Fuel','Utilities','Salary & Wages','Bank Charges','Office Supplies','Marketing','Tax & Government Fee','Other']},
      {name:'description',label:'Description',type:'textarea',required:true},
      {name:'amount',label:'Gross amount (PKR)',type:'number',min:0.01,step:'0.01',required:true},
      {name:'taxAmount',label:'Included tax / withholding',type:'number',min:0,step:'0.01',defaultValue:0},
      {name:'expenseAccount',label:'Expense account',type:'select',required:true,placeholder:'Select expense account',options:expenseAccounts},
      {name:'paidFromAccount',label:'Planned payment account',type:'select',required:true,placeholder:'Select cash or bank',options:liquid},
      {name:'paymentMethod',label:'Payment method',type:'select',defaultValue:'Cash',options:['Cash','Bank Transfer','Cheque','Card','Other']},
      {name:'reference',label:'Bill / receipt reference'},{name:'projectReference',label:'Tender / project reference'},{name:'notes',label:'Notes',type:'textarea'}
    ]},
    advance:{title:'Record advance payment',description:'Track who received the advance, its purpose and remaining settlement.',submit:submitAdvance,fields:[
      {name:'advanceDate',label:'Advance date',type:'date',required:true,defaultValue:today()},
      {name:'advanceType',label:'Advance type',type:'select',required:true,defaultValue:'Supplier',options:['Supplier','Employee','Tender / Project','Travel','Security Deposit','Other']},
      {name:'recipientName',label:'Recipient / supplier',required:true},{name:'purpose',label:'Purpose',type:'textarea',required:true},
      {name:'amount',label:'Advance amount (PKR)',type:'number',min:0.01,step:'0.01',required:true},
      {name:'paidFromAccount',label:'Payment account',type:'select',required:true,placeholder:'Select cash or bank',options:liquid},
      {name:'paymentMethod',label:'Payment method',type:'select',defaultValue:'Bank Transfer',options:['Cash','Bank Transfer','Cheque','Card','Other']},
      {name:'reference',label:'Payment / cheque reference'},{name:'projectReference',label:'PO / tender / project reference'},
      {name:'expectedSettlementDate',label:'Expected settlement date',type:'date'},{name:'notes',label:'Notes',type:'textarea'}
    ]},
    account:{title:'Add finance account',description:'Create a controlled cash, bank or ledger account.',submit:submitAccount,fields:[
      {name:'code',label:'Account code',required:true},{name:'name',label:'Account name',required:true},
      {name:'type',label:'Account type',type:'select',required:true,defaultValue:'Bank',options:['Cash','Bank','Asset','Liability','Equity','Income','Expense','Tax']},
      {name:'openingBalance',label:'Opening balance',type:'number',step:'0.01',defaultValue:0},
      {name:'openingSide',label:'Opening side',type:'select',defaultValue:'Debit',options:['Debit','Credit']},
      {name:'description',label:'Description',type:'textarea'}
    ]}
  };
  const settlementForm=modal?.kind==='settlement'?{title:`Settle ${modal.record.advanceNumber}`,description:`Outstanding: ${money(modal.record.outstandingAmount)}`,submit:submitSettlement,fields:[
    {name:'settlementDate',label:'Settlement date',type:'date',required:true,defaultValue:today()},
    {name:'type',label:'Settlement type',type:'select',required:true,defaultValue:'Adjustment',options:['Adjustment','Refund']},
    {name:'amount',label:'Amount (PKR)',type:'number',min:0.01,step:'0.01',required:true},
    {name:'account',label:'Adjustment / receiving account',type:'select',required:true,placeholder:'Select account',options:selectable},
    {name:'reference',label:'Reference'},{name:'notes',label:'Settlement notes',type:'textarea'}
  ]}:null;

  const ledgerActions=record=><div className="table-actions">
    {record.status==='Draft'&&<button className="table-action" disabled={busy} onClick={()=>action(`l-${record._id}`,()=>api.post(`/finance/ledger/${record._id}/submit`,{}))}><Send size={13}/> Submit</button>}
    {record.status==='Submitted'&&canApprove&&<button className="table-action action-primary" disabled={busy} onClick={()=>action(`l-${record._id}`,()=>api.post(`/finance/ledger/${record._id}/approve`,{}))}><CheckCircle2 size={13}/> Post</button>}
  </div>;
  const expenseActions=record=><div className="table-actions">
    {record.status==='Draft'&&<button className="table-action" disabled={busy} onClick={()=>action(`e-${record._id}`,()=>api.post(`/finance/expenses/${record._id}/submit`,{}))}><Send size={13}/> Submit</button>}
    {record.status==='Submitted'&&canApprove&&<button className="table-action action-primary" disabled={busy} onClick={()=>action(`e-${record._id}`,()=>api.post(`/finance/expenses/${record._id}/approve`,{}))}><CheckCircle2 size={13}/> Approve</button>}
    {record.status==='Approved'&&<button className="table-action action-primary" disabled={busy} onClick={()=>action(`e-${record._id}`,()=>api.post(`/finance/expenses/${record._id}/pay`,{expenseAccount:record.expenseAccount?._id||record.expenseAccount,paidFromAccount:record.paidFromAccount?._id||record.paidFromAccount}))}><WalletCards size={13}/> Pay & post</button>}
  </div>;
  const advanceActions=record=><div className="table-actions">
    {record.status==='Draft'&&<button className="table-action" disabled={busy} onClick={()=>action(`a-${record._id}`,()=>api.post(`/finance/advances/${record._id}/submit`,{}))}><Send size={13}/> Submit</button>}
    {record.status==='Submitted'&&canApprove&&<button className="table-action action-primary" disabled={busy} onClick={()=>action(`a-${record._id}`,()=>api.post(`/finance/advances/${record._id}/approve`,{}))}><CheckCircle2 size={13}/> Approve</button>}
    {record.status==='Approved'&&<button className="table-action action-primary" disabled={busy} onClick={()=>action(`a-${record._id}`,()=>api.post(`/finance/advances/${record._id}/pay`,{paidFromAccount:record.paidFromAccount?._id||record.paidFromAccount}))}><HandCoins size={13}/> Pay & post</button>}
    {['Paid','Partially Settled'].includes(record.status)&&<button className="table-action" onClick={()=>setModal({kind:'settlement',record})}><Scale size={13}/> Settle</button>}
  </div>;

  return <div className="admin-page finance-page">
    <div className="admin-top"><div><span className="eyebrow">FINANCE CONTROL CENTRE</span><h1>Ledger, expenses & advances</h1><p>Controlled daily accounts with approval, posting and settlement history.</p></div><span className="status-pill"><i/> Double-entry controls active</span></div>
    {error&&<div className="form-message error">{error}</div>}
    <nav className="finance-tabs">{[['overview','Overview',Landmark],['ledger','Daily ledger',BookOpen],['expenses','Expenses',Receipt],['advances','Advances',HandCoins],['accounts','Accounts',Building2]].map(([key,label,Icon])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}><Icon size={16}/>{label}</button>)}</nav>
    {tab==='overview'&&<><div className="metric-grid finance-metrics">{[[money(summary?.liquidBalance),'Cash & bank balance',Landmark],[money(summary?.monthlyExpenses),'Expenses this month',Receipt],[money(summary?.outstandingAdvances),'Unsettled advances',HandCoins],[summary?.pendingApprovals||0,'Pending approvals',CheckCircle2]].map(([value,label,Icon])=><div className="metric-card" key={label}><div className="metric-icon"><Icon/></div><span>{label}</span><strong>{value}</strong><small>Finance workspace</small></div>)}</div><div className="finance-overview-grid"><section className="panel"><div className="panel-head"><div><h3>Cash and bank position</h3><span>Calculated from posted ledger entries</span></div></div><div className="account-balance-list">{summary?.accounts?.map(account=><div key={account._id}><span><b>{account.name}</b><small>{account.code} · {account.type}</small></span><strong className={account.balance<0?'negative':''}>{money(account.balance)}</strong></div>)}</div></section><section className="panel"><div className="panel-head"><div><h3>Recent postings</h3><span>Latest approved vouchers</span></div><button className="table-action" onClick={()=>setTab('ledger')}>View ledger <ArrowUpRight size={13}/></button></div>{summary?.recentEntries?.length?summary.recentEntries.map(entry=><div className="finance-activity" key={entry._id}><div><b>{entry.voucherNumber}</b><span>{entry.narration}</span></div><strong>{money(entry.totalDebit)}</strong></div>):<div className="empty-state"><BookOpen/><p>No posted vouchers yet.</p></div>}</section></div></>}
    {tab==='ledger'&&<section className="panel record-panel"><div className="panel-head"><div><h3>Daily general ledger</h3><span>Balanced vouchers; posted records require reversal, not deletion.</span></div><button className="btn btn-sm" onClick={()=>setModal({kind:'ledger'})}><Plus size={15}/> New voucher</button></div><div className="finance-filterbar"><input aria-label="Search ledger" placeholder="Search voucher, party or narration" value={ledgerSearch} onChange={event=>setLedgerSearch(event.target.value)}/><input aria-label="Filter ledger by date" type="date" value={ledgerDate} onChange={event=>setLedgerDate(event.target.value)}/><span>{filteredLedger.length} entries</span></div><AdminTable rows={filteredLedger} columns={[{key:'postingDate',label:'Date',render:r=>date(r.postingDate)},{key:'voucherNumber',label:'Voucher'},{key:'voucherType',label:'Type'},{key:'narration',label:'Narration'},{key:'partyName',label:'Party'},{key:'totalDebit',label:'Amount',render:r=>money(r.totalDebit)},{key:'status',label:'Status',render:r=><span className={statusClass(r.status)}>{r.status}</span>},{key:'actions',label:'Actions',render:ledgerActions}]} empty="No ledger vouchers match the selected filters."/></section>}
    {tab==='expenses'&&<section className="panel record-panel"><div className="panel-head"><div><h3>Expense register</h3><span>Approval and payment posting remain separate controls.</span></div><button className="btn btn-sm" onClick={()=>setModal({kind:'expense'})}><Plus size={15}/> Record expense</button></div><AdminTable rows={expenses} columns={[{key:'expenseDate',label:'Date',render:r=>date(r.expenseDate)},{key:'expenseNumber',label:'Expense no.'},{key:'payee',label:'Payee'},{key:'category',label:'Category'},{key:'amount',label:'Amount',render:r=>money(r.amount)},{key:'projectReference',label:'Project / Tender'},{key:'status',label:'Status',render:r=><span className={statusClass(r.status)}>{r.status}</span>},{key:'actions',label:'Actions',render:expenseActions}]} empty="No expenses have been recorded."/></section>}
    {tab==='advances'&&<section className="panel record-panel"><div className="panel-head"><div><h3>Advance register</h3><span>Monitor payments, adjustments, refunds and overdue settlements.</span></div><button className="btn btn-sm" onClick={()=>setModal({kind:'advance'})}><Plus size={15}/> Record advance</button></div><AdminTable rows={advances} columns={[{key:'advanceDate',label:'Date',render:r=>date(r.advanceDate)},{key:'advanceNumber',label:'Advance no.'},{key:'recipientName',label:'Recipient'},{key:'advanceType',label:'Type'},{key:'amount',label:'Paid',render:r=>money(r.amount)},{key:'outstandingAmount',label:'Outstanding',render:r=><b className={r.outstandingAmount>0?'amount-due':''}>{money(r.outstandingAmount)}</b>},{key:'expectedSettlementDate',label:'Settle by',render:r=>date(r.expectedSettlementDate)},{key:'status',label:'Status',render:r=><span className={statusClass(r.status)}>{r.status}</span>},{key:'actions',label:'Actions',render:advanceActions}]} empty="No advances have been recorded."/></section>}
    {tab==='accounts'&&<section className="panel record-panel"><div className="panel-head"><div><h3>Chart of accounts</h3><span>System and business accounts used by every financial posting.</span></div>{canApprove&&<button className="btn btn-sm" onClick={()=>setModal({kind:'account'})}><Plus size={15}/> Add account</button>}</div><AdminTable rows={accounts} columns={[{key:'code',label:'Code'},{key:'name',label:'Account'},{key:'type',label:'Type'},{key:'totalDebit',label:'Total debit',render:r=>money(r.totalDebit)},{key:'totalCredit',label:'Total credit',render:r=>money(r.totalCredit)},{key:'balance',label:'Net balance',render:r=><b className={r.balance<0?'negative':''}>{money(r.balance)}</b>},{key:'isSystem',label:'Source',render:r=>r.isSystem?'System':'Custom'}]}/></section>}
    {modal&&<QuickCreateModal {...(settlementForm||forms[modal.kind])} onClose={()=>setModal(null)} onSubmit={settlementForm?.submit||forms[modal.kind].submit}/>}
  </div>;
}
