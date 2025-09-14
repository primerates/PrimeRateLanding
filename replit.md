# Prime Rate Home Loans - Landing Page

## Overview

This is a professional mortgage lending landing page for Prime Rate Home Loans, built with React and designed to convert visitors into loan applicants. The application features a clean, trustworthy design inspired by major financial institutions like Chase and Rocket Mortgage. The site focuses on lead generation through multiple contact forms including pre-approval applications, rate tracking requests, and general inquiries, all integrated with email notifications via SendGrid.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern development
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing (single-page application)
- **TanStack Query** for server state management and API calls
- **React Hook Form** with Zod validation for form handling and validation

### UI/UX Design System
- **Shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom color palette
- **Design guidelines** focused on trust-building with navy blue primary colors, clean typography (Inter/Lora fonts), and professional layout
- **Responsive design** optimized for both desktop and mobile experiences
- **Accessibility** features through Radix UI components

### Backend Architecture
- **Express.js** server handling API routes and form submissions
- **Node.js** runtime with ESM module support
- **Email integration** via SendGrid for form notifications and lead management
- **RESTful API** design for form submissions (pre-approval, rate tracker, contact forms)

### Database Layer
- **Drizzle ORM** configured for PostgreSQL with type-safe schema definitions
- **Database schema** includes basic user management structure
- **Migration support** through Drizzle Kit for schema versioning

### Form Management System
- **Pre-approval application** with comprehensive borrower information collection
- **Co-borrower support** for joint applications
- **Rate tracking** requests for market updates
- **Contact forms** for general inquiries
- **Real-time validation** and user feedback

### Development Infrastructure
- **TypeScript** configuration with path aliases for clean imports
- **Replit integration** with development banner and error overlay
- **PostCSS** with Tailwind and Autoprefixer for CSS processing
- **Hot module replacement** in development for fast iteration

## External Dependencies

### Email Service
- **SendGrid** - Transactional email service for form submission notifications and lead management

### Database
- **Neon Database** (PostgreSQL) - Serverless PostgreSQL database for user data and application state

### UI Components
- **Radix UI** - Headless component library for accessible UI primitives
- **Lucide Icons** - Icon library for consistent iconography
- **Google Fonts** - Inter and Lora fonts for professional typography

### Development Tools
- **Replit** - Development environment with integrated tooling
- **TypeScript** - Static type checking and enhanced developer experience
- **ESLint/Prettier** - Code quality and formatting tools (implied from modern React setup)

### Asset Management
- **Vite asset handling** - Optimized asset bundling and loading
- **Image assets** - Hero images and visual content stored in attached_assets directory