import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SSNInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
  testId?: string;
  className?: string;
}

const SSNInput = ({
  label,
  value,
  onChange,
  id,
  testId,
  className = 'space-y-2'
}: SSNInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
    let formatted = inputValue;
    
    // Format as XXX-XX-XXXX
    if (inputValue.length >= 6) {
      formatted = `${inputValue.slice(0, 3)}-${inputValue.slice(3, 5)}-${inputValue.slice(5, 9)}`;
    } else if (inputValue.length >= 4) {
      formatted = `${inputValue.slice(0, 3)}-${inputValue.slice(3)}`;
    } else if (inputValue.length >= 1) {
      // Keep as is for first 3 digits
      formatted = inputValue;
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
        placeholder="XXX-XX-XXXX"
        maxLength={11}
        data-testid={testId}
      />
    </div>
  );
};

export default SSNInput;