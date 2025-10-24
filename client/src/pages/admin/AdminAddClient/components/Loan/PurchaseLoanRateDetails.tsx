import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CurrencyInputWithToggle from '../CurrencyInputWithToggle';

const PurchaseLoanRateDetails = () => {
  const form = useFormContext();

  return (
    <Card className="bg-muted mt-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Mid FICO */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="bbb-midFico" className="text-sm">
                Mid FICO
              </Label>
              <Controller
                control={form.control}
                name="bbb.midFico"
                render={({ field }) => (
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={() => { }}
                    data-testid="toggle-bbb-fico-type"
                    className="scale-[0.8]"
                  />
                )}
              />
            </div>
            <Input
              id="bbb-midFico"
              {...form.register('bbb.midFico')}
              placeholder="Enter"
              className="border border-input bg-background px-3 rounded-md"
              data-testid="input-bbb-midFico"
            />
          </div>

          {/* Rate Lock Status */}
          <div className="space-y-2">
            <Controller
              control={form.control}
              name="bbb.rateLockStatus"
              render={({ field }) => (
                <Label
                  htmlFor="bbb-rateLockStatus"
                  className={(field.value === 'not-locked' || field.value === 'expired' || !field.value) ? 'text-red-500' : ''}
                >
                  Rate Lock Status
                </Label>
              )}
            />
            <Controller
              name="bbb.rateLockStatus"
              control={form.control}
              defaultValue="not-locked"
              render={({ field }) => (
                <Select
                  value={field.value || "not-locked"}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger data-testid="select-bbb-rateLockStatus">
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
              <Label htmlFor="bbb-rateLockDate" className="text-sm">
                {form.watch("bbb.rateLockDateToggle") ? "Lock Date - 10 Year Bond" : "Rate Lock Date"}
              </Label>
              <Controller
                control={form.control}
                name="bbb.rateLockDateToggle"
                defaultValue={false}
                render={({ field }) => (
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    data-testid="toggle-bbb-rateLockDate"
                    className="scale-[0.8]"
                  />
                )}
              />
            </div>
            {form.watch("bbb.rateLockDateToggle") ? (
              <Input
                id="bbb-rateLockDate"
                {...form.register('bbb.rateLockDate')}
                data-testid="input-bbb-rateLockDate"
              />
            ) : (
              <Input
                id="bbb-rateLockDate"
                value={form.watch('bbb.rateLockDate') || ''}
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
                  form.setValue('bbb.rateLockDate', formatted);
                }}
                placeholder="MM/DD/YYYY"
                maxLength={10}
                data-testid="input-bbb-rateLockDate"
              />
            )}
          </div>

          {/* Rate Lock Expiration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="bbb-rateLockExpiration" className="text-sm">
                {form.watch("bbb.rateLockExpirationToggle") ? "Rate Lock Duration" : "Rate Lock Expiration"}
              </Label>
              <Controller
                control={form.control}
                name="bbb.rateLockExpirationToggle"
                defaultValue={false}
                render={({ field }) => (
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    data-testid="toggle-bbb-rateLockExpiration"
                    className="scale-[0.8]"
                  />
                )}
              />
            </div>
            {form.watch("bbb.rateLockExpirationToggle") ? (
              <Input
                id="bbb-rateLockExpiration"
                value={form.watch('bbb.rateLockExpiration') || ''}
                onChange={(e) => {
                  form.setValue('bbb.rateLockExpiration', e.target.value);
                }}
                placeholder="Enter duration"
                data-testid="input-bbb-rateLockExpiration"
              />
            ) : (
              <Input
                id="bbb-rateLockExpiration"
                value={form.watch('bbb.rateLockExpiration') || ''}
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
                  form.setValue('bbb.rateLockExpiration', formatted);
                }}
                placeholder="MM/DD/YYYY"
                maxLength={10}
                data-testid="input-bbb-rateLockExpiration"
              />
            )}
          </div>
        </div>

        {/* Row 4: Interest Rate, Principal & Interest Payment, Tax & Insurance Payment, Total Monthly Payment, HOA, Attached to Property */}
        <div className="grid grid-cols-1 md:grid-cols-10 gap-4 mt-6">
          {/* Interest Rate */}
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="bbb-interestRate">Interest Rate</Label>
            <Controller
              control={form.control}
              name="bbb.interestRate"
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
                      id="bbb-interestRate"
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
                      data-testid="input-bbb-interestRate"
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
              fieldPrefix="bbb"
              fieldName="principalAndInterestPayment"
              toggleFieldName="principalInterestPaymentToggle"
              defaultLabel="Principal & Interest Payment"
              toggledLabel="Interest Only Payment"
              testId="input-bbb-principalInterestPayment"
            />
          </div>

          {/* Tax & Insurance Payment */}
          <div className="md:col-span-2">
            <CurrencyInputWithToggle
              fieldPrefix="bbb"
              fieldName="taxInsurancePayment"
              toggleFieldName="taxInsurancePaymentToggle"
              defaultLabel="Tax & Insurance Payment"
              toggledLabel="Tax Payment Only"
              toggledLabel2="Insurance Payment Only"
              testId="input-bbb-taxInsurancePayment"
              tripleToggle={true}
            />
          </div>

          {/* Total Monthly Payment */}
          <div className="md:col-span-2">
            <CurrencyInputWithToggle
              fieldPrefix="bbb"
              fieldName="totalMonthlyPayment"
              defaultLabel="Total Monthly Payment"
              testId="input-bbb-totalMonthlyPayment"
              showToggle={false}
              readOnly={true}
              bgMuted={true}
              calculateValue={(form) => {
                const principalAndInterest = form.watch("bbb.principalAndInterestPayment") || '';
                const taxInsurance = form.watch("bbb.taxInsurancePayment") || '';

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
              fieldPrefix="bbb"
              fieldName="hoa"
              defaultLabel="HOA"
              testId="input-bbb-hoa"
              showToggle={false}
            />
          </div>

          {/* Attached to Property */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bbb-attachedToProperty">Attached to Property</Label>
            <Controller
              control={form.control}
              name="bbb.attachedToProperty"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                >
                  <SelectTrigger data-testid="select-bbb-attachedToProperty">
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

export default PurchaseLoanRateDetails;
