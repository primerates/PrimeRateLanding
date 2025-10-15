import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FormCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  testId?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

const FormCheckbox = ({
  id,
  label,
  checked,
  onCheckedChange,
  testId,
  disabled = false,
  className = "",
  labelClassName = ""
}: FormCheckboxProps) => {
  // Default styling for both property and loan checkboxes
  const defaultCheckboxClass = "transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg] border-black";
  const defaultLabelClass = "font-medium text-black";
  
  // Add conditional styling based on checked state and disabled state
  const checkboxClasses = `${defaultCheckboxClass} ${
    checked ? 'pointer-events-none opacity-75' : ''
  } ${className}`;
  
  const labelClasses = `${defaultLabelClass} ${
    checked ? 'pointer-events-none opacity-75' : 'cursor-pointer'
  } ${labelClassName}`;

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={checkboxClasses}
        data-testid={testId}
      />
      <Label 
        htmlFor={id} 
        className={labelClasses}
      >
        {label}
      </Label>
    </div>
  );
};

export default FormCheckbox;