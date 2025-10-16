import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface CalculatedEstimatedInputProps {
  label?: string;
  estimatedLabel?: string;
  isEstimateMode: boolean;
  onEstimateModeChange: (value: boolean) => void;

  // For Estimated mode (Input)
  estimatedValue: string;
  onEstimatedValueChange: (value: string) => void;

  // For Calculated mode (Display)
  calculatedValue: string;

  // Input customization
  maxLength?: number;
  suffix?: string; // e.g., '%' for LTV
  placeholder?: string;
  testId?: string;
  className?: string;
}

const CalculatedEstimatedInput = ({
  label = 'Calculated Value',
  estimatedLabel = 'Estimated Value',
  isEstimateMode,
  onEstimateModeChange,
  estimatedValue,
  onEstimatedValueChange,
  calculatedValue,
  maxLength = 3,
  suffix = '',
  placeholder = '',
  testId = 'calculated-estimated-input',
  className = 'space-y-2'
}: CalculatedEstimatedInputProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters and limit length
    const value = e.target.value.replace(/[^\d]/g, '').slice(0, maxLength);
    onEstimatedValueChange(value);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor={isEstimateMode ? `${testId}-input` : testId}>
          {isEstimateMode ? estimatedLabel : label}
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Switch
                checked={isEstimateMode}
                onCheckedChange={onEstimateModeChange}
                data-testid={`switch-${testId}`}
                className="scale-[0.8] hover:border-blue-600 hover:border-2"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isEstimateMode ? label : estimatedLabel}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {isEstimateMode ? (
        /* Estimated Input Mode */
        <Input
          id={`${testId}-input`}
          type="text"
          placeholder={placeholder}
          value={estimatedValue ? `${estimatedValue}${suffix}` : ''}
          onChange={handleInputChange}
          className="w-full"
          data-testid={`input-${testId}`}
        />
      ) : (
        /* Calculated Display Mode */
        <div className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm transition-colors items-center">
          <span className="font-medium" data-testid={`text-${testId}`}>
            {calculatedValue || ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default CalculatedEstimatedInput;
