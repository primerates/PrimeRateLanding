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

### Data Table Sticky Column Pattern (Default Standard)
For all Excel/CSV data upload features, use sticky columns for the first two columns:

**Implementation Pattern**:
1. **Column Selection**: First two columns (index 0 and 1) are always sticky/frozen
2. **CSS Classes**:
   - Column 0: `sticky-col-lastName` (left: 0)
   - Column 1: `sticky-col-firstName` (left: 150px)
3. **Styling Requirements**:
   - position: sticky with appropriate left offset
   - z-index: 20 for proper layering
   - box-shadow for visual separation
   - Background colors must match alternating row pattern
4. **Header Styling**: Add `sticky-header` class to sticky column headers
5. **Index-Based Approach**: Use `colIdx` instead of column names to ensure compatibility with varying CSV headers

**Benefits**: Maintains context when scrolling horizontally through wide datasets, improving data review efficiency.

## System Architecture

### Frontend Architecture
- **Frameworks**: React 18 with TypeScript, Vite for build, Wouter for routing.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for form handling.
- **UI/UX Design**: Shadcn/ui (Radix UI based) and Tailwind CSS for styling. Trust-building design with navy blue primary colors, Inter/Lora fonts, responsive design, and accessibility focus.
- **Form Management**: Pre-approval application (with co-borrower), rate tracking, and general contact forms. Features real-time validation, zero-lag auto-sum/calculation, and phone number auto-formatting.

### Backend Architecture
- **Server**: Express.js with Node.js (ESM modules) for API routes and form submissions.
- **Email Integration**: SendGrid for notifications and lead management.
- **API**: RESTful design for form submissions.

### Database Layer
- **ORM**: Drizzle ORM configured for PostgreSQL.
- **Database**: PostgreSQL with type-safe schema.
- **Tools**: Drizzle Kit for migration support.

### Admin Features
- **Comments & Posts Management**: System for client testimonials and internal company posts with 5-tab navigation, real-time preview, statistics, localStorage persistence, sortable tables, and sticky notes functionality.
- **Marketing Direct Mail System**: Campaign management with CSV upload, batch tracking, lead journey monitoring, state selection, and auto-calculated costs. Features sticky columns for data tables, state selector dialog, and detailed batch creation forms with 5-row layout.
- **Loan Management System**: Manages client loan applications with support for multiple loan categories, rate configurations, third-party services, and quote generation. Includes specific patterns for FHA Upfront MIP calculations, rate column totals, and value synchronization.

## Admin Marketing - Direct Mail System

### Batch Creation
- **5-Row Layout**: Campaign parameters, date tracking, vendor fields, cost tracking, and CSV upload
  - **Row 1**: Batch Number, Batch Title, 10 Year Bond, Par Rate
  - **Row 2**: Loan Category, Data Speed, Delivery, Duration to First Call (text field)
  - **Row 3**: Data Date, Print Date, Mail Date, First Call (all date fields with MM/DD/YYYY format)
  - **Separation line below Row 3**
  - **Row 4**: Data Vendor, Print Vendor (swapped positions), Mail Vendor, Supply Vendor
  - **Row 5**: Data Cost, Mail Cost, Print Cost, Supply Cost (currency formatted with CurrencyInput component)
  - **Separation line below Row 5**
  - **CSV Upload**: UTF8 file upload with green labels below the 5 rows
- **States Selector**: Green "States" button in card header opens dialog to select multiple states; displays count in button when states selected
- **Date Fields**: Auto-format as MM/DD/YYYY; "First Call" renamed from "Mail Date" for clarity
- **Column Mapping**: Required fields include Reference Number, First Name, Last Name, Street Address, City, State, Zip Code; auto-detection with manual override; Last Name and First Name stored as separate columns in batch data

### Batch List Table
- **Column Headers** (left to right): Created, Batch #, Batch Title, Category, Data, Delivery, 10 Yr Bond, Par Rate, Records, **States**, Cost, Actions
- **States Column**: Displays state count (e.g., "3 States") or "-" if none selected
- **Cost Column**: Auto-calculates total from Data Cost + Mail Cost + Print Cost + Supply Cost
- **Sortable Columns**: Created, Batch #, Batch Title with arrow indicators

### Batch Details Card
- **Toggle Behavior**: Clicking batch title or batch number toggles the batch details card open/close
- **Card Header**: 
  - Batch title with edit button (green pen icon)
  - States button (green) showing state count
  - Edit/save/cancel buttons for batch details editing
  - Eye icon to show/hide collapsible batch details section
- **Batch Details Edit**: Green pen icon activates edit mode for all batch fields; green checkmark saves changes; red X cancels
- **5-Row Layout** (matches Create Batch form):
  - **Row 1**: Batch #, Batch Title, 10 Year Bond, Par Rate (all editable)
  - **Row 2**: Loan Category, Data Speed, Delivery, Duration to First Call (all editable)
  - **Row 3**: Data Date, Print Date, Mail Date, First Call (all editable, MM/DD/YYYY format)
  - **Separation line below Row 3**
  - **Row 4**: Data Vendor, Print Vendor, Mail Vendor, Supply Vendor (all editable)
  - **Row 5**: Data Cost, Mail Cost, Print Cost, Supply Cost (all editable, currency formatted)

### Batch Details Table
- **Column Order**: Reference Number, Last Name, First Name, and all other CSV columns displayed in table
- **Reference Column**: Displays as "Reference Number" (duplicate reference columns filtered out)
- **State Selection Validation**: Users must select at least one state before uploading CSV files

## External Dependencies

### Email Service
- **SendGrid**: Transactional email service.

### Database
- **Neon Database**: Serverless PostgreSQL database.

### UI Components
- **Radix UI**: Headless component library.
- **Lucide Icons**: Icon library.
- **Google Fonts**: Inter and Lora fonts.