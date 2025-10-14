import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface BusinessDescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (description: string) => void;
  currentValue?: string;
}

const BusinessDescriptionDialog = ({
  isOpen,
  onClose,
  onSave,
  currentValue = ''
}: BusinessDescriptionDialogProps) => {
  const [description, setDescription] = useState(currentValue);

  useEffect(() => {
    if (isOpen) {
      setDescription(currentValue);
    }
  }, [isOpen, currentValue]);

  const handleSave = () => {
    onSave(description);
    onClose();
  };

  const handleCancel = () => {
    setDescription(currentValue);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent data-testid="dialog-business-description">
        <DialogHeader>
          <DialogTitle>Description</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <textarea
              id="business-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the nature of the business, services offered, products sold, etc."
              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
              data-testid="textarea-business-description"
              rows={5}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-business-description-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-business-description-save"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessDescriptionDialog;