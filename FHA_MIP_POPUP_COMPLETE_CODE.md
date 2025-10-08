# COMPLETE FHA UPFRONT MIP POPUP CODE

## 1. STATE VARIABLES

```typescript
// Dialog open/close state
const [isFhaMipDialogOpen, setIsFhaMipDialogOpen] = useState(false);

// PURPLE SECTION - Existing/Prior FHA Data
const [fhaMipLoanStartMonthYear, setFhaMipLoanStartMonthYear] = useState('');
const [fhaMipStartingLoanBalance, setFhaMipStartingLoanBalance] = useState('');
const [fhaMipCostFactor, setFhaMipCostFactor] = useState('1.75');
const [fhaMipCost, setFhaMipCost] = useState('');
const [fhaMipRemainingMonths, setFhaMipRemainingMonths] = useState('');
const [fhaMipEstimatedCredit, setFhaMipEstimatedCredit] = useState('');
const [fhaMipRemainingRefundValue, setFhaMipRemainingRefundValue] = useState('');
const [fhaMipNewLoanAmount, setFhaMipNewLoanAmount] = useState('');

// GREEN SECTION - New FHA Estimates
const [newLoanAmount, setNewLoanAmount] = useState('');
const [newFhaMipCostFactor, setNewFhaMipCostFactor] = useState('1.75');
const [savedFhaMipEstimate, setSavedFhaMipEstimate] = useState('0');
const [adjustedNewFhaMip, setAdjustedNewFhaMip] = useState('');
```

## 2. PURPLE SECTION CALCULATIONS (Existing FHA Data)

```typescript
// Auto-calculate FHA MIP Cost
const calculatedFhaMipCost = useMemo(() => {
  const balance = parseInt(fhaMipStartingLoanBalance.replace(/[^\d]/g, '') || '0', 10);
  const factor = parseFloat(fhaMipCostFactor || '0');
  const cost = balance * (factor / 100);
  return cost > 0 ? Math.round(cost).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
}, [fhaMipStartingLoanBalance, fhaMipCostFactor]);

// Auto-calculate Remaining Refund Value based on Remaining Months
// Formula: 80% for month 1, decreasing by 2% for each additional month, minimum 10%
const calculatedRemainingRefundValue = useMemo(() => {
  const months = parseInt(fhaMipRemainingMonths || '0', 10);
  if (months === 0) return '';
  const percentage = 80 - ((months - 1) * 2);
  return percentage >= 10 ? percentage.toString() : '10';
}, [fhaMipRemainingMonths]);

// Auto-calculate Estimated MIP Refund
const calculatedEstimatedMipRefund = useMemo(() => {
  const cost = parseInt(calculatedFhaMipCost.replace(/[^\d]/g, '') || '0', 10);
  const percentage = parseInt(calculatedRemainingRefundValue || '0', 10);
  const refund = cost * (percentage / 100);
  return refund > 0 ? Math.round(refund).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
}, [calculatedFhaMipCost, calculatedRemainingRefundValue]);
```

## 3. GREEN SECTION CALCULATIONS (New FHA Estimates)

```typescript
// Calculate totals for each rate column (feeds into New Loan Amount)
const rateColumnTotals = useMemo(() => {
  return Array.from({ length: 5 }).map((_, index) => {
    const values = [
      existingLoanBalanceValues[index],
      cashOutAmountValues[index],
      rateBuyDownValues[index],
      vaFundingFeeValues[index],
      vaAppraisalValues[index],
      vaTermiteValues[index],
      vaUnderwritingValues[index],
      titleEscrowValues[index],
      payOffInterestValues[index],
      stateTaxValues[index],
      processingValues[index],
      creditReportValues[index],
      escrowReservesValues[index]
    ];
    
    const total = values.reduce((sum, val) => {
      const num = parseInt(val || '0', 10);
      return sum + num;
    }, 0);
    
    return total;
  });
}, [
  existingLoanBalanceValues, cashOutAmountValues, rateBuyDownValues,
  vaFundingFeeValues, vaAppraisalValues, vaTermiteValues, vaUnderwritingValues,
  titleEscrowValues, payOffInterestValues, stateTaxValues,
  processingValues, creditReportValues, escrowReservesValues
]);

// Auto-populate newLoanAmount from rateColumnTotals (first selected rate column)
useEffect(() => {
  const firstRateId = selectedRateIds[0];
  if (firstRateId && rateColumnTotals[firstRateId]) {
    const total = rateColumnTotals[firstRateId];
    const formatted = total > 0 ? Math.round(total).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
    setNewLoanAmount(formatted);
  }
}, [selectedRateIds, rateColumnTotals]);

// Auto-calculate New FHA MIP Cost
const calculatedNewFhaMipCost = useMemo(() => {
  const balance = parseInt(newLoanAmount.replace(/[^\d]/g, '') || '0', 10);
  const factor = parseFloat(newFhaMipCostFactor || '0');
  const cost = balance * (factor / 100);
  return cost > 0 ? Math.round(cost).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
}, [newLoanAmount, newFhaMipCostFactor]);

// Auto-calculate New FHA Upfront MIP Estimate (New MIP Cost - Prior MIP Refund)
const calculatedAdjustedNewFhaMip = useMemo(() => {
  const newMipCost = parseInt(calculatedNewFhaMipCost.replace(/[^\d]/g, '') || '0', 10);
  const priorRefund = parseInt(calculatedEstimatedMipRefund.replace(/[^\d]/g, '') || '0', 10);
  const estimate = newMipCost - priorRefund;
  return estimate > 0 ? estimate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
}, [calculatedNewFhaMipCost, calculatedEstimatedMipRefund]);
```

## 4. SAVE BUTTON HANDLER (In Dialog Footer)

```typescript
// Inside Dialog component - Save Button
<Button 
  type="button"
  onClick={() => {
    // Save the calculated estimate to savedFhaMipEstimate
    setSavedFhaMipEstimate(calculatedAdjustedNewFhaMip);
    setIsFhaMipDialogOpen(false);
  }}
  data-testid="button-save-fha-mip"
>
  Save
</Button>
```

## 5. DIALOG COMPONENT (Complete JSX Structure)

The dialog has a purple background header with white text, two main sections (purple and green), and a save button.

**Note:** The complete dialog code is approximately 250+ lines and includes:

### Dialog Structure:
- **DialogHeader**: Purple background (`bg-primary`) with white text
- **DialogContent**: Contains two main sections
  - **Purple Section**: Prior/Existing FHA Data (7 fields)
  - **Green Section**: New FHA Estimates (4 fields)
- **DialogFooter**: Cancel and Save buttons

### Purple Section Fields (Existing FHA):
1. **Loan Start (MM/YYYY)** - Input with month/year formatting
2. **Starting Loan Balance** - Currency input with $ formatting
3. **Cost Factor** - Percentage input (default 1.75%)
4. **FHA MIP Cost** - Auto-calculated, read-only (purple background)
5. **Remaining Months** - Number input (max 36 months)
6. **Remaining Refund Value** - Auto-calculated %, read-only (purple background)
7. **Estimated MIP Refund** - Auto-calculated $, read-only (purple background)

### Green Section Fields (New FHA):
1. **New Loan Amount** - Auto-populated from Quote tab, read-only (green background)
2. **New FHA MIP Cost Factor** - Percentage input (default 1.75%)
3. **New FHA MIP Cost** - Auto-calculated $, read-only (green background)
4. **New FHA Upfront MIP Estimate** - Final result, read-only (green background)

## 6. HOW IT WORKS (Workflow)

1. **User clicks "New FHA Upfront MIP" button** in Quote tab → Opens dialog
2. **Purple Section (Existing FHA)**: User enters prior FHA loan data
   - Loan Start Month/Year
   - Starting Balance  
   - Cost Factor (default 1.75%)
   - Remaining Months
   - System auto-calculates:
     * FHA MIP Cost = Starting Balance × Cost Factor
     * Remaining Refund Value = 80% - ((Months - 1) × 2%), min 10%
     * Estimated MIP Refund = FHA MIP Cost × Remaining Refund Value
3. **Green Section (New FHA)**: Auto-populates from Quote tab calculations
   - "New Loan Amount" field is **READ-ONLY** and auto-syncs from "New Est. Loan Amount" (fourth card, first selected rate column)
   - System auto-calculates:
     * New FHA MIP Cost = New Loan Amount × New Cost Factor
     * New FHA Upfront MIP Estimate = New FHA MIP Cost - Estimated MIP Refund
4. **User clicks Save** → Copies `calculatedAdjustedNewFhaMip` to `savedFhaMipEstimate`
5. **`savedFhaMipEstimate`** → Displays in the "New FHA Upfront MIP" field in second card

## 7. KEY DESIGN PATTERNS

### Colors:
- **Purple (`bg-purple-600`)**: Existing/Prior FHA data section and titles
- **Green (`bg-green-600`)**: New FHA estimates section and titles
- **Primary (`bg-primary`)**: Dialog header with white text
- **Read-only fields**: Use `disabled` attribute with `disabled:cursor-not-allowed disabled:opacity-100`

### Input Formatting:
- **Currency**: Auto-formats with commas, removes non-digits
- **Percentage**: Accepts decimals, displays with % symbol
- **Month/Year**: MM/YYYY format
- **Months**: Number only, max 36

### Calculations Execute Order:
1. `rateColumnTotals` (line 1305) → Calculates "New Est. Loan Amount"
2. `calculatedNewFhaMipCost` (line 1350) → Uses `newLoanAmount`
3. `useEffect` (line 1357) → Syncs `newLoanAmount` from `rateColumnTotals`
4. `calculatedAdjustedNewFhaMip` (line 1366) → Uses `calculatedNewFhaMipCost`
5. Save button → Copies to `savedFhaMipEstimate`
