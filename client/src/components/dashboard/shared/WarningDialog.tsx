import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WarningDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;
  
  /**
   * Callback when dialog is closed/dismissed
   */
  onClose: () => void;
  
  /**
   * Dialog title
   */
  title: string;
  
  /**
   * Dialog message/description
   */
  message: string;
  
  /**
   * Text for the action button (default: "OK")
   */
  buttonText?: string;
  
  /**
   * Test ID for the dialog
   */
  testId?: string;
}

/**
 * Reusable warning/confirmation dialog component
 * Features:
 * - Consistent purple theme styling
 * - Single action button (OK by default)
 * - Backdrop blur effect
 */
export function WarningDialog({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  testId = 'warning-dialog'
}: WarningDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30"
        data-testid={testId}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-purple-200 pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end mt-4">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            data-testid={`${testId}-button-close`}
          >
            {buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
