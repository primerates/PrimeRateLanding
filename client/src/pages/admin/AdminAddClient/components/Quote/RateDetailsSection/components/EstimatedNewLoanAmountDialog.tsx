import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EstimatedNewLoanAmountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Dialog component that displays information about Estimated New Loan Amount
 */
const EstimatedNewLoanAmountDialog = ({ isOpen, onClose }: EstimatedNewLoanAmountDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 [&>button]:text-white [&>button:hover]:text-gray-200" data-testid="dialog-estimated-loan-amount">
        <DialogHeader className="text-white p-6 rounded-t-lg" style={{ backgroundColor: '#1a3373' }}>
          <DialogTitle className="text-white">Estimated New Loan Amount</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-6 px-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Message */}
          <div className="text-lg text-muted-foreground">
            The initial new loan amount is an estimate based on your mortgage statement, which may not reflect the most current balance. The final loan amount will be confirmed once we receive the official payoff demand from your lender.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EstimatedNewLoanAmountDialog;
