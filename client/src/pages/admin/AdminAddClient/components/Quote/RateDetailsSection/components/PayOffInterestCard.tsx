import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '../utils/formatters';

interface PayOffInterestCardProps {
  selectedRateIds: number[];
  payOffInterestValues: string[];
  setPayOffInterestValues: (values: string[]) => void;
  setThirdPartyServiceValues: (fn: (prev: { [serviceId: string]: string[] }) => { [serviceId: string]: string[] }) => void;
  escrowReserves: string;
  monthlyEscrow: string;
  calculatedTotalMonthlyEscrow: number;
  columnWidth: string;
  gridCols: string;
  onEscrowInfoClick?: () => void;
}

/**
 * Card component for Pay Off Interest and New Escrow Reserves
 */
const PayOffInterestCard = ({
  selectedRateIds,
  payOffInterestValues,
  setPayOffInterestValues,
  setThirdPartyServiceValues,
  escrowReserves,
  monthlyEscrow,
  calculatedTotalMonthlyEscrow,
  columnWidth,
  gridCols,
  onEscrowInfoClick
}: PayOffInterestCardProps) => {
  const handlePayOffInterestChange = (rateId: number, value: string) => {
    const newValues = [...payOffInterestValues];
    newValues[rateId] = value;
    setPayOffInterestValues(newValues);
    // Also update thirdPartyServiceValues['s6'] to keep them in sync
    setThirdPartyServiceValues(prev => ({
      ...prev,
      's6': newValues
    }));
  };

  return (
    <Card
      className="mt-8 transition-all duration-700 animate-roll-down border-l-4 border-l-violet-400 hover:border-2 hover:border-violet-400 transition-colors flex-none"
      style={{ width: columnWidth, maxWidth: '100%' }}
    >
      <CardContent className="pt-6 space-y-6">
        {/* Pay Off Interest Section */}
        <div>
          <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
            <div className="flex items-center justify-end pr-4">
              <Label className="text-base font-bold text-right whitespace-nowrap">Pay Off Interest</Label>
            </div>
            {selectedRateIds.map((rateId) => {
              const displayValue = formatCurrency(payOffInterestValues[rateId] || '');

              return (
                <div key={rateId} className="flex justify-center">
                  <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      type="text"
                      placeholder=""
                      value={displayValue}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        handlePayOffInterestChange(rateId, value);
                      }}
                      className="border-0 bg-transparent text-center text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                      data-testid={`input-payoff-interest-${rateId}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* New Escrow Reserves Section - Conditionally shown */}
        {escrowReserves !== 'escrow-not-included' && (
          <div className="border-t pt-6">
            <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
              <div className="flex flex-col items-end justify-center pr-4">
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onEscrowInfoClick && (
                    <button
                      type="button"
                      onClick={onEscrowInfoClick}
                      className="h-4 w-4 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      data-testid="icon-info-escrow-reserves"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </button>
                  )}
                  <Label className="text-base font-bold text-right whitespace-nowrap">New Escrow Reserves</Label>
                </div>
                {monthlyEscrow && monthlyEscrow !== 'select' && (
                  <span className="text-sm text-muted-foreground text-right mt-1">
                    {monthlyEscrow === 'includes-tax-insurance' && 'Includes Tax & Insurance'}
                    {monthlyEscrow === 'includes-tax-only' && 'Includes Tax Only'}
                    {monthlyEscrow === 'includes-insurance-only' && 'Includes Insurance Only'}
                  </span>
                )}
              </div>
              {selectedRateIds.map((rateId) => {
                const displayValue = calculatedTotalMonthlyEscrow > 0 ? calculatedTotalMonthlyEscrow.toLocaleString('en-US') : '';

                return (
                  <div key={rateId} className="flex justify-center">
                    <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                      <span className="text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        placeholder=""
                        value={displayValue}
                        readOnly
                        className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                        data-testid={`input-escrow-reserves-${rateId}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayOffInterestCard;
