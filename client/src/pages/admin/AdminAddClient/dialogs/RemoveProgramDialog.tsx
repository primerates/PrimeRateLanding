import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { type LoanCategory } from '../components/Quote/LoanProgramSelect';

interface RemoveProgramDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: (programId: string, categoryId: string) => void;
  availableCategories: LoanCategory[];
  removedBuiltInPrograms: string[];
}

const RemoveProgramDialog = ({
  isOpen,
  onClose,
  onRemove,
  availableCategories,
  removedBuiltInPrograms
}: RemoveProgramDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const { toast } = useToast();

  const handleRemove = () => {
    if (selectedProgram && selectedCategory) {
      const category = availableCategories.find(cat => cat.id === selectedCategory);
      const program = category?.programs.find(prog => prog.id === selectedProgram);
      const programName = program?.name || '';

      onRemove(selectedProgram, selectedCategory);
      toast({
        title: "Program Removed",
        description: `"${programName}" has been removed.`,
      });
      setSelectedCategory('');
      setSelectedProgram('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedCategory('');
    setSelectedProgram('');
    onClose();
  };

  // Get programs for selected category
  // Note: availableCategories already has merged built-in + custom programs with removed ones filtered out
  const getAvailablePrograms = () => {
    if (!selectedCategory) return [];
    const category = availableCategories.find(cat => cat.id === selectedCategory);
    return category?.programs || [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-remove-program">
        <DialogHeader>
          <DialogTitle>Remove Loan Program</DialogTitle>
          <DialogDescription>
            Select a category and then a program to remove.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-for-removal">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setSelectedProgram(''); // Reset program when category changes
              }}
            >
              <SelectTrigger data-testid="select-category-for-removal">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(category => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    data-testid={`select-category-removal-${category.id}`}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
            <div className="space-y-2">
              <Label htmlFor="program-to-remove">Program</Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger data-testid="select-program-to-remove">
                  <SelectValue placeholder="Select Program to Remove" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePrograms().map(program => (
                    <SelectItem
                      key={program.id}
                      value={program.id}
                      data-testid={`select-program-remove-${program.id}`}
                    >
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            data-testid="button-cancel-remove-program"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={!selectedProgram || !selectedCategory}
            data-testid="button-confirm-remove-program"
          >
            Remove Program
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveProgramDialog;
