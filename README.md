# GIGS - On-Demand Event Staffing Marketplace

An Uber-like marketplace connecting event organizers with qualified staff for seamless event experiences.

## 🎯 Project Overview

GIGS is a comprehensive event staffing marketplace that connects event organizers (employers) with qualified event staff (workers). The platform facilitates job postings, worker applications, secure payments, and comprehensive event management.

### Key Features
- **Real-time Job Matching**: Intelligent matching based on skills, location, and availability
- **Secure Payment Processing**: Automated invoicing and payout management
- **Rating & Review System**: Build trust through community feedback
- **Mobile-Responsive Design**: Works seamlessly on all devices
- **Location-Based Search**: Find staff within specified radius
- **Real-time Notifications**: Stay updated on job status and applications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm installed
- PostgreSQL database (local or cloud)
- Git for version control

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up your environment:**
   ```bash
   # Copy the environment template
   cp .env.example .env
   
   # Edit .env with your database URL and other configurations
   # Make sure to set up a PostgreSQL database first
   ```

3. **Initialize the database:**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Run database migrations
   pnpm db:migrate
   
   # Seed with demo data (optional)
   pnpm prisma db seed
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the running application.

## 🛠️ Tech Stack

### Core Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | Full-stack React framework | 15.x |
| **TypeScript** | Type-safe JavaScript | 5.x |
| **Prisma** | Database ORM and migrations | 5.x |
| **PostgreSQL** | Primary database | 14+ |
| **Tailwind CSS** | Utility-first styling | 3.x |
| **shadcn/ui** | Component library | Latest |

### Development Tools
| Tool | Purpose |
|------|---------|
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **TypeScript** | Static type checking |

## 📁 Project Structure

```
/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and Tailwind CSS
│   ├── layout.tsx         # Root layout with metadata and providers
│   └── page.tsx           # Landing page component
├── components/             # Reusable UI components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities and configurations
│   ├── database.ts       # Prisma client configuration
│   ├── constants.ts       # App-wide constants
│   ├── types.ts          # TypeScript definitions
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema definition
│   └── seed.ts           # Database seeding script
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

#### Database Schema Overview
The database consists of the following main entities:
- **Users**: Base user accounts with role-based access (Worker, Employer, Admin)
- **WorkerProfile**: Extended profile for event staff with skills and availability
- **EmployerProfile**: Extended profile for event organizers with company details
- **JobPosting**: Event job listings with requirements and compensation
- **Booking**: Worker-job assignments with status tracking
- **Invoice/Payout**: Financial transaction records

#### Setting up the Database
```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Apply database migrations
pnpm db:migrate

# Seed with sample data for development
pnpm prisma db seed

# Open Prisma Studio for database exploration
pnpm db:studio
```

### Production (PostgreSQL)
Use a managed PostgreSQL instance (Neon, Supabase, RDS, etc.) and update the `DATABASE_URL` accordingly before running migrations and seeding production data.

## 🔧 Available Scripts

### Development Commands
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint for code quality |
| `pnpm type-check` | Run TypeScript compiler checks |

### Database Commands
| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate Prisma client after schema changes |
| `pnpm db:push` | Push schema changes to database (dev only) |
| `pnpm db:migrate` | Create and run database migrations |
| `pnpm db:studio` | Open Prisma Studio for database exploration |
| `pnpm db:seed` | Populate database with sample data |

## 🚧 Development Status

### ✅ Completed Features
- [x] **Project Foundation**
  - [x] Next.js 15 setup with TypeScript
  - [x] Prisma ORM with PostgreSQL schema
  - [x] Tailwind CSS + shadcn/ui component library
  - [x] ESLint and Prettier configuration
- [x] **Core Infrastructure**
  - [x] Database models and relationships
  - [x] Type-safe validation schemas
  - [x] Error boundary implementation
  - [x] Loading states and UI feedback
- [x] **Landing Page**
  - [x] Responsive hero section
  - [x] Feature showcase
  - [x] How-it-works section
  - [x] Call-to-action components
- [x] **Developer Experience**
  - [x] Comprehensive code documentation
  - [x] Utility functions and helpers
  - [x] Type definitions and interfaces

### 🔄 In Progress (Current Sprint)
- [ ] **Authentication System**
  - [ ] NextAuth.js setup and configuration
  - [ ] User registration and login flows
  - [ ] Role-based access control
  - [ ] Profile management
- [ ] **Job Management**
  - [ ] Job posting creation and editing
  - [ ] Job listing and search functionality
  - [ ] Application and booking system
- [ ] **Core Features**
  - [ ] Worker profile setup and management
  - [ ] Employer dashboard
  - [ ] Basic matching algorithm

### 🔮 Upcoming Features
- [ ] **Advanced Features**
  - [ ] Real-time notifications
  - [ ] Payment processing (Stripe integration)
  - [ ] Rating and review system
  - [ ] Advanced search and filtering
- [ ] **Platform Enhancement**
  - [ ] Mobile app compatibility
  - [ ] API rate limiting and security
  - [ ] Analytics dashboard
  - [ ] Email notification system
- [ ] **Scale & Performance**
  - [ ] Caching strategies
  - [ ] Database optimization
  - [ ] CDN integration
  - [ ] Performance monitoring

## 🧪 Testing Strategy

```bash
# Unit tests (when implemented)
pnpm test

# Integration tests (when implemented)
pnpm test:integration

# E2E tests (when implemented)
pnpm test:e2e

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 🔒 Security Considerations

- **Authentication**: Secure user authentication with NextAuth.js
- **Authorization**: Role-based access control (RBAC)
- **Data Validation**: Server-side validation with Zod schemas
- **SQL Injection**: Protected by Prisma ORM parameterized queries
- **CSRF Protection**: Built-in Next.js CSRF protection
- **Environment Variables**: Sensitive data stored in environment variables
- **Input Sanitization**: All user inputs validated and sanitized

## 🚀 Deployment Guide

### Prerequisites
- PostgreSQL database (Neon, Supabase, or similar)
- Vercel account (recommended) or other Next.js hosting provider

### Environment Setup
```bash
# Production environment variables
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secure-nextauth-secret"
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### Database Migration
```bash
# Run migrations on production database
pnpm db:migrate

# Generate Prisma client for production
pnpm db:generate
```

## 🤝 Contributing

We welcome contributions to improve the GIGS platform. Please follow these guidelines:

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper documentation
4. Run tests and linting (`pnpm lint && pnpm type-check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Write comprehensive JSDoc documentation
- Use meaningful variable and function names
- Implement proper error handling
- Add unit tests for new features
- Follow the existing code structure and patterns

### Pull Request Guidelines
- Provide clear description of changes
- Include screenshots for UI changes
- Reference related issues
- Ensure all checks pass
- Request review from maintainers

## ⚠️ Known Limitations

### Current MVP Limitations
1. **Authentication**: Basic authentication system (NextAuth.js implementation in progress)
2. **Real-time Features**: No WebSocket/real-time notifications yet
3. **Payment Processing**: Stripe integration planned but not implemented
4. **Mobile App**: Web-only (mobile app planned for future)
5. **Advanced Analytics**: Basic dashboard only
6. **File Uploads**: Limited file upload capabilities
7. **Internationalization**: English-only interface

### Technical Debt
- Legacy type definitions need cleanup
- Some components need accessibility improvements
- Test coverage needs improvement
- API rate limiting not implemented
- Caching strategies not optimized

## 📊 Performance Considerations

### Optimization Strategies
- **Next.js Image Optimization**: Automatic image optimization
- **Static Generation**: Pre-rendered pages where possible
- **Code Splitting**: Automatic code splitting by Next.js
- **Database Indexing**: Optimized database indexes for common queries
- **Bundle Analysis**: Regular bundle size monitoring

### Monitoring
```bash
# Analyze bundle size
pnpm build && pnpm analyze

# Check performance
lighthouse http://localhost:3000
```

## 📞 Support & Contact

- **Email**: support@gigs.com
- **Documentation**: [Link to docs when available]
- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Discussions

## 🔄 Version History

### v1.0.0-mvp (Current)
- Initial MVP release
- Core marketplace functionality
- Database schema and seeding
- Landing page and basic UI
- TypeScript implementation
- Comprehensive documentation

### Upcoming Releases
- **v1.1.0**: Authentication system
- **v1.2.0**: Job management features
- **v1.3.0**: Payment processing
- **v2.0.0**: Real-time features and mobile app

## 📄 License
