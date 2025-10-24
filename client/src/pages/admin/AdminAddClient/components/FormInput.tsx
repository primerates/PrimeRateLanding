import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  testId?: string;
  className?: string;
  labelClassName?: string;
  type?: string;
  maxLength?: number;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const FormInput = ({
  label,
  value,
  onChange,
  id,
  placeholder = '',
  testId,
  className = "space-y-2 max-w-[75%]",
  labelClassName = "",
  type = "text",
  maxLength,
  required = false,
  readOnly = false,
  disabled = false,
  onBlur
}: FormInputProps) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={className}>
      <div className="min-h-5 flex items-center gap-2">
        <Label htmlFor={id} className={labelClassName}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      <Input
        id={id}
        type={type}
        value={value || ''}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        readOnly={readOnly}
        disabled={disabled}
        className={readOnly || disabled ? 'bg-muted' : ''}
        data-testid={testId}
      />
    </div>
  );
};

export default FormInput;