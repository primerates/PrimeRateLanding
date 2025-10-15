import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';

interface ValuationSummaryDialogProps {
  isOpen: boolean;
  propertyIndex: number | null;
  onClose: () => void;
}

const ValuationSummaryDialog = ({
  isOpen,
  propertyIndex,
  onClose
}: ValuationSummaryDialogProps) => {
  const form = useFormContext<InsertClient>();

  // Format currency function (simplified version)
  const formatCurrency = (value: string): string => {
    if (!value || value.trim() === '') return 'Not available';
    
    // Remove any existing formatting
    const numericValue = value.replace(/[^\d.]/g, '');
    const num = parseFloat(numericValue);
    
    if (isNaN(num)) return 'Not available';
    
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (propertyIndex === null) return null;

  const property = (form.watch('property.properties') || [])[propertyIndex];
  const clientEstimate = property?.estimatedValue || '';
  const zillowEstimate = property?.valuations?.zillow || '';
  const realtorEstimate = property?.valuations?.realtor || '';
  const redfinEstimate = property?.valuations?.redfin || '';
  const appraisedValue = property?.appraisedValue || '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-testid="dialog-valuation-summary">
        <DialogHeader>
          <DialogTitle>Property Valuation Summary</DialogTitle>
          <DialogDescription>
            All valuation estimates for this property
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4">
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground">APPRAISAL</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(appraisedValue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground">CLIENT ESTIMATE</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(clientEstimate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground">ZILLOW.COM</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(zillowEstimate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground">REALTOR.COM</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(realtorEstimate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground">REDFIN.COM</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(redfinEstimate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={onClose}
            data-testid="button-valuation-summary-close"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ValuationSummaryDialog;