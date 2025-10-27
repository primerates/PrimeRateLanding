import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { type ThirdPartyCategory } from '../../hooks/useThirdPartyServices';

interface RemoveServicesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: (categoryId: string, serviceId: string) => void;
  categories: ThirdPartyCategory[];
}

/**
 * Dialog for removing a service
 */
const RemoveServicesDialog = ({ isOpen, onClose, onRemove, categories }: RemoveServicesDialogProps) => {
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const handleClose = () => {
    setSelectedServiceId('');
    setSelectedCategoryId('');
    onClose();
  };

  const handleRemove = () => {
    if (selectedServiceId && selectedCategoryId) {
      onRemove(selectedCategoryId, selectedServiceId);
      setSelectedServiceId('');
      setSelectedCategoryId('');
      onClose();
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    // Find which category this service belongs to
    const categoryId = categories.find(cat =>
      cat.services.some(service => service.id === serviceId)
    )?.id;
    setSelectedCategoryId(categoryId || '');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-remove-services-tps">
        <DialogHeader>
          <DialogTitle>Remove Service</DialogTitle>
          <DialogDescription>
            Select a service to remove.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-to-remove-tps">Service</Label>
            <Select value={selectedServiceId} onValueChange={handleServiceSelect}>
              <SelectTrigger data-testid="select-service-to-remove-tps">
                <SelectValue placeholder="Select Service to Remove" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) =>
                  category.services.map((service) => (
                    <SelectItem
                      key={service.id}
                      value={service.id}
                      data-testid={`select-remove-service-${service.id}`}
                    >
                      • {service.serviceName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            data-testid="button-cancel-remove-service-tps"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemove}
            disabled={!selectedServiceId}
            data-testid="button-confirm-remove-service-tps"
          >
            Remove Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveServicesDialog;
