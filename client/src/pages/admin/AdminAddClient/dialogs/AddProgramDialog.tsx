import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { type LoanCategory } from '../components/Quote/LoanProgramSelect';

interface AddProgramDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (programName: string, categoryId: string) => void;
  availableCategories: LoanCategory[];
}

const AddProgramDialog = ({ isOpen, onClose, onAdd, availableCategories }: AddProgramDialogProps) => {
  const [programName, setProgramName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { toast } = useToast();

  const handleAdd = () => {
    if (programName.trim() && selectedCategory) {
      const categoryName = availableCategories.find(cat => cat.id === selectedCategory)?.name || '';
      onAdd(programName.trim(), selectedCategory);
      toast({
        title: "Program Added",
        description: `"${programName.trim()}" has been added to ${categoryName}.`,
      });
      setProgramName('');
      setSelectedCategory('');
      onClose();
    }
  };

  const handleClose = () => {
    setProgramName('');
    setSelectedCategory('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-add-program">
        <DialogHeader>
          <DialogTitle>Add Loan Program</DialogTitle>
          <DialogDescription>
            Create a new loan program and assign it to a category.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-program-name">Program Name</Label>
            <Input
              id="new-program-name"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="e.g., FHA 30 Year"
              data-testid="input-new-program-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="select-category">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="select-category-for-program">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(category => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    data-testid={`select-category-${category.id}`}
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
            data-testid="button-cancel-add-program"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!programName.trim() || !selectedCategory}
            data-testid="button-save-add-program"
          >
            Add Program
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProgramDialog;
