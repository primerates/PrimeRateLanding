import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import SelectItems from './SelectItems';
import { type Option } from '../data/formOptions';

interface FormSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  testId?: string;
  className?: string;
  getOptionColor?: (value: string) => string;
  displayValue?: boolean; // If true, display option.value instead of option.label
}

const FormSelect = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = '',
  testId,
  className = 'space-y-2 max-w-[75%]',
  getOptionColor,
  displayValue = false
}: FormSelectProps) => {
  return (
    <div className={className}>
      <Label htmlFor={testId}>{label}</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger
          data-testid={testId}
          className={getOptionColor ? getOptionColor(value) : ''}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItems options={options} testIdPrefix={testId} displayValue={displayValue} />
        </SelectContent>
      </Select>
    </div>
  );
};

export default FormSelect;