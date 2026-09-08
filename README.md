# Surgicare MERN Platform

Surgicare's public corporate website and secure business-operations foundation for medical-device, hospital-consumable and institutional supply workflows.

## Technology

- React 18, Vite and React Router
- Node.js and Express REST API
- MongoDB and Mongoose
- JWT authentication with bcrypt password hashing

The application remains separated into `client/` and `server/`.

## Current scope

### Public website

- Premium, responsive Home, About, Products, Product Detail, Institutional Supply, Quality and Contact routes
- Backend-powered product catalogue with safe representative placeholders while the approved catalogue is pending
- RFQ/contact form with validation and MongoDB persistence
- Configurable founder, contact, certification and product-content placeholders
- Accessible navigation, reduced-motion support and mobile-specific layouts

### Secure operations platform

- Staff login and protected React/API routes
- Live overview for receipts, receivables, tenders, inventory and stock attention
- Products, product-wise tender evaluation, itemised quotations, delivery challans, sales-tax invoices, receivables and website enquiries
- Reusable record-creation forms and honest empty states
- Tender approval outcomes by product, approved quantity and approved rate
- Quotation editor with server-calculated tax/discount totals and a print/PDF-ready view
- Delivery challan editor with batch, manufacturing/expiry, dispatch and receiving details plus print/PDF view
- Sales-tax invoice editor with NTN/STRN fields, server-calculated taxable value/tax and print/PDF view
- Role-based API authorization, allowlisted business-document payloads and staff action audit logs
- Atomic quotation and delivery-challan numbering

## Local setup

1. Install Node.js 20+ and run MongoDB locally, or obtain a MongoDB connection URI.
2. Copy `server/.env.example` to `server/.env`.
3. Replace `JWT_SECRET` with a long random value. Set the temporary admin name, email and a password of at least 12 characters.
4. Install dependencies from the repository root:

   ```bash
   npm install
   npm run install:all
   ```

5. Create or update the first authorised admin account:

   ```bash
   npm run create-admin
   ```

6. Start both applications:

   ```bash
   npm run dev
   ```

- Public website: `http://localhost:5173`
- Staff access: `http://localhost:5173/staff-login`
- API health: `http://localhost:5000/api/health`

## Validation

Run the server syntax check and production client build together:

```bash
npm run check
```

Run the business-rule and authorization tests:

```bash
npm test
```

## Vercel deployment

The repository includes a Vercel configuration for the Vite frontend, React Router fallbacks and Express serverless API. The public website can be previewed without a database; data-backed product, RFQ and staff features require `MONGO_URI`, `JWT_SECRET` and `CLIENT_URL` in the Vercel project environment.

## API routes

Public:

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/slug/:slug`
- `POST /api/rfqs`
- `POST /api/auth/login`

Authenticated staff routes cover the dashboard, tenders, quotations, challans, sales-tax invoices, payments, clients, RFQ review and product mutations.

## Content safeguards

The site intentionally does not invent certifications, clients, manufacturers, product specifications, regulatory claims, founder details, addresses, contact information or commercial performance. Replace the clearly marked placeholders only with approved Surgicare material.

## Next recommended phase

- Add the verified product catalogue, media and technical files
- Configure genuine company contact and leadership content
- Confirm final letterhead, legal details and tax wording with Surgicare's accountant/tax adviser
- Connect approved quotation → challan → invoice → receivable creation
- Extend the connected tender → order → stock → delivery → invoice → payment workflow
- Add batch-level stock movements and configurable expiry alerts
- Add an audit-history screen, MFA/session revocation and final production security review
