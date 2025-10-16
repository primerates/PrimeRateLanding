import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { type LoanCategory } from '../components/Quote/LoanProgramSelect';

interface RemoveCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: (categoryId: string) => void;
  availableCategories: LoanCategory[];
  removedBuiltInCategories: string[];
}

const RemoveCategoryDialog = ({
  isOpen,
  onClose,
  onRemove,
  availableCategories,
  removedBuiltInCategories
}: RemoveCategoryDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const { toast } = useToast();

  const handleRemove = () => {
    if (selectedCategory) {
      const categoryName = availableCategories.find(cat => cat.id === selectedCategory)?.name || '';
      onRemove(selectedCategory);
      toast({
        title: "Category Removed",
        description: `"${categoryName}" has been removed.`,
      });
      setSelectedCategory('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedCategory('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-remove-category">
        <DialogHeader>
          <DialogTitle>Remove Loan Program Category</DialogTitle>
          <DialogDescription>
            Select a category to remove. All programs under this category will also be hidden.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="category-to-remove">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="select-category-to-remove">
                <SelectValue placeholder="Select Category to Remove" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(category => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    data-testid={`select-category-remove-${category.id}`}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            data-testid="button-cancel-remove-category"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={!selectedCategory}
            data-testid="button-confirm-remove-category"
          >
            Remove Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveCategoryDialog;
