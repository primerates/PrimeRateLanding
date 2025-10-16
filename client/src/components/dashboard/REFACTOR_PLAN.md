# AdminSnapshot Dashboard Refactoring Plan

## Current State
- **File Size**: 6,692 lines
- **Expected Growth**: 20,000 lines
- **Problem**: Monolithic component with hundreds of state variables, making it unmaintainable

## Refactoring Goals
1. Break into domain-specific components (< 500 lines each)
2. Create shared/reusable components
3. Organize state with custom hooks
4. Maintain all existing functionality
5. Make AdminSnapshot.tsx the orchestrator (< 500 lines)

## New Architecture

### 1. Shared Components (`/shared`)
- `AttachmentDialog.tsx` - Unified attachment upload/view/delete dialog
- `CustomScrollbar.tsx` - Flywheel scrollbar with purple-pink gradient
- `DeleteConfirmationDialog.tsx` - Admin code confirmation dialog
- `WarningDialog.tsx` - Reusable warning/confirmation dialogs
- `StatesDialog.tsx` - Display selected states
- `NotesDialog.tsx` - Notes editor dialog
- `DashboardCard.tsx` - Reusable card wrapper with minimize/expand

### 2. Custom Hooks (`/hooks`)
- `useDashboardFilters.ts` - Entity, Category, Team, Time filters + logic
- `useFinancialsState.ts` - Expense/Revenue form state + search state
- `useMarketingState.ts` - Batch creation, search, and list state
- `useStaffState.ts` - Staff form and search state
- `useAutoMinimize.ts` - Card auto-minimize/expand logic
- `useAttachments.ts` - Attachment queries and mutations

### 3. Performance Components (`/performance`)
- `PerformanceCard.tsx` - Main metrics card with filters
  - Includes: metrics display, filter controls, minimize/expand
  - Uses: useDashboardFilters hook

### 4. Charts (already exist, may need minor updates)
- `RevenueSourcesChart.tsx` ✓
- `ExpenseBreakdownChart.tsx` ✓

### 5. Financials Components (`/financials`)
- `FinancialsPanel.tsx` - Main container for financials features
  - Routes to Expense or Revenue based on teamFilter
- `ExpenseSearchCard.tsx` - Expense search with 12 fields
- `ExpenseLogCard.tsx` - Expense log form
- `ExpenseTransactionsTable.tsx` - Dynamic expense transactions table
- `RevenueSearchCard.tsx` - Revenue search with 8 fields  
- `RevenueLogCard.tsx` - Revenue log form
- `RevenueTransactionsTable.tsx` - Dynamic revenue transactions table

### 6. Marketing Components (`/marketing`)
- `MarketingPanel.tsx` - Main container for marketing features
- `BatchSearchCard.tsx` - Batch query/search card
- `NewBatchCard.tsx` - Create new batch form with CSV upload
  - Includes: 3-stage CSV upload (Upload, Mapping, Preview)
- `BatchListTable.tsx` - Batch list with custom scrollbar

### 7. Staff Components (`/staff`)
- `StaffPanel.tsx` - Main container for staff features
- `StaffSearchCard.tsx` - Staff search with 10+ fields
- `StaffResultsTable.tsx` - Staff search results table
- `AddStaffCard.tsx` - Add new staff member form

### 8. Vendor Components (`/vendor`)
- `VendorPanel.tsx` - Vendor-specific features (if any)
  - Currently minimal, but ready for future expansion

### 9. Other Components
- `PrimeRateCard.tsx` - Prime rate display (Staff/MLO specific)
- `AddEntryModal.tsx` - Modal for selecting entry type

### 10. Main Orchestrator
- `AdminSnapshot.tsx` (< 500 lines)
  - Header/navigation
  - Filter context provider
  - Conditional rendering of panels based on categoryFilter
  - Global dialogs (delete confirmation, warnings)

## Migration Strategy

### Phase 1: Shared Components & Hooks
1. Extract shared dialogs and UI components
2. Create custom hooks for state management
3. Test hooks independently

### Phase 2: Domain Components (in order)
1. Performance card
2. Financials panel (highest complexity)
3. Marketing panel
4. Staff panel  
5. Vendor panel

### Phase 3: Integration
1. Update AdminSnapshot.tsx to use new components
2. Test all functionality
3. Remove old code
4. Update documentation

## State Flow

### Filter State (Global via useDashboardFilters)
```
entityFilter, categoryFilter, teamFilter, timeFilter
→ Passed to all panels via props or context
```

### Domain State (Local to each panel)
```
Financials: useFinancialsState()
  - Expense form state
  - Revenue form state
  - Search states
  - Table visibility

Marketing: useMarketingState()
  - Batch creation state
  - CSV upload state
  - Search state
  - Batch list

Staff: useStaffState()
  - Staff form state
  - Search state
  - Results state
```

### Attachment State (Global via useAttachments)
```
- Attachment dialogs
- Upload/delete mutations
- Queries for attachment lists
```

## Key Principles
1. **Single Responsibility**: Each component does ONE thing
2. **Prop Drilling Limit**: Use context for deeply nested props
3. **State Locality**: Keep state as local as possible
4. **Composition**: Build complex UIs from simple components
5. **Testability**: Components should be easily unit testable

## File Size Targets
- Shared components: < 200 lines each
- Domain panels: < 500 lines each
- Custom hooks: < 150 lines each
- Main AdminSnapshot: < 500 lines

## Testing Strategy
After each extraction:
1. Verify the specific panel/feature works
2. Check conditional rendering logic
3. Test auto-minimize/expand behavior
4. Verify attachment functionality
5. Check all mutations and queries
