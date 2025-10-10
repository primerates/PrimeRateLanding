import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  testId?: string;
  className?: string;
}

const DateInput = ({
  label,
  value,
  onChange,
  id,
  placeholder = "MM/DD/YYYY",
  testId,
  className = "space-y-2 max-w-[75%]"
}: DateInputProps) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
    let formatted = '';
    
    if (inputValue.length > 0) {
      formatted = inputValue.substring(0, 2);
      if (inputValue.length > 2) {
        formatted += '/' + inputValue.substring(2, 4);
        if (inputValue.length > 4) {
          formatted += '/' + inputValue.substring(4, 8);
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
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={10}
        data-testid={testId}
      />
    </div>
  );
};

export default DateInput;