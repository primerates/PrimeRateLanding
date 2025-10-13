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
  type?: string;
  maxLength?: number;
  required?: boolean;
  readOnly?: boolean;
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
  type = "text",
  maxLength,
  required = false,
  readOnly = false,
  onBlur
}: FormInputProps) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value || ''}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        readOnly={readOnly}
        className={readOnly ? 'bg-muted' : ''}
        data-testid={testId}
      />
    </div>
  );
};

export default FormInput;