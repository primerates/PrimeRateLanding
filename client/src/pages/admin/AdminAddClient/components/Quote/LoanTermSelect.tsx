import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface LoanTermOption {
  value: string;
  label: string;
}

interface LoanTermSelectProps {
  label?: string;
  customLabel?: string;
  isCustomMode: boolean;
  onCustomModeChange: (value: boolean) => void;
  selectValue: string;
  onSelectChange: (value: string) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  selectOptions?: LoanTermOption[];
  inputValidation?: RegExp;
  testId?: string;
  className?: string;
}

const DEFAULT_OPTIONS: LoanTermOption[] = [
  { value: 'select', label: 'Select' },
  { value: '30-years', label: '30' },
  { value: '25-years', label: '25' },
  { value: '20-years', label: '20' },
  { value: '18-years', label: '18' },
  { value: '15-years', label: '15' },
  { value: '12-years', label: '12' },
  { value: '10-years', label: '10' }
];

const LoanTermSelect = ({
  label = 'Loan Term / Years',
  customLabel = 'Custom Term / Years',
  isCustomMode,
  onCustomModeChange,
  selectValue,
  onSelectChange,
  inputValue,
  onInputChange,
  selectOptions = DEFAULT_OPTIONS,
  inputValidation = /^\d{1,2}$/,
  testId = 'select-loan-term',
  className = 'space-y-2 max-w-[75%]'
}: LoanTermSelectProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or validate against pattern
    if (value === '' || inputValidation.test(value)) {
      onInputChange(value);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor={isCustomMode ? 'custom-term-input' : testId}>
          {isCustomMode ? customLabel : label}
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Switch
                checked={isCustomMode}
                onCheckedChange={onCustomModeChange}
                data-testid="switch-custom-term"
                className="scale-[0.8] hover:border-blue-600 hover:border-2"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCustomMode ? label : customLabel}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {!isCustomMode ? (
        <Select value={selectValue} onValueChange={onSelectChange}>
          <SelectTrigger data-testid={testId}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                data-testid={`${testId}-${option.value}`}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id="custom-term-input"
          type="text"
          placeholder=""
          value={inputValue}
          onChange={handleInputChange}
          data-testid="input-custom-term"
        />
      )}
    </div>
  );
};

export default LoanTermSelect;
