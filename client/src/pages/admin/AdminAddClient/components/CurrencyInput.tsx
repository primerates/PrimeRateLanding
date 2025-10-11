import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CurrencyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  testId?: string;
  className?: string;
  placeholder?: string;
}

const CurrencyInput = ({
  label,
  value,
  onChange,
  id,
  testId,
  className = 'space-y-2',
  placeholder = ''
}: CurrencyInputProps) => {
  const [localValue, setLocalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Sync local value with prop value when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value || '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^\d.]/g, ''); // Only allow digits and decimal
    setLocalValue(inputValue);
    onChange(inputValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseFloat(localValue) || 0;
    const formatted = num > 0 ? `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '';
    setLocalValue(formatted);
    onChange(formatted);
  };

  const handleFocus = () => {
    setIsFocused(true);
    const raw = localValue.replace(/[^\d.]/g, ''); // Strip to raw for editing
    setLocalValue(raw);
    onChange(raw);
  };

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        data-testid={testId}
      />
    </div>
  );
};

export default CurrencyInput;