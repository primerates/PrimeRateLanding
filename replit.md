# Prime Rate Home Loans - Landing Page

## Overview
This project is a professional mortgage lending landing page for Prime Rate Home Loans, built with React. Its primary purpose is lead generation, converting visitors into loan applicants through various contact forms (pre-approval, rate tracking, general inquiries) integrated with email notifications. The business vision is to streamline the mortgage application process and enhance lead management through a clean, trustworthy design inspired by major financial institutions.

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
- **UI/UX**: Shadcn/ui (Radix UI based) and Tailwind CSS. Features a trust-building design with navy blue primary colors, Inter/Lora fonts, responsive design, and accessibility focus.
- **Form Management**: Pre-approval (with co-borrower), rate tracking, and general contact forms with real-time validation, auto-sum/calculation, and phone number auto-formatting.

### Backend
- **Server**: Express.js with Node.js (ESM modules).
- **API**: RESTful design for form submissions.

### Database
- **ORM**: Drizzle ORM.
- **Database**: PostgreSQL with type-safe schema.
- **Tools**: Drizzle Kit for migrations.

### Admin Features
- **Comments & Posts Management**: Manages client testimonials and internal company posts with real-time preview, statistics, sortable tables, and sticky notes. Features dynamic display of content sections based on user interaction.
- **Loan Management System**: Manages client loan applications, supporting multiple loan categories, rate configurations, third-party services, and quote generation.
- **Snapshot Analytics Dashboard**: Comprehensive dashboard combining financial analytics, marketing campaign management (Direct Mail, Lead Vendors, Social Media), expense/revenue tracking, and data visualization. All marketing features are now integrated within the Dashboard.

### PDF Document Extraction System (Quote Tile)

**Route**: `/admin/quotes`

**Features**:
- **PDF Upload**: Drag-and-drop or browse to upload mortgage documents (max 10MB)
- **Document Types**: Paystub, Bank Statement, Tax Return, Mortgage Statement, Credit Report, Other
- **Multi-Page OCR**: AWS Textract processes all pages of complex documents (credit reports, tax returns)
- **AI-Powered Extraction**: Uses Claude (Anthropic) claude-sonnet-4-20250514 to extract structured data
- **Structured Data Display**: Custom grid layout with color-coded icons showing:
  - Borrower info (name, address)
  - Income data (employer, gross/net pay, YTD gross)
  - Loan details (lender, loan number, property address, balance, payment, interest rate)
  - Bank statements (bank name, ending balance, statement date)
  - Tax returns (AGI, total income, filing status)
  - Credit reports (scores, accounts, collections, inquiries, public records)

**API Endpoints**:
- `POST /api/pdf/upload` - Upload and extract PDF data
- `GET /api/pdf/documents` - List all documents (optional clientId filter)
- `GET /api/pdf/documents/:id` - Get single document
- `DELETE /api/pdf/documents/:id` - Delete document

**Technology Stack**:
- Backend: pdf-parse (v2.2.9) with PDFParse class API for text-based PDFs
- OCR: AWS Textract for multi-page document processing (processes all pages, not just first)
- AI: Anthropic Claude (claude-sonnet-4-20250514) for intelligent structured data extraction
- Storage: In-memory storage with typed schema
- Frontend: React with drag-drop upload, TanStack Query for API calls

**How It Works**:
1. User uploads PDF (mortgage docs, credit reports, paystubs, etc.)
2. AWS Textract processes ALL pages of the PDF (using pdf-lib to split multi-page PDFs)
3. Each page is extracted separately and combined into complete text
4. Extracted text sent to Claude AI for intelligent structuring into JSON format
5. All extracted fields displayed dynamically in UI
6. Supports complex multi-page documents like 25-page credit reports (48K+ characters)

**Required Environment Variables**:
- `ANTHROPIC_API_KEY` - Anthropic Claude API key for AI extraction
- `AWS_ACCESS_KEY_ID` - AWS access key for Textract
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for Textract
- `AWS_REGION` - AWS region (defaults to us-east-1)

### Admin Navigation

#### Dashboard Tiles
- **Row 1**: Lead, Quote, Loan Prep, Loan, Funded (green left border on hover)
- **Row 2**: Closed, Dashboard (blue left border on hover)
- **Row 3**: Library, Settings (purple left border on hover)

### Snapshot Analytics Dashboard
**Route**: `/admin/reports`

**Overview**: Comprehensive command center combining financial analytics, marketing campaign management, expense/revenue tracking, and data visualization. All marketing features are fully integrated within the Dashboard.

**Core Features**:
- **Real-time Financial Metrics**: Displays Gross Income, Revenue, and Expense with trend indicators
- **Interactive Filters**: 
  - Entity filter (Prime Rate, Branch, Partners) - defaults to Prime Rate
  - Category filter (Financials, Direct Mail, Lead Vendor, Social Media, Staff, Vendor)
  - Time period filter with dropdown (Today with auto date display, MTD, YTD, From Date, To Date, Compare)
- **Revenue Sources Visualization**: Pie chart with detailed breakdown by source (Direct Mail, Lead Vendors, Social Media, Repeat Clients, Referrals)
- **Expense Breakdown**: Pie chart categorizing expenses (Marketing, Staff, Vendors, Services, Supplies)
- **Drill-down Capabilities**: Click on "Direct Mail" to view state-by-state breakdown and loan program distribution
- **Visual Design**: Dark gradient theme (slate-900 to purple-900) with glassmorphism cards and animated elements
- **Expense & Revenue Logging**: Add entry functionality with transaction tracking, date filtering, sortable tables, action menus (edit/delete)
**Transaction Attachments System**: Upload and manage receipts/invoices for expense and revenue transactions
  - File upload support: PDF, JPG, PNG (max 5MB)
  - Drag-and-drop or browse file selection
  - **Visual Indicators**: Paperclip icon column in transaction tables showing:
    - Clickable paperclip icon when attachments exist
    - "PDF" label for PDF attachments
    - Count badge for multiple attachments
    - Direct access to Manage Attachments dialog
  - Attachment count badges on action menu buttons
  - Download and delete functionality
  - Secure storage with base64 encoding
  - API Endpoints:
    - `POST /api/transactions/:id/attachments` - Upload attachment
    - `GET /api/transactions/:id/attachments` - List attachments
    - `DELETE /api/transactions/:id/attachments/:attachmentId` - Delete attachment

**Marketing Campaign Management** (integrated within Dashboard):
- **Direct Mail Batch Creation**:
  - **17 Required Fields**: Batch Number, Batch Title, 10 Yr Bond, Par Rate, Category, Data Category, Delivery Speed, Data Date, Data Vendor, Print Vendor, Mail Vendor, Supply Vendor, Data Cost, Mail Cost, Print Cost, Supply Cost, and **States** (mandatory)
  - **States Selection**: Button in batch card header (above completion bar) opens dialog with US states checkboxes
  - **Completion Bar**: Shows 17 segments tracking field completion progress
  - **CSV Upload**: Three-stage workflow (Upload → Column Mapping → Preview) only appears when all 17 fields are complete
  - **Validation**: States-specific warning when no states selected; generic warning for incomplete fields
  - **Auto-mapping**: Fuzzy matching (threshold 0.6) for CSV columns to required fields
  - **Batch Management**: Action menu (three dots) with delete functionality, confirmation dialogs, localStorage persistence
  - **Batch List**: Sortable table with batch details, cost tracking, record counts, date formatting

**Technology Stack**:
- Recharts library for data visualization (PieChart, BarChart with responsive containers)
- Papa Parse for CSV processing with auto-column detection
- Interactive drill-down with state management
- Custom tooltips with currency formatting
- Live status indicator with animation
- Shadcn/ui DropdownMenu components matching header design theme

### Background Selector System
Allows customization of dashboard and login page backgrounds with various presets (e.g., Geometric Cubes, Infinity Grid, Neon Night). Supports mode toggling, visual previews, and persistence via localStorage.

## External Dependencies

### Email Service
- **SendGrid**: Transactional email service for notifications and lead management.

### Database
- **Neon Database**: Serverless PostgreSQL database.

### UI Components
- **Radix UI**: Headless component library for UI elements.
- **Lucide Icons**: Icon library.
- **Google Fonts**: Inter and Lora fonts for typography.