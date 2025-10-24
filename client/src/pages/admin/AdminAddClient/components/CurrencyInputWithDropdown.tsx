import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LabelOption {
  value: string;
  label: string;
}

interface CurrencyInputWithDropdownProps {
  fieldPrefix: string;
  fieldName: string;
  labelOptions: LabelOption[];
  selectorFieldName?: string;
  testId?: string;
  className?: string;
}

const CurrencyInputWithDropdown = ({
  fieldPrefix,
  fieldName,
  labelOptions,
  selectorFieldName,
  testId,
  className = "space-y-2"
}: CurrencyInputWithDropdownProps) => {
  const form = useFormContext();
  const [isOpen, setIsOpen] = React.useState(false);

  const fieldPath = `${fieldPrefix}.${fieldName}`;
  const selectorFieldPath = selectorFieldName ? `${fieldPrefix}.${selectorFieldName}` : undefined;
  const inputId = `${fieldPrefix}-${fieldName}`;
  const inputTestId = testId || `input-${fieldPrefix}-${fieldName}`;
  const selectorTestId = `select-${fieldPrefix}-${selectorFieldName}`;

  // Get the current selected label
  const getCurrentLabel = () => {
    if (!selectorFieldPath) return labelOptions[0]?.label || '';

    const selectedValue = form.watch(selectorFieldPath as any) || labelOptions[0]?.value;
    const selectedOption = labelOptions.find(opt => opt.value === selectedValue);
    return selectedOption?.label || labelOptions[0]?.label || '';
  };

  return (
    <div className={className}>
      {/* Row 1: Label with Dropdown */}
      <div className="mb-2">
        {selectorFieldPath && (
          <Controller
            control={form.control}
            name={selectorFieldPath as any}
            defaultValue={labelOptions[0]?.value || ''}
            render={({ field }) => (
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full text-sm font-medium text-left hover:text-primary transition-colors"
                    data-testid={selectorTestId}
                  >
                    <span>{getCurrentLabel()}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-2" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[250px]">
                  {labelOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => {
                        field.onChange(option.value);
                        setIsOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <span className={field.value === option.value ? 'font-semibold' : ''}>
                        {field.value === option.value && '✓ '}
                        {option.label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        )}
      </div>

      {/* Row 2: Currency Input */}
      <Controller
        control={form.control}
        name={fieldPath as any}
        defaultValue=""
        render={({ field }) => {
          return (
            <div className="flex items-center border border-input bg-background px-3 rounded-md">
              <span className="text-muted-foreground text-sm">$</span>
              <Input
                id={inputId}
                type="text"
                placeholder="0"
                value={field.value}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  field.onChange(value);
                }}
                onBlur={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  const formatted = value ? Number(value).toLocaleString() : '';
                  form.setValue(fieldPath as any, formatted);
                }}
                className="border-0 bg-transparent px-2 focus-visible:ring-0"
                data-testid={inputTestId}
              />
            </div>
          );
        }}
      />
    </div>
  );
};

export default CurrencyInputWithDropdown;
