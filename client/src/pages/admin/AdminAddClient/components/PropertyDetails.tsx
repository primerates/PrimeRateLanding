import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import { toast } from '@/hooks/use-toast';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import DateInput from './DateInput';
import AppraisalIcon from './AppraisalIcon';
import ValuationButtons from './ValuationButtons';

interface PropertyDetailsProps {
  propertyId: string;
  propertyIndex: number;
  openValuationDialog: (type: string, index: number) => void;
  handleValuationHover: (type: string, index: number, e: React.MouseEvent) => void;
  handleValuationHoverLeave: () => void;
  openValuationSummary: (index: number) => void;
}

const PropertyDetails = ({
  propertyId,
  propertyIndex,
  openValuationDialog,
  handleValuationHover,
  handleValuationHoverLeave,
  openValuationSummary
}: PropertyDetailsProps) => {
  const form = useFormContext<InsertClient>();

  const getPropertyFieldPath = (field: string) => {
    return `property.properties.${propertyIndex}.${field}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
      {/* Purchase Price */}
      <FormInput
        label="Purchase Price"
        value={form.watch(getPropertyFieldPath('purchasePrice') as any) || ''}
        onChange={(value) => {
          const cleanValue = value.replace(/[^\d.]/g, '');
          form.setValue(getPropertyFieldPath('purchasePrice') as any, cleanValue);
        }}
        id={`property-purchase-price-${propertyId}`}
        placeholder="$0.00"
        testId={`input-property-purchase-price-${propertyId}`}
        className="space-y-2 md:col-span-2"
      />

      {/* Purchase Date */}
      <DateInput
        label="Purchase Date"
        value={form.watch(getPropertyFieldPath('purchaseDate') as any) || ''}
        onChange={(value) => {
          form.setValue(getPropertyFieldPath('purchaseDate') as any, value);
        }}
        id={`property-owned-since-${propertyId}`}
        testId={`input-property-owned-since-${propertyId}`}
        className="space-y-2 md:col-span-2"
        showInfoIcon={true}
        infoTitle="Purchase Information"
        infoDescription="Please see purchase and record dates in title report located in vendor page."
        onInfoClick={() => {
          toast({
            title: "Purchase Information",
            description: "Please see purchase and record dates in title report located in vendor page.",
            duration: 5000,
          });
        }}
        infoButtonTestId={`button-purchased-info-${propertyId}`}
      />

      {/* Title Held By */}
      <FormSelect
        label="Title Held By"
        value={form.watch(getPropertyFieldPath('titleHeldBy') as any) || ''}
        onValueChange={(value) => form.setValue(getPropertyFieldPath('titleHeldBy') as any, value)}
        options={[
          { value: 'select', label: 'Select' },
          { value: 'borrower', label: 'Borrower' },
          { value: 'borrowers', label: 'Borrowers' },
          { value: 'co-borrower', label: 'Co-Borrower' },
          { value: 'other', label: 'Other' }
        ]}
        placeholder="Select"
        testId={`select-property-title-held-by-${propertyId}`}
        className="space-y-2 md:col-span-2"
        showInfoIcon={true}
        infoTitle="Title Information"
        infoDescription="Please see deed documents in vendor page."
        onInfoClick={() => {
          toast({
            title: "Title Information",
            description: "Please see deed documents in vendor page.",
            duration: 5000,
          });
        }}
        infoButtonTestId={`button-title-held-by-info-${propertyId}`}
      />

      {/* Estimated Value */}
      <div className="space-y-2 md:col-span-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={`property-estimated-value-${propertyId}`}>Est. Value</Label>
          <ValuationButtons
            propertyId={propertyId}
            propertyIndex={propertyIndex}
            openValuationDialog={openValuationDialog}
            handleValuationHover={handleValuationHover}
            handleValuationHoverLeave={handleValuationHoverLeave}
            openValuationSummary={openValuationSummary}
          />
        </div>
        <Input
          id={`property-estimated-value-${propertyId}`}
          value={form.watch(getPropertyFieldPath('estimatedValue') as any) || ''}
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d.]/g, '');
            form.setValue(getPropertyFieldPath('estimatedValue') as any, value);
          }}
          placeholder="$0.00"
          data-testid={`input-property-estimated-value-${propertyId}`}
        />
      </div>

      {/* Appraised Value */}
      <div className="space-y-2 md:col-span-2">
        <div className="flex items-center gap-2 min-h-8">
          <Label htmlFor={`property-appraised-value-${propertyId}`}>Appraised Value</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
            title="Appraised Property Value"
            data-testid={`button-appraised-value-info-${propertyId}`}
          >
            <AppraisalIcon index={propertyIndex} control={form.control} />
          </Button>
        </div>
        <Input
          id={`property-appraised-value-${propertyId}`}
          value={form.watch(getPropertyFieldPath('appraisedValue') as any) || ''}
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d.]/g, '');
            form.setValue(getPropertyFieldPath('appraisedValue') as any, value);
          }}
          placeholder="$0.00"
          data-testid={`input-property-appraised-value-${propertyId}`}
        />
      </div>

      {/* Secured Loan */}
      <div className="space-y-2 md:col-span-2">
        <div className="flex items-center gap-2 min-h-8">
          <div className="flex items-center gap-2">
            <Label htmlFor={`property-active-secured-loan-${propertyId}`}>Secured Loan</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;