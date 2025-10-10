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

## Admin Comments & Posts Management System

### Overview
The Comments & Posts Management system (`/admin/add-comment`) provides a comprehensive interface for managing two types of content:
1. **Client Testimonials**: Featured in the homepage "What Our Clients Say" section
2. **Company Posts (Insights)**: Internal staff messages for company communication

### System Features
- **5-Tab Navigation**: Client Comment, All Comments, Company Post, All Posts, Notes
- **Preview Functionality**: Real-time preview matching exact website design
- **Statistics Tracking**: Total comments, last comment date, unique states
- **localStorage Persistence**: Seamless connection between admin panel and public homepage
- **Sortable Tables**: All Comments and All Posts tabs with column sorting (chronological for dates, numeric for ratings, alphabetical for text)
- **Sticky Notes**: Notes tab with yellow sticky note input and pin-to-wall display system

### All Posts Tab
- **Table Columns** (left to right): Post Date, Post By, Category, Author, Post Content
- **Sortable Columns**: Post Date, Post By, Category, Author (Post Content is not sortable)
- **Sorting Implementation**: 
  - Uses `useMemo` for performance optimization
  - Dates parsed with `new Date().getTime()` for chronological sorting
  - String columns use lowercase comparison for case-insensitive sorting
  - Returns 0 for equality to ensure stable sorting
- **Row Click Functionality**: Opens dialog with view/edit modes
- **Dialog Features**: 
  - View mode: Displays all post fields (Post By, Category, Author, Date, Content, Font Size/Type/Color)
  - Edit mode: All fields editable with appropriate controls
  - Delete button removes post from localStorage
  - Edit/Save functionality updates localStorage

### Category Dropdown
- **Location**: Company Post tab, first row after "Post by" field
- **Options**: Select, I wish I had said that, Policy, Events, Announcement
- **Integration**: Category displayed in All Posts table and saved with post data

### Category-Based Counting System
- **Insight Circle**: Counts posts with category "I wish I had said that"
- **Events Circle**: Counts posts with categories "Policy", "Events", or "Announcement"
- **Implementation**: 
  - `calculateCategoryCounts()` function updates counts from post array
  - Counts updated on: initial load, post creation, post edit, post deletion
  - State variables: `insightCount` and `eventsCount`
- **Category-to-Counter Mapping**:
  - "I wish I had said that" → Insight counter
  - "Policy", "Events", "Announcement" → Events counter
  - Future category additions should be deliberately mapped to appropriate counter

### Notes Tab
- **Blank Template Note**: Always displayed first (leftmost) - ready for creating new notes
- **Visual Design**: 
  - Yellow background (bg-yellow-100/dark:bg-yellow-900)
  - Red pin icon at top center (rotated 45 degrees)
  - "Sticky Note" header with yellow pin icon
  - Minimize/Expand button at top right corner
  - Three buttons always visible: Edit, Pin, Unpin
- **Minimize/Expand**: 
  - Click minimize icon (top right) to collapse note to header only
  - Click expand icon to restore note content
- **Creating Notes**: 
  - Type in the blank template note (always on the left)
  - Click "Pin" button to save the note
  - The pinned note moves to the right
  - The blank template stays on the left, cleared and ready for the next note
- **Button Behavior**:
  - **Blank Note**: Only "Pin" button is active (Edit and Unpin are disabled)
  - **Pinned Notes**: Only "Edit" and "Unpin" buttons are active (Pin is disabled)
- **Edit Functionality**:
  - Notes are directly editable in textarea
  - Click "Edit" button to enter edit mode
  - "Edit" button changes to "Save" button
  - Click "Save" to save changes
- **Unpin System**:
  - Click "Unpin" to delete and remove the sticky note completely
  - Only pinned notes are saved to localStorage
- **Data Persistence**:
  - Notes stored in localStorage key `'pinnedNotes'`
  - Only pinned notes persist across sessions
  - Blank template note never persists (always starts empty)

### Technical Implementation
- **Data Storage**: Company posts stored in localStorage key `'postedCompanyPosts'`; Notes stored in `'pinnedNotes'`
- **State Management**: Dedicated sorting state (`sortPostColumn`, `sortPostDirection`) and dialog state for posts; Notes use `blankNoteText`, `pinnedNotes`, `editingNoteId`, `editingNoteText`, and `minimizedNotes` state
- **Index Mapping**: Sorted arrays use `findIndex()` to map back to original array indices for edit/delete operations
- **Dashboard Display**: Only the most recent post (last in array) is displayed on AdminDashboard, not all posts
- **Republish Feature**: "Publish" button in All Posts table updates post date to today, making it the most recent

## Admin Dashboard

### Tile Layout
The Admin Dashboard displays tiles organized in rows:
- **Row 1 (Lead Journey)**: Lead → Quote → Loan Prep → Loan → Funded
- **Row 2 (Operations)**: Marketing, Snapshot, Library, Audit, Settings
- **Row 3 (Management)**: Vendors, Staff, Partners, Ledger, Vault

## Admin Marketing - Direct Mail System

### Overview
The Marketing Direct Mail system (`/admin/marketing`) provides comprehensive campaign management with CSV upload, batch tracking, and lead journey monitoring.

### Batch List Table
- **Column Headers** (left to right): Created, Batch #, Batch Title, Category, Data, Delivery, 10 Yr Bond, Par Rate, Records, Cost, Actions
- **Cost Column**: Automatically calculates and displays total cost from: Data Cost + Mail Cost + Print Cost + Supply Cost
- **Alternating Row Colors**: Zebra striping for visual separation (white/gray-50 alternating backgrounds)
- **Sortable Columns**: Created, Batch #, Batch Title (clickable headers with sort icons)

### Batch Creation
- **4-Row Layout**: Vendor fields, cost tracking, bond rates, and campaign parameters
- **Cost Fields**: Data Cost, Mail Cost, Print Cost, Supply Cost (currency formatted with CurrencyInput component)
- **Backward Compatibility**: Display functions return "-" for undefined values (vendor fields, cost fields, delivery/category/dataType) preventing errors on legacy batches

### Data Management
- **CSV Upload**: Smart column mapping with flexible header recognition
- **Reference Numbers**: Unique batch tracking identifiers
- **Lead Journey Tracking**: Stages include Lead → Quote → Loan Prep → Loan → Funded

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