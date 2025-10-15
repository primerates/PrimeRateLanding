import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DTIFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  animationClass?: string;
  testId?: string;
}

const DTIField: React.FC<DTIFieldProps> = ({
  control,
  name,
  label,
  isEditing,
  setIsEditing,
  animationClass = '',
  testId
}) => {
  // Format percentage value for display only
  const formatPercentageDisplay = (value: string | number | undefined): string => {
    if (!value && value !== 0) return '';
    const numericValue = typeof value === 'string' ? value.replace(/[^0-9.]/g, '') : value.toString();
    if (numericValue === '' || numericValue === '0') return numericValue === '0' ? '0%' : '';
    return `${numericValue}%`;
  };

  // Parse percentage input and return raw numeric value
  const parsePercentageInput = (input: string): string => {
    const numericValue = input.replace(/[^0-9.]/g, '');
    return numericValue;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`${name}-input`} className={`text-lg font-semibold ${animationClass}`}>
        {label}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const displayValue = formatPercentageDisplay(field.value);
          const hasValue = field.value && field.value.trim() !== '';
          
          return (
            <div className="min-h-[40px] flex items-center">
              {!isEditing && hasValue ? (
                <div
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer bg-navy-900 hover:bg-navy-800 text-white rounded-full w-20 h-20 flex items-center justify-center transition-colors duration-200"
                  style={{
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                    fontSize: '36px',
                    fontWeight: 600,
                    backgroundColor: '#1a3373',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                  }}
                  data-testid={testId ? `display-${testId}` : `display-${name}`}
                >
                  <span>
                    {displayValue.replace('%', '')}
                    <span style={{ fontSize: '28px' }}>%</span>
                  </span>
                </div>
              ) : (
                <Input
                  id={`${name}-input`}
                  value={displayValue}
                  onChange={(e) => {
                    const rawValue = parsePercentageInput(e.target.value);
                    field.onChange(rawValue);
                  }}
                  onBlur={() => {
                    if (hasValue) {
                      setIsEditing(false);
                    }
                  }}
                  onFocus={() => setIsEditing(true)}
                  placeholder="%"
                  autoFocus={isEditing && hasValue}
                  className="w-1/2"
                  data-testid={testId ? `input-${testId}` : `input-${name}`}
                />
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default DTIField;