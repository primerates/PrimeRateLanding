import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AddCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (categoryName: string) => void;
}

const AddCategoryDialog = ({ isOpen, onClose, onAdd }: AddCategoryDialogProps) => {
  const [categoryName, setCategoryName] = useState('');
  const { toast } = useToast();

  const handleAdd = () => {
    if (categoryName.trim()) {
      onAdd(categoryName.trim());
      toast({
        title: "Category Added",
        description: `"${categoryName.trim()}" has been added to loan programs.`,
      });
      setCategoryName('');
      onClose();
    }
  };

  const handleClose = () => {
    setCategoryName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-add-category">
        <DialogHeader>
          <DialogTitle>Add Loan Program Category</DialogTitle>
          <DialogDescription>
            Create a new category for loan programs. The category will be displayed in green.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="new-category-name">Category Name</Label>
            <Input
              id="new-category-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Government Loans"
              data-testid="input-new-category-name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            data-testid="button-cancel-add-category"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!categoryName.trim()}
            data-testid="button-save-add-category"
          >
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
