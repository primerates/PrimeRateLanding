import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CurrencyInputWithToggle from '../CurrencyInputWithToggle';

interface PrimaryLoanRateDetailsProps {
  loanId: string;
}

const PrimaryLoanRateDetails = ({ loanId }: PrimaryLoanRateDetailsProps) => {
  const form = useFormContext();
  const fieldPrefix = `currentLoan.${loanId}`;

  return (
    <Card className="bg-muted mt-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
          {/* Interest Rate */}
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor={`${loanId}-interestRate`}>Interest Rate</Label>
            <Controller
              control={form.control}
              name={`${fieldPrefix}.interestRate`}
              defaultValue=""
              render={({ field }) => {
                const numVal = field.value ? field.value.replace(/[^\d.]/g, '') : '';
                const parts = numVal.split('.');
                let displayValue = parts[0];
                if (parts.length > 1) {
                  displayValue += '.' + parts[1].substring(0, 3);
                }

                return (
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <Input
                      id={`${loanId}-interestRate`}
                      type="text"
                      placeholder="0.000"
                      value={displayValue}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d.]/g, '');
                        const parts = value.split('.');
                        if (parts.length > 2) return;
                        if (parts.length === 2 && parts[1].length > 3) return;
                        field.onChange(value);
                      }}
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid={`input-${loanId}-interestRate`}
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                );
              }}
            />
          </div>

          {/* Principal & Interest Payment */}
          <div className="md:col-span-2">
            <CurrencyInputWithToggle
              fieldPrefix={fieldPrefix}
              fieldName="principalAndInterestPayment"
              defaultLabel="Principal & Interest Payment"
              testId={`input-${loanId}-principalInterestPayment`}
              showToggle={false}
            />
          </div>

          {/* Tax & Insurance Payment */}
          <div className="md:col-span-2">
            <CurrencyInputWithToggle
              fieldPrefix={fieldPrefix}
              fieldName="taxInsurancePayment"
              defaultLabel="Tax & Insurance Payment"
              testId={`input-${loanId}-taxInsurancePayment`}
              showToggle={false}
            />
          </div>

          {/* Total Monthly Payment */}
          <div className="md:col-span-2">
            <CurrencyInputWithToggle
              fieldPrefix={fieldPrefix}
              fieldName="totalMonthlyPayment"
              defaultLabel="Total Monthly Payment"
              testId={`input-${loanId}-totalMonthlyPayment`}
              showToggle={false}
              readOnly={true}
              bgMuted={true}
              calculateValue={(form) => {
                const principalAndInterest = form.watch(`${fieldPrefix}.principalAndInterestPayment`) || '';
                const taxInsurance = form.watch(`${fieldPrefix}.taxInsurancePayment`) || '';

                const pi = principalAndInterest ? parseInt(principalAndInterest.replace(/,/g, '')) : 0;
                const ti = taxInsurance ? parseInt(taxInsurance.replace(/,/g, '')) : 0;
                const total = pi + ti;
                return total > 0 ? total.toLocaleString() : '';
              }}
            />
          </div>

          {/* Attached to Property */}
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor={`${loanId}-attachedToProperty`}>Attached to Property</Label>
            <Controller
              control={form.control}
              name={`${fieldPrefix}.attachedToProperty`}
              render={({ field }) => (
                <Select
                  value={field.value}
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

export default PrimaryLoanRateDetails;
