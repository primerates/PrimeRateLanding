import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExistingLoanRateDetailsProps {
  loanId: string;
  loanType: 'second' | 'third';
}

const PREPAYMENT_PENALTY_OPTIONS = [
  { value: 'select', label: 'select' },
  { value: 'No', label: 'No' },
  { value: 'Yes - See Loan Notes', label: 'Yes - See Loan Notes' }
];

const ExistingLoanRateDetails = ({ loanId, loanType }: ExistingLoanRateDetailsProps) => {
  const form = useFormContext();

  // Use unique field prefix based on loan type and loanId
  const fieldPrefix = loanType === 'second' ? `currentSecondLoan.${loanId}` : `currentThirdLoan.${loanId}`;

  return (
    <Card className="bg-muted mt-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
          {/* Interest Rate */}
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor={`${loanId}-interestRate`}>Interest Rate</Label>
            <div className="flex items-center border border-input bg-background px-3 rounded-md">
              <Input
                id={`${loanId}-interestRate`}
                type="text"
                placeholder="0.00"
                {...form.register(`${fieldPrefix}.interestRate` as any)}
                className="border-0 bg-transparent px-2 focus-visible:ring-0"
                data-testid={`input-${loanId}-interestRate`}
              />
              <span className="text-muted-foreground text-sm">%</span>
            </div>
          </div>

          {/* Loan Balance */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${loanId}-principalInterestPayment`}>Loan Balance</Label>
            <Controller
              control={form.control}
              name={`${fieldPrefix}.principalAndInterestPayment` as any}
              defaultValue=""
              render={({ field }) => {
                const numVal = field.value ? field.value.replace(/[^\d]/g, '') : '';
                const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

                return (
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id={`${loanId}-principalInterestPayment`}
                      type="text"
                      placeholder="0"
                      value={displayValue}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        field.onChange(value);
                      }}
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid={`input-${loanId}-principalInterestPayment`}
                    />
                  </div>
                );
              }}
            />
          </div>

          {/* Monthly Payment */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${loanId}-totalMonthlyPayment`}>Monthly Payment</Label>
            <Controller
              control={form.control}
              name={`${fieldPrefix}.totalMonthlyPayment` as any}
              defaultValue=""
              render={({ field }) => {
                const numVal = field.value ? field.value.replace(/[^\d]/g, '') : '';
                const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

                return (
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id={`${loanId}-totalMonthlyPayment`}
                      type="text"
                      placeholder="0"
                      value={displayValue}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        field.onChange(value);
                      }}
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid={`input-${loanId}-totalMonthlyPayment`}
                    />
                  </div>
                );
              }}
            />
          </div>

          {/* Pre-Payment Penalty */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${loanId}-prePaymentPenalty`}>Pre-Payment Penalty</Label>
            <Controller
              control={form.control}
              name={`${fieldPrefix}.prePaymentPenalty` as any}
              render={({ field }) => (
                <Select
                  value={field.value || 'select'}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger data-testid={`select-${loanId}-prePaymentPenalty`}>
                    <SelectValue placeholder="select" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREPAYMENT_PENALTY_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Attached to Property */}
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor={`${loanId}-attachedToProperty`}>Attached to Property</Label>
            <Controller
              control={form.control}
              name={`${fieldPrefix}.attachedToProperty` as any}
              render={({ field }) => (
                <Select
                  value={field.value || 'select'}
                  onValueChange={(value) => {
                    field.onChange(value);

                    // Copy property address to loan when attached
                    if (value && value !== 'select' && value !== 'Other') {
                      const properties = form.watch('property.properties') || [];
                      const selectedProperty = properties.find((p: any) => p.id === value);
                      if (selectedProperty?.address) {
                        form.setValue(`${fieldPrefix}.propertyAddress` as any, {
                          street: selectedProperty.address.street || '',
                          unit: selectedProperty.address.unit || '',
                          city: selectedProperty.address.city || '',
                          state: selectedProperty.address.state || '',
                          zipCode: selectedProperty.address.zip || '',
                          county: selectedProperty.address.county || ''
                        });
                      }
                    }
                  }}
                >
                  <SelectTrigger data-testid={`select-${loanId}-attachedToProperty`}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select</SelectItem>
                    {(() => {
                      const properties = form.watch('property.properties') || [];
                      return properties
                        .filter((property: any) => property.use !== 'home-purchase')
                        .map((property: any) => {
                          const address = property.address;
                          const streetAddress = address?.street;
                          const city = address?.city;
                          const state = address?.state;
                          const zipCode = address?.zip;

                          let displayText;

                          if (property.use === 'primary' && !streetAddress) {
                            displayText = 'Primary Residence';
                          } else {
                            displayText = streetAddress || 'Property';
                            if (city && state) {
                              displayText += `, ${city}, ${state}`;
                            } else if (city) {
                              displayText += `, ${city}`;
                            } else if (state) {
                              displayText += `, ${state}`;
                            }
                            if (zipCode) {
                              displayText += ` ${zipCode}`;
                            }
                          }

                          return (
                            <SelectItem key={`property-${property.id}`} value={property.id}>
                              {displayText}
                            </SelectItem>
                          );
                        });
                    })()}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExistingLoanRateDetails;
