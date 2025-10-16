export interface Option {
  value: string;
  label: string;
  className?: string;
}

export interface LoanCategoryOption {
  value: string;
  label: string;
  testId: string;
}

// Stage Options
export const STAGE_OPTIONS: Option[] = [
  { value: 'Lead', label: 'Lead' },
  { value: 'Quote', label: 'Quote', className: 'text-orange-600' },
  { value: 'Loan Prep', label: 'Loan Prep' },
  { value: 'Loan', label: 'Loan' },
  { value: 'Funded', label: 'Funded', className: 'text-green-600' },
  { value: 'Audit', label: 'Audit', className: 'text-blue-600' },
  { value: 'Closed', label: 'Closed', className: 'text-green-600' },
  { value: 'Cancel', label: 'Cancel', className: 'text-red-600' },
  { value: 'Withdraw', label: 'Withdraw', className: 'text-red-600' }
];

export const getStageColor = (stage: string): string => {
  const option = STAGE_OPTIONS.find(opt => opt.value === stage);
  return option?.className || '';
};

// Source Options
export const BUILT_IN_SOURCES: Option[] = [
  { value: 'Direct Mail', label: 'Direct Mail' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Website', label: 'Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Repeat Client', label: 'Repeat Client' }
];

// Marital Status Options
export const MARITAL_STATUS_OPTIONS: Option[] = [
  { value: 'Select', label: 'Select' },
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' }
];

// Relationship Options
export const RELATIONSHIP_OPTIONS: Option[] = [
  { value: 'N/A', label: 'N/A' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'partner', label: 'Partner' },
  { value: 'family', label: 'Family' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
  { value: 'not-applicable', label: 'Not Applicable' }
];

// Contact Time Options
export const CONTACT_TIME_OPTIONS: Option[] = [
  { value: 'Select', label: 'Select' },
  { value: 'Morning', label: 'Morning' },
  { value: 'Afternoon', label: 'Afternoon' },
  { value: 'Evening', label: 'Evening' }
];

// Residence Type Options
export const RESIDENCE_TYPE_OPTIONS: Option[] = [
  { value: 'owned', label: 'Owned' },
  { value: 'rental', label: 'Rental' },
  { value: 'other', label: 'Other' }
];

// US States Options
export const US_STATES_OPTIONS: Option[] = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

// Formation Options for Self Employment
export const FORMATION_OPTIONS: Option[] = [
  { value: 'Sole Proprietorship', label: 'Sole Proprietorship' },
  { value: 'General Partnership (GP)', label: 'General Partnership (GP)' },
  { value: 'Limited Partnership (LP)', label: 'Limited Partnership (LP)' },
  { value: 'Limited Liability Partnership (LLP)', label: 'Limited Liability Partnership (LLP)' },
  { value: 'LLC taxed as S-Corp', label: 'LLC taxed as S-Corp' },
  { value: 'LLC taxed as C-Corp', label: 'LLC taxed as C-Corp' },
  { value: 'C Corporation (C-Corp)', label: 'C Corporation (C-Corp)' },
  { value: 'S Corporation (S-Corp)', label: 'S Corporation (S-Corp)' },
  { value: 'Benefit Corporation (B-Corp)', label: 'Benefit Corporation (B-Corp)' },
  { value: 'Close Corporation', label: 'Close Corporation' },
  { value: 'Non-Profit Corporation', label: 'Non-Profit Corporation' },
  { value: 'Professional Corporation (PC)', label: 'Professional Corporation (PC)' },
  { value: 'Professional LLC (PLLC)', label: 'Professional LLC (PLLC)' },
  { value: 'Joint Venture', label: 'Joint Venture' },
  { value: 'CPA', label: 'CPA' },
  { value: 'Other', label: 'Other' }
];

// Loan Category Options
export const LOAN_CATEGORY_OPTIONS: Option[] = [
  { value: 'select', label: 'Select' },
  { value: 'conventional', label: 'Conventional' },
  { value: 'conventional-jumbo', label: 'Conventional Jumbo' },
  { value: 'fha', label: 'FHA' },
  { value: 'va', label: 'VA' },
  { value: 'va-jumbo', label: 'VA Jumbo' },
  { value: 'other', label: 'Other' }
];

// Loan Purpose Options
export const LOAN_PURPOSE_OPTIONS: Option[] = [
  { value: 'select', label: 'Select' },
  { value: 'cash-out', label: 'Cash Out' },
  { value: 'rate-reduction', label: 'Rate Reduction' },
  { value: 'term-reduction', label: 'Term Reduction' },
  { value: 'other', label: 'Other' }
];

// Doc Type Options
export const DOC_TYPE_OPTIONS: Option[] = [
  { value: 'select', label: 'Select' },
  { value: 'full-doc', label: 'Full Doc' },
  { value: 'streamline', label: 'Streamline' },
  { value: 'irrrl', label: 'IRRRL' }
];

// Loan Term Options
export const LOAN_TERM_OPTIONS: Option[] = [
  { value: 'select', label: 'Select' },
  { value: '30-year-fixed', label: '30 Year Fixed' },
  { value: '25-year-fixed', label: '25 Year Fixed' },
  { value: '20-year-fixed', label: '20 Year Fixed' },
  { value: '15-year-fixed', label: '15 Year Fixed' },
  { value: '10-year-fixed', label: '10 Year Fixed' }
];

// Pre-Payment Penalty Options
export const PREPAYMENT_PENALTY_OPTIONS: Option[] = [
  { value: 'select', label: 'Select' },
  { value: 'No', label: 'No' },
  { value: 'Yes - 6 Months', label: 'Yes - 6 Months' },
  { value: 'Yes - 1 Year', label: 'Yes - 1 Year' },
  { value: 'Yes - 2 Years', label: 'Yes - 2 Years' },
  { value: 'Yes - 3 Years', label: 'Yes - 3 Years' },
  { value: 'Yes - 4 Years', label: 'Yes - 4 Years' },
  { value: 'Yes - 5 Years', label: 'Yes - 5 Years' }
];

// Rate Lock Status Options
export const RATE_LOCK_STATUS_OPTIONS: Option[] = [
  { value: 'select', label: 'Select' },
  { value: 'locked', label: 'Locked' },
  { value: 'not-locked', label: 'Not Locked' },
  { value: 'expired', label: 'Expired' },
  { value: 'extended', label: 'Extended' }
];

// Property Use Options
export const BUILT_IN_PROPERTY_USES: Option[] = [
  { value: 'primary-residence', label: 'Primary Residence' },
  { value: 'second-home', label: 'Second Home' },
  { value: 'investment-property', label: 'Investment Property' },
  { value: 'home-purchase', label: 'Home Purchase' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'multi-family', label: 'Multi-Family' }
];

// Property Type Options
export const BUILT_IN_PROPERTY_TYPES: Option[] = [
  { value: 'single-family', label: 'Single Family' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'multi-family', label: 'Multi-Family' },
  { value: 'other', label: 'Other' }
];

// US States Options
export const US_STATES: Option[] = [
  { value: 'select', label: 'Select' },
  { value: 'AL', label: 'AL' },
  { value: 'AK', label: 'AK' },
  { value: 'AZ', label: 'AZ' },
  { value: 'AR', label: 'AR' },
  { value: 'CA', label: 'CA' },
  { value: 'CO', label: 'CO' },
  { value: 'CT', label: 'CT' },
  { value: 'DE', label: 'DE' },
  { value: 'FL', label: 'FL' },
  { value: 'GA', label: 'GA' },
  { value: 'HI', label: 'HI' },
  { value: 'ID', label: 'ID' },
  { value: 'IL', label: 'IL' },
  { value: 'IN', label: 'IN' },
  { value: 'IA', label: 'IA' },
  { value: 'KS', label: 'KS' },
  { value: 'KY', label: 'KY' },
  { value: 'LA', label: 'LA' },
  { value: 'ME', label: 'ME' },
  { value: 'MD', label: 'MD' },
  { value: 'MA', label: 'MA' },
  { value: 'MI', label: 'MI' },
  { value: 'MN', label: 'MN' },
  { value: 'MS', label: 'MS' },
  { value: 'MO', label: 'MO' },
  { value: 'MT', label: 'MT' },
  { value: 'NE', label: 'NE' },
  { value: 'NV', label: 'NV' },
  { value: 'NH', label: 'NH' },
  { value: 'NJ', label: 'NJ' },
  { value: 'NM', label: 'NM' },
  { value: 'NY', label: 'NY' },
  { value: 'NC', label: 'NC' },
  { value: 'ND', label: 'ND' },
  { value: 'OH', label: 'OH' },
  { value: 'OK', label: 'OK' },
  { value: 'OR', label: 'OR' },
  { value: 'PA', label: 'PA' },
  { value: 'RI', label: 'RI' },
  { value: 'SC', label: 'SC' },
  { value: 'SD', label: 'SD' },
  { value: 'TN', label: 'TN' },
  { value: 'TX', label: 'TX' },
  { value: 'UT', label: 'UT' },
  { value: 'VT', label: 'VT' },
  { value: 'VA', label: 'VA' },
  { value: 'WA', label: 'WA' },
  { value: 'WV', label: 'WV' },
  { value: 'WI', label: 'WI' },
  { value: 'WY', label: 'WY' }
];

// Rate Buydown Options
export const RATE_BUYDOWN_OPTIONS: Option[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

// Escrow Reserves Options
export const ESCROW_RESERVES_OPTIONS: Option[] = [
  { value: 'new-escrow-reserves', label: 'New Escrow Reserves' },
  { value: 'escrow-not-included', label: 'Escrow Not Included' }
];

// Monthly Escrow Options
export const MONTHLY_ESCROW_OPTIONS: Option[] = [
  { value: 'includes-tax-insurance', label: 'Includes Tax & Insurance' },
  { value: 'includes-tax-only', label: 'Includes Tax Only' },
  { value: 'includes-insurance-only', label: 'Includes Insurance Only' }
];

// Lender Options
export const BUILT_IN_LENDERS: Option[] = [
  { value: 'uwm', label: 'UWM' },
  { value: 'pennymac', label: 'Pennymac' },
  { value: 'rocket-mortgage', label: 'Rocket Mortgage' },
  { value: 'wells-fargo', label: 'Wells Fargo' },
  { value: 'quicken-loans', label: 'Quicken Loans' }
];

// Title Options
export const BUILT_IN_TITLES: Option[] = [
  { value: 'first-american-title', label: 'First American Title' },
  { value: 'reltco', label: 'Reltco' },
  { value: 'chicago-title', label: 'Chicago Title' },
  { value: 'fidelity-national', label: 'Fidelity National' },
  { value: 'old-republic', label: 'Old Republic' }
];

// Loan Category Options
export const VA_OPTIONS: LoanCategoryOption[] = [
  { value: 'VA - Cash Out', label: 'Cash Out', testId: 'option-category-va-cash-out' },
  { value: 'VA - Purchase', label: 'Purchase', testId: 'option-category-va-purchase' },
  { value: 'VA - Rate & Term', label: 'Rate & Term', testId: 'option-category-va-rate-term' },
  { value: 'VA - IRRRL', label: 'IRRRL', testId: 'option-category-va-irrrl' }
];

export const VA_JUMBO_OPTIONS: LoanCategoryOption[] = [
  { value: 'VA Jumbo - Cash Out', label: 'Cash Out', testId: 'option-category-va-jumbo-cash-out' },
  { value: 'VA Jumbo - Purchase', label: 'Purchase', testId: 'option-category-va-jumbo-purchase' },
  { value: 'VA Jumbo - Rate & Term', label: 'Rate & Term', testId: 'option-category-va-jumbo-rate-term' },
  { value: 'VA Jumbo - IRRRL', label: 'IRRRL', testId: 'option-category-va-jumbo-irrrl' }
];

export const FANNIE_CONV_OPTIONS: LoanCategoryOption[] = [
  { value: 'Fannie Conv - Cash Out', label: 'Cash Out', testId: 'option-category-fannie-conv-cash-out' },
  { value: 'Fannie Conv - Purchase', label: 'Purchase', testId: 'option-category-fannie-conv-purchase' },
  { value: 'Fannie Conv - Rate & Term', label: 'Rate & Term', testId: 'option-category-fannie-conv-rate-term' },
  { value: 'Fannie Conv - Streamline', label: 'Streamline', testId: 'option-category-fannie-conv-streamline' }
];

export const FANNIE_JUMBO_OPTIONS: LoanCategoryOption[] = [
  { value: 'Fannie Jumbo - Cash Out', label: 'Cash Out', testId: 'option-category-fannie-jumbo-cash-out' },
  { value: 'Fannie Jumbo - Purchase', label: 'Purchase', testId: 'option-category-fannie-jumbo-purchase' },
  { value: 'Fannie Jumbo - Rate & Term', label: 'Rate & Term', testId: 'option-category-fannie-jumbo-rate-term' },
  { value: 'Fannie Jumbo - Streamline', label: 'Streamline', testId: 'option-category-fannie-jumbo-streamline' }
];

export const FHA_OPTIONS: LoanCategoryOption[] = [
  { value: 'FHA - Cash Out', label: 'Cash Out', testId: 'option-category-fha-cash-out' },
  { value: 'FHA - Purchase', label: 'Purchase', testId: 'option-category-fha-purchase' },
  { value: 'FHA - Rate & Term', label: 'Rate & Term', testId: 'option-category-fha-rate-term' },
  { value: 'FHA - Streamline', label: 'Streamline', testId: 'option-category-fha-streamline' }
];

export const NON_QM_OPTIONS: LoanCategoryOption[] = [
  { value: 'Non-QM - Cash Out', label: 'Cash Out', testId: 'option-category-non-qm-cash-out' },
  { value: 'Non-QM - Purchase', label: 'Purchase', testId: 'option-category-non-qm-purchase' },
  { value: 'Non-QM - Rate & Term', label: 'Rate & Term', testId: 'option-category-non-qm-rate-term' }
];

export const SECOND_LOAN_OPTIONS: LoanCategoryOption[] = [
  { value: 'Second Loan - HELOC', label: 'HELOC', testId: 'option-category-second-loan-heloc' },
  { value: 'Second Loan - Fixed Second', label: 'Fixed Second', testId: 'option-category-second-loan-fixed-second' }
];