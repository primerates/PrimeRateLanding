# Prime Rate Home Loans - Landing Page

## Overview
This project is a professional mortgage lending landing page for Prime Rate Home Loans, built with React, designed to convert visitors into loan applicants. It features a clean, trustworthy design inspired by major financial institutions and focuses on lead generation through multiple contact forms (pre-approval, rate tracking, general inquiries), all integrated with email notifications. The business vision is to streamline the mortgage application process and enhance lead management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Frameworks**: React 18 with TypeScript, Vite for build, Wouter for routing.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for form handling.
- **UI/UX Design**: Shadcn/ui (Radix UI based) and Tailwind CSS for styling.
- **Design Principles**: Trust-building with navy blue primary colors, Inter/Lora fonts, responsive design, and accessibility focus.
- **Form Management**: Comprehensive pre-approval application (with co-borrower support), rate tracking, and general contact forms. Features real-time validation and a zero-lag auto-sum/calculation pattern for numerical fields and a phone number auto-format pattern.

### Backend Architecture
- **Server**: Express.js with Node.js (ESM modules) for API routes and form submissions.
- **Email Integration**: SendGrid for notifications and lead management.
- **API**: RESTful design for form submissions.

### Database Layer
- **ORM**: Drizzle ORM configured for PostgreSQL.
- **Database**: PostgreSQL with type-safe schema.
- **Tools**: Drizzle Kit for migration support.

### Development Infrastructure
- **Tooling**: TypeScript configuration, Replit integration, PostCSS with Tailwind and Autoprefixer.
- **Workflow**: Hot module replacement for fast iteration.

## External Dependencies

### Email Service
- **SendGrid**: Transactional email service.

### Database
- **Neon Database**: Serverless PostgreSQL database.

### UI Components
- **Radix UI**: Headless component library.
- **Lucide Icons**: Icon library.
- **Google Fonts**: Inter and Lora fonts.

### Development Tools
- **Replit**: Development environment.
- **TypeScript**: Static type checking.

### Asset Management
- **Vite asset handling**: Optimized asset bundling.
- **Image assets**: Stored in `attached_assets` directory.