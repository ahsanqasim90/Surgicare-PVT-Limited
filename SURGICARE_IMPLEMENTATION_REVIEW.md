# Surgicare MERN Platform — Implementation Review & CV Portfolio Report

**Review date:** 24 October 2026

**Repository:** https://github.com/ahsanqasim90/Surgicare-PVT-Limited

**Live application:** https://surgicare-mern-website.vercel.app

**Project type:** Full-stack MERN web application

**Current maturity:** Deployed, working MVP with a polished public website and an authenticated operations-management foundation

---

## 1. Executive summary

Surgicare is not only a static company website. It is a custom-designed, full-stack platform with two connected parts:

1. A public-facing corporate and product website for a medical and surgical supply company.
2. A protected staff portal for managing products, tenders, quotations, delivery challans, sales-tax invoices, receivables and customer enquiries.

The application was built with React, Vite, Node.js, Express, MongoDB and Mongoose. It includes real database persistence, JWT-based authentication, protected frontend and backend routes, responsive layouts, reusable UI components, REST APIs, input validation, security middleware and a production Vercel deployment.

The current version is best described as a **production-deployed full-stack operations, procurement and finance MVP**. Its core architecture and major workflows are implemented and working. Product-wise tender evaluation, itemised quotations, delivery challans, sales-tax invoices, supplier management, controlled purchase orders, goods-receipt posting, stock movements, supplier payables, a double-entry daily ledger, expense approvals, advance-payment settlement, role-based API authorization, atomic document numbering and backend audit logging are implemented. Advanced features such as automatic sales-document conversion, MFA and verified final company content remain future work.

## 2. What is fully implemented

### Public corporate website

- Responsive navigation with desktop and mobile states.
- Sticky header with scroll-aware styling.
- Branded footer with company, solution and staff-portal navigation.
- Home, About, Products, Product Detail, Institutional Supply, Quality and Contact/RFQ routes.
- Original medical-supply visual language using a navy, teal and neutral design system.
- Responsive desktop, tablet and mobile breakpoints.
- Reduced-motion support and keyboard-visible focus states.
- Dynamic product catalogue backed by MongoDB.
- Safe representative catalogue fallback when no approved products exist.
- Product search and category filtering.
- Dynamic product-detail route based on product slug.
- RFQ/contact form connected to the backend and MongoDB.
- Loading, success, error, empty and unavailable states.
- Custom 404 page.

### Secure operations portal

- Dedicated staff login experience.
- JWT authentication and session restoration.
- Protected React routes.
- Protected Express API endpoints.
- Admin sidebar navigation and account display.
- Live operational dashboard backed by MongoDB.
- Inventory/product records.
- Tender records.
- Quotation records.
- Delivery challan records.
- Receivable/payment records.
- Public website enquiry inbox.
- Reusable data table and quick-create modal components.
- Product-wise tender approval outcomes, quantities and rates.
- Itemised quotation creation/editing with server-calculated totals.
- Browser print/PDF-ready quotation view.
- Itemised delivery challan editor and print/PDF-ready dispatch document.
- Sales-tax invoice editor with tax identity fields, server calculations and print/PDF-ready output.
- Finance control centre with daily ledger, chart of accounts, expense approvals and advance-payment settlement.
- Procurement control centre with supplier master data, purchase-order approvals, goods received notes, stock posting, supplier invoices and payments.
- Immutable stock-movement history linked to posted and reversed goods receipts.
- Accounts-payable posting with separate inventory, input-tax, payable and cash/bank ledger entries.
- Balanced debit/credit validation, controlled posting and reversal-ready ledger architecture.
- Role-based API authorization and role-aware sidebar navigation.
- Staff mutation audit logs.
- Atomic quotation and delivery-challan number generation.
- Empty states suitable for a new database.

### Backend and infrastructure

- Express REST API separated from the React client.
- Twenty Mongoose models, including procurement, finance, audit and atomic-counter support models.
- Reusable CRUD controller and resource router.
- Centralized error handling.
- Request logging.
- Password hashing with bcrypt.
- JWT verification middleware.
- Login and enquiry rate limiting.
- Helmet security headers.
- Configurable CORS policy.
- MongoDB Atlas connectivity.
- Vercel serverless API entry point.
- SPA rewrites for React Router.
- Environment-variable based configuration.
- Production build and validation scripts.

## 3. Frontend route-by-route review

| Route | Purpose | Implemented behavior | Status |
|---|---|---|---|
| `/` | Home | Hero, trust indicators, product categories, procurement workflow, leadership placeholder and RFQ CTA | Implemented |
| `/about` | Company profile | Company positioning, history timeline, leadership area and institutional CTA | Implemented; verified company details still required |
| `/products` | Product catalogue | MongoDB catalogue, fallback catalogue, search, category filters and empty states | Implemented |
| `/products/:slug` | Product detail | Images, overview, specifications, packaging, availability and enquiry deep-link | Implemented; depends on approved product data |
| `/institutional-supply` | Procurement capability | Six-stage supply workflow, capabilities and accountability principles | Implemented |
| `/quality` | Quality positioning | Six quality areas and certificate/document-library placeholder | Implemented; real certificates still required |
| `/contact` | RFQ and enquiry | Validated form, URL-prefilled product, API submission and feedback states | Implemented |
| `/staff-login` | Staff authentication | Email/password login, error and loading states, return-to-requested-page navigation | Implemented |
| `/admin` | Operations dashboard | Revenue, outstanding receivables, active tenders, inventory count, pipeline, upcoming payments and low-stock warning | Implemented |
| `/admin/inventory` | Inventory | Product listing and opening-stock record creation | MVP implemented |
| `/admin/procurement` | Purchasing and stock | Suppliers, approval-based POs, GRNs, stock ledger, supplier invoices and payable payments | Implemented |
| `/admin/tenders` | Tenders | Product-wise evaluation, approved quantity/rate, outcome summaries, filtering and editing | Implemented |
| `/admin/quotations` | Quotations | Itemised create/edit workflow, calculated totals, atomic numbering and print/PDF-ready view | Implemented |
| `/admin/challans` | Delivery | Itemised challan create/edit, batch/expiry traceability, dispatch/receipt data and print view | Implemented |
| `/admin/invoices` | Tax invoices | Itemised create/edit, NTN/STRN fields, server-calculated tax totals, atomic numbering and print view | Implemented; final legal template review required |
| `/admin/finance` | Finance control centre | Chart of accounts, daily double-entry ledger, cash/bank balances, expenses, approvals, advances and settlements | Implemented |
| `/admin/payments` | Receivables | Amount, received amount, due date and derived payment status | MVP implemented |
| `/admin/enquiries` | Customer enquiries | Displays RFQs submitted from the public website | Implemented |
| `*` | Unknown route | Custom page-not-found response | Implemented |

## 4. Public website implementation details

### Home page

The homepage communicates Surgicare's market position through:

- A strong medical-supply hero statement.
- Product, procurement and delivery CTAs.
- Trust indicators for quality, fulfilment and procurement.
- A custom blueprint-style medical graphic created with HTML/CSS and icons.
- Six healthcare product categories.
- A six-step institutional procurement workflow.
- Founder/leadership content area prepared for approved material.
- A final quotation CTA.

### About page

The About page includes:

- Surgicare's establishment year and healthcare-supply positioning.
- A company-role explanation focused on institutional procurement.
- A timeline structure for future verified milestones.
- A founder/director section ready for a real portrait and message.
- Clear placeholders instead of invented business claims.

### Products and product details

The catalogue has two operating modes:

- **Live mode:** Products are loaded from MongoDB and link to dynamic detail pages.
- **Fallback mode:** Representative categories remain visible while the approved catalogue is unavailable.

Implemented product capabilities include:

- Keyword search.
- Category filtering.
- Slug-based detail URLs.
- Product images or an intentional placeholder.
- Manufacturer and SKU display.
- Availability status.
- Technical specification list.
- Packaging information.
- Product-specific quotation enquiry links.

### Institutional Supply page

This page translates the business process into a clear six-stage workflow:

1. Requirement capture.
2. Quotation or tender preparation.
3. Procurement.
4. Verification.
5. Delivery.
6. Support.

It also presents requirement capture, documentation readiness, supply verification and delivery coordination as core capabilities.

### Quality page

The quality page covers:

- Product quality.
- Supplier selection.
- Storage and handling.
- Traceability.
- Documentation.
- Certificates and authorisations.

The content avoids presenting unverified certifications as fact. The document-library area is ready for approved certificates.

### Contact and RFQ page

The enquiry form collects:

- Name.
- Organisation or hospital.
- Email.
- Phone.
- Product or requirement.
- Quantity.
- Detailed message.

The form includes client-side constraints, server-side Mongoose validation, submission loading state, success/error feedback and a warning not to provide confidential patient data. Successful enquiries are persisted in MongoDB and displayed in the protected staff portal.

## 5. Admin portal implementation details

### Authentication

- Staff credentials are submitted to the Express API.
- Passwords are compared against bcrypt hashes; plain passwords are not stored.
- A signed JWT is returned after successful authentication.
- The token is held in session storage.
- `/auth/me` restores and verifies the current staff session.
- Expired or invalid sessions are removed automatically.
- Protected frontend routes redirect unauthenticated users to the login screen.
- Protected backend endpoints require a valid bearer token.
- The user model supports Director, Admin, Sales, Inventory and Accounts roles.

### Dashboard

The dashboard calculates live figures from MongoDB:

- Total recorded receipts.
- Total outstanding receivables.
- Active tender count.
- Active inventory-item count.
- Tender counts by workflow status.
- Five upcoming unpaid receivables.
- Products at or below minimum stock.

### Inventory

The product schema already supports:

- Product name and unique slug.
- SKU and category.
- Manufacturer and descriptions.
- Multiple images.
- Technical specifications.
- Packaging information.
- Availability.
- Unit and stock quantity.
- Minimum stock threshold.
- Purchase and selling prices.
- Batch number and expiry date.
- Storage location.
- Featured and active flags.

The current admin UI lists the core fields and creates basic opening-stock records. The backend supports full create, read, update and delete operations.

### Tenders

The tender model supports:

- Title and tender number.
- Hospital/organisation.
- Submission and closing dates.
- Eight tender workflow states.
- Product-linked line items.
- Quoted and approved quantities/rates.
- Total value.
- Notes and document references.

The current UI creates and edits full tender item records. Each product can be marked Pending, Approved, Partially Approved or Rejected with approved quantity/rate and rejection notes. The overall result and offered/approved values are calculated by the server. Tender document upload remains future work.

### Quotations

The quotation model supports:

- Automatic quotation numbers.
- Client and contact details.
- Issue and validity dates.
- Five quotation states.
- Multiple line items.
- Quantity, unit rate, tax and discount.
- Calculated line totals, subtotal, tax, discount and grand total.
- Payment terms, delivery terms and notes.

The current UI creates and edits complete quotation line items, shows live totals and provides a letterhead-friendly browser print view that can be saved as PDF. Final legal/company details and the approved letterhead artwork still need to be supplied.

### Delivery challans

The challan model supports:

- Automatic challan numbers.
- Client and procurement reference.
- Delivery date.
- Product, brand, batch, manufacturing/expiry, ordered/delivered quantity and unit line items.
- Receiver name and contact.
- Draft, Ready, Dispatched, Partially Delivered, Delivered and Returned states.
- Notes.

The current UI creates and edits complete challan records and produces a letterhead-friendly receiving document that can be printed or saved as PDF.

### Sales tax invoices

The invoice workflow supports atomic invoice numbers, buyer/seller NTN and STRN fields, PO/reference data, multiple taxable items, discounts, per-line sales-tax rates, server-calculated totals, payment status and a letterhead-friendly print/PDF view. The supplied registration values and final wording must be verified by Surgicare's accountant or tax adviser before legal issuance.

### Procurement and supplier payables

The purchasing workspace implements a controlled sequence from supplier to payment:

- Supplier profiles with contact, NTN/STRN, address, banking and payment-term fields.
- Purchase orders with server-calculated line totals, discounts and input tax.
- Draft, submission, approval, issue, partial-receipt and full-receipt states.
- Goods received notes tied to an issued PO and existing inventory products.
- Over-receipt prevention and condition-based receipt handling.
- Transactional GRN posting that increases stock and creates traceable stock-movement records.
- Controlled GRN reversal that checks available stock and retains the original and reversal audit trail.
- Supplier invoices linked to the correct supplier, PO and posted GRN.
- Approval posting to Inventory, Input Sales Tax and Accounts Payable.
- Partial/full supplier payments posted against a selected cash or bank account.
- Live accounts-payable, overdue-invoice, open-PO and low-stock metrics.

### Payments and receivables

The payment model supports:

- Client and invoice/tender reference.
- Total and received amounts.
- Due and received dates.
- Pending, Partially Paid, Paid and Overdue states.
- Notes.

The quick-create form derives the initial payment status from the entered total and received amount. The dashboard uses these records to calculate receipts and outstanding balances.

### Enquiries

- Public RFQs are saved in MongoDB.
- The admin inbox lists the received date, contact, organisation, requirement, email and status.
- The backend supports New, In Review, Responded and Closed statuses.
- Status-changing UI controls have not yet been added.

## 6. Backend API review

The application registers more than 65 REST operations across the following resources:

| Resource | Public operations | Protected operations |
|---|---|---|
| Health | Service health check | — |
| Authentication | Login | Current-user verification |
| Products | List, get by slug, get by ID | Create, update, delete |
| RFQs | Submit enquiry | List enquiries, update status |
| Dashboard | — | Read dashboard summary |
| Tenders | — | List, get, create, update, delete |
| Quotations | — | List, get, create, update, delete |
| Challans | — | List, get, create, update, delete |
| Sales-tax invoices | — | List, get, create, update, delete |
| Payments | — | List, get, create, update, delete |
| Clients | — | List, get, create, update, delete |
| Procurement | — | Supplier master, PO workflow, GRN posting/reversal, stock ledger, supplier invoice approval and payments |
| Finance | — | Accounts, balanced ledger, expense workflow, advances and settlements |

### Reusable backend patterns

- A generic CRUD controller handles common list, get, create, update and delete behavior.
- A reusable router factory applies CRUD behavior to different Mongoose models.
- Resource lists are sorted newest-first and capped at 250 records.
- Updates run schema validators.
- Duplicate values return a conflict response.
- Invalid MongoDB identifiers and validation failures return controlled client errors.
- Unexpected internal errors do not expose detailed server information to the client.

## 7. Database model review

Twenty MongoDB collections are represented through Mongoose models:

1. `User` — authentication, roles and account state.
2. `Product` — catalogue and inventory master data.
3. `Tender` — institutional tender records and line items.
4. `Quotation` — commercial quotation data and calculations.
5. `DeliveryChallan` — delivery records, batches and receiving details.
6. `Payment` — receivables and payment tracking.
7. `RFQ` — website-generated quotation enquiries.
8. `Client` — hospital/customer contact records.
9. `AuditLog` — staff mutation history and actor/request metadata.
10. `Counter` — atomic document-number sequences.
11. `SalesTaxInvoice` — buyer/tax registration data, taxable line items and invoice totals.
12. `FinanceAccount` — chart of accounts, cash/bank accounts and opening balances.
13. `LedgerEntry` — balanced vouchers, posting status and reversal references.
14. `Expense` — expense approval, payment and ledger-posting records.
15. `Advance` — supplier/employee/project advances, adjustments, refunds and outstanding balances.
16. `Supplier` — verified supplier identity, tax, contact, banking and payment terms.
17. `PurchaseOrder` — itemised purchasing, approval and receipt progress.
18. `GoodsReceipt` — PO-linked receipt, batch/expiry and posting/reversal state.
19. `StockMovement` — immutable product quantity changes and source-document traceability.
20. `SupplierInvoice` — accounts payable, input tax, payment allocation and ledger references.

All models use automatic creation and update timestamps.

## 8. Reusable frontend architecture

| Component/module | Responsibility |
|---|---|
| `App.jsx` | Central route configuration |
| `PublicLayout` | Shared header, footer, skip link and route scroll reset |
| `AdminLayout` | Protected operations shell and sidebar navigation |
| `AuthContext` | Authentication state, login, logout and session checking |
| `api.js` | Shared fetch wrapper, bearer token and standardized errors |
| `ProtectedRoute` | Authentication gate and requested-page redirect |
| `Header` | Responsive public navigation |
| `Footer` | Shared corporate navigation and legal placeholders |
| `Brand` | Reusable Surgicare brand mark |
| `SectionTitle` | Consistent page-section typography |
| `AdminTable` | Reusable configurable data table and empty state |
| `QuickCreateModal` | Reusable schema-driven create form |
| `TenderEditor` | Product-wise tender submission and evaluation editor |
| `QuotationEditor` | Itemised quotation editor with live totals |
| `QuotationPrint` | Letterhead-friendly quotation print/PDF view |
| `ChallanEditor` / `ChallanPrint` | Traceable delivery workflow and receiving document |
| `InvoiceEditor` / `InvoicePrint` | Sales-tax calculation workflow and printable tax invoice |
| `ProcurementEditor` | Shared purchase-order, goods-receipt and supplier-invoice editor |

## 9. UI, responsive design and accessibility

### Design implementation

- Central design tokens for colours, shadows and typography.
- Navy/teal visual system appropriate for healthcare and institutional supply.
- Custom grids, cards, tables, forms, modal and dashboard components.
- Purpose-built hero visuals without reliance on a generic website template.
- Consistent typography, spacing, interaction and empty-state language.

### Responsive implementation

- Desktop layouts at full width.
- Tablet adjustments below 1100px and 900px.
- Mobile navigation and single-column layouts below 720px.
- Responsive admin sidebar that becomes a horizontal navigation strip on mobile.
- Responsive tables with horizontal scrolling.

### Accessibility foundations

- Skip-to-content link.
- Semantic headings, navigation, forms and tables.
- Accessible names on icon buttons.
- Visible keyboard focus styling.
- Form labels and status/alert roles.
- Escape-key modal closing.
- Reduced-motion media query.

The new document editors include automatic focus placement, Escape-key closing and background scroll locking. Accessibility can be strengthened further with a full modal focus trap, more comprehensive screen-reader testing and a formal WCAG audit.

## 10. Security review

### Implemented protections

- bcrypt password hashing with cost factor 12.
- JWT expiry support.
- Active-account verification on every protected request.
- Helmet security headers.
- CORS restricted through an environment-defined client URL.
- Request body size limited to 2 MB.
- Login rate limit: 10 attempts per 15 minutes.
- Enquiry rate limit: 20 submissions per 15 minutes.
- `x-powered-by` disabled.
- Production errors hide internal details.
- Secrets are environment-based and excluded from the repository.
- Vercel proxy trust configured for correct rate-limit behavior.
- Role-based authorization for Sales, Inventory and Accounts business areas.
- Explicit payload allowlists and server-side commercial calculations for tenders and quotations.
- Atomic document counters that avoid count-based numbering collisions.
- Audit records for create, update and delete actions.

### Recommended hardening

- Rotate any database or account credentials that have ever been shared in chat or screenshots.
- Add a production Content Security Policy tailored to required assets.
- Consider secure, HTTP-only cookies for authentication if the system handles higher-risk operational data.
- Add refresh-token/session-revocation strategy if longer sessions are required.
- Add a protected audit-history viewer and retention policy.
- Add account lockout/monitoring and optional multi-factor authentication.
- Add automated dependency scanning in CI.

## 11. Deployment and engineering workflow

- The frontend is built with Vite into `client/dist`.
- Vercel serves the React SPA and rewrites client routes to `index.html`.
- `/api/*` requests are routed to the Express serverless handler.
- The serverless handler reuses a cached MongoDB connection promise.
- A health endpoint can respond without opening a database connection.
- Missing or unavailable database configuration returns a controlled 503 response.
- Root scripts support dependency installation, local development, production builds, validation and initial admin creation.
- Source history is maintained in Git and pushed to GitHub.

## 12. Verification evidence from this review

The following checks were completed through 24 October 2026:

- Backend syntax check passed.
- Production React/Vite build passed.
- 1,612 frontend modules transformed successfully.
- Production bundle generated successfully.
- Thirteen automated business-rule/authorization tests passed.
- Authenticated tender and quotation API reads passed against the connected database.
- Client dependency audit: 0 known vulnerabilities.
- Server dependency audit: 0 known vulnerabilities.
- Live Home, About, Products, Institutional Supply, Quality, Contact and Staff Login routes rendered successfully.
- Unauthenticated `/admin` access redirected to Staff Login as intended.
- No browser console errors were recorded during the live public-route review.

These checks confirm build integrity, core document calculations and basic runtime behavior. They are not a replacement for broader integration/end-to-end coverage, a penetration test or a regulatory assessment.

## 13. Honest current limitations

### Content still required from Surgicare

- Verified company address, phone, email and legal information.
- Founder/director name, portrait and approved message.
- Genuine milestones and geographic coverage.
- Approved product catalogue, photographs and technical specifications.
- Verified certificates and authorisations.
- Privacy policy and legal terms.

### Product features still to build

- Edit/delete controls across every remaining admin module.
- Dedicated client-management screen.
- Final approved quotation letterhead/company details.
- Accountant/tax-adviser approval of the final sales-tax invoice wording and required registrations.
- Automatic quotation-to-challan-to-invoice document conversion.
- Tender document uploads and attachment storage.
- Sales-delivery stock-out posting and customer/supplier return workflows.
- Per-batch stock balances and automated expiry alerts.
- Automatic invoice-to-receipt allocation, overdue automation and bank reconciliation.
- Enquiry status controls and response notes.
- Email notifications.
- Audit-history user interface and retention/export controls.
- Server-side search, filtering and pagination.
- Broader integration and end-to-end test coverage.

### Technical risks to address before larger-scale use

- Some generic CRUD resources still accept broader schema-shaped request bodies; additional endpoint-specific validation is recommended.
- Authorization is role-based, but permissions are not yet configurable per user or organisation.
- Audit events are stored but do not yet have an admin viewer, retention policy or tamper-evident export.
- Current automated tests cover tender, quotation, challan, invoice, finance, procurement calculations and authorization rules; broader API and browser regression coverage is still required.
- Authentication still uses a session-storage bearer token; higher-risk production use should consider HTTP-only cookies, MFA and session revocation.
- SEO still needs page-specific metadata, sitemap, robots configuration and structured data.

## 14. Overall assessment

| Area | Assessment |
|---|---|
| Original UI design | Strong |
| Public website | Working and polished; final verified content needed |
| Responsive behavior | Implemented across key breakpoints |
| Frontend architecture | Clear and reusable for an MVP |
| Backend architecture | Functional REST and database foundation |
| Authentication | Working MVP implementation |
| Admin operations | Working foundation; advanced workflow UI remains |
| Database design | Broad domain coverage with useful future-ready fields |
| Deployment | Live on Vercel and connected to MongoDB Atlas |
| Automated testing | Core tender, quotation and authorization rules covered; broader coverage needed |
| Enterprise readiness | Security foundation improved; still requires MFA/session controls, audit UI, workflow depth and security assessment |

**Conclusion:** This is a substantial portfolio project and is appropriate to include on a CV as a self-designed, full-stack MERN application. The correct claim is that you designed and developed a deployed medical-supply corporate website and operations-management MVP—not that every enterprise workflow is fully complete.

## 15. CV-ready project entry

### Recommended project title

**Surgicare Medical Supply & Operations Platform — Full-Stack MERN Application**

### Short CV description

Designed and developed a responsive full-stack MERN platform for a medical and surgical supply company, combining a public product/RFQ website with a JWT-protected staff portal for inventory, procurement, tenders, quotations, delivery challans, sales-tax invoices, payables, receivables and finance. Built the UI system from scratch, designed MongoDB schemas and REST APIs, and deployed the application to Vercel with MongoDB Atlas.

### CV bullet points

- Designed and built a production-deployed MERN platform from scratch using React, Vite, Node.js, Express, MongoDB and Mongoose.
- Developed a responsive corporate website with dynamic product catalogue, category filtering, product detail pages and a database-backed RFQ workflow.
- Implemented JWT authentication, bcrypt password hashing, protected frontend/API routes, role-based authorization, rate limiting, Helmet security headers and centralized error handling.
- Created an authenticated operations portal with product-wise tender evaluation, itemised quotations, traceable delivery challans, sales-tax invoices, print-ready documents, inventory monitoring, receivables and website enquiries.
- Designed twenty MongoDB models and more than 65 REST operations, including purchasing, stock movement, double-entry finance, atomic numbering, audit logging and server-calculated business metrics.
- Configured Git/GitHub version control, Vercel serverless deployment, SPA routing and MongoDB Atlas integration.

### Compact one-line version

Built and deployed a custom MERN medical-supply platform featuring a responsive corporate website, MongoDB-backed RFQs and products, JWT staff authentication, and operational modules for tenders, quotations, inventory, delivery challans, sales-tax invoices and receivables.

## 16. Portfolio/GitHub description

Surgicare is a custom full-stack MERN platform for medical and surgical institutional supply. It combines a responsive public corporate website and dynamic product/RFQ experience with a secure operations portal covering inventory, procurement, tenders, quotations, delivery challans, sales-tax invoices, supplier payables, receivables and finance. The system uses React, Vite, Express, MongoDB, Mongoose, JWT authentication and a Vercel serverless deployment.

## 17. Interview talking points

### Why was MERN selected?

MERN allowed the frontend, API and database models to share a JavaScript-based development workflow. MongoDB also fits product, quotation, tender and delivery records that contain nested line items and may evolve as the business confirms its process.

### What was technically challenging?

- Combining a public marketing site and a protected operational application in one React project.
- Maintaining authentication state and protecting both UI routes and API endpoints.
- Connecting an Express application to MongoDB in a serverless Vercel environment.
- Designing reusable CRUD patterns while preserving resource-specific quotation and challan logic.
- Building an original responsive design system without using a prebuilt site template.

### What would be built next?

The next phase would connect approved quotations to challans, invoices, stock-out and receivables; add batch-level expiry alerts, audit-history UI, MFA/session controls, final accountant-approved tax wording and broader automated integration/end-to-end testing.

## 18. Skills demonstrated

- React component architecture.
- React Router routing and protected routes.
- State management with hooks and Context.
- Responsive UI and original CSS design systems.
- Accessible interaction foundations.
- REST API design with Express.
- MongoDB/Mongoose schema design.
- Authentication and application security fundamentals.
- Reusable CRUD architecture.
- Domain modelling for healthcare procurement operations.
- Error handling and validation.
- Git/GitHub workflow.
- Vercel serverless deployment.
- MongoDB Atlas configuration.
- Debugging production deployment and routing issues.

---

## Final portfolio statement

This project demonstrates the ability to take a real business idea from a blank folder to an original design, functioning full-stack architecture, persistent database, secure staff access and a public production deployment. It should be presented as a strong self-directed MERN portfolio project, with the remaining roadmap described openly as the next stage of product development.
