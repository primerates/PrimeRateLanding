import { Card, CardContent } from '@/components/ui/card';
import MonetaryInputRow from './MonetaryInputRow';

interface ExistingLoanCardProps {
  selectedRateIds: number[];
  existingLoanBalanceValues: string[];
  setExistingLoanBalanceValues: (values: string[]) => void;
  isExistingLoanBalanceSameMode: boolean;
  setIsExistingLoanBalanceSameMode: (mode: boolean) => void;
  cashOutAmountValues: string[];
  setCashOutAmountValues: (values: string[]) => void;
  isCashOutSameMode: boolean;
  setIsCashOutSameMode: (mode: boolean) => void;
  showCashOut: boolean;
  columnWidth: string;
  gridCols: string;
}

/**
 * Card component for Existing Loan Balance and Cash Out Amount
 */
const ExistingLoanCard = ({
  selectedRateIds,
  existingLoanBalanceValues,
  setExistingLoanBalanceValues,
  isExistingLoanBalanceSameMode,
  setIsExistingLoanBalanceSameMode,
  cashOutAmountValues,
  setCashOutAmountValues,
  isCashOutSameMode,
  setIsCashOutSameMode,
  showCashOut,
  columnWidth,
  gridCols
}: ExistingLoanCardProps) => {
  const handleExistingLoanBalanceChange = (rateId: number, value: string) => {
    const newValues = [...existingLoanBalanceValues];
    newValues[rateId] = value;
    setExistingLoanBalanceValues(newValues);
  };

  const handleExistingLoanBalanceToggle = () => {
    if (isExistingLoanBalanceSameMode) {
      const firstValue = existingLoanBalanceValues[selectedRateIds[0]] || '';
      const newValues = [...existingLoanBalanceValues];
      selectedRateIds.forEach(id => newValues[id] = firstValue);
      setExistingLoanBalanceValues(newValues);
    }
    setIsExistingLoanBalanceSameMode(!isExistingLoanBalanceSameMode);
  };

  const handleCashOutChange = (rateId: number, value: string) => {
    const newValues = [...cashOutAmountValues];
    newValues[rateId] = value;
    setCashOutAmountValues(newValues);
  };

  const handleCashOutToggle = () => {
    if (isCashOutSameMode) {
      const firstValue = cashOutAmountValues[selectedRateIds[0]] || '';
      const newValues = [...cashOutAmountValues];
      selectedRateIds.forEach(id => newValues[id] = firstValue);
      setCashOutAmountValues(newValues);
    }
    setIsCashOutSameMode(!isCashOutSameMode);
  };

  return (
    <Card
      className="mt-8 transition-all duration-700 animate-roll-down border-l-4 border-l-green-500 hover:border-2 hover:border-green-500 transition-colors flex-none"
      style={{ width: columnWidth, maxWidth: '100%' }}
    >
      <CardContent className="pt-6 space-y-6">
        {/* Existing Loan Balance Row */}
        <MonetaryInputRow
          label="Existing Loan Balance:"
          values={existingLoanBalanceValues}
          selectedRateIds={selectedRateIds}
          onChange={handleExistingLoanBalanceChange}
          isSameMode={isExistingLoanBalanceSameMode}
          onToggleSameMode={handleExistingLoanBalanceToggle}
          testIdPrefix="input-existing-loan-balance"
          gridCols={gridCols}
          showSameToggle={true}
        />

        {/* Cash Out Amount Row - Conditional */}
        {!showCashOut && (
          <MonetaryInputRow
            label="Cash Out Amount"
            values={cashOutAmountValues}
            selectedRateIds={selectedRateIds}
            onChange={handleCashOutChange}
            isSameMode={isCashOutSameMode}
            onToggleSameMode={handleCashOutToggle}
            testIdPrefix="input-cash-out-amount"
            gridCols={gridCols}
            showSameToggle={true}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ExistingLoanCard;
