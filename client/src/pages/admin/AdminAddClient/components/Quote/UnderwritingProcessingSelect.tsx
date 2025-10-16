import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface UnderwritingProcessingSelectProps {
  isProcessingMode: boolean;
  onProcessingModeChange: (value: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  testId?: string;
  className?: string;
}

const UnderwritingProcessingSelect = ({
  isProcessingMode,
  onProcessingModeChange,
  value,
  onValueChange,
  testId = 'select-underwriting',
  className = 'space-y-2'
}: UnderwritingProcessingSelectProps) => {
  const handleModeChange = (checked: boolean) => {
    onProcessingModeChange(checked);
    // Reset to default 'financed' when toggling
    onValueChange('financed');
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor={testId}>
          {isProcessingMode ? 'Processing' : 'Underwriting'}
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Switch
                checked={isProcessingMode}
                onCheckedChange={handleModeChange}
                data-testid="switch-processing-mode"
                className="scale-[0.8] hover:border-blue-600 hover:border-2"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isProcessingMode ? 'Underwriting' : 'Processing'}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger data-testid={testId}>
          <SelectValue placeholder="Financed" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="financed" data-testid={`${testId}-financed`}>
            Financed
          </SelectItem>
          <SelectItem value="not-financed" data-testid={`${testId}-not-financed`}>
            Not Financed
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UnderwritingProcessingSelect;
