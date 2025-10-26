import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import FormInput from '../../FormInput';
import FormSelect from '../../FormSelect';
import { US_STATES_OPTIONS } from '../../../data/formOptions';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';
import { useState } from 'react';

interface EmployerAddressRowProps {
  calculatedAdjustedNewFhaMip: string;
  cardId: string;
  getEmployerFieldPath: (cardId: string, fieldName: string) => string;
  fieldPrefix: 'income' | 'coBorrowerIncome';
  employmentType: 'employers' | 'secondEmployers';
}

const EmployerAddressRow = ({ cardId, getEmployerFieldPath, fieldPrefix, employmentType }: EmployerAddressRowProps) => {
  const form = useFormContext<InsertClient>();
  const {
    countyLookupLoading,
    setCountyLookupLoading
  } = useAdminAddClientStore();

  const [countyOptions, setCountyOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Generate unique loading key based on field prefix, employment type, and card ID
  const loadingKey = `${fieldPrefix}-${employmentType}-${cardId}`;

  const lookupCountyFromZip = async (zipCode: string): Promise<Array<{ value: string; label: string }>> => {
    if (!zipCode || zipCode.length < 5) return [];

    try {
      const response = await fetch(`/api/county-lookup/${zipCode}`);
      if (response.ok) {
        const data = await response.json();
        return data.counties || [];
      }
    } catch (error) {
      console.error('County lookup failed:', error);
    }
    return [];
  };

  const handleZipCodeLookup = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setCountyOptions([]);
      return;
    }

    setCountyLookupLoading((prev) => ({ ...prev, [loadingKey]: true }));
    const counties = await lookupCountyFromZip(zipCode);

    if (counties.length === 1) {
      // Auto-fill single county result
      form.setValue(getEmployerFieldPath(cardId, 'employerAddress.county') as any, counties[0].label, { shouldDirty: true });
      setCountyOptions([]); // Keep as input field but with value filled
    } else if (counties.length > 1) {
      // Show dropdown for multiple counties
      setCountyOptions(counties);
    } else {
      // No counties found, keep as input field
      setCountyOptions([]);
    }

    setCountyLookupLoading((prev) => ({ ...prev, [loadingKey]: false }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-3">
        <FormInput
          label="Street Address"
          value={form.watch(getEmployerFieldPath(cardId, 'employerAddress.street') as any) || ''}
          onChange={(value) => form.setValue(getEmployerFieldPath(cardId, 'employerAddress.street') as any, value)}
          id={`${cardId}-employer-street`}
          testId={`input-${cardId}-employer-street`}
          className="space-y-2"
        />
      </div>

      <div className="space-y-2 md:col-span-1">
        <Label htmlFor={`${cardId}-employer-unit`}>Unit/Suite</Label>
        <Input
          id={`${cardId}-employer-unit`}
          value={form.watch(getEmployerFieldPath(cardId, 'employerAddress.unit') as any) || ''}
          onChange={(e) => form.setValue(getEmployerFieldPath(cardId, 'employerAddress.unit') as any, e.target.value)}
          data-testid={`input-${cardId}-employer-unit`}
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`${cardId}-employer-city`}>City</Label>
        <Input
          id={`${cardId}-employer-city`}
          value={form.watch(getEmployerFieldPath(cardId, 'employerAddress.city') as any) || ''}
          onChange={(e) => form.setValue(getEmployerFieldPath(cardId, 'employerAddress.city') as any, e.target.value)}
          data-testid={`input-${cardId}-employer-city`}
        />
      </div>

      <div className="md:col-span-1">
        <FormSelect
          label="State"
          value={form.watch(getEmployerFieldPath(cardId, 'employerAddress.state') as any) || ''}
          onValueChange={(value) => form.setValue(getEmployerFieldPath(cardId, 'employerAddress.state') as any, value)}
          options={US_STATES_OPTIONS}
          placeholder="State"
          testId={`select-${cardId}-employer-state`}
          className="space-y-2"
          displayValue={true}
        />
      </div>

      <div className="md:col-span-1">
        <FormInput
          label="ZIP Code"
          value={form.watch(getEmployerFieldPath(cardId, 'employerAddress.zip') as any) || ''}
          onChange={(value) => form.setValue(getEmployerFieldPath(cardId, 'employerAddress.zip') as any, value)}
          onBlur={(e) => handleZipCodeLookup(e.target.value)}
          id={`${cardId}-employer-zip`}
          testId={`input-${cardId}-employer-zip`}
          className="space-y-2"
        />
      </div>

      <div className="md:col-span-2">
        {countyOptions.length > 0 ? (
          <FormSelect
            label="County"
            value={form.watch(getEmployerFieldPath(cardId, 'employerAddress.county') as any) || ''}
            onValueChange={(value) => {
              if (value === 'manual-entry') {
                form.setValue(getEmployerFieldPath(cardId, 'employerAddress.county') as any, '');
                setCountyOptions([]);
              } else {
                // Find the selected county to get its label for display
                const selectedCounty = countyOptions.find(county => county.value === value);
                form.setValue(getEmployerFieldPath(cardId, 'employerAddress.county') as any, selectedCounty?.label || value, { shouldDirty: true });
              }
            }}
            options={[
              ...countyOptions,
              { value: 'manual-entry', label: 'Enter county manually' }
            ]}
            placeholder={(countyLookupLoading as any)[loadingKey] ? "Looking up counties..." : "Select county"}
            testId={`select-${cardId}-employer-county`}
            className="space-y-2"
          />
        ) : (
          <FormInput
            label="County"
            value={form.watch(getEmployerFieldPath(cardId, 'employerAddress.county') as any) || ''}
            onChange={(value) => form.setValue(getEmployerFieldPath(cardId, 'employerAddress.county') as any, value)}
            placeholder={(countyLookupLoading as any)[loadingKey] ? "Looking up counties..." : ""}
            id={`${cardId}-employer-county`}
            testId={`input-${cardId}-employer-county`}
            className="space-y-2"
          />
        )}
      </div>

      <div className="md:col-span-2">
        <FormSelect
          label="Full-Time / Part-Time"
          value={form.watch(getEmployerFieldPath(cardId, 'employmentType') as any) || ''}
          onValueChange={(value) => form.setValue(getEmployerFieldPath(cardId, 'employmentType') as any, value)}
          options={[
            { value: 'Full-Time', label: 'Full-Time' },
            { value: 'Part-Time', label: 'Part-Time' }
          ]}
          placeholder="Select"
          testId={`select-${cardId}-employer-employment-type`}
          className="space-y-2"
        />
      </div>
    </div>
  );
};

export default EmployerAddressRow;