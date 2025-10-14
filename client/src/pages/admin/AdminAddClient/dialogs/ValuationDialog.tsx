import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface ValuationDialogProps {
  isOpen: boolean;
  service: 'zillow' | 'redfin' | 'realtor' | null;
  currentValue: string;
  onClose: () => void;
  onSave: (value: string) => void;
  onSaveAndApply: (value: string) => void;
}

const ValuationDialog = ({
  isOpen,
  service,
  currentValue,
  onClose,
  onSave,
  onSaveAndApply
}: ValuationDialogProps) => {
  const [valuationInput, setValuationInput] = useState('');

  // Update input when dialog opens or currentValue changes
  useEffect(() => {
    if (isOpen) {
      setValuationInput(currentValue);
    }
  }, [isOpen, currentValue]);

  const handleSave = () => {
    onSave(valuationInput);
    setValuationInput('');
  };

  const handleSaveAndApply = () => {
    onSaveAndApply(valuationInput);
    setValuationInput('');
  };

  const handleClose = () => {
    onClose();
    setValuationInput('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent data-testid="dialog-property-valuation">
        <DialogHeader>
          <DialogTitle>
            {service === 'zillow' && 'Zillow Valuation'}
            {service === 'redfin' && 'Redfin Valuation'}
            {service === 'realtor' && 'Realtor.com Valuation'}
          </DialogTitle>
          <DialogDescription>
            Enter the property valuation from {service === 'zillow' && 'Zillow.com'}
            {service === 'redfin' && 'Redfin.com'}
            {service === 'realtor' && 'Realtor.com'}.
            You can save the value for reference or apply it to the estimated property value field.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="valuation-input">Property Value</Label>
            <Input
              id="valuation-input"
              value={valuationInput}
              onChange={(e) => setValuationInput(e.target.value)}
              placeholder="$0.00"
              data-testid="input-valuation-amount"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            data-testid="button-valuation-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            data-testid="button-valuation-save"
          >
            Save
          </Button>
          <Button
            onClick={handleSaveAndApply}
            className="bg-orange-500 hover:bg-orange-600 text-white"
            data-testid="button-valuation-save-apply"
          >
            Save & Apply to Estimated Value
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ValuationDialog;