import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  testId?: string;
  className?: string;
  showInfoIcon?: boolean;
  infoTitle?: string;
  infoDescription?: string;
  onInfoClick?: () => void;
  infoButtonTestId?: string;
}

const DateInput = ({
  label,
  value,
  onChange,
  id,
  placeholder = "MM/DD/YYYY",
  testId,
  className = "space-y-2 max-w-[75%]",
  showInfoIcon = false,
  infoTitle = "Information",
  infoDescription = "",
  onInfoClick,
  infoButtonTestId
}: DateInputProps) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
    let formatted = '';
    
    if (inputValue.length > 0) {
      formatted = inputValue.substring(0, 2);
      if (inputValue.length > 2) {
        formatted += '/' + inputValue.substring(2, 4);
        if (inputValue.length > 4) {
          formatted += '/' + inputValue.substring(4, 8);
        }
      }
    }
    
    onChange(formatted);
  };

  return (
    <div className={className}>
      <div className="min-h-5 flex items-center gap-2">
        <Label htmlFor={id}>{label}</Label>
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
      <Input
        id={id}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={10}
        data-testid={testId}
      />
    </div>
  );
};

export default DateInput;