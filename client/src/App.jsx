import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import InstitutionalSupply from './pages/InstitutionalSupply';
import Quality from './pages/Quality';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import AdminInventory from './pages/AdminInventory';
import AdminTenders from './pages/AdminTenders';
import AdminQuotations from './pages/AdminQuotations';
import AdminChallans from './pages/AdminChallans';
import AdminPayments from './pages/AdminPayments';
import NotFound from './pages/NotFound';
import ProductDetail from './pages/ProductDetail';
import StaffLogin from './pages/StaffLogin';
import AdminEnquiries from './pages/AdminEnquiries';
import QuotationPrint from './pages/QuotationPrint';
import AdminInvoices from './pages/AdminInvoices';
import ChallanPrint from './pages/ChallanPrint';
import InvoicePrint from './pages/InvoicePrint';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/institutional-supply" element={<InstitutionalSupply />} />
        <Route path="/quality" element={<Quality />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/staff-login" element={<StaffLogin />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="tenders" element={<AdminTenders />} />
        <Route path="quotations" element={<AdminQuotations />} />
        <Route path="quotations/:id/print" element={<QuotationPrint />} />
        <Route path="challans" element={<AdminChallans />} />
        <Route path="challans/:id/print" element={<ChallanPrint />} />
        <Route path="invoices" element={<AdminInvoices />} />
        <Route path="invoices/:id/print" element={<InvoicePrint />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
