import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import SelectItems from './SelectItems';
import { type Option } from '../data/formOptions';

interface FormSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  testId?: string;
  className?: string;
  getOptionColor?: (value: string) => string;
  displayValue?: boolean; // If true, display option.value instead of option.label
  showInfoIcon?: boolean;
  infoTitle?: string;
  infoDescription?: string;
  onInfoClick?: () => void;
  infoButtonTestId?: string;
  disabled?: boolean;
}

const FormSelect = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = '',
  testId,
  className = 'space-y-2 max-w-[75%]',
  getOptionColor,
  displayValue = false,
  showInfoIcon = false,
  infoTitle = 'Information',
  infoDescription = '',
  onInfoClick,
  infoButtonTestId,
  disabled = false
}: FormSelectProps) => {
  return (
    <div className={className}>
      <div className="min-h-5 flex items-center gap-2">
        <Label htmlFor={testId}>{label}</Label>
        {showInfoIcon && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-1 h-auto text-blue-600 hover:text-blue-800"
                onClick={onInfoClick}
                data-testid={infoButtonTestId}
              >
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={15} className="text-sm">
              {infoTitle}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          data-testid={testId}
          className={`${getOptionColor ? getOptionColor(value) : ''} ${disabled ? 'bg-muted' : ''}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItems options={options} testIdPrefix={testId} displayValue={displayValue} />
        </SelectContent>
      </Select>
    </div>
  );
};

export default FormSelect;