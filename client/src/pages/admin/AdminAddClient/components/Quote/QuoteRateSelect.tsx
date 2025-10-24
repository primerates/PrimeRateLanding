import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown } from 'lucide-react';

interface QuoteRateSelectProps {
  selectedRateIds: number[];
  onSelectedRateIdsChange: (rateIds: number[]) => void;
  isEnabled: boolean;
  disabledMessage?: string;
  testId?: string;
  className?: string;
}

const QuoteRateSelect = ({
  selectedRateIds,
  onSelectedRateIdsChange,
  isEnabled,
  disabledMessage = 'Complete all other fields to unlock rate selection',
  testId = 'button-quote-select',
  className = 'space-y-2'
}: QuoteRateSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRateToggle = (rateId: number, checked: boolean) => {
    if (checked) {
      const newIds = [...selectedRateIds, rateId].sort((a, b) => a - b);
      onSelectedRateIdsChange(newIds);
    } else {
      const newIds = selectedRateIds.filter(id => id !== rateId);
      onSelectedRateIdsChange(newIds);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedRateIdsChange([0, 1, 2, 3]);
    } else {
      onSelectedRateIdsChange([]);
    }
  };

  const getButtonText = () => {
    if (selectedRateIds.length === 0) {
      return "Select";
    } else if (selectedRateIds.length === 1) {
      return `Rate ${selectedRateIds[0] + 1}`;
    } else {
      return `${selectedRateIds.length} Rates (${selectedRateIds.map(id => id + 1).join(', ')})`;
    }
  };

  const isAllSelected = selectedRateIds.length === 4 &&
    selectedRateIds.includes(0) &&
    selectedRateIds.includes(1) &&
    selectedRateIds.includes(2) &&
    selectedRateIds.includes(3);

  return (
    <div className={className}>
      <Label htmlFor="quote-select">Quote</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
            data-testid={testId}
          >
            {getButtonText()}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-3" align="start">
          <div className="space-y-2">
            {!isEnabled ? (
              <>
                {/* Individual rate checkboxes */}
                {[0, 1, 2, 3].map((rateId) => (
                  <div key={rateId} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rate-${rateId}`}
                      checked={selectedRateIds.includes(rateId)}
                      onCheckedChange={(checked) => handleRateToggle(rateId, checked as boolean)}
                      data-testid={`checkbox-rate-${rateId + 1}`}
                    />
                    <Label htmlFor={`rate-${rateId}`} className="text-sm cursor-pointer">
                      Rate {rateId + 1}
                    </Label>
                  </div>
                ))}

                {/* Select All Four checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-rates"
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    data-testid="checkbox-select-all-rates"
                  />
                  <Label htmlFor="select-all-rates" className="text-sm font-medium cursor-pointer">
                    Select All Four
                  </Label>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                {disabledMessage}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default QuoteRateSelect;
