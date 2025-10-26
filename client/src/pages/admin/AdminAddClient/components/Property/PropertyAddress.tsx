import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import { US_STATES_OPTIONS } from '../../data/formOptions';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';

interface PropertyAddressProps {
  propertyId: string;
  propertyIndex: number;
}

const PropertyAddress = ({
  propertyId,
  propertyIndex
}: PropertyAddressProps) => {
  const form = useFormContext<InsertClient>();
  const {
    countyLookupLoading,
    setCountyLookupLoading
  } = useAdminAddClientStore();

  const [countyOptions, setCountyOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Generate unique loading key
  const loadingKey = `property-${propertyIndex}`;

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
      form.setValue(getPropertyFieldPath('county') as any, counties[0].label, { shouldDirty: true });
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

  // Handler for property address changes - triggers auto-copy to attached loans
  const handlePropertyAddressChange = () => {
    const properties = form.watch('property.properties') || [];
    if (propertyIndex < 0 || propertyIndex >= properties.length) return;

    const property = properties[propertyIndex];
    if (!property || !property.address) return;

    const propertyAddress = property.address;
    const propertyId = property.id;    

    // Prepare the address object to copy
    const addressToCopy = {
      street: propertyAddress.street || '',
      unit: propertyAddress.unit || '',
      city: propertyAddress.city || '',
      state: propertyAddress.state || '',
      zipCode: propertyAddress.zip || '',
      county: propertyAddress.county || ''
    };

    // Check all current loans
    const currentLoanData = form.watch('currentLoan') || {};

    Object.keys(currentLoanData).forEach((loanId) => {
      const loan = currentLoanData[loanId];
      if (loan?.attachedToProperty === propertyId) {
        form.setValue(`currentLoan.${loanId}.propertyAddress` as any, addressToCopy);
      }
    });

    // Check all second loans
    const currentSecondLoanData = form.watch('currentSecondLoan') || {};
    Object.keys(currentSecondLoanData).forEach((loanId) => {
      const loan = currentSecondLoanData[loanId];
      
      if (loan?.attachedToProperty === propertyId) {
        form.setValue(`currentSecondLoan.${loanId}.propertyAddress` as any, addressToCopy);
      }
    });

    // Check all third loans
    const currentThirdLoanData = form.watch('currentThirdLoan') || {};
    Object.keys(currentThirdLoanData).forEach((loanId) => {
      const loan = currentThirdLoanData[loanId];
      if (loan?.attachedToProperty === propertyId) {
        form.setValue(`currentThirdLoan.${loanId}.propertyAddress` as any, addressToCopy);
      }
    });
  };

  const getPropertyFieldPath = (field: string) => {
    return `property.properties.${propertyIndex}.address.${field}`;
  };

  // Check property type to determine address source
  const propertyUse = form.watch(`property.properties.${propertyIndex}.use` as any);
  const isPrimaryResidence = propertyUse === 'primary';
  const isCoBorrowerProperty = propertyUse === 'second-home' || propertyUse === 'investment';

  // Watch borrower and co-borrower addresses for syncing
  const borrowerAddress = form.watch('borrower.residenceAddress' as any);
  const coBorrowerAddress = form.watch('coBorrower.residenceAddress' as any);

  // For primary residence, sync borrower address to property address
  // For co-borrower properties, initially sync co-borrower address
  useEffect(() => {
    if (isPrimaryResidence && borrowerAddress) {
      form.setValue(getPropertyFieldPath('street') as any, borrowerAddress.street || '', { shouldDirty: false });
      form.setValue(getPropertyFieldPath('unit') as any, borrowerAddress.unit || '', { shouldDirty: false });
      form.setValue(getPropertyFieldPath('city') as any, borrowerAddress.city || '', { shouldDirty: false });
      form.setValue(getPropertyFieldPath('state') as any, borrowerAddress.state || '', { shouldDirty: false });
      form.setValue(getPropertyFieldPath('zip') as any, borrowerAddress.zip || '', { shouldDirty: false });
      form.setValue(getPropertyFieldPath('county') as any, borrowerAddress.county || '', { shouldDirty: false });

      // Also copy to attached loans for primary residence
      setTimeout(() => handlePropertyAddressChange(), 100);
    } else if (isCoBorrowerProperty && coBorrowerAddress) {
      // Only sync if property address is empty (initial sync only)
      const currentStreet = form.watch(getPropertyFieldPath('street') as any);
      if (!currentStreet) {
        form.setValue(getPropertyFieldPath('street') as any, coBorrowerAddress.street || '', { shouldDirty: false });
        form.setValue(getPropertyFieldPath('unit') as any, coBorrowerAddress.unit || '', { shouldDirty: false });
        form.setValue(getPropertyFieldPath('city') as any, coBorrowerAddress.city || '', { shouldDirty: false });
        form.setValue(getPropertyFieldPath('state') as any, coBorrowerAddress.state || '', { shouldDirty: false });
        form.setValue(getPropertyFieldPath('zip') as any, coBorrowerAddress.zip || '', { shouldDirty: false });
        form.setValue(getPropertyFieldPath('county') as any, coBorrowerAddress.county || '', { shouldDirty: false });
      }
    }
  }, [isPrimaryResidence, isCoBorrowerProperty, borrowerAddress, coBorrowerAddress, propertyIndex, form]);

  // Get values from appropriate address source
  const getFieldValue = (field: string) => {
    if (isPrimaryResidence) {
      return form.watch(`borrower.residenceAddress.${field}` as any) || '';
    } else if (isCoBorrowerProperty) {
      // For co-borrower properties, check if property address exists, otherwise use co-borrower address
      const propertyValue = form.watch(getPropertyFieldPath(field) as any) || '';
      if (propertyValue) {
        return propertyValue;
      }
      return form.watch(`coBorrower.residenceAddress.${field}` as any) || '';
    }
    return form.watch(getPropertyFieldPath(field) as any) || '';
  };

  // Handle field changes - only disable for primary residence
  const handleFieldChange = (field: string, value: string) => {
    if (!isPrimaryResidence) {
      form.setValue(getPropertyFieldPath(field) as any, value);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <FormInput
        label="Street Address *"
        value={getFieldValue('street')}
        onChange={(value) => handleFieldChange('street', value)}
        onBlur={() => !isPrimaryResidence && setTimeout(() => handlePropertyAddressChange(), 1000)}
        id={`property-address-street-${propertyId}`}
        testId={`display-property-street-${propertyId}`}
        className="space-y-2 md:col-span-3"
        disabled={isPrimaryResidence}
      />
      
      <FormInput
        label="Unit/Apt"
        value={getFieldValue('unit')}
        onChange={(value) => handleFieldChange('unit', value)}
        id={`property-address-unit-${propertyId}`}
        testId={`display-property-unit-${propertyId}`}
        className="space-y-2 md:col-span-1"
        disabled={isPrimaryResidence}
      />
      
      <FormInput
        label="City *"
        value={getFieldValue('city')}
        onChange={(value) => handleFieldChange('city', value)}
        onBlur={() => !isPrimaryResidence && setTimeout(() => handlePropertyAddressChange(), 1000)}
        id={`property-address-city-${propertyId}`}
        testId={`display-property-city-${propertyId}`}
        className="space-y-2 md:col-span-2"
        disabled={isPrimaryResidence}
      />
      
      <FormSelect
        label="State *"
        value={getFieldValue('state')}
        onValueChange={(value) => {
          handleFieldChange('state', value);
          if (!isPrimaryResidence) {
            setTimeout(() => handlePropertyAddressChange(), 100);
          }
        }}
        options={US_STATES_OPTIONS}
        placeholder="Select State"
        testId={`select-property-state-${propertyId}`}
        className="space-y-2 md:col-span-1"
        displayValue={true}
        disabled={isPrimaryResidence}
      />
      
      <FormInput
        label="ZIP Code *"
        value={getFieldValue('zip')}
        onChange={(value) => handleFieldChange('zip', value)}
        onBlur={(e) => {
          if (!isPrimaryResidence) {
            handleZipCodeLookup(e.target.value);
            setTimeout(() => handlePropertyAddressChange(), 1000);
          }
        }}
        id={`property-address-zip-${propertyId}`}
        testId={`display-property-zip-${propertyId}`}
        className="space-y-2 md:col-span-1"
        disabled={isPrimaryResidence}
      />
      
      {countyOptions.length > 0 && !isPrimaryResidence ? (
        <FormSelect
          label="County"
          value={getFieldValue('county')}
          onValueChange={(value) => {
            if (value === 'manual-entry') {
              handleFieldChange('county', '');
              setCountyOptions([]);
            } else {
              // Find the selected county to get its label for display
              const selectedCounty = countyOptions.find(county => county.value === value);
              form.setValue(getPropertyFieldPath('county') as any, selectedCounty?.label || value, { shouldDirty: true });
              setTimeout(() => handlePropertyAddressChange(), 100);
            }
          }}
          options={[
            ...countyOptions,
            { value: 'manual-entry', label: 'Enter county manually' }
          ]}
          placeholder={(countyLookupLoading as any)[loadingKey] ? "Looking up counties..." : "Select county"}
          testId={`select-property-county-${propertyId}`}
          className="space-y-2 md:col-span-2"
        />
      ) : (
        <FormInput
          label="County"
          value={getFieldValue('county')}
          onChange={(value) => handleFieldChange('county', value)}
          onBlur={() => !isPrimaryResidence && setTimeout(() => handlePropertyAddressChange(), 1000)}
          placeholder={(countyLookupLoading as any)[loadingKey] ? "Looking up counties..." : ""}
          id={`property-address-county-${propertyId}`}
          testId={`display-property-county-${propertyId}`}
          className="space-y-2 md:col-span-2"
          disabled={isPrimaryResidence}
        />
      )}
      
      <FormSelect
        label="Property Type *"
        value={form.watch(`property.properties.${propertyIndex}.propertyType` as any) || ''}
        onValueChange={(value) => form.setValue(`property.properties.${propertyIndex}.propertyType` as any, value)}
        options={[
          { value: 'single-family', label: 'Single Family' },
          { value: 'townhome', label: 'Townhome' },
          { value: 'condo', label: 'Condo' },
          { value: 'multi-family', label: 'Multi-Family' },
          { value: 'manufactured', label: 'Manufactured' }
        ]}
        placeholder="Select Type"
        testId={`select-property-type-${propertyId}`}
        className="space-y-2 md:col-span-2"
      />
    </div>
  );
};

export default PropertyAddress;