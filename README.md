# Loanline — Loan Management System

Loanline is a role-based Loan Management System built with Next.js, Express, TypeScript, MongoDB, Mongoose, and Tailwind CSS. It supports the complete loan lifecycle: borrower application, sanction review, disbursement, repayment collection, and closure.

## Features

- Borrower portal with loan status cards, repayment progress, rejection reasons, and a UTR payment ledger.
- Active-loan prevention: borrowers cannot apply again while an application is `APPLIED`, `SANCTIONED`, or `DISBURSED`.
- Role-based operations modules for Sales, Sanction, Disbursement, Collection, and Admin users.
- Applicant search, status filters, pagination, salary-slip modal preview, and repayment history in the operations dashboard.
- Payment validation for duplicate UTRs, invalid amounts, and overpayments.
- Client-side JWT/role route guards, contextual navigation, and logout.

## Tech stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, Axios
- Backend: Express.js, TypeScript, Mongoose, JWT, Multer
- Database: MongoDB Atlas or local MongoDB

## Run locally

Install dependencies in each application:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create `backend/.env` (this file is intentionally ignored by Git):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
```

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seed accounts

Seed the database with role accounts:

```bash
cd backend
npm run seed
```

Running the seed script creates these six accounts. Use the shared password **`Password123!`** for every account.

| Name | Role | Email | Password |
| --- | --- | --- | --- |
| John Borrower | Borrower | borrower@lms.com | `Password123!` |
| Sales Exec | Sales | sales@lms.com | `Password123!` |
| Sanction Officer | Sanction | sanction@lms.com | `Password123!` |
| Disbursement Exec | Disbursement | disbursement@lms.com | `Password123!` |
| Collection Exec | Collection | collection@lms.com | `Password123!` |
| Admin User | Admin | admin@lms.com | `Password123!` |

## Main routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/borrower/dashboard` | Borrower | Loan summaries and payment history |
| `/apply` | Borrower | Three-step loan application |
| `/dashboard` | Operations/Admin | Role-specific operations workspace |
| `/login` | Public | User authentication |
| `/signup` | Public | Borrower registration |

## API overview

- `POST /api/auth/signup`, `POST /api/auth/login`
- `GET /api/loans/my`, `POST /api/loans/check-bre`, `POST /api/loans/upload`, `POST /api/loans/apply`
- `GET /api/ops/sales`
- `GET` / `POST /api/ops/sanction/:loanId`
- `GET` / `POST /api/ops/disbursement/:loanId`
- `GET` / `POST /api/ops/collection/:loanId`

All protected API calls require an `Authorization: Bearer <JWT>` header.
