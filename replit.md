# Prime Rate Home Loans - Landing Page

## Overview
This project is a professional mortgage lending landing page for Prime Rate Home Loans, built with React, designed to convert visitors into loan applicants. It features a clean, trustworthy design inspired by major financial institutions and focuses on lead generation through multiple contact forms (pre-approval, rate tracking, general inquiries), all integrated with email notifications. The business vision is to streamline the mortgage application process and enhance lead management.

## User Preferences
Preferred communication style: Simple, everyday language.

### Admin Popup Dialog Spacing Pattern (Default Standard)
When creating popup dialogs in the admin interface, use this spacing approach to ensure visual consistency:

**Key Spacing Rules**:
1. **Section Separation (below fields)**: Use inline style `marginBottom: '32px'` on the last field div before a new section
2. **Separation Lines**: Use inline style `borderTop: '1px solid hsl(var(--border))', paddingTop: '24px'` on paragraph/text divs
3. **Spacing above separation lines**: Use `<div className="h-4"></div>` (16px) for compact spacing

**Technical Note**: Parent containers with `space-y-4` class override child margin Tailwind classes. Always use inline styles with explicit pixel values (e.g., `style={{ marginBottom: '32px' }}`) to ensure spacing renders correctly.

**Testing Pattern**: Use thick red borders (`borderBottom: '3px solid red'`) as temporary visual indicators when testing spacing, then remove once confirmed.

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

## Admin Loan Management System

### Overview
The admin interface (`/admin/add-client`) manages client loan applications with support for multiple loan categories (Conventional, FHA, VA, etc.), rate configurations, third-party services, and quote generation.

### Key Technical Patterns

#### FHA Upfront MIP Calculations
- **Design Pattern**: Purple title/fields for existing/prior FHA data; Green title/fields for new FHA estimates
- **Display Fields**: Use `disabled` attribute with `disabled:cursor-not-allowed disabled:opacity-100` classes
- **Calculation Logic**: 
  ```
  New FHA Upfront MIP Estimate = calculatedNewFhaMipCost - calculatedEstimatedMipRefund
  Stored in: calculatedAdjustedNewFhaMip (single string value with comma formatting)
  ```
- **Visual Indicators**: Settings icon displays in red when values empty, returns to default when populated

#### Rate Column Totals System
- **Architecture**: 5 rate columns with auto-calculated totals
- **Data Structure**: Most values are arrays (one per column), but some like `calculatedAdjustedNewFhaMip` are single values applied to all columns
- **Critical Fix**: Always strip commas before parseInt: `.replace(/[^\d]/g, '')` before `parseInt()` for accurate numeric conversion
- **Implementation**:
  ```javascript
  const total = values.reduce((sum, val) => {
    const num = parseInt((val || '0').replace(/[^\d]/g, ''), 10);
    return sum + num;
  }, 0);
  ```

#### Value Synchronization
- **Pay Off Interest**: Updates both `payOffInterestValues` and `thirdPartyServiceValues['s6']` for consistency
- **Escrow Reserves**: Syncs `calculatedTotalMonthlyEscrow` to `escrowReservesValues` for calculations

#### Labels & Naming
- **Preference**: "New FHA Upfront MIP" chosen for clarity over alternatives
- **Default Tab**: "client" (Borrower) is default, Quote tab design preserved

#### FHA/VA Conditional Row (New FHA Upfront MIP / VA Funding Fee)
- **Implementation**: Independent row that displays different content based on loan category
- **FHA Loans**: Shows "New FHA Upfront MIP" with settings icon and disabled inputs displaying calculated values
- **VA Loans**: Shows "VA Funding Fee" (no settings icon) with editable inputs connected to `thirdPartyServiceValues['s1']`
- **Data Flow**: 
  - VA Funding Fee values stored in `thirdPartyServiceValues['s1']` array (one value per rate column)
  - These values are included in auto-sum calculations at the bottom of the page
  - Service ID 's1' (VA Funding Fee) is always hidden from Third Party Services section to prevent duplication
- **Conditional Logic**: Uses direct check `selectedLoanCategory?.startsWith('VA - ')` or `selectedLoanCategory?.startsWith('VA Jumbo - ')` to determine display mode