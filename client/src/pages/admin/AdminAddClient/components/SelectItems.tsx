import { SelectItem } from '@/components/ui/select';
import { STAGE_OPTIONS, type Option } from '../data/stageOptions';

interface SelectItemsProps {
  options?: Option[];
  testIdPrefix?: string;
}

const SelectItems = ({ 
  options = STAGE_OPTIONS, 
  testIdPrefix 
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
          {option.label}
        </SelectItem>
      ))}
    </>
  );
};

export default SelectItems;