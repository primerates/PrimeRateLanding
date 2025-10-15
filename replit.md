# Prime Rate Home Loans - Landing Page

## Overview
This project is a professional React-based mortgage lending landing page for Prime Rate Home Loans, designed for lead generation. It features various contact forms (pre-approval, rate tracking, general inquiries) integrated with email notifications to streamline the mortgage application process. The business vision is to enhance lead management through a clean, trustworthy design inspired by major financial institutions.

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

### Data Table Sticky Column Pattern (Default Standard)
For all Excel/CSV data upload features, use sticky columns for key identifier columns:

**Implementation Pattern**:
1. **Column Selection**: First Name column is sticky/frozen
2. **CSS Classes**:
   - `sticky-col-firstName` with left: 0
3. **Styling Requirements**:
   - position: sticky with appropriate left offset
   - z-index: 20 for proper layering (30 for headers)
   - box-shadow for visual separation
   - Background colors must match alternating row pattern
4. **Header Styling**: Add `sticky-header` class to sticky column headers
5. **Column-Based Approach**: Check `column === 'firstName'` to apply sticky class

**Benefits**: Maintains context when scrolling horizontally through wide datasets, improving data review efficiency.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **Routing**: Wouter.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for form validation.
- **UI/UX**: Shadcn/ui (Radix UI based) and Tailwind CSS, featuring a trust-building design with navy blue primary colors, Inter/Lora fonts, responsive design, and accessibility focus.
- **Form Management**: Pre-approval (with co-borrower), rate tracking, and general contact forms with real-time validation and auto-formatting.

### Backend
- **Server**: Express.js with Node.js (ESM modules).
- **API**: RESTful design for form submissions.

### Database
- **ORM**: Drizzle ORM.
- **Database**: PostgreSQL with type-safe schema.
- **Tools**: Drizzle Kit for migrations.

### Admin Features
- **Comments & Posts Management**: Manages client testimonials and internal posts with real-time preview, statistics, and sortable tables.
- **Loan Management System**: Manages client loan applications, supporting multiple loan categories, rate configurations, and quote generation.
- **PDF Document Extraction System (Quote Tile)**: Supports drag-and-drop PDF upload for various document types (Paystub, Bank Statement, Tax Return, Mortgage Statement, Credit Report) using AWS Textract for OCR and Anthropic Claude for AI-powered structured data extraction.
- **Snapshot Analytics Dashboard**: Comprehensive dashboard for financial analytics, marketing campaign management, expense/revenue tracking, and data visualization.
    - **Key Features**: Interactive filters, real-time financial metrics, conditional card displays, customizable search cards with dynamic column systems for results tables.
    - **Design**: Purple-to-pink gradient scrollbars, themed icons, consistent dropdown styling across all admin features.
    - **Functionality**: Transaction Attachments System for expenses/revenue, PDF attachment system for staff and batches.
    - **Search Card System**:
      - **Manual Access**: Magnifying glass icon in Performance card opens category-specific search cards
      - **Expense Search Card** (Financials/Expense): Search icon, 12 fields across 3 rows - Date, Amount, Payee, Payment For, Invoice #, Check #, Payment Method, Payment Term, Vendor, Services, Area, Role
      - **Revenue Search Card** (Financials/Revenue): DollarSign icon, 8 fields across 2 rows - Payment Date, Source, Amount, Reference #, Payment Method, Purpose, Term, Status
      - **Auto-Hide Logic**: Cards mutually exclusive - switching between Expense/Revenue auto-hides the other; both hide when Team ≠ Expense/Revenue
      - **Button Standardization**: Clear Filters (left) and Search buttons match at px-3.5 py-1.5 text-sm height

### Background Selector System
Allows customization of dashboard and login page backgrounds with various presets, supporting mode toggling, visual previews, and persistence.

## External Dependencies

- **Email Service**: SendGrid for transactional emails.
- **Database**: Neon Database (serverless PostgreSQL).
- **UI Components**: Radix UI, Lucide Icons.
- **Fonts**: Google Fonts (Inter, Lora).
- **OCR**: AWS Textract.
- **AI**: Anthropic Claude (`claude-sonnet-4-20250514`).