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
- **Library/Testing Sandbox**: Testing environment featuring:
    - **Theme Settings System**: Self-contained color scheme selector with 3 preset themes (Professional Dashboard, Cyberpunk, Sunset Blaze)
    - **Theme Preview Cards**: Visual previews showing gradient colors, backgrounds, and accent elements for each theme
    - **Real-time Application**: Selected themes instantly update borrower card colors including page gradients, card backgrounds, input styles, label colors, title gradients, and border accents
    - **Light/Dark Mode Toggle**: Works in conjunction with theme settings and brightness controls
    - **Brightness Controls**: Separate sliders for page and card brightness in light mode
- **Snapshot Analytics Dashboard**: Comprehensive dashboard for financial analytics, marketing campaign management, expense/revenue tracking, and data visualization.
    - **Key Features**: Interactive filters, real-time financial metrics, conditional card displays, customizable search cards with dynamic column systems for results tables.
    - **Design**: Purple-to-pink gradient scrollbars, themed icons, consistent dropdown styling across all admin features.
    - **Functionality**: Transaction Attachments System for expenses/revenue, PDF attachment system for staff and batches.
    - **Search Card System** (Financials):
      - **Manual Access**: Magnifying glass icon in Performance card opens category-specific search cards
      - **Conflict Prevention**: If expense/revenue log form is open, magnifying glass displays warning instead of opening search card
      - **Expense Search Card** (Financials/Expense): Search icon, date filter dropdown, 12 fields across 3 rows
        - **Date Filter Dropdown**: Today/MTD/YTD/Date Range selector positioned left of Clear Filters button; when Date Range selected, shows From Date and To Date inputs
        - Row 1: Log Date (date field), Transaction Date (date field), Clear Date (date field), Amount
        - Row 2: Invoice #, Check #, Payment Method, Payment Term
        - Row 3: Category, Area, Paid To, Payee
      - **Dynamic Transactions Table**: When user fills search fields and clicks "Search Expense", the Transactions table displays only columns matching filled search fields. Default shows all columns. Includes X close button for independent visibility control.
        - **Field Mapping**: Log Date → logDate, Transaction Date → transactionDate, Clear Date → clearanceDate, Amount → expense (emerald-500 green), Invoice # → invoiceNumber, Check # → checkNumber, Payment Method → paidWith, Payment Term → paymentTerm, Category → expenseCategory, Area → area, Paid To → paidTo, Payee → payee
        - **State Management**: visibleTransactionColumns state tracks which columns to display, isColumnVisible helper function checks visibility
        - **Success Notification**: Toast message "Transaction has been recorded" displays when expense is successfully logged
        - **Flywheel Scrollbar**: Custom horizontal scrollbar with purple-to-pink gradient indicator matching Staff/Direct Mail implementation - draggable indicator syncs with table scroll, click-to-jump on track, instruction text "← Drag or click the scrollbar to navigate →"
        - **Search Filtering**: Transactions table automatically filters to show only matching records based on filled search parameters (exact match on all fields)
        - **Auto-Close Search**: When user clicks "Add Entry" while search card is open, search card automatically closes before opening expense log form
        - **Direct Expense Entry**: When in Expense tab (Financials/Expense), clicking "Add Entry" directly opens Expense Log form (bypasses Add Entry modal)
        - **Transactions Visibility**: Transactions card only appears when Search card has values and user clicks "Search Expense" button; starts hidden by default
      - **Revenue Search Card** (Financials/Revenue): DollarSign icon, date filter dropdown, 8 fields across 2 rows
        - **Date Filter Dropdown**: Today/MTD/YTD/Date Range selector positioned left of Clear Filters button; when Date Range selected, shows From Date and To Date inputs
        - Row 1: Log Date, Transaction Date, Clear Date, Reference #
        - Row 2: Revenue Category, Revenue Source, Payment Method, Amount
        - **Mutual Exclusivity**: Revenue Search Card and Revenue Log card cannot be open simultaneously - opening one automatically closes the other
      - **Revenue Transactions Table**: Complete feature parity with Expense Transactions
        - **Field Mapping**: Log Date → logDate, Transaction Date → transactionDate, Clear Date → clearanceDate, Reference # → paymentForm, Revenue Category → revenueCategory, Revenue Source → revenueTerm, Payment Method → paymentFrom, Amount → revenue (emerald-500 green)
        - **State Management**: visibleRevenueColumns state tracks which columns to display, isRevenueColumnVisible helper function checks visibility
        - **Flywheel Scrollbar**: Purple-to-pink gradient indicator with drag functionality and click-to-jump navigation
        - **Dynamic Columns**: Table displays only columns matching filled Revenue Search fields
        - **Transactions Visibility**: Card only appears when Revenue Search has values and user clicks "Search Revenue" button
      - **Auto-Hide Logic**: Cards mutually exclusive - switching between Expense/Revenue auto-hides the other; both hide when Team ≠ Expense/Revenue
      - **Button Standardization**: Clear Filters (left) and Search buttons match at px-3.5 py-1.5 text-sm height
    - **Staff Card Auto-Minimize System**: When Staff category is selected with Team ≠ "Select" and user clicks Add Entry → Add Staff Member, the system automatically minimizes Performance card while closing all Search cards for optimal workflow focus
    - **Manual Search Card Access**: For both Staff and Marketing categories, Search cards do not auto-display when Team is selected - users must click the magnifying glass icon in the Performance card to open Search
    - **Marketing Mutual Exclusivity** (Marketing/Direct Mail):
      - **New Batch and Search Card**: Cannot be open simultaneously - only one can be visible at a time
      - **Conflict Prevention**: When New Batch card is open and user clicks magnifying glass icon, displays warning: "Please complete or close the open new batch entry"
      - **Auto-Close Logic**: When Search card is open and user clicks "Add Entry" → "Add New Batch", Search card automatically closes before New Batch card opens
    - **Marketing Batch List Flow**: When Marketing/Direct Mail is selected, Batch List only appears after user opens Search card and clicks "Search Batch" button

### Background Selector System
Allows customization of dashboard and login page backgrounds with various presets, supporting mode toggling, visual previews, and persistence.

## External Dependencies

- **Email Service**: SendGrid for transactional emails.
- **Database**: Neon Database (serverless PostgreSQL).
- **UI Components**: Radix UI, Lucide Icons.
- **Fonts**: Google Fonts (Inter, Lora).
- **OCR**: AWS Textract.
- **AI**: Anthropic Claude (`claude-sonnet-4-20250514`).