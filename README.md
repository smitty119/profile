## Salon Automation System — Prototype Model

This is a minimal Node + Prisma prototype modeling the core entities for a Salon Automation System.

### What’s included
- Prisma schema for users, staff, customers, services, appointments, invoices, payments, inventory
- SQLite database configuration
- TypeScript seed script with sample data

### Prerequisites
- Node.js 18+

### Setup
1. Install dependencies:
```
npm install
```

2. Generate Prisma Client and push schema:
```
npm run prisma:generate
npm run prisma:push
```

3. Seed sample data:
```
npx tsc
npm run db:seed
```

The SQLite database will be created at `dev.db` in the project root.

### Project structure
- `prisma/schema.prisma`: Prisma models and enums
- `generated/prisma`: Prisma Client output
- `src/seed.ts`: Seed script for demo data
- `.env`: Database URL (`DATABASE_URL="file:./dev.db"`)

### Next steps
- Add API/routes and UI to interact with the data
- Implement authentication and role-based authorization
- Add scheduling logic (conflict checks, reminders) and reporting views

