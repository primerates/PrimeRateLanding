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
- **PDF Document Extraction System (Quote Tile)**:
    - **Route**: `/admin/quotes`
    - **Features**: Drag-and-drop PDF upload (max 10MB) for various document types (Paystub, Bank Statement, Tax Return, Mortgage Statement, Credit Report). Uses AWS Textract for multi-page OCR and Anthropic Claude (`claude-sonnet-4-20250514`) for AI-powered structured data extraction (Borrower info, Income data, Loan details, Bank statements, Tax returns, Credit reports). Data is displayed in a custom grid.
    - **Technology Stack**: `pdf-parse`, AWS Textract, Anthropic Claude, in-memory storage, React with TanStack Query.
- **Snapshot Analytics Dashboard**:
    - **Route**: `/admin/reports`
    - **Overview**: Comprehensive dashboard for financial analytics, marketing campaign management (Direct Mail, Lead Vendors, Social Media), expense/revenue tracking, and data visualization. Features interactive filters (Category, Team, Time), real-time financial metrics, and conditional card displays.
    - **Core Features**: Performance Card with interactive title, filter dropdowns, header buttons, Search Cards (Direct Mail, Staff Page) with minimizable functionality. Both Search cards use matching purple magnify glass icons (`Search` component with `bg-purple-500/20 border-purple-500/30` styling).
    - **Staff Search Card Fields**: 
      - Row 1: Area, Role (formerly Magnify), Rating, Performance
      - Row 2: Status (formerly Bonus - now dropdown with options: Select, Active, Paused, Not Active), Duration (formerly With Company), Category (formerly Compensation), Earnings
      - Row 3: License Count, Loan Volume, Funding Volume, Clear Filters
    - **Staff Search Results Table**:
      - Dynamic Column System: Table columns automatically sync with Search Card field labels and only display columns with active search criteria
      - Column Visibility: Last Name and First Name always shown; other columns (Area, Role, Rating, Performance, Status, Duration, Category, Earnings, License Count, Loan Volume, Funding Volume) appear only when corresponding search field has a value (dropdowns: non-empty selection; inputs: any value)
      - Column Title Sync: If Search Card field labels change, table column headers automatically update to match
      - Attachment Management: Paperclip column shows document count for each staff entry, clickable to manage attachments
      - Actions Menu: 3-dot menu (MoreVertical) in "Actions" column provides options to attach documents, edit, or delete staff entries
      - Header Controls: Minimize button (Plus/Minus icon) to collapse/expand table content, X close button to hide results table
      - Custom Interactive Scrollbar: Purple/pink gradient indicator with click-to-jump and drag-to-scroll functionality
      - Features: Draggable scrollbar indicator, click track to jump to position, auto-sizing based on content width
      - Cursor states: grab/grabbing for better UX
    - **Staff Form Card**:
      - PDF Attachment System: Paperclip icon next to minimize button for managing staff documents
      - Displays document count (clickable to open attachment dialog)
      - Supports PDF, JPG, PNG uploads, camera capture (max 5MB)
      - Same attachment functionality as Expense/Revenue logs
      - Documents linked to temporary staff ID before form submission
      - **Compliance Card Fields**: Background Check, Credit Review, Identification, Work Authorization, Drug Screening, Employment Agreement, Policy, NDA Agreement, Source (formerly Interview Grade - dropdown with options: Select, Referral, Return, Recruiter, Indeed)
    - **Visualizations**: Pie charts for Revenue Sources and Expense Breakdown with drill-down capabilities.
    - **Expense & Revenue Logging**: Add entry functionality with transaction tracking, date filtering, sortable tables, and an advanced Transaction Attachments System supporting PDF, JPG, PNG uploads, camera capture, and temporary ID management for attachments.
    - **Marketing Campaign Management**: Direct Mail Batch Creation with 17 required fields, US states selection, completion bar, CSV upload with fuzzy mapping, and batch management actions.
    - **Search Card (Marketing)**: Features a "Search Batch" button matching Staff page's "Search Staff" button styling (`px-3.5 py-1.5 text-sm rounded-lg` with purple-to-pink gradient). Data Category defaults to "Select". Data Category selections (Show All, Trigger Data, Monthly Data) only take effect when user clicks "Search Batch" button, which opens the Batch List table.
    - **Batch List Table**:
      - Themed Icon: FileText icon in purple box matching Search card design
      - Header Controls: Minimize button (Plus/Minus icon) to collapse/expand table, X close button to hide batch list
      - Attachment System: Paperclip column showing document count for each batch, clickable to manage batch attachments
      - Supports PDF, JPG, PNG uploads and camera capture (max 5MB) per batch
      - Sortable columns with visual indicators
    - **Dropdown Styling Standard**: All dropdowns use native HTML `<select>` elements with consistent styling: `w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors`. Native `<option>` elements display browser default blue hover effect on grey background with white text. This styling pattern matches across Direct Mail search fields (including Batch Financials: Select, Profitable, Loss) and Staff Role card dropdowns (Payroll Type, Level, Role, Authorization, Access).
    - **Technology Stack**: Recharts for data visualization, Papa Parse for CSV processing.

### Background Selector System
Allows customization of dashboard and login page backgrounds with various presets, supporting mode toggling, visual previews, and persistence.

## External Dependencies

- **Email Service**: SendGrid for transactional emails.
- **Database**: Neon Database (serverless PostgreSQL).
- **UI Components**: Radix UI, Lucide Icons.
- **Fonts**: Google Fonts (Inter, Lora).
- **OCR**: AWS Textract.
- **AI**: Anthropic Claude (`claude-sonnet-4-20250514`).
```