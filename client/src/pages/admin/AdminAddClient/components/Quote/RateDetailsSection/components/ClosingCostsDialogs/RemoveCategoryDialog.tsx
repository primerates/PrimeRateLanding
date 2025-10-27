import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { type ThirdPartyCategory } from '../../hooks/useThirdPartyServices';

interface RemoveCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: (categoryId: string) => void;
  categories: ThirdPartyCategory[];
}

/**
 * Dialog for removing a category
 */
const RemoveCategoryDialog = ({ isOpen, onClose, onRemove, categories }: RemoveCategoryDialogProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const handleClose = () => {
    setSelectedCategoryId('');
    onClose();
  };

  const handleRemove = () => {
    if (selectedCategoryId) {
      onRemove(selectedCategoryId);
      setSelectedCategoryId('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-remove-category-tps">
        <DialogHeader>
          <DialogTitle>Remove Category</DialogTitle>
          <DialogDescription>
            Select a category to remove from the list.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="category-to-remove-tps">Category</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger data-testid="select-category-to-remove-tps">
                <SelectValue placeholder="Select Category to Remove" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    data-testid={`select-remove-category-${category.id}`}
                  >
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            data-testid="button-cancel-remove-category-tps"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemove}
            disabled={!selectedCategoryId}
            data-testid="button-confirm-remove-category-tps"
          >
            Remove Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveCategoryDialog;
