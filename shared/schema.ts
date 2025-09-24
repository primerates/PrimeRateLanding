import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Address schema for reusable address components
export const addressSchema = z.object({
  street: z.string().min(1),
  unit: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  county: z.string().optional(),
});

// Pension schema for multiple pensions
export const pensionSchema = z.object({
  id: z.string().optional(),
  payerName: z.string().optional(),
  monthlyAmount: z.string().optional(),
  startDate: z.string().optional(),
});

// Client Management Schema
export const borrowerInfoSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  maritalStatus: z.enum(["Select", "single", "married", "divorced", "widowed"]).refine(val => val !== "Select", "Please select a marital status"),
  relationshipToBorrower: z.enum(["N/A", "spouse", "partner", "family", "friend", "other", "not-applicable"]).optional(),
  dateOfBirth: z.string().min(1),
  ssn: z.string().min(1),
  preferredContactTime: z.enum(["Select", "Morning", "Afternoon", "Evening"]).optional(),
  residenceAddress: addressSchema,
  yearsAtAddress: z.string().min(1),
  monthsAtAddress: z.string().optional(),
  priorResidenceAddress: addressSchema.partial().optional(),
  priorYearsAtAddress: z.string().optional(),
  priorMonthsAtAddress: z.string().optional(),
  subjectProperty: addressSchema.partial().optional(),
  leadRef: z.string().optional(),
  dmBatch: z.string().optional(),
  source: z.enum(["Select", "Direct Mail", "Social Media", "Client Referral", "Other"]).refine(val => !val || val !== "Select", "Please select a source").optional(),
  callDate: z.string().optional(),
  startDate: z.string().optional(),
  loanDuration: z.string().optional(),
});

export const incomeSchema = z.object({
  // Income type selections
  incomeTypes: z.object({
    employment: z.boolean().optional(),
    secondEmployment: z.boolean().optional(),
    selfEmployment: z.boolean().optional(),
    pension: z.boolean().optional(),
    socialSecurity: z.boolean().optional(),
    vaBenefits: z.boolean().optional(),
    disability: z.boolean().optional(),
    other: z.boolean().optional(),
  }).optional(),
  
  // Employment fields  
  employerName: z.string().optional(),
  jobTitle: z.string().optional(),
  monthlyIncome: z.string().optional(),
  monthlyBonusIncome: z.string().optional(),
  annualBonusIncome: z.string().optional(),
  employmentType: z.enum(["Full-Time", "Part-Time"]).optional(),
  yearsEmployedYears: z.string().optional(),
  yearsEmployedMonths: z.string().optional(),
  employerAddress: addressSchema.partial().optional(),
  employerPhone: z.string().optional(),
  employmentVerificationPhone: z.string().optional(),
  isShowingEmploymentVerification: z.boolean().optional(),
  employerRemote: z.string().optional(),
  
  // Prior Employment fields
  priorEmployerName: z.string().optional(),
  priorJobTitle: z.string().optional(),
  priorMonthlyIncome: z.string().optional(),
  priorMonthlyBonusIncome: z.string().optional(),
  priorAnnualBonusIncome: z.string().optional(),
  priorEmploymentType: z.enum(["Full-Time", "Part-Time"]).optional(),
  priorYearsEmployedYears: z.string().optional(),
  priorYearsEmployedMonths: z.string().optional(),
  priorEmployerAddress: addressSchema.partial().optional(),
  priorEmployerPhone: z.string().optional(),
  priorEmploymentVerificationPhone: z.string().optional(),
  priorIsShowingEmploymentVerification: z.boolean().optional(),
  priorEmployerRemote: z.string().optional(),
  
  // Second Employment fields
  secondEmployerName: z.string().optional(),
  secondJobTitle: z.string().optional(),
  secondMonthlyIncome: z.string().optional(),
  secondMonthlyBonusIncome: z.string().optional(),
  secondAnnualBonusIncome: z.string().optional(),
  secondEmploymentType: z.enum(["Full-Time", "Part-Time"]).optional(),
  secondYearsEmployedYears: z.string().optional(),
  secondYearsEmployedMonths: z.string().optional(),
  secondEmployerAddress: addressSchema.partial().optional(),
  secondEmployerPhone: z.string().optional(),
  secondEmploymentVerificationPhone: z.string().optional(),
  secondIsShowingEmploymentVerification: z.boolean().optional(),
  secondEmployerRemote: z.string().optional(),
  
  // Second Prior Employment fields (for cascading employment history)
  secondPriorEmployerName: z.string().optional(),
  secondPriorJobTitle: z.string().optional(),
  secondPriorMonthlyIncome: z.string().optional(),
  secondPriorMonthlyBonusIncome: z.string().optional(),
  secondPriorAnnualBonusIncome: z.string().optional(),
  secondPriorEmploymentType: z.enum(["Full-Time", "Part-Time"]).optional(),
  secondPriorYearsEmployedYears: z.string().optional(),
  secondPriorYearsEmployedMonths: z.string().optional(),
  secondPriorEmployerAddress: addressSchema.partial().optional(),
  secondPriorEmployerPhone: z.string().optional(),
  secondPriorEmploymentVerificationPhone: z.string().optional(),
  secondPriorIsShowingEmploymentVerification: z.boolean().optional(),
  secondPriorEmployerRemote: z.string().optional(),
  
  // Self-Employment fields
  businessName: z.string().optional(),
  businessMonthlyIncome: z.string().optional(),
  yearsInBusinessYears: z.string().optional(),
  yearsInBusinessMonths: z.string().optional(),
  businessAddress: addressSchema.partial().optional(),
  businessPhone: z.string().optional(),
  formationDate: z.string().optional(),
  formation: z.string().optional(),
  ownershipPercentage: z.string().optional(),
  taxesPreparedBy: z.string().optional(),
  businessDescription: z.string().optional(),
  grossAnnualRevenue: z.string().optional(),
  netAnnualRevenue: z.string().optional(),
  
  // Pension fields (multiple pensions)
  pensions: z.array(pensionSchema).optional(),
  
  // Social Security fields
  socialSecurityMonthlyAmount: z.string().optional(),
  socialSecurityStartDate: z.string().optional(),
  
  // VA Disability fields
  vaBenefitsMonthlyAmount: z.string().optional(),
  vaBenefitsStartDate: z.string().optional(),
  
  // Disability fields
  disabilityPayerName: z.string().optional(),
  disabilityMonthlyAmount: z.string().optional(),
  disabilityStartDate: z.string().optional(),
  
  // Other income fields
  otherIncomeDescription: z.string().optional(),
  otherIncomeMonthlyAmount: z.string().optional(),
  
  // DTI fields
  frontDTI: z.string().optional(),
  backDTI: z.string().optional(),
  guidelineDTI: z.string().optional(),
});

// Loan details schema for property loan information
export const loanDetailSchema = z.object({
  lenderName: z.string().optional(),
  loanNumber: z.string().optional(),
  mortgageBalance: z.string().optional(),
  piPayment: z.string().optional(),
  escrowPayment: z.string().optional(),
  totalMonthlyPayment: z.string().optional(),
  // Investment property rental fields
  isPropertyRented: z.string().optional(),
  monthlyRental: z.string().optional(),
  monthlyIncome: z.string().optional(),
  // Attached to Property fields for second and third loans (property ID)
  attachedToProperty: z.string().optional(),
  propertyAddress: z.object({
    street: z.string().optional(),
    unit: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    county: z.string().optional(),
  }).optional(),
});

// Individual property entry schema
export const propertyEntrySchema = z.object({
  id: z.string().min(1), // Required: stable ID for property attachment system
  use: z.enum(["primary", "second-home", "investment", "home-purchase"]).optional(),
  isSubject: z.boolean().optional(),
  address: addressSchema.partial().optional(),
  propertyType: z.string().optional(),
  estimatedValue: z.string().optional(),
  valuations: z.object({
    zillow: z.string().optional(),
    redfin: z.string().optional(),
    realtor: z.string().optional(),
  }).optional(),
  appraisedValue: z.string().optional(),
  ownedSince: z.string().optional(),
  purchasePrice: z.string().optional(),
  hoaFee: z.string().optional(),
  activeSecuredLoan: z.string().optional(), // For primary residence
  loan: loanDetailSchema.optional(),
  activeSecondLoan: z.string().optional(), // For second loan
  secondLoan: loanDetailSchema.optional(),
  ownedHeldBy: z.enum(["borrower", "borrower-coborrower", "borrower-others"]).optional(), // Property ownership
  activeThirdLoan: z.string().optional(), // For third loan
  thirdLoan: loanDetailSchema.optional(),
});

// Property section schema with multiple properties support
export const propertySchema = z.object({
  estimatedLTV: z.string().optional(),
  properties: z.array(propertyEntrySchema).optional(),
});

export const currentLoanSchema = z.object({
  currentLender: z.string().optional(),
  lenderName: z.string().optional(),
  loanNumber: z.string().optional(),
  loanStartDate: z.string().optional(),
  remainingTermPerCreditReport: z.string().optional(),
  currentBalance: z.string().optional(),
  currentRate: z.string().optional(),
  principalAndInterestPayment: z.string().optional(),
  escrowPayment: z.string().optional(),
  totalMonthlyPayment: z.string().optional(),
  monthlyPayment: z.string().optional(),
  hoaPayment: z.string().optional(),
  prepaymentPenalty: z.enum(['Yes - see notes', 'No']).optional(),
  statementBalance: z.object({
    mode: z.enum(['Statement Balance', 'Pay Off Demand']).optional(),
    amount: z.string().optional(),
  }).optional(),
  attachedToProperty: z.string().optional(), // Property ID for attachment system
  propertyAddress: z.object({
    street: z.string().optional(),
    unit: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    county: z.string().optional(),
  }).optional(),
  loanCategory: z.string().optional(),
  loanProgram: z.string().optional(),
  loanDuration: z.string().optional(),
  loanTerm: z.string().optional(),
  loanPurpose: z.string().optional(),
});

export const newLoanSchema = z.object({
  loanAmount: z.string().optional(),
  loanProgram: z.string().optional(),
  interestRate: z.string().optional(),
  loanTerm: z.string().optional(),
  loanPurpose: z.enum(["purchase", "refinance", "cash-out", ""]).optional(),
  monthlyPayment: z.string().optional(),
  lockPeriod: z.string().optional(),
});

export const vendorsSchema = z.object({
  realtor: z.string().optional(),
  appraiser: z.string().optional(),
  titleCompany: z.string().optional(),
  inspector: z.string().optional(),
  insurance: z.string().optional(),
  attorney: z.string().optional(),
});

export const clientSchema = z.object({
  id: z.string().optional(),
  // Borrower Information
  borrower: borrowerInfoSchema,
  coBorrower: borrowerInfoSchema.partial().optional(),
  // Additional Categories
  income: incomeSchema.optional(),
  coBorrowerIncome: incomeSchema.optional(),
  property: propertySchema.optional(),
  currentLoan: currentLoanSchema.optional(),
  secondLoan: currentLoanSchema.optional(),
  thirdLoan: currentLoanSchema.optional(),
  newLoan: newLoanSchema.optional(),
  vendors: vendorsSchema.optional(),
  // Metadata
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  status: z.enum(["active", "closed", "on-hold"]).default("active"),
});

export type Address = z.infer<typeof addressSchema>;
export type BorrowerInfo = z.infer<typeof borrowerInfoSchema>;
export type Income = z.infer<typeof incomeSchema>;
export type Property = z.infer<typeof propertySchema>;
export type CurrentLoan = z.infer<typeof currentLoanSchema>;
export type NewLoan = z.infer<typeof newLoanSchema>;
export type Vendors = z.infer<typeof vendorsSchema>;
export type Client = z.infer<typeof clientSchema>;

// Pre-approval form schema for the Get Approved forms
export const preApprovalDataSchema = z.object({
  // Borrower information
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  
  // Address fields
  streetAddress: z.string().min(1, "Street address is required"),
  unitApt: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  
  // Income information
  incomeSource: z.string().min(1, "Income source is required"),
  grossAnnualIncome: z.string().min(1, "Gross annual income is required"),
  
  // Loan details
  loanPurpose: z.string().min(1, "Loan purpose is required"),
  desiredLoanAmount: z.string().min(1, "Desired loan amount is required"),
  desiredCashAmount: z.string().optional(), // Only required for cash-out refinance
  downPayment: z.string().optional(), // Only required for purchase
  estimatedPropertyValue: z.string().min(1, "Estimated property value is required"),
  propertyType: z.string().min(1, "Property type is required"),
  intendedUse: z.string().min(1, "Intended use is required"),
  
  // Conditional fields for purchase
  firstTimeBuyer: z.string().optional(),
  timelineToPurchase: z.string().optional(),
  
  // Conditional field for refinance
  appraisalCompleted: z.string().optional(),
  
  // Additional information
  additionalInfo: z.string().optional(),
  
  // Co-borrower selection
  addCoBorrower: z.enum(["yes", "no"]).default("no"),
});

export const coBorrowerDataSchema = z.object({
  // Personal information
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  
  // Address fields (optional if same as borrower)
  streetAddress: z.string().optional(),
  unitApt: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  sameAsBorrower: z.boolean().default(false),
  
  // Income information
  incomeSource: z.string().min(1, "Income source is required"),
  grossAnnualIncome: z.string().min(1, "Gross annual income is required"),
});

export const preApprovalSubmissionSchema = z.object({
  preApprovalData: preApprovalDataSchema,
  coBorrowerData: coBorrowerDataSchema.optional(),
});

export type PreApprovalData = z.infer<typeof preApprovalDataSchema>;
export type CoBorrowerData = z.infer<typeof coBorrowerDataSchema>;
export type PreApprovalSubmission = z.infer<typeof preApprovalSubmissionSchema>;

// Create insert schema (excluding auto-generated fields)
export const insertClientSchema = clientSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClient = z.infer<typeof insertClientSchema>;
