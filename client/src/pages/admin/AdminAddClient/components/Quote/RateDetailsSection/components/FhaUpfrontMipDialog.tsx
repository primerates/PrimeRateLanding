import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';
import { useFhaMipCalculations } from '../hooks/useFhaMipCalculations';

interface FhaUpfrontMipDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const FhaUpfrontMipDialog = ({ isOpen, onClose }: FhaUpfrontMipDialogProps) => {
  const { toast } = useToast();
  const quoteData = useAdminAddClientStore((state) => state.quoteData);
  const updateQuoteData = useAdminAddClientStore((state) => state.updateQuoteData);

  // Use the FHA MIP calculations hook
  const {
    calculatedFhaMipCost,
    calculatedRemainingRefundValue,
    calculatedEstimatedMipRefund,
    calculatedNewFhaMipCost,
    calculatedAdjustedNewFhaMip
  } = useFhaMipCalculations({
    fhaMipLoanStartMonthYear: quoteData.fhaMipLoanStartMonthYear,
    fhaMipStartingLoanBalance: quoteData.fhaMipStartingLoanBalance,
    fhaMipCostFactor: quoteData.fhaMipCostFactor,
    fhaMipRemainingMonths: quoteData.fhaMipRemainingMonths,
    fhaNewLoanAmount: quoteData.fhaNewLoanAmount,
    fhaNewMipCostFactor: quoteData.fhaNewMipCostFactor,
  });

  const handleSave = () => {
    onClose();
    toast({
      title: 'Settings Saved',
      description: 'FHA Upfront MIP settings have been saved successfully.',
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" data-testid="dialog-fha-mip">
          <DialogHeader className="bg-primary text-white -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
            <DialogTitle className="text-white">FHA Upfront Mortgage Insurance Premium</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Section Title */}
            <div>
              <h3 className="text-base font-semibold text-purple-600">Existing FHA Upfront MIP Refund Estimate</h3>
            </div>

            {/* Loan Start Month/Year */}
            <div className="flex items-center gap-4 justify-end">
              <Label htmlFor="fha-mip-loan-start" className="text-left">
                Loan Start Month/Year:
              </Label>
              <Input
                id="fha-mip-loan-start"
                type="text"
                placeholder="MM/YYYY"
                value={quoteData.fhaMipLoanStartMonthYear}
                onChange={(e) => updateQuoteData({ fhaMipLoanStartMonthYear: e.target.value })}
                className="w-64"
                data-testid="input-fha-mip-loan-start"
              />
            </div>

            {/* Starting Existing Loan Balance */}
            <div className="flex items-center gap-4 justify-end">
              <Label htmlFor="fha-mip-starting-balance" className="text-left">
                Starting Loan Balance:
              </Label>
              <div className="flex items-center border border-input px-3 rounded-md w-64 bg-background">
                <span className="text-muted-foreground text-sm">$</span>
                <Input
                  id="fha-mip-starting-balance"
                  type="text"
                  placeholder="0"
                  value={quoteData.fhaMipStartingLoanBalance}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    const formatted = value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
                    updateQuoteData({ fhaMipStartingLoanBalance: formatted });
                  }}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  data-testid="input-fha-mip-starting-balance"
                />
              </div>
            </div>

            {/* FHA MIP Cost Factor */}
            <div className="flex items-center gap-4 justify-end">
              <Label htmlFor="fha-mip-cost-factor" className="text-left">
                Prior FHA MIP Cost Factor:
              </Label>
              <div className="flex items-center border border-input px-3 rounded-md w-64 bg-background">
                <Input
                  id="fha-mip-cost-factor"
                  type="text"
                  placeholder="0.00"
                  value={quoteData.fhaMipCostFactor}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d.]/g, '');
                    updateQuoteData({ fhaMipCostFactor: value });
                  }}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  data-testid="input-fha-mip-cost-factor"
                />
                <span className="text-muted-foreground text-sm">%</span>
              </div>
            </div>

            {/* FHA MIP Cost */}
            <div className="flex items-center gap-4 justify-end">
              <Label htmlFor="fha-mip-cost" className="text-left">
                Prior FHA MIP Cost:
              </Label>
              <div className="flex items-center border border-input px-3 rounded-md w-64 bg-background">
                <span className="text-muted-foreground text-sm">$</span>
                <Input
                  id="fha-mip-cost"
                  type="text"
                  placeholder="0"
                  value={calculatedFhaMipCost}
                  disabled
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-100"
                  data-testid="input-fha-mip-cost"
                />
              </div>
            </div>

            {/* Remaining Months */}
            <div className="flex items-center gap-4 justify-end">
              <Label htmlFor="fha-mip-remaining-months" className="text-left">
                Remaining Months:
              </Label>
              <Input
                id="fha-mip-remaining-months"
                type="text"
                placeholder="0"
                value={quoteData.fhaMipRemainingMonths}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^\d]/g, '').slice(0, 2);
                  const numValue = parseInt(value || '0', 10);
                  if (numValue > 36) value = '36';
                  updateQuoteData({ fhaMipRemainingMonths: value });
                }}
                maxLength={2}
                className="w-64"
                data-testid="input-fha-mip-remaining-months"
              />
            </div>

            {/* Remaining Refund Value */}
            <div className="flex items-center gap-4 justify-end">
              <Label htmlFor="fha-mip-remaining-refund-value" className="text-left">
                Remaining Refund Value:
              </Label>
              <div className="flex items-center border border-input px-3 rounded-md w-64 bg-background">
                <Input
                  id="fha-mip-remaining-refund-value"
                  type="text"
                  placeholder="0"
                  value={calculatedRemainingRefundValue}
                  disabled
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-100"
                  data-testid="input-fha-mip-remaining-refund-value"
                />
                <span className="text-muted-foreground text-sm">%</span>
              </div>
            </div>

            {/* Estimated MIP Credit/Refund */}
            <div className="flex items-center gap-4 justify-end">
              <Label htmlFor="fha-mip-estimated-credit" className="text-left">
                Est. Prior FHA Upfront MIP Refund:
              </Label>
              <div className="flex items-center border border-input px-3 rounded-md w-64 bg-background">
                <span className="text-muted-foreground text-sm">$</span>
                <Input
                  id="fha-mip-estimated-credit"
                  type="text"
                  placeholder="0"
                  value={calculatedEstimatedMipRefund}
                  disabled
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-100 font-bold text-purple-600"
                  data-testid="input-fha-mip-estimated-credit"
                />
              </div>
            </div>

            {/* New FHA MIP Estimate Section */}
            <div className="border-t pt-12 mt-6">
              {/* Section Title */}
              <div>
                <h3 className="text-base font-semibold text-green-600">New FHA Upfront MIP Estimate</h3>
              </div>

              <div className="space-y-6 mt-6">
                {/* New Loan Amount */}
                <div className="flex items-center gap-4 justify-end">
                  <Label htmlFor="new-loan-amount" className="text-left">
                    New Loan Amount:
                  </Label>
                  <div className="flex items-center border border-input px-3 rounded-md w-64 bg-background">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id="new-loan-amount"
                      type="text"
                      placeholder="0"
                      value={quoteData.fhaNewLoanAmount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        const formatted = value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
                        updateQuoteData({ fhaNewLoanAmount: formatted });
                      }}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      data-testid="input-new-loan-amount"
                    />
                  </div>
                </div>

                {/* New FHA MIP Cost Factor */}
                <div className="flex items-center gap-4 justify-end">
                  <Label htmlFor="new-fha-mip-cost-factor" className="text-left">
                    New FHA MIP Cost Factor:
                  </Label>
                  <div className="flex items-center border border-input px-3 rounded-md w-64 bg-background">
                    <Input
                      id="new-fha-mip-cost-factor"
                      type="text"
                      placeholder="0.00"
                      value={quoteData.fhaNewMipCostFactor}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d.]/g, '');
                        updateQuoteData({ fhaNewMipCostFactor: value });
                      }}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      data-testid="input-new-fha-mip-cost-factor"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>

                {/* New FHA MIP Cost */}
                <div className="flex items-center gap-4 justify-end">
                  <Label htmlFor="new-fha-mip-cost" className="text-left">
                    New FHA MIP Cost:
                  </Label>
                  <div className="flex items-center border border-input px-3 rounded-md w-64 bg-background">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id="new-fha-mip-cost"
                      type="text"
                      placeholder="0"
                      value={calculatedNewFhaMipCost}
                      disabled
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-100 font-bold text-green-600"
                      data-testid="input-new-fha-mip-cost"
                    />
                  </div>
                </div>

                <div className="border-t my-6"></div>

                <div className="flex items-center gap-4 justify-end">
                  <Label htmlFor="adjusted-new-fha-mip" className="text-left">
                    New FHA Upfront MIP Estimate:
                  </Label>
                  <div className="flex items-center border border-input px-3 rounded-md w-64 bg-green-600">
                    <span className="text-white text-sm">$</span>
                    <Input
                      id="adjusted-new-fha-mip"
                      type="text"
                      placeholder="0"
                      value={calculatedAdjustedNewFhaMip}
                      disabled
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/50 disabled:cursor-not-allowed disabled:opacity-100"
                      data-testid="input-adjusted-new-fha-mip"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border mb-2"></div>
          <p className="text-sm text-muted-foreground italic mb-3 text-right">* after crediting prior loan Upront MIP balance.</p>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-fha-mip"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              data-testid="button-save-fha-mip"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FhaUpfrontMipDialog;
