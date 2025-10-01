# Prime Rate Home Loans - Landing Page

## Overview

This is a professional mortgage lending landing page for Prime Rate Home Loans, built with React and designed to convert visitors into loan applicants. The application features a clean, trustworthy design inspired by major financial institutions like Chase and Rocket Mortgage. The site focuses on lead generation through multiple contact forms including pre-approval applications, rate tracking requests, and general inquiries, all integrated with email notifications via SendGrid.

## Recent Changes

### Implemented Toggle-Based Income Field in Borrower Employer Card (October 1, 2025)

Successfully implemented the Self-Employment income field pattern in the Borrower Employer card with performance-optimized architecture:

- **Toggle Switch Implementation**: Added Switch component to toggle between "Gross Monthly Income" and "Net Monthly Income" labels
- **Per-Card Toggle State**: Implemented `isShowingEmployerNetIncome: Record<string, boolean>` allowing each employer card to independently maintain its gross/net selection
- **Dual Field Storage**: Created separate form paths for `monthlyIncome` (Gross) and `netMonthlyIncome` (Net) in employer schema
- **Performance-Optimized Component**: Created `ToggleIncomeInput` memoized component using React Hook Form's `useWatch` and `useController` hooks to eliminate typing lag
- **Currency Formatting**: Implemented automatic formatting with useMemo that displays user input with $ symbol and comma separators
- **Schema Updates**: Extended `employers` schema in shared/schema.ts to include `netMonthlyIncome` field
- **Form Integration**: Field paths computed outside component and passed as props for optimal React.memo effectiveness
- **Value Persistence**: Each field maintains its own value independently; toggling between cards or gross/net preserves previously entered amounts

The Borrower Employer card now follows a performance-optimized version of the Self-Employment income field pattern, providing consistent user experience across different income types with zero typing lag even under rapid input scenarios.

### Completed Co-Borrower Residence Section Restructure (September 30, 2025)

Successfully restructured the Co-Borrower residence sections to match the Borrower design with:

- **Unified Structure**: Co-Borrower residence sections now mirror the Borrower card layout exactly, ensuring consistency across the application
- **Purple Circle Design**: Added purple "Owned" and "Rental" clickable circles to Current Residence, First Prior Residence, and Second Prior Residence sections
- **Simplified Time Input**: Replaced toggle switches with simple "Years / Months" labels for cleaner user interface
- **Cascading Residence Logic**: Implemented conditional display of Prior Residence sections based on time calculations:
  - First Prior Residence appears when current residence < 2 years
  - Second Prior Residence appears when combined current + first prior < 2 years
- **Decimal Time Support**: Enhanced time calculations to properly handle fractional years (e.g., 1.6 years = 19.2 months) using parseFloat
- **Consistent Field Structure**: All address fields (street, unit, city, state, ZIP, county) follow the same pattern in all three residence sections
- **Form Path Integrity**: All form bindings updated to use `coBorrower` paths (`coBorrower.residenceAddress`, `coBorrower.priorResidenceAddress`, `coBorrower.priorResidenceAddress2`)
- **County Lookup Integration**: ZIP code county lookup functionality properly integrated with Co-Borrower specific state handlers

The Co-Borrower residence workflow now provides the same user experience as the Borrower section, with matching visual design, conditional logic, and form validation patterns.

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

#### Auto-Sum/Calculation Pattern (Zero-Lag Performance)
For auto-calculating fields that sum multiple form inputs, use this isolated component pattern:

```typescript
// CRITICAL: Isolated React.memo component with useWatch + setValue pattern
const TotalMonthlyPaymentField = React.memo<{ form: any }>(({ form }) => {
  const [principal, tax] = useWatch({
    control: form.control,
    name: ["currentLoan.principalAndInterestPayment", "currentLoan.newField1"]
  });

  const total = useMemo(() => {
    const pNum = Number((principal || "").toString().replace(/[^\d]/g, "")) || 0;
    const tNum = Number((tax || "").toString().replace(/[^\d]/g, "")) || 0;
    return (pNum + tNum).toLocaleString();
  }, [principal, tax]);

  useEffect(() => {
    const currentTotal = form.getValues("currentLoan.newField2");
    if (currentTotal !== total) {
      form.setValue("currentLoan.newField2", total, {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false
      });
    }
  }, [total, form]);

  return (
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="currentLoan-newField2">Total Monthly Payment</Label>
      <div className="flex items-center border border-input bg-background px-3 rounded-md">
        <span className="text-muted-foreground text-sm">$</span>
        <Input
          id="currentLoan-newField2"
          type="text"
          placeholder="0"
          value={total}
          readOnly
          className="border-0 bg-transparent px-2 focus-visible:ring-0"
          data-testid="input-currentLoan-newField2"
        />
      </div>
    </div>
  );
});

// Usage: <TotalMonthlyPaymentField form={form} />
```

**Critical Rules for Zero-Lag Auto-Sum:**
- **NEVER use watch() at component level** - Causes entire large components to re-render on every keystroke
- **Always create isolated React.memo component** - Only this component re-renders, not parent
- **Use useWatch inside the isolated component** - Monitors only the fields needed for calculation
- **Calculate in useMemo** - Efficient computation only when dependencies change
- **Update with setValue in guarded useEffect** - Prevents infinite loops, keeps form state in sync
- **Format input fields only on blur** - Never format on every keystroke

**Input Field Pattern (for fields being summed):**
```typescript
<Controller
  control={form.control}
  name="currentLoan.principalAndInterestPayment"
  defaultValue=""
  render={({ field }) => (
    <Input
      value={field.value}
      onChange={(e) => {
        const value = e.target.value.replace(/[^\d]/g, '');
        field.onChange(value);
      }}
      onBlur={(e) => {
        const value = e.target.value.replace(/[^\d]/g, '');
        const formatted = value ? Number(value).toLocaleString() : '';
        form.setValue("currentLoan.principalAndInterestPayment", formatted);
      }}
    />
  )}
/>
```

**Why This Works:**
- Input fields store raw values while typing → zero lag
- Formatting happens only on blur → no expensive operations during typing
- Auto-sum component is isolated → only it re-renders when watched values change
- Parent component never re-renders → maintains typing speed even in 23K+ line files

**Reference Implementation:** Primary Loan card (lines 3862-3903 in AdminAddClient.tsx)

#### Phone Number Auto-Format Pattern (xxx-xxx-xxxx)
For phone number fields that need natural typing with automatic formatting and complete backspace deletion:

```typescript
<Input
  id="phone-field-id"
  value={form.watch('fieldPath.phone') || ''}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    let formatted = '';
    if (value.length > 0) {
      formatted = value.substring(0, 3);
      if (value.length > 3) {
        formatted += '-' + value.substring(3, 6);
        if (value.length > 6) {
          formatted += '-' + value.substring(6, 10);
        }
      }
    }
    form.setValue('fieldPath.phone', formatted);
  }}
  placeholder=""
  maxLength={12}
  data-testid="input-phone-field-id"
/>
```

**How it works:**
- Strips all non-digit characters with `replace(/\D/g, '')`
- Builds formatted string by adding hyphens at positions 3 and 6
- Limits to 10 digits max (displayed as 12 characters with hyphens)
- Allows free backspace/delete since it rebuilds the format on each keystroke

**Implementation locations:**
- Borrower phone field
- Co-Borrower phone field

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