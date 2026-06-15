Project Scope

SplitShare is a full-stack shared expense management application designed to import CSV transaction data, detect anomalies, store validated expenses, generate expense splits, track import history, and calculate settlements between group members.

CSV Data Issues Identified and Handling Strategy
1. Missing Payer Information

Problem:

Some rows contained empty or missing paid_by values.

Handling:

Such rows were skipped during import.
Logged as anomalies.
Count included in import summary.

Status:

Flagged and skipped.
2. Invalid Amount Values

Problem:

Empty amount fields.
Non-numeric values.
Values resulting in NaN during parsing.

Handling:

Validation performed before database insertion.
Invalid records flagged.
Rows skipped from import.

Status:

Flagged and skipped.
3. Duplicate Expenses

Problem:
Duplicate transactions detected using:

(date + description + amount + paid_by)

Handling:

Duplicate rows identified during import.
Logged as anomalies.
Duplicate entries prevented from being imported.

Status:

Flagged and skipped.
4. Settlement Transactions

Problem:
Rows representing settlements rather than actual expenses.

Handling:

Identified using description and transaction metadata.
Marked separately using settlement logic.

Status:

Flagged and categorized.
5. Currency Validation

Problem:
Expenses recorded in currencies other than INR.

Handling:

Currency preserved.
USD expenses identified and flagged in anomaly summary.

Status:

Imported with flag.
6. Invalid Dates

Problem:
Missing or malformed dates.

Handling:

Date parsing validation applied.
Invalid dates flagged during processing.

Status:

Flagged.
7. Negative Expense Amounts

Problem:
Negative transaction values detected.

Handling:

Treated as suspicious transactions.
Included in anomaly reporting.

Status:

Flagged.
Database Schema
User

Stores application users.

Fields:

id
name
email
passwordHash
createdAt
Group

Represents an expense-sharing group.

Fields:

id
name
createdAt
GroupMember

Maps users to groups.

Fields:

id
groupId
userId
joinedAt
leftAt
Expense

Stores imported expenses.

Fields:

id
groupId
paidById
description
amount
currency
amountInr
splitType
date
notes
isSettlement
createdAt
ExpenseSplit

Stores expense distribution among members.

Fields:

id
expenseId
userId
amount
Settlement

Stores settlement transactions.

Fields:

id
groupId
fromUserId
toUserId
amount
currency
date
notes
createdAt
ImportLog

Stores import audit history.

Fields:

id
filename
importedAt
totalRows
imported
skipped
flagged
anomalies
Import Workflow

CSV Upload
→ Validation
→ Anomaly Detection
→ Database Import
→ Expense Split Generation
→ Import Log Creation
→ Dashboard Analytics
→ Settlement Calculation

Technology Stack

Frontend:

React
TypeScript
Vite
Recharts

Backend:

Node.js
Express.js
Prisma ORM

Database:

Neon PostgreSQL

Deployment:

Vercel (Frontend)
Render (Backend)