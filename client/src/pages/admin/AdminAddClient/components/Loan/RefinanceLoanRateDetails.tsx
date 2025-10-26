import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CurrencyInputWithToggle from '../CurrencyInputWithToggle';
import CurrencyInputWithDropdown from '../CurrencyInputWithDropdown';
import MidFicoInput from '../MidFicoInput';

type FicoType = 'mid-fico' | 'borrower-scores' | 'co-borrower-scores';

interface RefinanceLoanRateDetailsProps {
  ficoType?: FicoType;
  onCycleFicoType?: () => void;
  onOpenBorrowerScores?: () => void;
  onOpenCoBorrowerScores?: () => void;
  calculatedMidFico?: string;
  hasCoBorrower?: boolean;
}

const RefinanceLoanRateDetails = ({
  ficoType = 'mid-fico',
  onCycleFicoType = () => {},
  onOpenBorrowerScores = () => {},
  onOpenCoBorrowerScores = () => {},
  calculatedMidFico = '',
  hasCoBorrower = false
}: RefinanceLoanRateDetailsProps) => {
  const form = useFormContext();

  return (
    <Card className="bg-muted mt-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Mid FICO */}
          <MidFicoInput
            fieldPrefix="newRefinanceLoan"
            ficoType={ficoType}
            onCycleFicoType={onCycleFicoType}
            onClickBorrowerScores={onOpenBorrowerScores}
            onClickCoBorrowerScores={onOpenCoBorrowerScores}
            calculatedMidFico={calculatedMidFico}
            hasCoBorrower={hasCoBorrower}
            testIdPrefix="newRefinanceLoan"
          />

          {/* Rate Lock Status */}
          <div className="space-y-2">
            <Controller
              control={form.control}
              name="newRefinanceLoan.rateLockStatus"
              render={({ field }) => (
                <Label
                  htmlFor="newRefinanceLoan-rateLockStatus"
                  className={(field.value === 'not-locked' || field.value === 'expired' || !field.value) ? 'text-red-500' : ''}
                >
                  Rate Lock Status
                </Label>
              )}
            />
            <Controller
              name="newRefinanceLoan.rateLockStatus"
              control={form.control}
              defaultValue="not-locked"
              render={({ field }) => (
                <Select
                  value={field.value || "not-locked"}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger data-testid="select-newRefinanceLoan-rateLockStatus">
                    <SelectValue placeholder="Not Locked" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="locked">Locked</SelectItem>
                    <SelectItem value="not-locked">Not Locked</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Rate Lock Date */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="newRefinanceLoan-rateLockDate" className="text-sm">
                {form.watch("newRefinanceLoan.rateLockDateToggle") ? "Lock Date - 10 Year Bond" : "Rate Lock Date"}
              </Label>
              <Controller
                control={form.control}
                name="newRefinanceLoan.rateLockDateToggle"
                defaultValue={false}
                render={({ field }) => (
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    data-testid="toggle-newRefinanceLoan-rateLockDate"
                    className="scale-[0.8]"
                  />
                )}
              />
            </div>
            {form.watch("newRefinanceLoan.rateLockDateToggle") ? (
              <Input
                id="newRefinanceLoan-rateLockDate"
                {...form.register('newRefinanceLoan.rateLockDate')}
                data-testid="input-newRefinanceLoan-rateLockDate"
              />
            ) : (
              <Input
                id="newRefinanceLoan-rateLockDate"
                value={form.watch('newRefinanceLoan.rateLockDate') || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  let formatted = '';
                  if (value.length > 0) {
                    formatted = value.substring(0, 2);
                    if (value.length > 2) {
                      formatted += '/' + value.substring(2, 4);
                      if (value.length > 4) {
                        formatted += '/' + value.substring(4, 8);
                      }
                    }
                  }
                  form.setValue('newRefinanceLoan.rateLockDate', formatted);
                }}
                placeholder="MM/DD/YYYY"
                maxLength={10}
                data-testid="input-newRefinanceLoan-rateLockDate"
              />
            )}
          </div>

          {/* Rate Lock Expiration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="newRefinanceLoan-rateLockExpiration" className="text-sm">
                {form.watch("newRefinanceLoan.rateLockExpirationToggle") ? "Rate Lock Duration" : "Rate Lock Expiration"}
              </Label>
              <Controller
                control={form.control}
                name="newRefinanceLoan.rateLockExpirationToggle"
                defaultValue={false}
                render={({ field }) => (
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    data-testid="toggle-newRefinanceLoan-rateLockExpiration"
                    className="scale-[0.8]"
                  />
                )}
              />
            </div>
            {form.watch("newRefinanceLoan.rateLockExpirationToggle") ? (
              <Input
                id="newRefinanceLoan-rateLockExpiration"
                value={form.watch('newRefinanceLoan.rateLockExpiration') || ''}
                onChange={(e) => {
                  form.setValue('newRefinanceLoan.rateLockExpiration', e.target.value);
                }}
                placeholder="Enter duration"
                data-testid="input-newRefinanceLoan-rateLockExpiration"
              />
            ) : (
              <Input
                id="newRefinanceLoan-rateLockExpiration"
                value={form.watch('newRefinanceLoan.rateLockExpiration') || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  let formatted = '';
                  if (value.length > 0) {
                    formatted = value.substring(0, 2);
                    if (value.length > 2) {
                      formatted += '/' + value.substring(2, 4);
                      if (value.length > 4) {
                        formatted += '/' + value.substring(4, 8);
                      }
                    }
                  }
                  form.setValue('newRefinanceLoan.rateLockExpiration', formatted);
                }}
                placeholder="MM/DD/YYYY"
                maxLength={10}
                data-testid="input-newRefinanceLoan-rateLockExpiration"
              />
            )}
          </div>

          {/* Lender Credit/Broker Credit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="newRefinanceLoan-lenderCredit" className="text-sm">
                {form.watch("newRefinanceLoan.brokerCreditToggle") ? "Broker Credit" : "Lender Credit"}
              </Label>
              <Controller
                control={form.control}
                name="newRefinanceLoan.brokerCreditToggle"
                defaultValue={false}
                render={({ field }) => (
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    data-testid="toggle-newRefinanceLoan-brokerCredit"
                    className="scale-[0.8]"
                  />
                )}
              />
            </div>
            <Controller
              control={form.control}
              name="newRefinanceLoan.lenderCredit"
              defaultValue=""
              render={({ field }) => {
                const numVal = field.value ? field.value.replace(/[^\d]/g, '') : '';
                const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

                return (
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id="newRefinanceLoan-lenderCredit"
                      type="text"
                      placeholder="0"
                      value={displayValue}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        field.onChange(value);
                      }}
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid="input-newRefinanceLoan-lenderCredit"
                    />
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* Row 4: Interest Rate, Principal & Interest Payment, Tax & Insurance Payment, Total Monthly Payment, HOA, Attached to Property */}
        <div className="grid grid-cols-1 md:grid-cols-10 gap-4 mt-6">
          {/* Interest Rate */}
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="newRefinanceLoan-interestRate">Interest Rate</Label>
            <Controller
              control={form.control}
              name="newRefinanceLoan.interestRate"
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
                      id="newRefinanceLoan-interestRate"
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
                      data-testid="input-newRefinanceLoan-interestRate"
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
              fieldPrefix="newRefinanceLoan"
              fieldName="principalAndInterestPayment"
              toggleFieldName="principalInterestPaymentToggle"
              defaultLabel="Principal & Interest Payment"
              toggledLabel="Interest Only Payment"
              testId="input-newRefinanceLoan-principalInterestPayment"
            />
          </div>

          {/* Tax & Insurance Payment */}
          <div className="md:col-span-2">
            <CurrencyInputWithDropdown
              fieldPrefix="newRefinanceLoan"
              fieldName="taxInsurancePayment"
              selectorFieldName="taxInsurancePaymentSelector"
              labelOptions={[
                { value: 'tax-and-insurance', label: 'Tax & Insurance Payment' },
                { value: 'tax-only', label: 'Tax Payment Only' },
                { value: 'insurance-only', label: 'Insurance Payment Only' }
              ]}
              testId="input-newRefinanceLoan-taxInsurancePayment"
            />
          </div>

          {/* Total Monthly Payment */}
          <div className="md:col-span-2">
            <CurrencyInputWithToggle
              fieldPrefix="newRefinanceLoan"
              fieldName="totalMonthlyPayment"
              defaultLabel="Total Monthly Payment"
              testId="input-newRefinanceLoan-totalMonthlyPayment"
              showToggle={false}
              readOnly={true}
              bgMuted={true}
              calculateValue={(form) => {
                const principalAndInterest = form.watch("newRefinanceLoan.principalAndInterestPayment") || '';
                const taxInsurance = form.watch("newRefinanceLoan.taxInsurancePayment") || '';

                const pi = principalAndInterest ? parseInt(principalAndInterest.replace(/,/g, '')) : 0;
                const ti = taxInsurance ? parseInt(taxInsurance.replace(/,/g, '')) : 0;
                const total = pi + ti;
                return total > 0 ? total.toLocaleString() : '';
              }}
            />
          </div>

          {/* HOA */}
          <div className="md:col-span-1">
            <CurrencyInputWithToggle
              fieldPrefix="newRefinanceLoan"
              fieldName="hoa"
              defaultLabel="HOA"
              testId="input-newRefinanceLoan-hoa"
              showToggle={false}
            />
          </div>

          {/* Attached to Property */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="newRefinanceLoan-attachedToProperty">Attached to Property</Label>
            <Controller
              control={form.control}
              name="newRefinanceLoan.attachedToProperty"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);

                    // Copy property address to loan when attached
                    if (value && value !== 'select') {
                      const properties = form.watch('property.properties') || [];
                      const selectedProperty = properties.find((p: any) => p.id === value);
                      if (selectedProperty?.address) {
                        form.setValue('newRefinanceLoan.propertyAddress' as any, {
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
                  <SelectTrigger data-testid="select-newRefinanceLoan-attachedToProperty">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select</SelectItem>
                    {(() => {
                      const properties = form.watch('property.properties') || [];
                      return properties
                        .filter((property: any) => property.isSubject === true)
                        .map((property: any) => {
                          const address = property.address;
                          const streetAddress = address?.street;

                          let displayText;

                          if (!streetAddress) {
                            displayText = 'Subject Property';
                          } else {
                            displayText = streetAddress;
                          }

                          return (
                            <SelectItem key={`property-${property.id}`} value={property.id}>
                              {displayText}
                            </SelectItem>
                          );
                        });
                    })()}
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

export default RefinanceLoanRateDetails;
