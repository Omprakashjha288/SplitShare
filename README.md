# Shared Expense App

A full-stack expense sharing application that imports CSV transaction data, detects anomalies, stores expenses in PostgreSQL, generates expense splits, tracks import history, and calculates settlements between group members.

## Features

### CSV Import
- Import transactions from CSV files
- Automatic date parsing and validation
- Import status tracking (Imported, Skipped, Flagged)

### Anomaly Detection
- Detect missing payer information
- Detect invalid or negative amounts
- Detect duplicate transactions
- Flag suspicious or high-value expenses

### Expense Management
- Store expenses in PostgreSQL
- Create users and groups automatically
- Track shared expenses across members

### Expense Splitting
- Automatic equal expense splitting
- Generate member-wise expense shares
- Store split records for each transaction

### Dashboard Analytics
- Monthly Spending Bar Chart
- Top Spenders Pie Chart
- Total Expenses Overview
- User and Import Statistics

### Import History
- View previous CSV imports
- Track imported, skipped, and flagged rows
- Audit trail with timestamps

### Settlements
- Calculate balances between members
- Minimize required transactions
- Show exactly who owes whom

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Recharts
- CSS

### Backend
- Node.js
- Express.js
- Prisma ORM

### Database
- Neon PostgreSQL

---

## Run Locally

### Install Dependencies

```bash
npm install
```

### Start Frontend

```bash
npm run dev
```

### Start Backend

```bash
npm run server
```

### Open Application

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:5000
```

Prisma Studio:

```bash
npx prisma studio
```

---

## Project Structure

```txt
src/
 ├── pages/
 ├── components/
 ├── services/
 ├── types/
 └── utils/

server/
 ├── index.ts
 └── prisma.ts

prisma/
 └── schema.prisma
```

---

## Key Features Implemented

- CSV Import & Validation
- Anomaly Detection
- PostgreSQL Persistence
- Expense Splitting Engine
- Dashboard Analytics
- Import Audit Logs
- Settlement Calculation
- Production Build Ready
