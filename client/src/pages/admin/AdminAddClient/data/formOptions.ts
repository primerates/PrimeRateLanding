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