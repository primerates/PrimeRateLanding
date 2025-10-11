import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BUILT_IN_SOURCES } from '../data/sourceOptions';
import { useToast } from '@/hooks/use-toast';

interface RemoveSourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: (sourceValue: string) => void;
  removedSources: string[];
  title?: string;
}

const RemoveSourceDialog = ({ isOpen, onClose, onRemove, removedSources, title = 'Remove Source' }: RemoveSourceDialogProps) => {
  const [selectedSource, setSelectedSource] = useState('');
  const { toast } = useToast();

  const handleRemove = () => {
    if (selectedSource) {
      const sourceLabel = BUILT_IN_SOURCES.find(source => source.value === selectedSource)?.label || selectedSource;
      onRemove(selectedSource);
      toast({
        title: "Source Removed",
        description: `"${sourceLabel}" has been removed.`,
      });
      setSelectedSource('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedSource('');
    onClose();
  };

  const availableSources = BUILT_IN_SOURCES.filter(source => !removedSources.includes(source.value));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent data-testid="dialog-remove-source">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Select a built-in source to remove from the options.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="source-select">Source to Remove</Label>
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger data-testid="select-source-to-remove">
                <SelectValue placeholder="Select source to remove" />
              </SelectTrigger>
              <SelectContent>
                {availableSources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel-remove-source">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleRemove} 
            disabled={!selectedSource}
            data-testid="button-remove-source"
          >
            Remove Source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveSourceDialog;