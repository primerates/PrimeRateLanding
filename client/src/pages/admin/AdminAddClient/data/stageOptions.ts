export interface Option {
  value: string;
  label: string;
  className?: string;
}

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