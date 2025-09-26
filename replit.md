# Prime Rate Home Loans - Landing Page

## Overview

This is a professional mortgage lending landing page for Prime Rate Home Loans, built with React and designed to convert visitors into loan applicants. The application features a clean, trustworthy design inspired by major financial institutions like Chase and Rocket Mortgage. The site focuses on lead generation through multiple contact forms including pre-approval applications, rate tracking requests, and general inquiries, all integrated with email notifications via SendGrid.

## Recent Changes

### Completed Second Home Card System Duplication (September 26, 2025)

Successfully implemented a complete Second Home card system that mirrors Primary Residence functionality with:

- **Identical State Management**: Created `secondHomeCards`, `secondHomeData`, and `deleteSecondHomeDialog` states paralleling Primary Residence system
- **Complete Card Duplication**: Full Second Home card structure with blue border styling, matching all Primary Residence fields and sections
- **Animation System Integration**: 360-degree rotation on checkbox selection and subject property roll-down animations using shared animation states
- **Consistent Button Functionality**: Add Property (blue hover), Remove (red hover), and Toggle (orange hover) buttons with identical behavior
- **Deletion Dialog System**: Complete confirmation dialog with proper state cleanup and form data management
- **Property Type Integration**: Updated checkbox system to prevent desynchronization and manage card lifecycle
- **Form Binding Integrity**: All form fields correctly bound to property array indices maintaining data consistency

The system now features identical Primary Residence and Second Home card systems with complete feature parity, comprehensive form state management, animated interactions, and consistent Add/Remove button functionality across all property types.

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