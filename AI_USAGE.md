# AI_USAGE.md

## AI Tools Used

### 1. ChatGPT

Used For:

* Project planning
* Architecture discussions
* React and Express development guidance
* Prisma ORM troubleshooting
* PostgreSQL integration support
* Deployment assistance (Render + Vercel)
* Documentation generation
* Code review and debugging

### 2. IDE AI Assistance

Used For:

* Code completion
* Refactoring suggestions
* Boilerplate generation

---

# Key Prompts Used

### Prompt 1

"Help me build a Shared Expense App using React, Express, Prisma, and PostgreSQL."

Purpose:

* Initial project architecture.

---

### Prompt 2

"Debug Prisma and Neon PostgreSQL connection issues."

Purpose:

* Database integration troubleshooting.

---

### Prompt 3

"Help implement CSV import, anomaly detection, and expense splitting."

Purpose:

* Data processing workflow.

---

### Prompt 4

"Deploy a React frontend and Express backend using Vercel and Render."

Purpose:

* Production deployment.

---

## Cases Where AI Was Wrong

### Case 1: Incorrect TypeScript Syntax

AI Suggestion:
A template string and route handler were generated with mismatched braces, causing:

Error:

Expected ";" but found "$"

How I Caught It:

* The TypeScript compiler failed.
* Server would not start.

What I Changed:

* Reviewed the generated code.
* Corrected template string syntax and closing braces.
* Verified successful server startup.

Result:
Server compiled and executed successfully.

---

### Case 2: Broken Express Route Structure

AI Suggestion:
Generated an Express route with incorrectly nested braces and parentheses.

Error:

Expected ")" but found "}"

How I Caught It:

* Build process failed.
* Error location identified in server/index.ts.

What I Changed:

* Rewrote the route structure manually.
* Balanced all braces and route closures.
* Retested API endpoints.

Result:
Backend API worked correctly.

---

### Case 3: Deployment Assumption

AI Suggestion:
Suggested that Vercel deployment alone would be sufficient.

Problem:
The project contained both frontend and backend services.

How I Caught It:

* API requests failed after deployment testing.
* Backend endpoints were unavailable.

What I Changed:

* Deployed frontend to Vercel.
* Deployed Express backend separately on Render.
* Connected both using environment variables.

Result:
Application became fully functional in production.

---

### Case 4: Database Import Logic

AI Suggestion:
Provided import logic that did not fully account for duplicate records and validation edge cases.

Problem:
Import counts did not always match processed rows.

How I Caught It:

* Compared imported records against CSV totals.
* Verified import history and database entries.

What I Changed:

* Added duplicate detection.
* Added anomaly logging.
* Improved validation checks.

Result:
Import reports became consistent and auditable.

---

## Validation Process

AI-generated output was never accepted without review.

For every generated suggestion:

1. Code was manually inspected.
2. TypeScript compilation was verified.
3. Backend APIs were tested.
4. Database operations were validated.
5. Frontend functionality was tested.
6. Deployment was verified in production.

---

## Development Approach

AI was used as an assistant rather than an autonomous developer.

Final responsibility for:

* Design decisions
* Code integration
* Testing
* Debugging
* Deployment
* Documentation

remained with the developer.

---

## Summary

AI significantly accelerated development by assisting with architecture discussions, debugging, deployment guidance, and documentation.

However, all generated output was manually reviewed, corrected when necessary, tested, and validated before inclusion in the final project.
