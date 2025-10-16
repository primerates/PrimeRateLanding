import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ToggleAmountInputProps {
  fieldPrefix: string;
  fieldName: string;
  toggleFieldName?: string;
  defaultLabel: string;
  toggledLabel?: string;
  placeholder?: string;
  testId?: string;
  className?: string;
  showToggle?: boolean;
}

const ToggleAmountInput = ({
  fieldPrefix,
  fieldName,
  toggleFieldName,
  defaultLabel,
  toggledLabel,
  placeholder = "0",
  testId,
  className = "space-y-2",
  showToggle = true
}: ToggleAmountInputProps) => {
  const form = useFormContext();

  const fieldPath = `${fieldPrefix}.${fieldName}`;
  const toggleFieldPath = toggleFieldName ? `${fieldPrefix}.${toggleFieldName}` : undefined;
  const inputId = `${fieldPrefix}-${fieldName}`;
  const toggleTestId = `toggle-${fieldPrefix}-${fieldName}`;
  const inputTestId = testId || `input-${fieldPrefix}-${fieldName}`;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor={inputId} className="text-sm">
          {showToggle && toggleFieldPath && form.watch(toggleFieldPath as any) ? toggledLabel : defaultLabel}
        </Label>
        {showToggle && toggleFieldPath && (
          <Controller
            control={form.control}
            name={toggleFieldPath as any}
            defaultValue={false}
            render={({ field }) => (
              <Switch
                checked={!!field.value}
                onCheckedChange={field.onChange}
                data-testid={toggleTestId}
                className="scale-[0.8]"
              />
            )}
          />
        )}
      </div>
      <Controller
        control={form.control}
        name={fieldPath as any}
        defaultValue=""
        render={({ field }) => {
          const isToggled = showToggle && toggleFieldPath && form.watch(toggleFieldPath as any);
          
          if (isToggled) {
            // Toggled mode - regular text input
            return (
              <Input
                id={inputId}
                type="text"
                placeholder=""
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                className="focus-visible:ring-0 focus:outline-none focus:ring-0 focus:border-input focus:shadow-none"
                data-testid={inputTestId}
              />
            );
          }
          
          // Default mode - dollar value input with formatting
          const numVal = field.value ? field.value.replace(/[^\d]/g, '') : '';
          const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
          
          return (
            <div className="flex items-center border border-input bg-background px-3 rounded-md">
              <span className="text-muted-foreground text-sm">$</span>
              <Input
                id={inputId}
                type="text"
                placeholder={placeholder}
                value={displayValue}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  field.onChange(value);
                }}
                className="border-0 bg-transparent px-2 focus-visible:ring-0 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none"
                data-testid={inputTestId}
              />
            </div>
          );
        }}
      />
    </div>
  );
};

export default ToggleAmountInput;