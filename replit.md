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
- **Marketing Direct Mail System**: Manages marketing campaigns, including CSV upload, batch tracking, lead journey monitoring, and cost calculation. Features sticky columns in data tables and a detailed batch creation workflow.
- **Loan Management System**: Manages client loan applications, supporting multiple loan categories, rate configurations, third-party services, and quote generation.

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
- **Row 2**: Snapshot, Marketing, Library, Closed, Audit (blue left border on hover)
- **Row 3**: Vendors, Staff, Partners, Settings, Vault (purple left border on hover)

#### 10-Tab Menu Bar
Comprehensive navigation system with tabs in this order (left to right):
1. **Lead**: Lead management (coming soon)
2. **Marketing**: Direct mail campaigns, lead vendors, social media (has content)
3. **Snapshot**: Business overview and analytics (coming soon)
4. **Library**: Document and resource management (coming soon)
5. **Settings**: System configuration (coming soon)
6. **Vendors**: Vendor management (coming soon)
7. **Staff**: Staff management (coming soon)
8. **Partners**: Partner relationships (coming soon)
9. **Vault**: Secure storage (coming soon)
10. **Post**: Comments, posts, and notes (default tab with full functionality)

**Tab Styling**: Matching Lead Tile style with navy blue (#1a3373) for active state, green hover underline effect, and smooth transitions

#### Admin Marketing System
Features a header with "Back to Dashboard", "Shortcut Menu", "Screenshare", and "Save" options. Its navigation includes "Direct Mail", "Lead Vendor", "Social Media", and "Notes" tabs. The "Direct Mail" tab contains a Query Card for filtering and a Create Batch Card for new campaign setup, supporting 5-row layouts for campaign parameters, vendor details, and cost tracking, along with CSV upload and state selection. Batch details and lists are also managed here.

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