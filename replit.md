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
- **Comments & Posts Management**: Manages client testimonials and internal posts with real-time preview and sortable tables.
- **Loan Management System**: Manages client loan applications, supporting multiple loan categories, rate configurations, and quote generation.
- **PDF Document Extraction System (Quote Tile)**: Supports drag-and-drop PDF upload for various document types using AWS Textract for OCR and Anthropic Claude for AI-powered structured data extraction.
- **Library/Testing Sandbox**: Testing environment featuring a theme settings system with 3 preset themes (Professional Dashboard, Cyberpunk, Sunset Blaze), theme preview cards, real-time application of selected themes, light/dark mode toggle, and brightness controls.
    - **Draft Loan Status Tile**: Dedicated sandbox area for developing and testing updated loan status codes and features. Distinguished by orange accent border and "SANDBOX" badge.
- **Snapshot Analytics Dashboard**: Comprehensive dashboard for financial analytics, marketing campaign management, expense/revenue tracking, and data visualization.
    - **Key Features**: Interactive filters, real-time financial metrics, conditional card displays, customizable search cards with dynamic column systems for results tables, and transaction attachments system.
    - **Search Card System**: Provides category-specific search cards for Expenses and Revenue, with date filters and dynamic transaction tables that filter results based on search parameters.
    - **Vendor Management**: Includes dedicated cards for adding and searching vendors, with comprehensive search fields, dynamic results tables, and sortable columns.
    - **Workflow Automation**: Implements auto-minimizing and mutual exclusivity logic for various cards and forms to optimize user workflow.

## External Dependencies

- **Email Service**: SendGrid for transactional emails.
- **Database**: Neon Database (serverless PostgreSQL).
- **UI Components**: Radix UI, Lucide Icons.
- **Fonts**: Google Fonts (Inter, Lora).
- **OCR**: AWS Textract.
- **AI**: Anthropic Claude (`claude-sonnet-4-20250514`).