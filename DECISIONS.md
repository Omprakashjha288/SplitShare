# DECISIONS.md

## Project Decision Log

This document records the major technical and architectural decisions made during the development of SplitShare.

---

## 1. Frontend Framework

Decision:

* React + TypeScript + Vite

Options Considered:

* React + CRA
* React + Vite
* Next.js

Chosen:

* React + Vite

Reason:

* Faster development experience.
* Faster build times.
* Lightweight setup.
* Well-suited for a dashboard-style SPA.

---

## 2. Backend Framework

Decision:

* Express.js

Options Considered:

* Express.js
* NestJS
* Fastify

Chosen:

* Express.js

Reason:

* Simplicity.
* Quick API development.
* Easy integration with Prisma.

---

## 3. Database

Decision:

* Neon PostgreSQL

Options Considered:

* MySQL
* MongoDB
* PostgreSQL (Neon)

Chosen:

* PostgreSQL (Neon)

Reason:

* Relational structure fits shared-expense data.
* Supports transactions and relationships.
* Free cloud-hosted option available.

---

## 4. ORM Selection

Decision:

* Prisma ORM

Options Considered:

* Sequelize
* TypeORM
* Prisma

Chosen:

* Prisma

Reason:

* Type-safe queries.
* Excellent TypeScript support.
* Easier schema management and migrations.

---

## 5. CSV Parsing

Decision:

* PapaParse

Options Considered:

* Manual parsing
* csv-parser
* PapaParse

Chosen:

* PapaParse

Reason:

* Reliable CSV handling.
* Header support.
* Easy React integration.

---

## 6. Data Validation Strategy

Decision:

* Validate during import before database insertion.

Options Considered:

* Store raw data and validate later.
* Validate before insert.

Chosen:

* Validate before insert.

Reason:

* Prevents invalid records from entering the database.
* Keeps database clean.

---

## 7. Duplicate Detection

Decision:

* Use composite key:

(date + description + amount + paid_by)

Options Considered:

* Allow duplicates.
* Database unique constraints.
* Import-time duplicate detection.

Chosen:

* Import-time duplicate detection.

Reason:

* Detects duplicate expenses early.
* Prevents accidental double imports.

---

## 8. Anomaly Detection Rules

Implemented:

* Missing payer
* Invalid amount
* Duplicate transaction
* Settlement detection
* Invalid date
* USD transaction flagging

Reason:

* Improve data quality.
* Surface issues before storage.

---

## 9. Expense Splitting Logic

Decision:

* Equal split among active members.

Options Considered:

* Equal split
* Exact split
* Percentage split

Chosen:

* Equal split

Reason:

* Simplest and most common use case.
* Meets assignment requirements.

---

## 10. Import Logging

Decision:

* Store every import attempt.

Options Considered:

* No audit history.
* Store import metadata.

Chosen:

* Import metadata logging.

Reason:

* Supports traceability.
* Allows historical review of imports.

---

## 11. Dashboard Analytics

Decision:

* Use Recharts.

Options Considered:

* Chart.js
* Recharts
* D3.js

Chosen:

* Recharts

Reason:

* React-friendly.
* Simple API.
* Good dashboard visualization support.

---

## 12. Settlement Calculation

Decision:

* Compute balances using expense and split records.

Options Considered:

* Manual settlement tracking.
* Derived balance calculation.

Chosen:

* Derived balance calculation.

Reason:

* Eliminates redundant data.
* Keeps balances consistent with expenses.

---

## 13. Deployment Strategy

Decision:

* Vercel + Render

Options Considered:

* Railway
* Render
* Vercel only

Chosen:

* Vercel (Frontend)
* Render (Backend)

Reason:

* Vercel is optimized for React/Vite applications.
* Render supports long-running Express services.
* Works well with Neon PostgreSQL.

---

## 14. AI Usage Decision

Decision:

* Use AI as a development assistant.

Used For:

* Debugging support.
* Architecture discussions.
* Deployment troubleshooting.
* Documentation improvements.

Not Used For:

* Blind code generation without review.

Reason:

* Improved development speed while maintaining manual understanding and implementation control.

---

## Final Architecture

React + Vite
↓
Express.js API
↓
Prisma ORM
↓
Neon PostgreSQL

Deployment:

Frontend → Vercel

Backend → Render

Database → Neon PostgreSQL
