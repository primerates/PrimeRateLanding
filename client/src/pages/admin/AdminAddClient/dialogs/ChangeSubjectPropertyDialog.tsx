import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ChangeSubjectPropertyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  testId?: string;
  confirmButtonTestId?: string;
  cancelButtonTestId?: string;
}

const ChangeSubjectPropertyDialog = ({
  isOpen,
  onClose,
  onConfirm,
  testId = "dialog-subject-property-confirmation",
  confirmButtonTestId = "button-confirm-subject-property-change",
  cancelButtonTestId = "button-cancel-subject-property-change"
}: ChangeSubjectPropertyDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-testid={testId}>
        <DialogHeader>
          <DialogTitle>Change Subject Property</DialogTitle>
          <DialogDescription>
            Another property is designated as subject property. Would you like to proceed with this change?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid={cancelButtonTestId}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            data-testid={confirmButtonTestId}
          >
            Yes, Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeSubjectPropertyDialog;