import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PhoneInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
  testId?: string;
  className?: string;
  placeholder?: string;
}

const PhoneInput = ({
  label,
  value,
  onChange,
  id,
  testId,
  className = 'space-y-2',
  placeholder = ''
}: PhoneInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
    let formatted = '';
    
    if (inputValue.length > 0) {
      formatted = inputValue.substring(0, 3);
      if (inputValue.length > 3) {
        formatted += '-' + inputValue.substring(3, 6);
        if (inputValue.length > 6) {
          formatted += '-' + inputValue.substring(6, 10);
        }
      }
    }
    
    onChange(formatted);
  };

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={12}
        data-testid={testId}
      />
    </div>
  );
};

export default PhoneInput;