import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface VAFundingFeeCalculatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLoanCategory: string;
  selectedRateIds: number[];
  isVAExempt: boolean;
  isVAJumboExempt: boolean;
  vaFirstTimeCashOut: string;
  onVaFirstTimeCashOutChange: (value: string) => void;
  vaSubsequentCashOut: string;
  onVaSubsequentCashOutChange: (value: string) => void;
  vaRateTerm: string;
  onVaRateTermChange: (value: string) => void;
  vaIRRRL: string;
  onVaIRRRLChange: (value: string) => void;
  isVACalculated: boolean;
  onIsVACalculatedChange: (value: boolean) => void;
  selectedVARow: 'firstTime' | 'subsequent' | 'rateTerm' | 'irrrl' | null;
  onSelectedVARowChange: (value: 'firstTime' | 'subsequent' | 'rateTerm' | 'irrrl' | null) => void;
  newEstLoanAmount: number;
  vaFundingFeeValue: number;
  onApplyToRate: (value: string) => void;
  onClearAllValues: () => void;
}

/**
 * Dialog component for VA Funding Fee Calculator
 */
const VAFundingFeeCalculatorDialog = ({
  isOpen,
  onClose,
  selectedLoanCategory,
  selectedRateIds,
  isVAExempt,
  isVAJumboExempt,
  vaFirstTimeCashOut,
  onVaFirstTimeCashOutChange,
  vaSubsequentCashOut,
  onVaSubsequentCashOutChange,
  vaRateTerm,
  onVaRateTermChange,
  vaIRRRL,
  onVaIRRRLChange,
  isVACalculated,
  onIsVACalculatedChange,
  selectedVARow,
  onSelectedVARowChange,
  newEstLoanAmount,
  vaFundingFeeValue,
  onApplyToRate,
  onClearAllValues
}: VAFundingFeeCalculatorDialogProps) => {

  const handleClose = () => {
    onClose();
    onVaFirstTimeCashOutChange('');
    onVaSubsequentCashOutChange('');
    onVaRateTermChange('');
    onVaIRRRLChange('');
    onIsVACalculatedChange(false);
    onSelectedVARowChange(null);
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleClear = () => {
    onVaFirstTimeCashOutChange('0.00');
    onVaSubsequentCashOutChange('0.00');
    onVaRateTermChange('0.00');
    onVaIRRRLChange('0.00');
    onIsVACalculatedChange(false);
    onSelectedVARowChange(null);
    onClearAllValues();
  };

  const handleCalculate = () => {
    if (isVAExempt || isVAJumboExempt) {
      return;
    }

    if (selectedRateIds.length === 0) {
      console.error('No rate selected');
      return;
    }

    // Calculate base amount: New Est. Loan Amount - VA Funding Fee
    const baseAmount = newEstLoanAmount - vaFundingFeeValue;

    // Calculate each row
    const firstTimeCashOut = (baseAmount * 0.0215).toFixed(2);
    const subsequentCashOut = (baseAmount * 0.033).toFixed(2);
    const rateTerm = (baseAmount * 0.005).toFixed(2);
    const irrrl = (baseAmount * 0.005).toFixed(2);

    // Set calculated values with formatting
    onVaFirstTimeCashOutChange(parseFloat(firstTimeCashOut).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }));
    onVaSubsequentCashOutChange(parseFloat(subsequentCashOut).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }));
    onVaRateTermChange(parseFloat(rateTerm).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }));
    onVaIRRRLChange(parseFloat(irrrl).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }));

    // Mark as calculated to make fields read-only
    onIsVACalculatedChange(true);
  };

  const handleApplyToRate = () => {
    if (isVAExempt || isVAJumboExempt) {
      return;
    }

    if (selectedVARow) {
      let valueToApply = '';

      switch (selectedVARow) {
        case 'firstTime':
          valueToApply = vaFirstTimeCashOut;
          break;
        case 'subsequent':
          valueToApply = vaSubsequentCashOut;
          break;
        case 'rateTerm':
          valueToApply = vaRateTerm;
          break;
        case 'irrrl':
          valueToApply = vaIRRRL;
          break;
      }

      if (valueToApply) {
        onApplyToRate(valueToApply);
      }
    }

    onClose();
  };

  const parseValue = (val: string) => parseFloat(val.replace(/[^\d.]/g, '') || '0');
  const hasNonZeroValues =
    parseValue(vaFirstTimeCashOut) > 0 ||
    parseValue(vaSubsequentCashOut) > 0 ||
    parseValue(vaRateTerm) > 0 ||
    parseValue(vaIRRRL) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 [&>button]:text-white [&>button:hover]:text-gray-200" data-testid="dialog-va-funding-fee">
        <DialogHeader className="text-white p-6 rounded-t-lg" style={{ backgroundColor: '#1a3373' }}>
          <DialogTitle className="text-white">VA Funding Fee Calculator</DialogTitle>
        </DialogHeader>
        <Separator className="mt-0 -mx-6 w-[calc(100%+3rem)]" />
        <div className="py-4 space-y-4 px-6">
          {/* First Time Cash Out Row - Only show for Cash Out */}
          {selectedLoanCategory?.includes('Cash Out') && (
            <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-4 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!(isVAExempt || isVAJumboExempt)) {
                    onSelectedVARowChange(selectedVARow === 'firstTime' ? null : 'firstTime');
                  }
                }}
                className={selectedVARow === 'firstTime' ? 'bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black' : ''}
                data-testid="button-select-first-time"
              >
                Select
              </Button>
              <Label className="text-right">First Time Cash Out</Label>
              <div className="px-4 py-2 bg-muted rounded-md min-w-[80px] text-center font-semibold">
                2.15%
              </div>
              <Input
                type="text"
                value={vaFirstTimeCashOut}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, '');
                  onVaFirstTimeCashOutChange(value);
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const formatted = parseFloat(value).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });
                    onVaFirstTimeCashOutChange(formatted);
                  }
                }}
                placeholder="$0.00"
                disabled={isVACalculated}
                className="text-black"
                data-testid="input-va-first-time-cash-out"
              />
            </div>
          )}

          {/* Subsequent Cash Out Row - Only show for Cash Out */}
          {selectedLoanCategory?.includes('Cash Out') && (
            <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-4 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!(isVAExempt || isVAJumboExempt)) {
                    onSelectedVARowChange(selectedVARow === 'subsequent' ? null : 'subsequent');
                  }
                }}
                className={selectedVARow === 'subsequent' ? 'bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black' : ''}
                data-testid="button-select-subsequent"
              >
                Select
              </Button>
              <Label className="text-right">Subsequent Cash Out</Label>
              <div className="px-4 py-2 bg-muted rounded-md min-w-[80px] text-center font-semibold">
                3.3%
              </div>
              <Input
                type="text"
                value={vaSubsequentCashOut}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, '');
                  onVaSubsequentCashOutChange(value);
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const formatted = parseFloat(value).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });
                    onVaSubsequentCashOutChange(formatted);
                  }
                }}
                placeholder="$0.00"
                disabled={isVACalculated}
                className="text-black"
                data-testid="input-va-subsequent-cash-out"
              />
            </div>
          )}

          {/* Rate & Term Row - Only show if Rate & Term is selected */}
          {selectedLoanCategory?.includes('Rate & Term') && (
            <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-4 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!(isVAExempt || isVAJumboExempt)) {
                    onSelectedVARowChange(selectedVARow === 'rateTerm' ? null : 'rateTerm');
                  }
                }}
                className={selectedVARow === 'rateTerm' ? 'bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black' : ''}
                data-testid="button-select-rate-term"
              >
                Select
              </Button>
              <Label className="text-right">Rate & Term</Label>
              <div className="px-4 py-2 bg-muted rounded-md min-w-[80px] text-center font-semibold">
                0.5%
              </div>
              <Input
                type="text"
                value={vaRateTerm}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, '');
                  onVaRateTermChange(value);
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const formatted = parseFloat(value).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });
                    onVaRateTermChange(formatted);
                  }
                }}
                placeholder="$0.00"
                disabled={isVACalculated}
                className="text-black"
                data-testid="input-va-rate-term"
              />
            </div>
          )}

          {/* VA IRRRL Row - Only show if IRRRL is selected */}
          {selectedLoanCategory?.includes('IRRRL') && (
            <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-4 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!(isVAExempt || isVAJumboExempt)) {
                    onSelectedVARowChange(selectedVARow === 'irrrl' ? null : 'irrrl');
                  }
                }}
                className={selectedVARow === 'irrrl' ? 'bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black' : ''}
                data-testid="button-select-irrrl"
              >
                Select
              </Button>
              <Label className="text-right">VA IRRRL</Label>
              <div className="px-4 py-2 bg-muted rounded-md min-w-[80px] text-center font-semibold">
                0.5%
              </div>
              <Input
                type="text"
                value={vaIRRRL}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, '');
                  onVaIRRRLChange(value);
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const formatted = parseFloat(value).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });
                    onVaIRRRLChange(formatted);
                  }
                }}
                placeholder="$0.00"
                disabled={isVACalculated}
                className="text-black"
                data-testid="input-va-irrrl"
              />
            </div>
          )}
        </div>
        <Separator className="-mx-6 w-[calc(100%+3rem)]" />
        <DialogFooter className="gap-2 px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="hover:text-green-600"
            data-testid="button-cancel-va-funding-fee"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              // This button displays the exempt state but doesn't toggle it
              // Exempt can only be toggled from the Loan Category dropdown
            }}
            className={`${(isVAExempt || isVAJumboExempt) ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white cursor-default' : 'bg-transparent text-gray-400 border-gray-300 cursor-default'}`}
            data-testid="button-exempt-va-funding-fee"
          >
            Exempt
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!hasNonZeroValues}
            className="hover:text-blue-600"
            data-testid="button-clear-va-funding-fee"
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCalculate}
            disabled={hasNonZeroValues}
            className={selectedVARow ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-500 hover:text-black hover:border-yellow-500' : 'border-green-500 hover:border-green-500 hover:text-green-600'}
            data-testid="button-calculate-va-funding-fee"
          >
            Calculate
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleApplyToRate}
            className={selectedVARow ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-500 hover:text-black hover:border-yellow-500' : 'border-green-500 hover:border-green-500 hover:text-green-600'}
            data-testid="button-apply-to-all-rates"
          >
            Apply to Rate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VAFundingFeeCalculatorDialog;
