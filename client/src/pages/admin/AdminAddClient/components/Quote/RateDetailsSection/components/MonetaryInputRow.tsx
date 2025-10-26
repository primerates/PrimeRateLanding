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
  showInfoIcon?: boolean;
  onInfoClick?: () => void;
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
  showSameToggle = false,
  showInfoIcon = false,
  onInfoClick
}: MonetaryInputRowProps) => {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
      <div className="flex items-center justify-end pr-4 gap-2">
        {showInfoIcon && onInfoClick && (
          <button
            type="button"
            onClick={onInfoClick}
            className="h-4 w-4 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            data-testid="icon-info-rate-buy-down"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </button>
        )}
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
