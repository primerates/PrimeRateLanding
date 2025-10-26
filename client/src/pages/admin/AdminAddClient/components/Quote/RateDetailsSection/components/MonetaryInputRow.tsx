import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '../utils/formatters';

interface MonetaryInputRowProps {
  label: string;
  values: string[];
  selectedRateIds: number[];
  onChange: (rateId: number, value: string) => void;
  isSameMode?: boolean;
  onToggleSameMode?: () => void;
  disabled?: boolean;
  testIdPrefix: string;
  gridCols: string;
  labelClassName?: string;
  showSameToggle?: boolean;
}

/**
 * Reusable row component for monetary input fields
 * Displays a label and input fields for each selected rate
 */
const MonetaryInputRow = ({
  label,
  values,
  selectedRateIds,
  onChange,
  isSameMode = false,
  onToggleSameMode,
  disabled = false,
  testIdPrefix,
  gridCols,
  labelClassName = 'text-base font-semibold text-right',
  showSameToggle = false
}: MonetaryInputRowProps) => {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
      <div className="flex items-center justify-end pr-4">
        {showSameToggle && onToggleSameMode ? (
          <button
            type="button"
            onClick={onToggleSameMode}
            className={`${labelClassName} hover:text-blue-600 cursor-pointer`}
            data-testid={`button-${testIdPrefix}-toggle`}
          >
            {isSameMode ? 'Same' : label}
          </button>
        ) : (
          <Label className={labelClassName}>{label}</Label>
        )}
      </div>
      {selectedRateIds.map((rateId) => {
        const displayValue = formatCurrency(values[rateId] || '');

        return (
          <div key={rateId} className="flex justify-center">
            <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
              <span className="text-muted-foreground text-sm">$</span>
              <Input
                type="text"
                placeholder=""
                value={displayValue}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  onChange(rateId, value);
                }}
                disabled={disabled}
                className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-100"
                data-testid={`${testIdPrefix}-${rateId}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonetaryInputRow;
