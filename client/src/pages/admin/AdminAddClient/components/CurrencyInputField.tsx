import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';

interface CurrencyInputFieldProps {
  name: string;
  id?: string;
  placeholder?: string;
  testId?: string;
  shadowColor?: 'green' | 'red' | 'none';
  className?: string;
}

/**
 * Generic CurrencyInput component that integrates with react-hook-form
 * - Formats currency on blur ($1,234)
 * - Strips to raw number on focus for easy editing
 * - Real-time form updates during typing
 * - Supports optional shadow styling for visual feedback
 */
const CurrencyInputField = ({
  name,
  id,
  placeholder = '$0.00',
  testId,
  shadowColor = 'none',
  className = ''
}: CurrencyInputFieldProps) => {
  const form = useFormContext<InsertClient>();
  const [localValue, setLocalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Watch the form value
  const formValue = form.watch(name as any);

  // Sync local value with form value when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(formValue || '');
    }
  }, [formValue, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, ''); // Only allow digits and decimal
    setLocalValue(value);

    // Update form with raw value for real-time updates
    form.setValue(name as any, value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseFloat(localValue) || 0;
    const formatted = num > 0 ? `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '';
    setLocalValue(formatted);
    form.setValue(name as any, formatted);
  };

  const handleFocus = () => {
    setIsFocused(true);
    const raw = localValue.replace(/[^\d.]/g, ''); // Strip to raw for editing
    setLocalValue(raw);
  };

  // Apply shadow styling based on color - keep border black
  const getShadowClass = () => {
    if (shadowColor === 'green') {
      return 'shadow-lg shadow-green-200';
    } else if (shadowColor === 'red') {
      return 'shadow-lg shadow-red-200';
    }
    return '';
  };

  return (
    <Input
      id={id}
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      data-testid={testId}
      className={`${getShadowClass()} ${className}`.trim()}
    />
  );
};

export default CurrencyInputField;
