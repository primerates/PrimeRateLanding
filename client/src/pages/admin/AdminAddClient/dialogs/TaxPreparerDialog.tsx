import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaxPreparerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preparer: string) => void;
  currentValue?: string;
}

const TAX_PREPARER_OPTIONS = [
  { value: 'Select', label: 'Select' },
  { value: 'Borrower(s)', label: 'Borrower(s)' },
  { value: 'Tax Preparer', label: 'Tax Preparer' },
  { value: 'CPA', label: 'CPA' },
  { value: 'Other', label: 'Other' }
];

const TaxPreparerDialog = ({
  isOpen,
  onClose,
  onSave,
  currentValue = 'Select'
}: TaxPreparerDialogProps) => {
  const [preparer, setPreparer] = useState(currentValue);

  useEffect(() => {
    if (isOpen) {
      setPreparer(currentValue || 'Select');
    }
  }, [isOpen, currentValue]);

  const handleSave = () => {
    // Clear the value if "Select" is chosen, otherwise save the value
    const valueToSave = preparer === 'Select' ? '' : preparer;
    onSave(valueToSave);
    onClose();
  };

  const handleCancel = () => {
    setPreparer(currentValue || 'Select');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent data-testid="dialog-tax-preparer">
        <DialogHeader>
          <DialogTitle>Tax Preparer Information</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tax-preparer-select">Business tax returns are prepared and filed by</Label>
            <Select
              value={preparer}
              onValueChange={(value) => setPreparer(value)}
            >
              <SelectTrigger data-testid="select-tax-preparer">
                <SelectValue placeholder="Select who prepares tax returns" />
              </SelectTrigger>
              <SelectContent>
                {TAX_PREPARER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-tax-preparer-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-tax-preparer-save"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaxPreparerDialog;