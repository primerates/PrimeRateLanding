import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import { US_STATES_OPTIONS } from '../../data/formOptions';

interface PropertyAddressProps {
  propertyId: string;
  propertyIndex: number;
}

const PropertyAddress = ({
  propertyId,
  propertyIndex
}: PropertyAddressProps) => {
  const form = useFormContext<InsertClient>();

  const getPropertyFieldPath = (field: string) => {
    return `property.properties.${propertyIndex}.address.${field}`;
  };

  // Check property type to determine address source
  const propertyUse = form.watch(`property.properties.${propertyIndex}.use` as any);
  const isPrimaryResidence = propertyUse === 'primary';
  const isCoBorrowerProperty = propertyUse === 'second-home' || propertyUse === 'investment';

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
        id={`property-address-city-${propertyId}`}
        testId={`display-property-city-${propertyId}`}
        className="space-y-2 md:col-span-2"
        disabled={isPrimaryResidence}
      />
      
      <FormSelect
        label="State *"
        value={getFieldValue('state')}
        onValueChange={(value) => handleFieldChange('state', value)}
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
        id={`property-address-zip-${propertyId}`}
        testId={`display-property-zip-${propertyId}`}
        className="space-y-2 md:col-span-1"
        disabled={isPrimaryResidence}
      />
      
      <FormInput
        label="County"
        value={getFieldValue('county')}
        onChange={(value) => handleFieldChange('county', value)}
        id={`property-address-county-${propertyId}`}
        testId={`display-property-county-${propertyId}`}
        className="space-y-2 md:col-span-2"
        disabled={isPrimaryResidence}
      />
      
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