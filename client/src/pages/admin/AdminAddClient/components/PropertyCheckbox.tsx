import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PropertyCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  testId?: string;
}

const PropertyCheckbox = ({
  id,
  label,
  checked,
  onCheckedChange,
  testId
}: PropertyCheckboxProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
        data-testid={testId}
      />
      <Label htmlFor={id} className="font-medium">
        {label}
      </Label>
    </div>
  );
};

export default PropertyCheckbox;