# UTDesign Procurement

Procurement and reimbursement request management for UTD EPICS/Capstone/Senior Design students.

Three user roles: **Student**, **Mentor**, **Admin**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) (Vue 3, TypeScript) |
| UI | [Nuxt UI](https://ui.nuxt.com) + Tailwind CSS |
| Data grids | AG Grid Vue 3 |
| Auth | [BetterAuth](https://www.better-auth.com) (email/password; Microsoft SSO stubbed) |
| ORM | [Prisma 7](https://www.prisma.io) |
| Database | SQLite (`prisma/dev.db`) |
| Email | Nodemailer |

---

## Setup

### Prerequisites

- Node.js 20+
- No database server needed — SQLite is file-based

### Install

```bash
npm install
```

### Environment

Copy the example and fill in the required values:

```bash
cp .env.example .env
```

`.env.example`:
```
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="change-me-in-production"
BETTER_AUTH_URL="http://localhost:3000"

# Email (optional for dev)
NODEMAILER_EMAIL=""
NODEMAILER_PASSWORD=""

# UTD SSO — fill in when UTD OIT provides credentials
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""
MICROSOFT_TENANT_ID=""
```

### Database

```bash
# Create the database schema
npx prisma migrate dev --name init

# Seed with dev users and sample data
npm run db:seed
```

### Run

```bash
npm run dev
```

---

## Dev Credentials

After seeding, log in at `http://localhost:3000/login`:

| Role | Email | Password |
|---|---|---|
| Student | abc000000@utdallas.edu | password123 |
| Mentor | def000000@utdallas.edu | password123 |
| Admin | ghi000000@utdallas.edu | password123 |

---

## Database Scripts

```bash
npm run db:seed      # Seed dev data
npm run db:migrate   # Run pending migrations
npm run db:studio    # Open Prisma Studio
npm run db:push      # Push schema without migration (prototype)
```

---

## Project Structure

```
/app.vue             → Root layout
/pages               → Nuxt file-based routes
/components          → Vue components
  /cards             → RequestCard, ReimbursementCard (role-aware via props)
  /modals            → Modal dialogs
  /shared            → StatusBadge, BudgetDisplay, VendorSelect, DragAndDrop
/composables         → useAuth()
/layouts             → Default layout with NavBar
/middleware          → Client-side auth guard
/server
  /api               → H3/Nitro API route handlers
  /lib/auth.ts       → BetterAuth instance
  /middleware/auth.ts → Server-side session guard
  /utils             → prisma, budget, email, netid
/prisma
  /schema.prisma     → Database schema (SQLite + UserRole enum)
  /seed.ts           → Dev seed script
```

---

## Authentication

- Uses **BetterAuth** with email/password for local development
- Every `/api/*` route (except `/api/auth/*`) is protected by the server middleware in [server/middleware/auth.ts](server/middleware/auth.ts)
- Session user and role are attached to `event.context.user` / `event.context.role`
- Microsoft Azure AD (UTD SSO) is stubbed in [server/lib/auth.ts](server/lib/auth.ts) — enable once UTD OIT provides the clientId/secret/tenantId
