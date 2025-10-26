import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ExistingMonthlyPaymentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingMortgagePayment: string;
  onExistingMortgagePaymentChange: (value: string) => void;
  monthlyPaymentDebtsPayOff: string;
  onMonthlyPaymentDebtsPayOffChange: (value: string) => void;
  monthlyPaymentOtherDebts: string;
  onMonthlyPaymentOtherDebtsChange: (value: string) => void;
  calculatedTotal: number;
}

/**
 * Dialog component for Existing Monthly Payments (Total Monthly Savings info)
 */
const ExistingMonthlyPaymentsDialog = ({
  isOpen,
  onClose,
  existingMortgagePayment,
  onExistingMortgagePaymentChange,
  monthlyPaymentDebtsPayOff,
  onMonthlyPaymentDebtsPayOffChange,
  monthlyPaymentOtherDebts,
  onMonthlyPaymentOtherDebtsChange,
  calculatedTotal
}: ExistingMonthlyPaymentsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 [&>button]:text-white [&>button:hover]:text-gray-200" data-testid="dialog-existing-monthly-payments">
        <DialogHeader className="text-white p-6 rounded-t-lg" style={{ backgroundColor: '#1a3373' }}>
          <DialogTitle className="text-white">Existing Monthly Payments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 px-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Existing Mortgage Payment */}
          <div className="flex items-center gap-4">
            <Label htmlFor="existing-mortgage-payment" className="w-80 text-right">
              Existing Mortgage Payment:
            </Label>
            <div className="flex items-center border border-input bg-background px-3 rounded-md flex-1">
              <span className="text-muted-foreground text-sm">$</span>
              <Input
                id="existing-mortgage-payment"
                type="text"
                placeholder=""
                value={existingMortgagePayment.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  onExistingMortgagePaymentChange(value);
                }}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                data-testid="input-existing-mortgage-payment"
              />
            </div>
          </div>

          {/* Monthly Payment of Debts Marked for Pay Off */}
          <div className="flex items-center gap-4">
            <Label htmlFor="debts-payoff" className="w-80 text-right">
              Monthly Payment of Debts Marked for Pay Off:
            </Label>
            <div className="flex items-center border border-input bg-background px-3 rounded-md flex-1">
              <span className="text-muted-foreground text-sm">$</span>
              <Input
                id="debts-payoff"
                type="text"
                placeholder=""
                value={monthlyPaymentDebtsPayOff.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  onMonthlyPaymentDebtsPayOffChange(value);
                }}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                data-testid="input-debts-payoff"
              />
            </div>
          </div>

          {/* Monthly Payment of Other Debts with Remaining Cash Out Deployed */}
          <div className="flex items-center gap-4">
            <Label htmlFor="other-debts" className="w-80 text-right">
              Monthly Payment of Other Debts with Remaining Cash Out Deployed:
            </Label>
            <div className="flex items-center border border-input bg-background px-3 rounded-md flex-1">
              <span className="text-muted-foreground text-sm">$</span>
              <Input
                id="other-debts"
                type="text"
                placeholder=""
                value={monthlyPaymentOtherDebts.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  onMonthlyPaymentOtherDebtsChange(value);
                }}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                data-testid="input-other-debts"
              />
            </div>
          </div>

          {/* Total Existing Monthly Payments - Display Only (Auto-calculated) */}
          <div className="flex items-center gap-4" style={{ marginBottom: '32px' }}>
            <Label htmlFor="total-existing-payments" className="w-80 text-right">
              Total Existing Monthly Payments:
            </Label>
            <div className="flex items-center border border-input bg-muted px-3 rounded-md flex-1 h-9">
              <span className="text-base font-bold text-center w-full" data-testid="text-total-existing-payments">
                {calculatedTotal > 0 ? `$${calculatedTotal.toLocaleString('en-US')}` : ''}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExistingMonthlyPaymentsDialog;
