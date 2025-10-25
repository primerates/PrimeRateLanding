import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CurrencyInputWithToggleProps {
  fieldPrefix: string;
  fieldName: string;
  toggleFieldName?: string;
  defaultLabel: string;
  toggledLabel?: string;
  toggledLabel2?: string;
  testId?: string;
  className?: string;
  showToggle?: boolean;
  readOnly?: boolean;
  bgMuted?: boolean;
  tripleToggle?: boolean;
  calculateValue?: (form: any) => string;
}

const CurrencyInputWithToggle = ({
  fieldPrefix,
  fieldName,
  toggleFieldName,
  defaultLabel,
  toggledLabel,
  toggledLabel2,
  testId,
  className = "space-y-2",
  showToggle = true,
  readOnly = false,
  bgMuted = false,
  tripleToggle = false,
  calculateValue
}: CurrencyInputWithToggleProps) => {
  const form = useFormContext();

  const fieldPath = `${fieldPrefix}.${fieldName}`;
  const toggleFieldPath = toggleFieldName ? `${fieldPrefix}.${toggleFieldName}` : undefined;
  const inputId = `${fieldPrefix}-${fieldName}`;
  const toggleTestId = `toggle-${fieldPrefix}-${fieldName.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
  const inputTestId = testId || `input-${fieldPrefix}-${fieldName}`;

  // Watch all form values to trigger recalculation when dependencies change
  const formValues = form.watch();

  // Automatically update the form field with calculated value
  useEffect(() => {
    if (calculateValue) {
      const calculatedVal = calculateValue(form);
      const currentValue = form.getValues(fieldPath as any);
      // Only update if the calculated value is different from current value
      if (calculatedVal !== currentValue) {
        form.setValue(fieldPath as any, calculatedVal);
      }
    }
  }, [formValues, calculateValue, form, fieldPath]);

  const getLabel = () => {
    if (!showToggle || !toggleFieldPath) return defaultLabel;

    if (tripleToggle) {
      const toggleValue = form.watch(toggleFieldPath as any);
      if (toggleValue === "tax-only") return toggledLabel;
      if (toggleValue === "insurance-only") return toggledLabel2;
      return defaultLabel;
    }

    return form.watch(toggleFieldPath as any) ? toggledLabel : defaultLabel;
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor={inputId} className="text-sm">
          {getLabel()}
        </Label>
        {showToggle && toggleFieldPath && (
          <Controller
            control={form.control}
            name={toggleFieldPath as any}
            defaultValue={tripleToggle ? "" : false}
            render={({ field }) => (
              <Switch
                checked={!!field.value}
                onCheckedChange={tripleToggle ? () => {
                  const currentValue = field.value;
                  if (!currentValue || currentValue === "") {
                    field.onChange("tax-only");
                  } else if (currentValue === "tax-only") {
                    field.onChange("insurance-only");
                  } else {
                    field.onChange("");
                  }
                } : field.onChange}
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
          // Use calculated value if provided, otherwise use field value
          const displayValue = calculateValue ? calculateValue(form) : field.value;

          return (
            <div className={`flex items-center border border-input ${bgMuted ? 'bg-muted' : 'bg-background'} px-3 rounded-md`}>
              <span className="text-muted-foreground text-sm">$</span>
              <Input
                id={inputId}
                type="text"
                placeholder="0"
                value={displayValue}
                onChange={(e) => {
                  if (!calculateValue && !readOnly) {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    field.onChange(value);
                  }
                }}
                onBlur={(e) => {
                  if (!calculateValue && !readOnly) {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    const formatted = value ? Number(value).toLocaleString() : '';
                    form.setValue(fieldPath as any, formatted);
                  }
                }}
                readOnly={readOnly}
                className={`border-0 bg-transparent px-2 focus-visible:ring-0 ${readOnly ? 'cursor-not-allowed' : ''}`}
                data-testid={inputTestId}
              />
            </div>
          );
        }}
      />
    </div>
  );
};

export default CurrencyInputWithToggle;
