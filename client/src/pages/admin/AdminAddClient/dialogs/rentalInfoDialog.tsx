import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FormInput from '../components/FormInput';
import PhoneInput from '../components/PhoneInput';
import FormSelect from '../components/FormSelect';
import CurrencyInput from '../components/CurrencyInput';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';

const PROPERTY_TYPE_OPTIONS = [
  { value: 'Select', label: 'Select' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Townhouse', label: 'Townhouse' },
  { value: 'Condo', label: 'Condo' },
  { value: 'Single Family', label: 'Single Family' },
  { value: 'Duplex', label: 'Duplex' },
  { value: 'Multi-Family Unit', label: 'Multi-Family Unit' },
  { value: 'Other', label: 'Other' }
];

const RentalInfoDialog = () => {
  const form = useFormContext<InsertClient>();
  const {
    isRentalInfoDialogOpen,
    rentalInfoData,
    activeRentalSection,
    setIsRentalInfoDialogOpen,
    setRentalInfoData,
    setActiveRentalSection,
  } = useAdminAddClientStore();

  const handleCancel = () => {
    setIsRentalInfoDialogOpen(false);
    setRentalInfoData({
      landlordName: '',
      email: '',
      phone: '',
      propertyType: '',
      monthlyRent: '',
      notes: ''
    });
    setActiveRentalSection('');
  };

  const handleSave = () => {
    if (activeRentalSection === 'borrower-current') {
      form.setValue('borrower.residenceAddress.rentalInfo', rentalInfoData);
    } else if (activeRentalSection === 'borrower-prior') {
      form.setValue('borrower.priorResidenceAddress.rentalInfo', rentalInfoData);
    } else if (activeRentalSection === 'borrower-prior-2') {
      form.setValue('borrower.priorResidenceAddress2.rentalInfo', rentalInfoData);
    } else if (activeRentalSection === 'coborrower-current') {
      form.setValue('coBorrower.residenceAddress.rentalInfo' as any, rentalInfoData);
    } else if (activeRentalSection === 'coborrower-prior') {
      form.setValue('coBorrower.priorResidenceAddress.rentalInfo' as any, rentalInfoData);
    } else if (activeRentalSection === 'coborrower-prior-2') {
      form.setValue('coBorrower.priorResidenceAddress2.rentalInfo' as any, rentalInfoData);
    }
    setIsRentalInfoDialogOpen(false);
    setActiveRentalSection('');
  };

  return (
    <Dialog open={isRentalInfoDialogOpen} onOpenChange={setIsRentalInfoDialogOpen}>
      <DialogContent className="max-w-lg" data-testid="dialog-rental-info">
        <DialogHeader>
          <DialogTitle>Rental Residence Information</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <FormInput
            label="Landlord / Company Name"
            value={rentalInfoData.landlordName}
            onChange={(value) => setRentalInfoData({ ...rentalInfoData, landlordName: value })}
            id="rental-landlord-name"
            testId="input-rental-landlord-name"
            className="space-y-2"
          />
          <FormInput
            label="Email"
            value={rentalInfoData.email}
            onChange={(value) => setRentalInfoData({ ...rentalInfoData, email: value })}
            id="rental-email"
            testId="input-rental-email"
            className="space-y-2"
            type="email"
          />
          <PhoneInput
            label="Phone"
            value={rentalInfoData.phone}
            onChange={(value) => setRentalInfoData({ ...rentalInfoData, phone: value })}
            id="rental-phone"
            testId="input-rental-phone"
            className="space-y-2"
          />
          <FormSelect
            label="Property Type"
            value={rentalInfoData.propertyType || 'Select'}
            onValueChange={(value) => setRentalInfoData({ ...rentalInfoData, propertyType: value })}
            options={PROPERTY_TYPE_OPTIONS}
            placeholder="Select"
            testId="select-rental-property-type"
            className="space-y-2"
          />
          <CurrencyInput
            label="Monthly Rent Amount"
            value={rentalInfoData.monthlyRent}
            onChange={(value) => setRentalInfoData({ ...rentalInfoData, monthlyRent: value })}
            id="rental-monthly-rent"
            testId="input-rental-monthly-rent"
            className="space-y-2"
          />
          <div className="space-y-2">
            <Label htmlFor="rental-notes">Notes</Label>
            <Textarea
              id="rental-notes"
              value={rentalInfoData.notes}
              onChange={(e) => setRentalInfoData({ ...rentalInfoData, notes: e.target.value })}
              placeholder=""
              className="min-h-[100px] resize-none"
              data-testid="textarea-rental-notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel-rental-info"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            data-testid="button-save-rental-info"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RentalInfoDialog;