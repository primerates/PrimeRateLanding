export interface SourceOption {
  value: string;
  label: string;
}

export const BUILT_IN_SOURCES: SourceOption[] = [
  { value: 'Direct Mail', label: 'Direct Mail' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Website', label: 'Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Repeat Client', label: 'Repeat Client' }
];