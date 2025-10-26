import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface EscrowInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  propertyInsurance: string;
  onPropertyInsuranceChange: (value: string) => void;
  propertyTax: string;
  onPropertyTaxChange: (value: string) => void;
  statementEscrowBalance: string;
  onStatementEscrowBalanceChange: (value: string) => void;
  calculatedTotal: number;
}

/**
 * Dialog component that displays and allows editing of New Escrow Reserves details
 */
const EscrowInfoDialog = ({
  isOpen,
  onClose,
  propertyInsurance,
  onPropertyInsuranceChange,
  propertyTax,
  onPropertyTaxChange,
  statementEscrowBalance,
  onStatementEscrowBalanceChange,
  calculatedTotal
}: EscrowInfoDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 [&>button]:text-white [&>button:hover]:text-gray-200" data-testid="dialog-escrow-info">
        <DialogHeader className="text-white p-6 rounded-t-lg" style={{ backgroundColor: '#1a3373' }}>
          <DialogTitle className="text-white">New Escrow Reserves</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 px-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Property Insurance Reserves */}
          <div className="flex items-center gap-4">
            <Label htmlFor="property-insurance" className="w-48 text-right">
              Property Insurance Reserves:
            </Label>
            <div className="flex items-center border border-input bg-background px-3 rounded-md flex-1">
              <span className="text-muted-foreground text-sm">$</span>
              <Input
                id="property-insurance"
                type="text"
                placeholder=""
                value={propertyInsurance.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  onPropertyInsuranceChange(value);
                }}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                data-testid="input-property-insurance"
              />
            </div>
          </div>

          {/* Property Tax Reserves */}
          <div className="flex items-center gap-4">
            <Label htmlFor="property-tax" className="w-48 text-right">
              Property Tax Reserves:
            </Label>
            <div className="flex items-center border border-input bg-background px-3 rounded-md flex-1">
              <span className="text-muted-foreground text-sm">$</span>
              <Input
                id="property-tax"
                type="text"
                placeholder=""
                value={propertyTax.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  onPropertyTaxChange(value);
                }}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                data-testid="input-property-tax"
              />
            </div>
          </div>

          {/* Total New Escrow Reserves - Display Only (Auto-calculated) */}
          <div className="flex items-center gap-4">
            <Label htmlFor="total-monthly-escrow" className="w-48 text-right">
              Total New Escrow Reserves:
            </Label>
            <div className="flex items-center border border-input bg-muted px-3 rounded-md flex-1 h-9">
              <span className="text-base font-bold text-center w-full" data-testid="text-total-monthly-escrow">
                {calculatedTotal > 0 ? `$${calculatedTotal.toLocaleString('en-US')}` : ''}
              </span>
            </div>
          </div>

          {/* Spacing */}
          <div className="h-4"></div>

          {/* Description Text */}
          <div className="text-base text-muted-foreground mb-4">
            Your current monthly escrow balance, as shown on your latest mortgage statement, will be refunded to you once your new loan funds.
            Your new escrow reserve balance will be adjusted and updated to replace the previous balance.
          </div>

          {/* Statement Escrow Balance */}
          <div className="flex items-center gap-4" style={{ marginBottom: '32px' }}>
            <Label htmlFor="statement-escrow-balance" className="w-48 text-right">
              Statement Escrow Balance:
            </Label>
            <div className="flex items-center border border-input bg-background px-3 rounded-md flex-1">
              <span className="text-muted-foreground text-sm">$</span>
              <Input
                id="statement-escrow-balance"
                type="text"
                placeholder=""
                value={statementEscrowBalance.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  onStatementEscrowBalanceChange(value);
                }}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                data-testid="input-statement-escrow-balance"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EscrowInfoDialog;
