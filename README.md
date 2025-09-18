# GIGS – Event Staffing Marketplace

GIGS is an end-to-end staffing platform for live events. Employers post jobs, match with qualified workers in minutes, and finance teams can generate invoices and payouts without leaving the dashboard.

> **Tech stack** – Next.js App Router · TypeScript · Prisma · PostgreSQL · Tailwind · shadcn/ui · TanStack Query · PDFKit

## ✨ Capabilities

- **Real-time matching** powered by skills, rate bands, geography, and availability overlap.
- **Role-based workspaces** for workers, employers, and admins with dedicated flows.
- **Availability, bookings & payouts** – manage invitations, confirmations, invoices, and payout stubs.
- **Pre-seeded demo data** so you can explore the experience immediately.

## 🚀 Quick start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the example file and edit values as needed.

```bash
cp .env.example .env
```

The project expects a PostgreSQL database (local, Docker, or a managed service such as Neon/Supabase). Update `DATABASE_URL` with credentials for your instance.

### 3. Database & seed

```bash
pnpm db:push       # Create tables
pnpm db:seed       # Seed demo users, jobs, bookings, invoices
```

> The seed script creates realistic availability slots, bookings, invoices, and payout data so every UI page is populated out of the box.

### 4. Run the dev server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore the app. The landing page links to the worker, employer, and admin workspaces.

## 🧪 Smoke test guide

Use the seeded accounts below to walk through the three core flows.

| Role | Email | Notes |
|------|-------|-------|
| Worker | `alex.stage@gigs.test` | Stagehand with availability and invitations. |
| Employer | `maya@luminouslive.test` | Has multiple open jobs and suggested candidates. |
| Admin | `admin@gigs.test` | Use `/admin` routes – no login required in the demo. |

### Worker flow

1. Navigate to `/worker` – dashboard shows invitations, upcoming jobs, and earnings.
2. Visit `/worker/profile` to adjust skills, rates, radius, and home location.
3. Manage calendar slots in `/worker/availability` (uses the new DateTimeRangePicker, SkillMultiSelect, and RateInput components).
4. Respond to invitations from `/worker/matches` – accept/decline actions hit the booking API and auto-update job status.
5. Review booking history in `/worker/bookings` and confirm payouts.

### Employer flow

1. Visit `/employer` to see staffing KPIs and shortcuts.
2. Create a new job at `/employer/jobs/new` (JobForm combines AddressInput, DateTimeRangePicker, SkillMultiSelect, and RateInput).
3. Browse all jobs via `/employer/jobs` and drill into `/employer/jobs/[id]` to change job status or monitor invitations.
4. Discover recommended workers at `/employer/candidates/[jobId]` – invite directly from the CandidateSuggestions component.
5. Track confirmations in `/employer/bookings` and view staffing progress.

### Admin flow

1. Head to `/admin` for the KPI overview (worker/employer counts, fill rate, invoices, payouts).
2. Generate PDFs from `/admin/invoices` – the InvoiceGenerator component posts to the invoices API and stores the PDF in `public/invoices`.
3. Trigger payout stubs in `/admin/payouts` via the PayoutTrigger component (calls the payouts API and updates Prisma).

## 🧱 Project structure

```
app/
  worker/                # Worker dashboard & sub-pages
  employer/              # Employer dashboard & flows
  admin/                 # Admin KPIs, invoices, payouts
  api/                   # REST endpoints (jobs, bookings, invoices, payouts, etc.)
components/
  admin/                 # Admin widgets (invoice generator, payout trigger)
  employer/              # Employer-specific UI (job form, match suggestions)
  worker/                # Worker forms (profile, availability, invitations)
  ui/                    # shadcn/ui primitives
lib/
  constants.ts           # App constants & role enums
  matching.ts            # Ranking algorithm used on the server and API
  schemas.ts             # Zod schemas shared by the APIs and forms
  utils.ts               # Formatting helpers
prisma/
  schema.prisma          # Database schema
  seed.ts                # Demo data generator
```

## 📦 Core UI widgets

New reusable components live in `components/`:

- `RateInput` – synced slider/input for hourly rates with currency preview.
- `SkillMultiSelect` – popover + command palette multi-select with badges.
- `DateTimeRangePicker` – calendar + time selectors with guardrails on ranges.
- `AddressInput` – shared location widget (address, lat/lng inputs, optional geolocate hook).
- `AvailabilityGrid` – responsive cards showing worker availability slots.
- `ScoreBadge` – gradient badge for match scoring.

These power the worker profile editor, availability manager, employer job form, and candidate suggestions.

## 🛠️ Development scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start the Next.js dev server with hot reload. |
| `pnpm build` | Production build. |
| `pnpm lint` | ESLint using Next.js config. |
| `pnpm test` | Run Vitest (unit tests). |
| `pnpm db:push` | Apply Prisma schema to the database. |
| `pnpm db:seed` | Seed demo data (can be rerun safely). |

## 🔐 Environment variables

See [`.env.example`](./.env.example) for all configuration options. At minimum set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB"
NEXTAUTH_SECRET="change-me"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🤝 Contributing

1. Fork & clone the repo.
2. Create a feature branch.
3. Run `pnpm lint && pnpm test` before committing.
4. Submit a PR with screenshots/GIFs for UI changes.

## 🧭 Support

- Email: [support@gigs.com](mailto:support@gigs.com)
- Issues: GitHub Issues
- Feature requests: GitHub Discussions

Happy staffing! 🎉
