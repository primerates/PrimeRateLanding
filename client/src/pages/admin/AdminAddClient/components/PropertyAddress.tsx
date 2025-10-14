import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import { US_STATES_OPTIONS } from '../data/formOptions';

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
    return `property.properties.${propertyIndex}.${field}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <FormInput
        label="Street Address *"
        value={form.watch(getPropertyFieldPath('street') as any) || ''}
        onChange={(value) => form.setValue(getPropertyFieldPath('street') as any, value)}
        id={`property-address-street-${propertyId}`}
        testId={`display-property-street-${propertyId}`}
        className="space-y-2 md:col-span-3"
      />
      
      <FormInput
        label="Unit/Apt"
        value={form.watch(getPropertyFieldPath('unit') as any) || ''}
        onChange={(value) => form.setValue(getPropertyFieldPath('unit') as any, value)}
        id={`property-address-unit-${propertyId}`}
        testId={`display-property-unit-${propertyId}`}
        className="space-y-2 md:col-span-1"
      />
      
      <FormInput
        label="City *"
        value={form.watch(getPropertyFieldPath('city') as any) || ''}
        onChange={(value) => form.setValue(getPropertyFieldPath('city') as any, value)}
        id={`property-address-city-${propertyId}`}
        testId={`display-property-city-${propertyId}`}
        className="space-y-2 md:col-span-2"
      />
      
      <FormSelect
        label="State *"
        value={form.watch(getPropertyFieldPath('state') as any) || ''}
        onValueChange={(value) => form.setValue(getPropertyFieldPath('state') as any, value)}
        options={US_STATES_OPTIONS}
        placeholder="Select State"
        testId={`select-property-state-${propertyId}`}
        className="space-y-2 md:col-span-1"
        displayValue={true}
      />
      
      <FormInput
        label="ZIP Code *"
        value={form.watch(getPropertyFieldPath('zip') as any) || ''}
        onChange={(value) => form.setValue(getPropertyFieldPath('zip') as any, value)}
        id={`property-address-zip-${propertyId}`}
        testId={`display-property-zip-${propertyId}`}
        className="space-y-2 md:col-span-1"
      />
      
      <FormInput
        label="County"
        value={form.watch(getPropertyFieldPath('county') as any) || ''}
        onChange={(value) => form.setValue(getPropertyFieldPath('county') as any, value)}
        id={`property-address-county-${propertyId}`}
        testId={`display-property-county-${propertyId}`}
        className="space-y-2 md:col-span-2"
      />
      
      <FormSelect
        label="Property Type *"
        value={form.watch(getPropertyFieldPath('propertyType') as any) || ''}
        onValueChange={(value) => form.setValue(getPropertyFieldPath('propertyType') as any, value)}
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