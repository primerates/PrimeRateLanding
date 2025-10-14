export interface Option {
  value: string;
  label: string;
  className?: string;
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