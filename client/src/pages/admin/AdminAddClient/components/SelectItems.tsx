import { SelectItem } from '@/components/ui/select';
import { STAGE_OPTIONS, type Option } from '../data/formOptions';

interface SelectItemsProps {
  options?: Option[];
  testIdPrefix?: string;
  displayValue?: boolean; // If true, display option.value instead of option.label
}

const SelectItems = ({ 
  options = STAGE_OPTIONS, 
  testIdPrefix,
  displayValue = false
}: SelectItemsProps) => {
  return (
    <>
      {options.map((option) => (
        <SelectItem 
          key={option.value} 
          value={option.value}
          className={option.className}
          data-testid={testIdPrefix ? `${testIdPrefix}-${option.value.toLowerCase().replace(/\s+/g, '-')}` : undefined}
        >
          {displayValue ? option.value : option.label}
        </SelectItem>
      ))}
    </>
  );
};

export default SelectItems;