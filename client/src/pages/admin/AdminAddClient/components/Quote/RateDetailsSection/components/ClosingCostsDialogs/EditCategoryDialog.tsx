import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { type ThirdPartyCategory } from '../../hooks/useThirdPartyServices';

interface EditCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (categoryId: string, newName: string) => void;
  categories: ThirdPartyCategory[];
}

/**
 * Dialog for editing a category name
 */
const EditCategoryDialog = ({ isOpen, onClose, onEdit, categories }: EditCategoryDialogProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find(cat => cat.id === selectedCategoryId);
      setNewCategoryName(category?.categoryName || '');
    }
  }, [selectedCategoryId, categories]);

  const handleClose = () => {
    setSelectedCategoryId('');
    setNewCategoryName('');
    onClose();
  };

  const handleEdit = () => {
    if (selectedCategoryId && newCategoryName.trim()) {
      onEdit(selectedCategoryId, newCategoryName.trim());
      setSelectedCategoryId('');
      setNewCategoryName('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-edit-category-tps">
        <DialogHeader>
          <DialogTitle>Edit Category Name</DialogTitle>
          <DialogDescription>
            Select a category and enter a new name.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-to-edit-tps">Category</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger data-testid="select-category-to-edit-tps">
                <SelectValue placeholder="Select Category to Edit" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    data-testid={`select-edit-category-${category.id}`}
                  >
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCategoryId && (
            <div className="space-y-2">
              <Label htmlFor="edited-category-name-tps">New Category Name</Label>
              <Input
                id="edited-category-name-tps"
                placeholder="Enter new category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                data-testid="input-edited-category-name-tps"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            data-testid="button-cancel-edit-category-tps"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleEdit}
            disabled={!selectedCategoryId || !newCategoryName.trim()}
            data-testid="button-confirm-edit-category-tps"
          >
            Update Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;
