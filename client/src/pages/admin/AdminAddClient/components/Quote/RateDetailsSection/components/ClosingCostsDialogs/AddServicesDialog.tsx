import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { type ThirdPartyCategory } from '../../hooks/useThirdPartyServices';

interface AddServicesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (categoryId: string, serviceName: string) => void;
  categories: ThirdPartyCategory[];
}

/**
 * Dialog for adding a new service to a category
 */
const AddServicesDialog = ({ isOpen, onClose, onAdd, categories }: AddServicesDialogProps) => {
  const [serviceName, setServiceName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const handleClose = () => {
    setServiceName('');
    setSelectedCategoryId('');
    onClose();
  };

  const handleAdd = () => {
    if (serviceName.trim() && selectedCategoryId) {
      onAdd(selectedCategoryId, serviceName.trim());
      setServiceName('');
      setSelectedCategoryId('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-add-services-tps">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
          <DialogDescription>
            Select a category and enter a service name to add.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-for-service-tps">Category</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger data-testid="select-category-for-service-tps">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    data-testid={`select-category-${category.id}`}
                  >
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-service-tps">Service Name</Label>
            <Input
              id="new-service-tps"
              placeholder="Enter service name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              data-testid="input-new-service-tps"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            data-testid="button-cancel-add-service-tps"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!serviceName.trim() || !selectedCategoryId}
            data-testid="button-confirm-add-service-tps"
          >
            Add Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddServicesDialog;
