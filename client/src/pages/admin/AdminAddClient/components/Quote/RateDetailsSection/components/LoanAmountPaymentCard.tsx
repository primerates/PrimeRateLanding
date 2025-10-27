import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  onEstLoanAmountInfoClick?: () => void;
  onNewPaymentInfoClick?: () => void;
  onMonthlySavingsInfoClick?: () => void;
  calculatedNewEstLoanAmountValues?: (number | string)[];
  calculatedNewMonthlyPaymentValues?: string[];
  calculatedTotalMonthlySavingsValues?: string[];
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
  gridCols,
  onEstLoanAmountInfoClick,
  onNewPaymentInfoClick,
  onMonthlySavingsInfoClick,
  calculatedNewEstLoanAmountValues = [],
  calculatedNewMonthlyPaymentValues = [],
  calculatedTotalMonthlySavingsValues = []
}: LoanAmountPaymentCardProps) => {
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
            {onEstLoanAmountInfoClick && (
              <button
                type="button"
                onClick={onEstLoanAmountInfoClick}
                className="h-4 w-4 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                data-testid="icon-info-loan-amount"
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
            <Label className="text-base font-bold text-right whitespace-nowrap">New Est. Loan Amount</Label>
          </div>
          {selectedRateIds.map((rateId) => {
            // Use calculated value if available
            const calculatedValue = calculatedNewEstLoanAmountValues[rateId];
            const numericValue = typeof calculatedValue === 'number' ? calculatedValue : parseFloat(calculatedValue || '0');
            const displayValue = numericValue > 0
              ? numericValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '';

            return (
              <div key={rateId} className="flex justify-center">
                <div className="flex items-center px-3 rounded-md w-3/4">
                  <span className="text-base font-bold text-center w-full" data-testid={`text-new-est-loan-amount-${rateId}`}>
                    {displayValue ? `$${displayValue}` : ''}
                  </span>
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
                {onNewPaymentInfoClick && (
                  <button
                    type="button"
                    onClick={onNewPaymentInfoClick}
                    className="h-4 w-4 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    data-testid="icon-info-monthly-payment"
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
                <Label className="text-base font-bold text-right whitespace-nowrap">New Monthly Payment</Label>
              </div>
              {selectedRateIds.map((rateId) => {
                // Use calculated value if available
                const calculatedPayment = calculatedNewMonthlyPaymentValues[rateId];
                const displayValue = calculatedPayment ? parseInt(calculatedPayment, 10).toLocaleString('en-US') : '';

                return (
                  <div key={rateId} className="flex justify-center">
                    <div className="flex items-center px-3 rounded-md w-3/4">
                      <span className="text-base font-bold text-center w-full" data-testid={`text-new-monthly-payment-${rateId}`}>
                        {displayValue ? `$${displayValue}` : ''}
                      </span>
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
            <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
              <div className="flex items-center justify-end pr-4 gap-2 flex-shrink-0">
                {onMonthlySavingsInfoClick && (
                  <button
                    type="button"
                    onClick={onMonthlySavingsInfoClick}
                    className="h-4 w-4 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer -mr-0.5"
                    data-testid="icon-info-monthly-savings"
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
                <Label className="text-base font-bold text-right whitespace-nowrap">Total Monthly Savings</Label>
              </div>
              {selectedRateIds.map((rateId) => {
                // Use calculated savings value
                const calculatedSavings = calculatedTotalMonthlySavingsValues[rateId];
                const displayValue = calculatedSavings ? parseInt(calculatedSavings, 10).toLocaleString('en-US') : '';

                return (
                  <div key={rateId} className="flex justify-center">
                    <div className="flex items-center px-3 rounded-md w-3/4">
                      <span className="text-base font-bold text-center w-full" data-testid={`text-total-monthly-savings-${rateId}`}>
                        {displayValue ? `$${displayValue}` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoanAmountPaymentCard;
