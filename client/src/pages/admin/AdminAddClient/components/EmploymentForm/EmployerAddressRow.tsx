import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import { US_STATES_OPTIONS } from '../../data/formOptions';

interface EmployerAddressRowProps {
  calculatedAdjustedNewFhaMip: string;
  cardId: string;
  getEmployerFieldPath: (cardId: string, fieldName: string) => string;
}

const EmployerAddressRow = ({ cardId, getEmployerFieldPath }: EmployerAddressRowProps) => {
  const form = useFormContext<InsertClient>();

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
          id={`${cardId}-employer-zip`}
          testId={`input-${cardId}-employer-zip`}
          className="space-y-2"
        />
      </div>

      <div className="md:col-span-2">
        <FormInput
          label="County"
          value={form.watch(getEmployerFieldPath(cardId, 'employerAddress.county') as any) || ''}
          onChange={(value) => form.setValue(getEmployerFieldPath(cardId, 'employerAddress.county') as any, value)}
          id={`${cardId}-employer-county`}
          testId={`input-${cardId}-employer-county`}
          className="space-y-2"
        />
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