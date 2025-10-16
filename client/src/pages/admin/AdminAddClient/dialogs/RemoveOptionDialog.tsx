import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface OptionItem {
  value: string;
  label: string;
}

interface CustomOption {
  id: string;
  name: string;
}

interface RemoveOptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: (optionValue: string) => void;
  onRemoveCustom?: (optionId: string) => void;
  removedOptions: string[];
  builtInOptions: OptionItem[];
  customOptions?: CustomOption[];
  title?: string;
  description?: string;
  selectLabel?: string;
}

const RemoveOptionDialog = ({
  isOpen,
  onClose,
  onRemove,
  onRemoveCustom,
  removedOptions,
  builtInOptions,
  customOptions = [],
  title = 'Remove Option',
  description = 'Select an option to remove from the list.',
  selectLabel = 'Option to Remove'
}: RemoveOptionDialogProps) => {
  const [selectedOption, setSelectedOption] = useState('');
  const { toast } = useToast();

  const handleRemove = () => {
    if (selectedOption) {
      // Check if it's a built-in option
      const builtInOption = builtInOptions.find(option => option.value === selectedOption);

      if (builtInOption) {
        // It's a built-in option
        onRemove(selectedOption);
        toast({
          title: "Option Removed",
          description: `"${builtInOption.label}" has been removed.`,
        });
      } else {
        // It's a custom option
        const customOption = customOptions.find(option => option.id === selectedOption);
        if (customOption && onRemoveCustom) {
          onRemoveCustom(selectedOption);
          toast({
            title: "Option Removed",
            description: `"${customOption.name}" has been removed.`,
          });
        }
      }

      setSelectedOption('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedOption('');
    onClose();
  };

  const availableBuiltInOptions = builtInOptions.filter(option => !removedOptions.includes(option.value));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent data-testid="dialog-remove-option">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="option-select">{selectLabel}</Label>
            <Select value={selectedOption} onValueChange={setSelectedOption}>
              <SelectTrigger data-testid="select-option-to-remove">
                <SelectValue placeholder="Select option to remove" />
              </SelectTrigger>
              <SelectContent>
                {/* Built-in options */}
                {availableBuiltInOptions.length > 0 && (
                  <>
                    {availableBuiltInOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </>
                )}

                {/* Custom options */}
                {customOptions.length > 0 && (
                  <>
                    {availableBuiltInOptions.length > 0 && (
                      <div className="my-1 border-t border-border"></div>
                    )}
                    {customOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name} <span className="text-muted-foreground text-xs">(Custom)</span>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel-remove-option">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={!selectedOption}
            data-testid="button-remove-option"
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveOptionDialog;
