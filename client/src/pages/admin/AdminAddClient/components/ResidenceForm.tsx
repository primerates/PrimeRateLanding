import {  Info } from 'lucide-react';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';
import { Label } from '@/components/ui/label';
import ResidenceTypeSelector from './ResidenceTypeSelector';
import ResidenceInfoDialog from '../dialogs/residenceInfoDialog';
import RentalInfoDialog from '../dialogs/rentalInfoDialog';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';

const ResidenceForm = () => {
    const form = useFormContext<InsertClient>();
    const {
        setActiveResidenceSection,
        setResidenceInfoText,
        setIsResidenceInfoDialogOpen,
        setActiveRentalSection,
        setRentalInfoData,
        setIsRentalInfoDialogOpen,
    } = useAdminAddClientStore();
    
    const currentResidenceType = form.watch('borrower.currentResidenceType');
    const showInfoIcon = currentResidenceType === 'rental' || currentResidenceType === 'other';

    const handleInfoClick = () => {
        if (currentResidenceType === 'rental') {
            setActiveRentalSection('borrower-current');
            const savedData = form.getValues('borrower.residenceAddress.rentalInfo') || {};
            setRentalInfoData({
                landlordName: savedData.landlordName || '',
                email: savedData.email || '',
                phone: savedData.phone || '',
                propertyType: savedData.propertyType || '',
                monthlyRent: savedData.monthlyRent || '',
                notes: savedData.notes || ''
            });
            setIsRentalInfoDialogOpen(true);
        } else {
            setActiveResidenceSection('borrower-current');
            setResidenceInfoText(form.getValues('borrower.residenceAddress.additionalInfo') || '');
            setIsResidenceInfoDialogOpen(true);
        }
    };

    return (
        <>
            <div className="flex items-center gap-12">
                <div className="flex items-center gap-2">
                    <Label htmlFor="borrower-firstName" className="text-xl whitespace-nowrap">Current Residence</Label>
                    <div className="w-4 h-4 flex items-center justify-center">
                        {showInfoIcon && (
                            <Info
                                className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-600 transition-colors"
                                data-testid="icon-current-residence-info"
                                onClick={handleInfoClick}
                            />
                        )}
                    </div>
                </div>

                <ResidenceTypeSelector
                    fieldPath="borrower.currentResidenceType"
                    testIdPrefix="current-residence"
                />
            </div>
            <ResidenceInfoDialog />
            <RentalInfoDialog />
        </>
    );
};

export default ResidenceForm;