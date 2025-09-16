# GIGS - On-Demand Event Staffing Marketplace

An Uber-like marketplace connecting event organizers with qualified staff for seamless event experiences.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Set up the database:**
   ```bash
   pnpm db:migrate
   pnpm prisma db seed
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** Prisma ORM with PostgreSQL
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** React Hook Form + Zod validation
- **State Management:** Zustand
- **Data Fetching:** TanStack Query v5
- **Authentication:** NextAuth.js
- **PDF Generation:** @react-pdf/renderer
- **Email:** Nodemailer

## 📁 Project Structure

```
/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities and configurations
│   ├── constants.ts       # App-wide constants
│   ├── types.ts          # TypeScript definitions
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
│   └── invoices/        # Generated invoice PDFs
└── tests/               # Test files
```

## 🗄️ Database

### Development (PostgreSQL)
The Prisma data model uses PostgreSQL-specific features (array columns for skills, roles, and availability). Configure a local PostgreSQL database and set the `DATABASE_URL` in your `.env` file, for example:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/gigs_db"
```

After updating the environment variables, run migrations and seed data:

```bash
pnpm db:migrate
pnpm prisma db seed
```

### Production (PostgreSQL)
Use a managed PostgreSQL instance (Neon, Supabase, RDS, etc.) and update the `DATABASE_URL` accordingly before running migrations and seeding production data.

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript checks
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database with sample data
- `pnpm prisma db seed` - Run Prisma's seeding command (invokes the script above)

## 🚧 Current Status (MVP Phase)

This is the initial MVP setup. The following features are **in progress**:

### ✅ Completed
- [x] Project setup and configuration
- [x] Landing page with feature overview
- [x] Database schema foundation
- [x] TypeScript types and validations
- [x] UI component library (shadcn/ui)

### 🔄 Next Phase (Week 1)
- [ ] Database models and relationships
- [ ] User authentication system
- [ ] Event creation and management
- [ ] Staff application system
- [ ] Basic matching algorithm
- [ ] Payment integration foundation

### 🔮 Future Phases
- [ ] Real-time notifications
- [ ] Advanced matching algorithms
- [ ] Mobile responsiveness
- [ ] API rate limiting
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

## 🤝 Contributing

This is an MVP development project. For contribution guidelines and development practices, please refer to the team documentation.

## ⚠️ Known Limitations (MVP)

1. **Demo Data Only:** Currently uses mock data for demonstration
2. **PostgreSQL Required:** Ensure access to a PostgreSQL instance for local and production environments
3. **Basic Authentication:** Advanced OAuth providers not yet implemented
4. **Limited Payment Processing:** Stripe integration in development
5. **No Real-time Features:** WebSocket implementation planned for next phase

## 📄 License

This project is proprietary software developed for the GIGS marketplace platform.