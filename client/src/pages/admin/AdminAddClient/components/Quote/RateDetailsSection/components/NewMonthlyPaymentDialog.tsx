import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface NewMonthlyPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyInsurance: string;
  onMonthlyInsuranceChange: (value: string) => void;
  monthlyPropertyTax: string;
  onMonthlyPropertyTaxChange: (value: string) => void;
  newLoanAmountMip: string;
  onNewLoanAmountMipChange: (value: string) => void;
  monthlyFhaMip: string;
  onMonthlyFhaMipChange: (value: string) => void;
  calculatedEscrow: number;
  escrowReserves: string;
  isFHALoan: boolean;
}

/**
 * Dialog component for New Monthly Payment details
 */
const NewMonthlyPaymentDialog = ({
  isOpen,
  onClose,
  monthlyInsurance,
  onMonthlyInsuranceChange,
  monthlyPropertyTax,
  onMonthlyPropertyTaxChange,
  newLoanAmountMip,
  onNewLoanAmountMipChange,
  monthlyFhaMip,
  onMonthlyFhaMipChange,
  calculatedEscrow,
  escrowReserves,
  isFHALoan
}: NewMonthlyPaymentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 [&>button]:text-white [&>button:hover]:text-gray-200" data-testid="dialog-new-monthly-payment">
        <DialogHeader className="text-white p-6 rounded-t-lg" style={{ backgroundColor: '#1a3373' }}>
          <DialogTitle className="text-white">New Monthly Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 px-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Monthly Insurance */}
          <div className="flex items-center gap-4">
            <Label htmlFor="monthly-insurance" className="w-48 text-right">
              Monthly Home Insurance:
            </Label>
            <div className={`flex items-center border border-input px-3 rounded-md flex-1 ${escrowReserves === 'escrow-not-included' ? 'bg-muted' : 'bg-background'}`}>
              <span className="text-muted-foreground text-sm">$</span>
              <Input
                id="monthly-insurance"
                type="text"
                placeholder=""
                value={monthlyInsurance.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  onMonthlyInsuranceChange(value);
                }}
                disabled={escrowReserves === 'escrow-not-included'}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="input-monthly-insurance"
              />
            </div>
          </div>

          {/* Monthly Property Tax */}
          <div className="flex items-center gap-4">
            <Label htmlFor="monthly-property-tax" className="w-48 text-right">
              Monthly Property Tax:
            </Label>
            <div className={`flex items-center border border-input px-3 rounded-md flex-1 ${escrowReserves === 'escrow-not-included' ? 'bg-muted' : 'bg-background'}`}>
              <span className="text-muted-foreground text-sm">$</span>
              <Input
                id="monthly-property-tax"
                type="text"
                placeholder=""
                value={monthlyPropertyTax.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  onMonthlyPropertyTaxChange(value);
                }}
                disabled={escrowReserves === 'escrow-not-included'}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="input-monthly-property-tax"
              />
            </div>
          </div>

          {/* Total Monthly Escrow - Display Only (Auto-calculated) */}
          <div className="flex items-center gap-4 mb-24">
            <Label htmlFor="total-monthly-escrow-payment" className="w-48 text-right">
              Total Monthly Escrow:
            </Label>
            <div className="flex items-center border border-input bg-muted px-3 rounded-md flex-1 h-9">
              <span className="text-base font-bold text-center w-full" data-testid="text-total-monthly-escrow-payment">
                {calculatedEscrow > 0 ? `$${calculatedEscrow.toLocaleString('en-US')}` : ''}
              </span>
            </div>
          </div>

          {/* FHA MIP Section - Only shown for FHA loans */}
          {isFHALoan && (
            <>
              {/* Separation Line */}
              <div
                className="border-t border-border"
                style={{
                  marginTop: '48px',
                  marginBottom: '32px'
                }}
              ></div>

              {/* Annual & Monthly FHA MIP Section */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold">Annual & Monthly FHA MIP</h3>

                {/* New Loan Amount */}
                <div className="flex items-center gap-4">
                  <Label htmlFor="new-loan-amount-mip" className="w-48 text-right">
                    New Loan Amount:
                  </Label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="new-loan-amount-mip"
                      value={newLoanAmountMip.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        onNewLoanAmountMipChange(value);
                      }}
                      type="text"
                      className="pl-6 h-9"
                      placeholder="0"
                      data-testid="input-new-loan-amount-mip"
                    />
                  </div>
                </div>

                {/* Estimated LTV */}
                <div className="flex items-center gap-4">
                  <Label htmlFor="estimated-ltv" className="w-48 text-right">
                    Estimated LTV:
                  </Label>
                  <div className="relative flex-1">
                    <Input
                      id="estimated-ltv"
                      type="text"
                      className="pr-6 h-9"
                      placeholder="0"
                      data-testid="input-estimated-ltv"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                {/* Annual FHA MIP */}
                <div className="flex items-center gap-4">
                  <Label htmlFor="annual-fha-mip" className="w-48 text-right">
                    Annual FHA MIP:
                  </Label>
                  <div className="relative flex-1">
                    <Input
                      id="annual-fha-mip"
                      type="text"
                      className="pr-6 h-9"
                      placeholder="0"
                      data-testid="input-annual-fha-mip"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                {/* Monthly FHA MIP */}
                <div className="flex items-center gap-4">
                  <Label htmlFor="monthly-fha-mip" className="w-48 text-right">
                    Monthly FHA MIP:
                  </Label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="monthly-fha-mip"
                      value={monthlyFhaMip.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        onMonthlyFhaMipChange(value);
                      }}
                      type="text"
                      className="pl-6 h-9"
                      placeholder="0"
                      data-testid="input-monthly-fha-mip"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Separation Line */}
          <div
            className="border-t border-border"
            style={{
              marginTop: '48px',
              marginBottom: '32px'
            }}
          ></div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-monthly-payment"
            >
              Cancel
            </Button>
            <Button
              onClick={onClose}
              data-testid="button-save-monthly-payment"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewMonthlyPaymentDialog;
