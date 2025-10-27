import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type ThirdPartyCategory } from '../hooks/useThirdPartyServices';

interface CustomizeClosingCostsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  thirdPartyServices: ThirdPartyCategory[];
  thirdPartyServiceValues: { [serviceId: string]: string[] };
  onThirdPartyServiceValuesChange: (values: { [serviceId: string]: string[] }) => void;
  selectedRateIds: number[];
  selectedLoanCategory: string;
}

/**
 * Dialog component for customizing closing costs (Third Party Services)
 */
const CustomizeClosingCostsDialog = ({
  isOpen,
  onClose,
  thirdPartyServices,
  thirdPartyServiceValues,
  onThirdPartyServiceValuesChange,
  selectedRateIds,
  selectedLoanCategory
}: CustomizeClosingCostsDialogProps) => {

  const handleValueChange = (serviceId: string, value: string) => {
    // Apply the value to ALL selected rates
    const newValues = [...(thirdPartyServiceValues[serviceId] || Array(4).fill(''))];
    selectedRateIds.forEach(rateId => {
      newValues[rateId] = value;
    });

    onThirdPartyServiceValuesChange({
      ...thirdPartyServiceValues,
      [serviceId]: newValues
    });
  };

  // Helper to check if loan category is VA
  const isVALoan = selectedLoanCategory?.startsWith('VA - ') || selectedLoanCategory?.startsWith('VA Jumbo - ');

  const handleClose = () => {
    onClose();
  };

  // Get the first selected rate's values for display
  const firstRateId = selectedRateIds[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0 [&>button]:text-white [&>button:hover]:text-gray-200" data-testid="dialog-third-party-services">
        <DialogHeader className="text-white p-6 rounded-t-lg" style={{ backgroundColor: '#1a3373' }}>
          <DialogTitle className="text-white">Customize Closing Costs</DialogTitle>
        </DialogHeader>

        <div className="py-4 px-6 space-y-4">
          {/* Current Configuration Display */}
          <div className="border rounded-lg p-4 space-y-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <Label className="text-base font-semibold">Current Configuration:</Label>
            {thirdPartyServices.map((category) => (
              <div key={category.id} className="space-y-2">
                <Label className="text-sm font-bold">{category.categoryName}</Label>
                <div className="ml-4 space-y-2">
                  {category.services.map((service) => {
                    // Skip Pay Off Interest (s6) as it has its own section
                    if (service.id === 's6') return null;
                    // Skip Appraisal Inspection (s2)
                    if (service.id === 's2') return null;

                    const currentValue = firstRateId !== undefined
                      ? thirdPartyServiceValues[service.id]?.[firstRateId] || ''
                      : '';

                    // Rename "Underwriting Services" to "VA Underwriting Services" for VA loans
                    let displayName = service.serviceName;
                    if (service.id === 's4' && isVALoan) {
                      displayName = 'VA Underwriting Services';
                    }

                    return (
                      <div key={service.id} className="grid grid-cols-5 gap-2 items-center">
                        <span className="text-sm text-muted-foreground col-span-3">• {displayName}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">$</span>
                          <Input
                            type="text"
                            placeholder="0"
                            value={currentValue.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^\d]/g, '');
                              handleValueChange(service.id, value);
                            }}
                            className="w-full h-8 text-sm"
                            data-testid={`input-tps-value-${service.id}`}
                          />
                        </div>
                        <div></div>
                      </div>
                    );
                  })}
                  {category.services.filter(s => s.id !== 's6' && s.id !== 's2').length === 0 && (
                    <div className="text-sm text-muted-foreground italic">No services added yet</div>
                  )}
                </div>
              </div>
            ))}
            {thirdPartyServices.length === 0 && (
              <div className="text-sm text-muted-foreground italic">No categories added yet</div>
            )}
          </div>

          <div className="text-sm text-muted-foreground italic pt-2">
            Note: Values shown are for Rate {selectedRateIds[0] !== undefined ? selectedRateIds[0] + 1 : '1'}. Changes will be applied to all active rate columns.
          </div>
        </div>

        <DialogFooter className="gap-2 px-6 pb-6 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="hover:text-green-600"
            data-testid="button-cancel-closing-costs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleClose}
            data-testid="button-save-closing-costs"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizeClosingCostsDialog;
