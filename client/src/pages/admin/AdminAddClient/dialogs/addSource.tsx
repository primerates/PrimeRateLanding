import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AddSourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sourceName: string) => void;
  title?: string;
}

const AddSourceDialog = ({ isOpen, onClose, onAdd, title = 'Add New Source' }: AddSourceDialogProps) => {
  const [sourceName, setSourceName] = useState('');
  const { toast } = useToast();

  const handleAdd = () => {
    if (sourceName.trim()) {
      onAdd(sourceName.trim());
      toast({
        title: "Source Added",
        description: `"${sourceName.trim()}" has been added.`,
      });
      setSourceName('');
      onClose();
    }
  };

  const handleClose = () => {
    setSourceName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent data-testid="dialog-add-source">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter a name for the new source option.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="source-name">Source Name</Label>
            <Input
              id="source-name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="Enter source name"
              data-testid="input-source-name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel-add-source">
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!sourceName.trim()} data-testid="button-add-source">
            Add Source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSourceDialog;