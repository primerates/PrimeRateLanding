import {  Info } from 'lucide-react';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';
import { Label } from '@/components/ui/label';
import ResidenceTypeSelector from './ResidenceTypeSelector';
import ResidenceInfoDialog from '../../dialogs/residenceInfoDialog';
import RentalInfoDialog from '../../dialogs/rentalInfoDialog';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';

interface ResidenceFormProps {
    borrowerType?: 'borrower' | 'coBorrower';
    addressType?: 'current' | 'prior' | 'prior2';
}

const ResidenceForm = ({ borrowerType = 'borrower', addressType = 'current' }: ResidenceFormProps) => {
    const form = useFormContext<InsertClient>();
    const {
        setActiveResidenceSection,
        setResidenceInfoText,
        setIsResidenceInfoDialogOpen,
        setActiveRentalSection,
        setRentalInfoData,
        setIsRentalInfoDialogOpen,
    } = useAdminAddClientStore();
    
    // Get dynamic field path for residence type
    const getResidenceTypeField = () => {
        const suffix = addressType === 'current' ? 'currentResidenceType' :
                      addressType === 'prior' ? 'priorResidenceType' :
                      'priorResidenceType2';
        return `${borrowerType}.${suffix}`;
    };
    
    const residenceTypeField = getResidenceTypeField();
    const currentResidenceType = form.watch(residenceTypeField as any);
    const showInfoIcon = currentResidenceType === 'rental' || currentResidenceType === 'other';

    const handleInfoClick = () => {
        const addressSuffix = addressType === 'current' ? 'residenceAddress' :
                             addressType === 'prior' ? 'priorResidenceAddress' :
                             'priorResidenceAddress2';
        const sectionId = `${borrowerType}-${addressType}`;
        
        if (currentResidenceType === 'rental') {
            setActiveRentalSection(sectionId);
            const savedData = form.getValues(`${borrowerType}.${addressSuffix}.rentalInfo` as any) || {};
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
            setActiveResidenceSection(sectionId);
            setResidenceInfoText(form.getValues(`${borrowerType}.${addressSuffix}.additionalInfo` as any) || '');
            setIsResidenceInfoDialogOpen(true);
        }
    };

    return (
        <>
            <div className="flex items-center gap-12">
                <div className="flex items-center gap-2">
                    <Label htmlFor={`${borrowerType}-${addressType}-residence`} className="text-xl whitespace-nowrap">
                        {addressType === 'current' ? 'Current Residence' :
                         addressType === 'prior' ? 'Prior Residence' :
                         'Prior Residence 2'}
                    </Label>
                    <div className="w-4 h-4 flex items-center justify-center">
                        {showInfoIcon && (
                            <Info
                                className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-600 transition-colors"
                                data-testid={`icon-${borrowerType}-${addressType}-residence-info`}
                                onClick={handleInfoClick}
                            />
                        )}
                    </div>
                </div>

                <ResidenceTypeSelector
                    fieldPath={residenceTypeField}
                    testIdPrefix={`${borrowerType}-${addressType}-residence`}
                />
            </div>
            <ResidenceInfoDialog />
            <RentalInfoDialog />
        </>
    );
};

export default ResidenceForm;