import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import { toast } from '@/hooks/use-toast';
import FormSelect from '../FormSelect';
import DateInput from '../DateInput';
import AppraisalIcon from '../AppraisalIcon';
import ValuationButtons from './ValuationButtons';
import CurrencyInputField from '../CurrencyInputField';

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
      <div className="space-y-2 md:col-span-2">
        <div className="flex items-center gap-2 min-h-8">
          <Label htmlFor={`property-purchase-price-${propertyId}`}>Purchase Price</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
            title="Purchase Property Value"
            data-testid={`button-purchase-price-info-${propertyId}`}
          >
            <AppraisalIcon index={propertyIndex} control={form.control} />
          </Button>
        </div>
        <CurrencyInputField
          name={getPropertyFieldPath('purchasePrice')}
          id={`property-purchase-price-${propertyId}`}
          testId={`input-property-purchase-price-${propertyId}`}
        />
      </div>

      {/* Owned Since */}
      <DateInput
        label="Owned Since"
        value={form.watch(getPropertyFieldPath('ownedSince') as any) || ''}
        onChange={(value) => {
          form.setValue(getPropertyFieldPath('ownedSince') as any, value);
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

      {/* Owned Held By */}
      <FormSelect
        label="Owned Held By"
        value={form.watch(getPropertyFieldPath('ownedHeldBy') as any) || ''}
        onValueChange={(value) => form.setValue(getPropertyFieldPath('ownedHeldBy') as any, value)}
        options={[
          { value: 'borrower', label: 'Borrower' },
          { value: 'borrower-coborrower', label: 'Borrower & Co-Borrower' },
          { value: 'borrower-others', label: 'Borrower & Others' }
        ]}
        placeholder="Select"
        testId={`select-property-owned-held-by-${propertyId}`}
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
        infoButtonTestId={`button-owned-held-by-info-${propertyId}`}
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
        <CurrencyInputField
          name={getPropertyFieldPath('estimatedValue')}
          id={`property-estimated-value-${propertyId}`}
          testId={`input-property-estimated-value-${propertyId}`}
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
        <CurrencyInputField
          name={getPropertyFieldPath('appraisedValue')}
          id={`property-appraised-value-${propertyId}`}
          testId={`input-property-appraised-value-${propertyId}`}
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