import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';

const ResidenceInfoDialog = () => {
  const form = useFormContext<InsertClient>();
  const {
    isResidenceInfoDialogOpen,
    residenceInfoText,
    activeResidenceSection,
    setIsResidenceInfoDialogOpen,
    setResidenceInfoText,
    setActiveResidenceSection,
  } = useAdminAddClientStore();

  const handleCancel = () => {
    setIsResidenceInfoDialogOpen(false);
    setResidenceInfoText('');
    setActiveResidenceSection('');
  };

  const handleSave = () => {
    if (activeResidenceSection === 'borrower-current') {
      form.setValue('borrower.residenceAddress.additionalInfo', residenceInfoText);
    } else if (activeResidenceSection === 'borrower-prior') {
      form.setValue('borrower.priorResidenceAddress.additionalInfo', residenceInfoText);
    } else if (activeResidenceSection === 'borrower-prior2') {
      form.setValue('borrower.priorResidenceAddress2.additionalInfo', residenceInfoText);
    } else if (activeResidenceSection === 'coBorrower-current') {
      form.setValue('coBorrower.residenceAddress.additionalInfo' as any, residenceInfoText);
    } else if (activeResidenceSection === 'coBorrower-prior') {
      form.setValue('coBorrower.priorResidenceAddress.additionalInfo' as any, residenceInfoText);
    } else if (activeResidenceSection === 'coBorrower-prior2') {
      form.setValue('coBorrower.priorResidenceAddress2.additionalInfo' as any, residenceInfoText);
    }
    setIsResidenceInfoDialogOpen(false);
    setActiveResidenceSection('');
  };

  return (
    <Dialog open={isResidenceInfoDialogOpen} onOpenChange={setIsResidenceInfoDialogOpen}>
      <DialogContent className="max-w-md" data-testid="dialog-residence-info">
        <DialogHeader>
          <DialogTitle>Residence Information</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={residenceInfoText}
            onChange={(e) => setResidenceInfoText(e.target.value)}
            placeholder=""
            className="min-h-[150px] resize-none"
            data-testid="textarea-residence-info"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel-residence-info"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            data-testid="button-save-residence-info"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResidenceInfoDialog;