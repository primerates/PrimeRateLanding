import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';
import MonetaryInputRow from './MonetaryInputRow';

interface LoanAmountPaymentCardProps {
  selectedRateIds: number[];
  newEstLoanAmountValues: string[];
  setNewEstLoanAmountValues: (values: string[]) => void;
  newMonthlyPaymentValues: string[];
  setNewMonthlyPaymentValues: (values: string[]) => void;
  totalMonthlySavingsValues: string[];
  setTotalMonthlySavingsValues: (values: string[]) => void;
  isMonthlyPaymentRowExpanded: boolean;
  setIsMonthlyPaymentRowExpanded: (expanded: boolean) => void;
  isSavingsRowExpanded: boolean;
  setIsSavingsRowExpanded: (expanded: boolean) => void;
  columnWidth: string;
  gridCols: string;
}

/**
 * Card component for New Est. Loan Amount, New Monthly Payment, and Total Monthly Savings
 */
const LoanAmountPaymentCard = ({
  selectedRateIds,
  newEstLoanAmountValues,
  setNewEstLoanAmountValues,
  newMonthlyPaymentValues,
  setNewMonthlyPaymentValues,
  totalMonthlySavingsValues,
  setTotalMonthlySavingsValues,
  isMonthlyPaymentRowExpanded,
  setIsMonthlyPaymentRowExpanded,
  isSavingsRowExpanded,
  setIsSavingsRowExpanded,
  columnWidth,
  gridCols
}: LoanAmountPaymentCardProps) => {
  const handleLoanAmountChange = (rateId: number, value: string) => {
    const newValues = [...newEstLoanAmountValues];
    newValues[rateId] = value;
    setNewEstLoanAmountValues(newValues);
  };

  const handleMonthlyPaymentChange = (rateId: number, value: string) => {
    const newValues = [...newMonthlyPaymentValues];
    newValues[rateId] = value;
    setNewMonthlyPaymentValues(newValues);
  };

  const handleSavingsChange = (rateId: number, value: string) => {
    const newValues = [...totalMonthlySavingsValues];
    newValues[rateId] = value;
    setTotalMonthlySavingsValues(newValues);
  };

  return (
    <Card
      className="mt-8 transition-all duration-700 animate-roll-down border-l-4 border-l-blue-500 hover:border-2 hover:border-blue-500 transition-colors flex-none"
      style={{ width: columnWidth, maxWidth: '100%' }}
    >
      <CardContent className="pt-6 space-y-6">
        {/* New Est. Loan Amount Row */}
        <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
          <div className="flex items-center justify-end pr-4 gap-2 flex-shrink-0">
            {isMonthlyPaymentRowExpanded ? (
              <ChevronDown
                className="h-4 w-4 flex-shrink-0 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => setIsMonthlyPaymentRowExpanded(false)}
                data-testid="icon-collapse-monthly-payment"
              />
            ) : (
              <ChevronUp
                className="h-4 w-4 flex-shrink-0 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => setIsMonthlyPaymentRowExpanded(true)}
                data-testid="icon-expand-monthly-payment"
              />
            )}
            <Label className="text-base font-bold text-right whitespace-nowrap">New Est. Loan Amount</Label>
          </div>
          {selectedRateIds.map((rateId) => {
            const numVal = newEstLoanAmountValues[rateId] ? newEstLoanAmountValues[rateId].replace(/[^\d]/g, '') : '';
            const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

            return (
              <div key={rateId} className="flex justify-center">
                <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                  <span className="text-muted-foreground text-sm">$</span>
                  <input
                    type="text"
                    placeholder=""
                    value={displayValue}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, '');
                      handleLoanAmountChange(rateId, value);
                    }}
                    className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0 outline-none w-full"
                    data-testid={`input-new-est-loan-amount-${rateId}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* New Monthly Payment Row - Collapsible */}
        {isMonthlyPaymentRowExpanded && (
          <div className="border-t pt-6">
            <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
              <div className="flex items-center justify-end pr-4 gap-2 flex-shrink-0">
                {isSavingsRowExpanded ? (
                  <ChevronDown
                    className="h-4 w-4 flex-shrink-0 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => setIsSavingsRowExpanded(false)}
                    data-testid="icon-collapse-savings"
                  />
                ) : (
                  <ChevronUp
                    className="h-4 w-4 flex-shrink-0 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => setIsSavingsRowExpanded(true)}
                    data-testid="icon-expand-savings"
                  />
                )}
                <Label className="text-base font-bold text-right whitespace-nowrap">New Monthly Payment</Label>
              </div>
              {selectedRateIds.map((rateId) => {
                const numVal = newMonthlyPaymentValues[rateId] ? newMonthlyPaymentValues[rateId].replace(/[^\d]/g, '') : '';
                const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

                return (
                  <div key={rateId} className="flex justify-center">
                    <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                      <span className="text-muted-foreground text-sm">$</span>
                      <input
                        type="text"
                        placeholder=""
                        value={displayValue}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, '');
                          handleMonthlyPaymentChange(rateId, value);
                        }}
                        className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0 outline-none w-full"
                        data-testid={`input-new-monthly-payment-${rateId}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Total Monthly Savings Row - Collapsible under New Monthly Payment */}
        {isMonthlyPaymentRowExpanded && isSavingsRowExpanded && (
          <div className="border-t pt-6">
            <MonetaryInputRow
              label="Total Monthly Savings"
              values={totalMonthlySavingsValues}
              selectedRateIds={selectedRateIds}
              onChange={handleSavingsChange}
              testIdPrefix="input-total-monthly-savings"
              gridCols={gridCols}
              labelClassName="text-base font-bold text-right whitespace-nowrap"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoanAmountPaymentCard;
