import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RateBuyDownInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Dialog component that displays information about Rate Buy Down
 */
const RateBuyDownInfoDialog = ({ isOpen, onClose }: RateBuyDownInfoDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 [&>button]:text-white [&>button:hover]:text-gray-200" data-testid="dialog-rate-buy-down-info">
        <DialogHeader className="text-white p-6 rounded-t-lg" style={{ backgroundColor: '#1a3373' }}>
          <DialogTitle className="text-white">Rate Buy Down</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-6 px-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Message */}
          <div className="text-lg text-muted-foreground">
            A rate buydown, often called "points," allows you to finance/roll in an upfront cost into your new loan to lower your interest rate below the current market rate. The cost of buydown (points) can change until your interest rate is locked.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RateBuyDownInfoDialog;
