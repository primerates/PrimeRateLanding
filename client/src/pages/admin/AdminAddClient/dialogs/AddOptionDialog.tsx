import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AddOptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (optionName: string) => void;
  title?: string;
  description?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
}

const AddOptionDialog = ({
  isOpen,
  onClose,
  onAdd,
  title = 'Add New Option',
  description = 'Enter a name for the new option.',
  inputLabel = 'Option Name',
  inputPlaceholder = 'Enter option name'
}: AddOptionDialogProps) => {
  const [optionName, setOptionName] = useState('');
  const { toast } = useToast();

  const handleAdd = () => {
    if (optionName.trim()) {
      onAdd(optionName.trim());
      toast({
        title: "Option Added",
        description: `"${optionName.trim()}" has been added.`,
      });
      setOptionName('');
      onClose();
    }
  };

  const handleClose = () => {
    setOptionName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent data-testid="dialog-add-option">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="option-name">{inputLabel}</Label>
            <Input
              id="option-name"
              value={optionName}
              onChange={(e) => setOptionName(e.target.value)}
              placeholder={inputPlaceholder}
              data-testid="input-option-name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel-add-option">
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!optionName.trim()} data-testid="button-add-option">
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddOptionDialog;
