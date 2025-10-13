# Add New Client - Complete Data Schema & Field Mapping Documentation

**Document Version:** 1.0  
**Last Updated:** October 13, 2025  
**For:** Developer Roger - Refactoring & Data Mapping Reference

---

## 🚨 CRITICAL FINDINGS - Income Section Issue

### The Problem
Income fields appear empty after save because the form uses **TWO DIFFERENT** data structures:

1. **Legacy Flat Structure** (OLD - deprecated but still in schema):
   - `income.employerName`
   - `income.monthlyIncome`
   - `income.annualBonusIncome`

2. **Dynamic Card Structure** (NEW - currently in use):
   - `income.employers[cardId].employerName`
   - `income.employers[cardId].monthlyIncome`
   - `income.employers[cardId].annualBonusIncome`

### The Root Cause
The schema (`shared/schema.ts`) defines **BOTH** structures, but the UI form uses the NEW dynamic structure while some backend/display logic may expect the OLD flat structure.

**File:** `shared/schema.ts` lines 79-140
```typescript
// OLD flat fields (lines 80-92)
employerName: z.string().optional(),
monthlyIncome: z.string().optional(),
// ...

// NEW dynamic structure (lines 125-140)
employers: z.record(z.string(), z.object({
  employerName: z.string().optional(),
  monthlyIncome: z.string().optional(),
  // ...
})).default({})
```

### The Solution
Roger needs to ensure that **ONLY the dynamic structure** is used throughout the codebase OR implement a migration/compatibility layer that converts between the two formats.

---

## 📋 Complete Tab Structure & Completion Order

### Tab Order (Left to Right):
1. **Borrower** (`value="client"`) - ✅ START HERE
2. **Income** (`value="income"`)
3. **Property** (`value="property"`)
4. **Loan** (`value="loan"`)
5. **Credit** (`value="credit"`)
6. **Status** (`value="status"`)
7. **Vendors** (`value="vendors"`)
8. **Quote** (`value="quote"`)
9. **Notes** (`value="notes"`)

### Recommended Completion Flow:
1. **Borrower** → Basic client information (required for all other tabs)
2. **Income** → Employment and income details
3. **Property** → Property information (depends on borrower address)
4. **Loan** → Current and new loan details (depends on property)
5. **Vendors** → Third-party contacts
6. **Quote** → Generate loan quote (depends on all previous data)
7. **Status** → Lead tracking information
8. **Credit** → Credit score and history
9. **Notes** → Additional comments

### Tab Dependencies:
- **Income** tab: Requires borrower to exist (optional co-borrower triggers separate income section)
- **Property** tab: Can copy from borrower's residence address
- **Loan** tab: Links to specific properties via property ID
- **Quote** tab: Requires loan details, property info, and income data

---

## 📊 COMPLETE FIELD MAPPING TABLE

### TAB 1: BORROWER (`value="client"`)

#### Lead Information Section

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Stage | `borrower.stage` | dropdown | No | Lead, Quote, Loan Prep, Loan, Funded, Audit, Closed, Cancel, Withdraw |
| Lead Reference | `borrower.leadRef` | text | No | Free text (toggles with DM Batch) |
| DM Batch | `borrower.dmBatch` | text | No | Free text (toggles with Lead Reference) |
| Source | `borrower.source` | dropdown | No | Select, Direct Mail, Social Media, Client Referral, Other (customizable) |
| Call Date | `borrower.callDate` | date | No | Date picker format |
| Start Date | `borrower.startDate` | date | No | Date picker format |
| Loan Duration | `borrower.loanDuration` | text | No | Number of days/weeks |

#### Borrower Information Section

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| First Name | `borrower.firstName` | text | No | String |
| Middle Name | `borrower.middleName` | text | No | String |
| Last Name | `borrower.lastName` | text | No | String |
| Phone | `borrower.phone` | text | No | Auto-formatted: (XXX) XXX-XXXX |
| Email | `borrower.email` | email | No | Valid email format |
| Marital Status | `borrower.maritalStatus` | dropdown | No | Select, single, married, divorced, widowed |
| Date of Birth | `borrower.dateOfBirth` | date | No | Date picker |
| SSN | `borrower.ssn` | text | No | Masked input |
| Preferred Contact Time | `borrower.preferredContactTime` | dropdown | No | Select, Morning, Afternoon, Evening |

#### Current Address Section

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Street | `borrower.residenceAddress.street` | text | No | String |
| Unit/Apt | `borrower.residenceAddress.unit` | text | No | String |
| City | `borrower.residenceAddress.city` | text | No | String |
| State | `borrower.residenceAddress.state` | text | No | 2-letter state code |
| Zip | `borrower.residenceAddress.zip` | text | No | 5 or 9 digits |
| County | `borrower.residenceAddress.county` | text | No | String |
| Years at Address | `borrower.yearsAtAddress` | text | No | Number |
| Months at Address | `borrower.monthsAtAddress` | text | No | Number (0-11) |

#### Subject Property Address Section

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Street | `borrower.subjectProperty.street` | text | No | Can copy from residence |
| Unit/Apt | `borrower.subjectProperty.unit` | text | No | String |
| City | `borrower.subjectProperty.city` | text | No | String |
| State | `borrower.subjectProperty.state` | text | No | 2-letter state code |
| Zip | `borrower.subjectProperty.zip` | text | No | 5 or 9 digits |
| County | `borrower.subjectProperty.county` | text | No | String |

#### Prior Address Section (if < 2 years at current)

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Street | `borrower.priorResidenceAddress.street` | text | No | String |
| Unit/Apt | `borrower.priorResidenceAddress.unit` | text | No | String |
| City | `borrower.priorResidenceAddress.city` | text | No | String |
| State | `borrower.priorResidenceAddress.state` | text | No | 2-letter state code |
| Zip | `borrower.priorResidenceAddress.zip` | text | No | 5 or 9 digits |
| County | `borrower.priorResidenceAddress.county` | text | No | String |
| Years at Prior Address | `borrower.priorYearsAtAddress` | text | No | Number |
| Months at Prior Address | `borrower.priorMonthsAtAddress` | text | No | Number (0-11) |

#### Co-Borrower Section (Optional - Same structure as Borrower)

All co-borrower fields use the prefix `coBorrower.` instead of `borrower.`
Example: `coBorrower.firstName`, `coBorrower.residenceAddress.street`, etc.

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Relationship to Borrower | `coBorrower.relationshipToBorrower` | dropdown | No | N/A, spouse, partner, family, friend, other, not-applicable |

---

### TAB 2: INCOME (`value="income"`)

⚠️ **CRITICAL: This tab uses dynamic card-based data structure**

#### Income Type Toggles

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Employment | `income.incomeTypes.employment` | boolean | No | Toggle on/off |
| Second Employment | `income.incomeTypes.secondEmployment` | boolean | No | Toggle on/off |
| Self-Employment | `income.incomeTypes.selfEmployment` | boolean | No | Toggle on/off |
| Pension | `income.incomeTypes.pension` | boolean | No | Toggle on/off |
| Social Security | `income.incomeTypes.socialSecurity` | boolean | No | Toggle on/off |
| VA Benefits | `income.incomeTypes.vaBenefits` | boolean | No | Toggle on/off |
| Disability | `income.incomeTypes.disability` | boolean | No | Toggle on/off |
| Other Income | `income.incomeTypes.other` | boolean | No | Toggle on/off |

#### Employment Cards (Dynamic - Multiple Allowed)

**Path Structure:** `income.employers[{cardId}].{fieldName}`

Where `{cardId}` is a unique identifier (e.g., nanoid())

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Employer Name | `income.employers[cardId].employerName` | text | No | String |
| Job Title | `income.employers[cardId].jobTitle` | text | No | String |
| Gross Monthly Income | `income.employers[cardId].monthlyIncome` | currency | No | Auto-formatted: $X,XXX |
| Net Monthly Income | `income.employers[cardId].netMonthlyIncome` | currency | No | Toggle display with Gross |
| Monthly Bonus | `income.employers[cardId].monthlyBonusIncome` | currency | No | $X,XXX |
| Annual Bonus | `income.employers[cardId].annualBonusIncome` | currency | No | $X,XXX |
| Employment Type | `income.employers[cardId].employmentType` | dropdown | No | Full-Time, Part-Time |
| Years Employed | `income.employers[cardId].yearsEmployedYears` | number | No | Integer |
| Months Employed | `income.employers[cardId].yearsEmployedMonths` | number | No | 0-11 |
| Employer Phone | `income.employers[cardId].employerPhone` | text | No | (XXX) XXX-XXXX |
| Employment Verification Phone | `income.employers[cardId].employmentVerificationPhone` | text | No | Toggle with Employer Phone |
| Is Showing Verification | `income.employers[cardId].isShowingEmploymentVerification` | boolean | No | Toggle switch |
| Remote Status | `income.employers[cardId].employerRemote` | text | No | String |

#### Employer Address (within each card)

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Street | `income.employers[cardId].employerAddress.street` | text | No | String |
| Unit | `income.employers[cardId].employerAddress.unit` | text | No | String |
| City | `income.employers[cardId].employerAddress.city` | text | No | String |
| State | `income.employers[cardId].employerAddress.state` | text | No | 2-letter code |
| Zip | `income.employers[cardId].employerAddress.zip` | text | No | 5 or 9 digits |

#### Second Employment Cards (Dynamic - Multiple Allowed)

**Path Structure:** `income.secondEmployers[{cardId}].{fieldName}`

Same fields as Employment Cards above, but under `secondEmployers` object.

#### Self-Employment Cards (Dynamic - Multiple Allowed)

**Path Structure:** `income.selfEmployers[{cardId}].{fieldName}`

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Business Name | `income.selfEmployers[cardId].businessName` | text | No | String |
| Monthly Income | `income.selfEmployers[cardId].businessMonthlyIncome` | currency | No | $X,XXX |
| Years in Business | `income.selfEmployers[cardId].yearsInBusinessYears` | number | No | Integer |
| Months in Business | `income.selfEmployers[cardId].yearsInBusinessMonths` | number | No | 0-11 |
| Business Phone | `income.selfEmployers[cardId].businessPhone` | text | No | (XXX) XXX-XXXX |
| Formation Date | `income.selfEmployers[cardId].formationDate` | date | No | Date picker |
| Formation Type | `income.selfEmployers[cardId].formation` | text | No | LLC, Corp, etc. |
| Ownership % | `income.selfEmployers[cardId].ownershipPercentage` | text | No | Percentage |
| Taxes Prepared By | `income.selfEmployers[cardId].taxesPreparedBy` | text | No | String |
| Business Description | `income.selfEmployers[cardId].businessDescription` | textarea | No | Long text |
| Gross Annual Revenue | `income.selfEmployers[cardId].grossAnnualRevenue` | currency | No | $X,XXX |
| Net Annual Revenue | `income.selfEmployers[cardId].netAnnualRevenue` | currency | No | $X,XXX |

#### Business Address (within each self-employment card)

Same structure as employer address: `income.selfEmployers[cardId].businessAddress.{field}`

#### Pension Income (Multiple Pensions - Array)

**Path Structure:** `income.pensions[index].{fieldName}`

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Payer Name | `income.pensions[index].payerName` | text | No | String |
| Monthly Amount | `income.pensions[index].monthlyAmount` | currency | No | $X,XXX |
| Start Date | `income.pensions[index].startDate` | date | No | Date picker |

#### Other Income Types (Single Fields)

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Social Security Monthly | `income.socialSecurityMonthlyAmount` | currency | No | $X,XXX |
| Social Security Start Date | `income.socialSecurityStartDate` | date | No | Date picker |
| VA Benefits Monthly | `income.vaBenefitsMonthlyAmount` | currency | No | $X,XXX |
| VA Benefits Start Date | `income.vaBenefitsStartDate` | date | No | Date picker |
| Disability Payer | `income.disabilityPayerName` | text | No | String |
| Disability Monthly | `income.disabilityMonthlyAmount` | currency | No | $X,XXX |
| Disability Start Date | `income.disabilityStartDate` | date | No | Date picker |
| Other Income Description | `income.otherIncomeDescription` | text | No | String |
| Other Income Monthly | `income.otherIncomeMonthlyAmount` | currency | No | $X,XXX |

#### DTI Calculations

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Front DTI | `income.frontDTI` | text | No | Percentage (auto-calculated) |
| Back DTI | `income.backDTI` | text | No | Percentage (auto-calculated) |
| Guideline DTI | `income.guidelineDTI` | text | No | Percentage |

#### Co-Borrower Income

All co-borrower income fields follow the same structure with prefix `coBorrowerIncome.`
- `coBorrowerIncome.employers[cardId].{field}`
- `coBorrowerIncome.selfEmployers[cardId].{field}`
- `coBorrowerIncome.socialSecurityMonthlyAmount`
- etc.

---

### TAB 3: PROPERTY (`value="property"`)

#### Global Property Fields

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Estimated LTV | `property.estimatedLTV` | text | No | Percentage |

#### Property Entries (Dynamic Array)

**Path Structure:** `property.properties[index].{fieldName}`

Each property must have a unique `id` field (required, stable ID for attachment system)

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Property ID | `property.properties[index].id` | text | **YES** | Unique nanoid() |
| Property Use | `property.properties[index].use` | dropdown | No | primary, second-home, investment, home-purchase |
| Is Subject Property | `property.properties[index].isSubject` | boolean | No | Only one can be true |
| Property Type | `property.properties[index].propertyType` | text | No | SFR, Condo, Multi-family, etc. |
| Estimated Value | `property.properties[index].estimatedValue` | currency | No | $X,XXX |
| Appraised Value | `property.properties[index].appraisedValue` | currency | No | $X,XXX |
| Owned Since | `property.properties[index].ownedSince` | date | No | Date picker |
| Purchase Price | `property.properties[index].purchasePrice` | currency | No | $X,XXX |
| HOA Fee | `property.properties[index].hoaFee` | currency | No | $X,XXX |
| Owned/Held By | `property.properties[index].ownedHeldBy` | dropdown | No | borrower, borrower-coborrower, borrower-others |

#### Property Address (within each property)

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Street | `property.properties[index].address.street` | text | No | String |
| Unit | `property.properties[index].address.unit` | text | No | String |
| City | `property.properties[index].address.city` | text | No | String |
| State | `property.properties[index].address.state` | text | No | 2-letter code |
| Zip | `property.properties[index].address.zip` | text | No | 5 or 9 digits |
| County | `property.properties[index].address.county` | text | No | String |

#### Property Valuations (Nested within property)

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Zillow Estimate | `property.properties[index].valuations.zillow` | currency | No | $X,XXX |
| Redfin Estimate | `property.properties[index].valuations.redfin` | currency | No | $X,XXX |
| Realtor Estimate | `property.properties[index].valuations.realtor` | currency | No | $X,XXX |

#### Property Loans (Up to 3 per property)

**First Loan:** `property.properties[index].loan.{field}`
**Second Loan:** `property.properties[index].secondLoan.{field}`
**Third Loan:** `property.properties[index].thirdLoan.{field}`

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Active Secured Loan | `property.properties[index].activeSecuredLoan` | text | No | Yes/No toggle |
| Lender Name | `property.properties[index].loan.lenderName` | text | No | String |
| Loan Number | `property.properties[index].loan.loanNumber` | text | No | String |
| Mortgage Balance | `property.properties[index].loan.mortgageBalance` | currency | No | $X,XXX |
| P&I Payment | `property.properties[index].loan.piPayment` | currency | No | $X,XXX |
| Escrow Payment | `property.properties[index].loan.escrowPayment` | currency | No | $X,XXX |
| Total Monthly Payment | `property.properties[index].loan.totalMonthlyPayment` | currency | No | $X,XXX (auto-calc) |
| Is Property Rented | `property.properties[index].loan.isPropertyRented` | text | No | For investment properties |
| Monthly Rental Income | `property.properties[index].loan.monthlyRental` | currency | No | $X,XXX |
| Net Monthly Income | `property.properties[index].loan.monthlyIncome` | currency | No | Auto-calculated |

---

### TAB 4: LOAN (`value="loan"`)

#### Current Loan Details

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Current Lender | `currentLoan.currentLender` | text | No | String |
| Lender Name | `currentLoan.lenderName` | text | No | String |
| Loan Number | `currentLoan.loanNumber` | text | No | String |
| Loan Start Date | `currentLoan.loanStartDate` | date | No | Date picker |
| Remaining Term | `currentLoan.remainingTermPerCreditReport` | text | No | Months/years |
| Current Balance | `currentLoan.currentBalance` | currency | No | $X,XXX |
| Current Rate | `currentLoan.currentRate` | text | No | Percentage |
| P&I Payment | `currentLoan.principalAndInterestPayment` | currency | No | $X,XXX |
| Escrow Payment | `currentLoan.escrowPayment` | currency | No | $X,XXX |
| Total Monthly Payment | `currentLoan.totalMonthlyPayment` | currency | No | $X,XXX (auto-calc) |
| HOA Payment | `currentLoan.hoaPayment` | currency | No | $X,XXX |
| Prepayment Penalty | `currentLoan.prepaymentPenalty` | dropdown | No | Yes - see notes, No |
| Loan Category | `currentLoan.loanCategory` | text | No | String |
| Loan Program | `currentLoan.loanProgram` | text | No | String |
| Loan Duration | `currentLoan.loanDuration` | text | No | String |
| Loan Term | `currentLoan.loanTerm` | text | No | String |
| Loan Purpose | `currentLoan.loanPurpose` | text | No | String |
| Attached to Property | `currentLoan.attachedToProperty` | dropdown | No | Property ID from property list |

#### Statement Balance (Nested)

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Mode | `currentLoan.statementBalance.mode` | dropdown | No | Statement Balance, Pay Off Demand |
| Amount | `currentLoan.statementBalance.amount` | currency | No | $X,XXX |

#### Property Address (within loan - for reference)

Fields: `currentLoan.propertyAddress.{street, unit, city, state, zipCode, county}`

#### Second Loan & Third Loan

Same structure as `currentLoan` but with prefixes:
- `secondLoan.{field}`
- `thirdLoan.{field}`

#### New Loan Details

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Loan Amount | `newLoan.loanAmount` | currency | No | $X,XXX |
| Loan Program | `newLoan.loanProgram` | text | No | String |
| Interest Rate | `newLoan.interestRate` | text | No | Percentage |
| Loan Term | `newLoan.loanTerm` | text | No | Years |
| Loan Purpose | `newLoan.loanPurpose` | dropdown | No | purchase, refinance, cash-out, "" |
| Monthly Payment | `newLoan.monthlyPayment` | currency | No | $X,XXX |
| Lock Period | `newLoan.lockPeriod` | text | No | Days |

---

### TAB 5: VENDORS (`value="vendors"`)

| Field Label | Database Field | Type | Required | Valid Values/Notes |
|------------|----------------|------|----------|-------------------|
| Realtor | `vendors.realtor` | text | No | String |
| Appraiser | `vendors.appraiser` | text | No | String |
| Title Company | `vendors.titleCompany` | text | No | String |
| Inspector | `vendors.inspector` | text | No | String |
| Insurance | `vendors.insurance` | text | No | String |
| Attorney | `vendors.attorney` | text | No | String |

---

### TAB 6: QUOTE (`value="quote"`)

This tab is for quote generation and display - fields are dynamically generated from other tabs.

---

### TAB 7: STATUS (`value="status"`)

(Status fields are embedded in Borrower tab - see Lead Information section)

---

### TAB 8: CREDIT (`value="credit"`)

(Credit fields - to be documented based on implementation)

---

### TAB 9: NOTES (`value="notes"`)

(Notes section - free-form text area for additional comments)

---

## 🔧 Field Dependencies & Conditional Logic

### Income Tab Dependencies:
1. **Income Type Toggles** → Controls visibility of corresponding income sections
   - `incomeTypes.employment = true` → Shows Employment Cards
   - `incomeTypes.selfEmployment = true` → Shows Self-Employment Cards
   - `incomeTypes.pension = true` → Shows Pension section
   - etc.

2. **Employment Verification Toggle**:
   - When `isShowingEmploymentVerification = true`:
     - Shows "Job Verification" label
     - Field switches to `employmentVerificationPhone`
   - When `false`:
     - Shows "Employer Phone" label
     - Field shows `employerPhone`

3. **Gross/Net Income Toggle** (Per employer card):
   - Toggles display between `monthlyIncome` (gross) and `netMonthlyIncome` (net)
   - Only one displays at a time

### Property Tab Dependencies:
1. **Property Use** → Determines available fields:
   - `use = "investment"` → Shows rental income fields
   - `use = "primary"` → May show different loan options

2. **Active Loan Toggles**:
   - `activeSecuredLoan = "yes"` → Shows first loan details
   - `activeSecondLoan = "yes"` → Shows second loan details
   - `activeThirdLoan = "yes"` → Shows third loan details

3. **Property ID** → Used in Loan tab to attach loans to properties:
   - `currentLoan.attachedToProperty` references `property.properties[].id`

### Loan Tab Dependencies:
1. **Attached to Property** dropdown:
   - Populated from `property.properties` array
   - Links loan to specific property

### Co-Borrower Dependencies:
1. **Add Co-Borrower** → Enables entire co-borrower section
   - Creates `coBorrower` object
   - Creates `coBorrowerIncome` object
2. **Remove Co-Borrower** → Deletes all co-borrower data:
   - Sets `coBorrower = undefined`
   - Sets `coBorrowerIncome = undefined`

---

## 🔄 Data Flow & Save Process

### Form Submission Flow:

1. **User clicks Save button** → Triggers `form.handleSubmit(onSubmit)`
2. **onSubmit function** (line 3167):
   ```typescript
   const onSubmit = (data: InsertClient) => {
     // Clean up co-borrower if not needed
     if (!hasCoBorrower) {
       data.coBorrower = undefined;
       data.coBorrowerIncome = undefined;
     }
     addClientMutation.mutate(data);
   };
   ```
3. **Data sent to API** → `POST /api/clients`
4. **Backend saves to database** using schema from `shared/schema.ts`

### Currency Field Formatting:
- **Display:** `$1,234` (formatted for UI)
- **Storage:** `"1234"` (raw string value) OR `"$1,234"` (depends on field)
- **Important:** Some fields store formatted, some store raw - check specific implementation

### Dynamic Card ID Generation:
- Employment cards use `nanoid()` for unique IDs
- Card IDs are cleaned (alphanumeric only) before use in field paths
- Path: `income.employers.${cleanCardId}.fieldName`

---

## 🐛 Known Issues & Troubleshooting

### Issue 1: Income Fields Show Empty After Save

**Symptom:** Fill in Employment income fields → Click Save → View client → Fields are empty

**Root Cause:** Dual data structure (flat vs dynamic)

**Diagnosis Steps:**
1. Check browser DevTools → Network tab → Request payload when saving
2. Look for `income.employers` object with card IDs
3. Verify data is being sent in correct structure

**Fix Options:**

**Option A: Use Only Dynamic Structure (Recommended)**
1. Remove all legacy flat fields from schema:
   ```typescript
   // DELETE these from incomeSchema:
   employerName: z.string().optional(),
   monthlyIncome: z.string().optional(),
   // etc...
   ```
2. Ensure all form fields use dynamic paths:
   ```typescript
   income.employers[cardId].employerName
   ```

**Option B: Compatibility Layer**
1. Keep both structures in schema
2. Add conversion logic in onSubmit:
   ```typescript
   const onSubmit = (data: InsertClient) => {
     // Convert dynamic to flat for backward compatibility
     if (data.income?.employers) {
       const firstEmployer = Object.values(data.income.employers)[0];
       if (firstEmployer) {
         data.income.employerName = firstEmployer.employerName;
         data.income.monthlyIncome = firstEmployer.monthlyIncome;
         // etc...
       }
     }
     // ... rest of function
   };
   ```

### Issue 2: Property Attachment System

**Symptom:** Loans not linking to correct properties

**Cause:** Property ID mismatch or missing IDs

**Fix:** Ensure all properties have stable IDs (enforced in useEffect at line 3240)

---

## 📄 Database Schema Reference

**File:** `shared/schema.ts`

### Main Client Schema Structure:
```typescript
clientSchema = {
  id: string (optional),
  borrower: BorrowerInfo,
  coBorrower: BorrowerInfo (partial, optional),
  income: Income (optional),
  coBorrowerIncome: Income (optional),
  property: Property (optional),
  currentLoan: CurrentLoan (optional),
  secondLoan: CurrentLoan (optional),
  thirdLoan: CurrentLoan (optional),
  newLoan: NewLoan (optional),
  vendors: Vendors (optional),
  createdAt: string (optional),
  updatedAt: string (optional),
  status: "active" | "closed" | "on-hold" (default: "active")
}
```

### Key Schema Objects:
- **BorrowerInfo** (lines 39-64)
- **Income** (lines 66-230) - ⚠️ Contains both flat and dynamic structures
- **Property** (lines 283-286) - Contains array of PropertyEntry
- **PropertyEntry** (lines 257-280) - Individual property with loans
- **CurrentLoan** (lines 288-320)
- **NewLoan** (lines 322-330)
- **Vendors** (lines 332-339)

---

## 📋 Quick Reference: Helper Functions

### Field Path Generators (AdminAddClient.tsx):

```typescript
// Line 1823-1825
const getEmployerFieldPath = (cardId: string, fieldName: string) => {
  const cleanCardId = cardId.replace(/[^a-zA-Z0-9]/g, '');
  return `income.employers.${cleanCardId}.${fieldName}`;
};

// Similar for:
- getSecondEmployerFieldPath()
- getSelfEmployerFieldPath()
- getCoBorrowerEmployerFieldPath()
- etc.
```

---

## ✅ Action Items for Roger

### High Priority:
1. ✅ **Fix Income Save Issue**:
   - Choose Option A (dynamic only) or Option B (compatibility layer)
   - Test save/load cycle for all income types
   - Verify data persists correctly

2. ✅ **Verify Field Mappings**:
   - Cross-reference this document with actual implementation
   - Test each tab's save functionality
   - Check currency formatting consistency

3. ✅ **Data Validation**:
   - Ensure all required fields are enforced
   - Test edge cases (empty fields, large numbers, special characters)

### Medium Priority:
1. ⚠️ **Standardize Currency Storage**:
   - Decide: Store formatted ($1,234) or raw (1234)?
   - Update all currency fields consistently
   - Add validation for currency inputs

2. ⚠️ **Document Missing Tabs**:
   - Credit tab fields
   - Notes tab structure
   - Quote generation logic

### Low Priority:
1. ℹ️ **Code Cleanup**:
   - Remove deprecated flat income fields if using dynamic only
   - Add comments to complex field path logic
   - Update type definitions

---

## 📞 Support & Questions

For questions about this documentation or the refactoring process:
1. Check the field mapping table for specific field paths
2. Review the "Known Issues" section for common problems
3. Examine `shared/schema.ts` for authoritative schema definitions
4. Test in browser DevTools to inspect actual data flow

**Last Updated:** October 13, 2025
**Version:** 1.0
**Prepared for:** Developer Roger
