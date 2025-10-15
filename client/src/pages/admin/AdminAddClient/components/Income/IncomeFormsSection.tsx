import React from 'react';
import { useFormContext } from 'react-hook-form';
import { InsertClient } from '@shared/schema';
import IncomeTypes from './IncomeTypes';
import EmploymentForm from './EmploymentForm';
import SelfEmploymentForm from './SelfEmploymentForm';
import SocialSecurityForm from './SocialSecurityForm';
import PensionForm from './PensionForm';
import DisabilityCard from './DisabilityCard';
import PropertyRentalDialog from '../../dialogs/PropertyRentalDialog';
import DeleteConfirmationDialog from '../../dialogs/DeleteConfirmationDialog';

interface EmploymentDate {
    startDate: string;
    endDate: string;
    isPresent: boolean;
    duration: string;
}

interface IncomeFormsSectionProps {
    // Configuration
    fieldPrefix: 'income' | 'coBorrowerIncome';
    title: string;
    borderColor: string;
    totalIncome: string;
    
    // Employment state
    employerCards: string[];
    setEmployerCards: (cards: string[]) => void;
    secondEmployerCards: string[];
    setSecondEmployerCards: (cards: string[]) => void;
    selfEmploymentCards: string[];
    setSelfEmploymentCards: (cards: string[]) => void;
    propertyCardStates: Record<string, boolean>;
    setPropertyCardStates: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
    secondPropertyCardStates: Record<string, boolean>;
    setSecondPropertyCardStates: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
    selfEmploymentPropertyCardStates: Record<string, boolean>;
    setSelfEmploymentPropertyCardStates: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
    
    // Employment functions
    getEmployerFieldPath: (cardId: string, fieldName: string) => string;
    getSecondEmployerFieldPath: (cardId: string, fieldName: string) => string;
    getSelfEmploymentFieldPath: (cardId: string, fieldName: string) => string;
    employmentDates: Record<string, EmploymentDate>;
    setEmploymentDates: (updater: (prev: Record<string, EmploymentDate>) => Record<string, EmploymentDate>) => void;
    secondEmploymentDates: Record<string, EmploymentDate>;
    setSecondEmploymentDates: (updater: (prev: Record<string, EmploymentDate>) => Record<string, EmploymentDate>) => void;
    updateEmploymentDuration: (cardId: string, startDate: string, endDate: string, isPresent: boolean) => void;
    updateSecondEmploymentDuration: (cardId: string, startDate: string, endDate: string, isPresent: boolean) => void;
    
    // UI state
    showIncomeCardAnimation: Record<string, boolean>;
    setShowIncomeCardAnimation: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
    
    // Other forms state
    isSocialSecurityOpen: boolean;
    setIsSocialSecurityOpen: (open: boolean) => void;
    isPensionOpen: boolean;
    setIsPensionOpen: (open: boolean) => void;
    isDisabilityOpen: boolean;
    setIsDisabilityOpen: (open: boolean) => void;
    
    // Dialog state
    propertyRentalDialog: { isOpen: boolean; type: 'add' | 'remove' | null };
    setPropertyRentalDialog: (dialog: { isOpen: boolean; type: 'add' | 'remove' | null }) => void;
    deleteEmployerDialog: { isOpen: boolean; cardId: string };
    setDeleteEmployerDialog: (dialog: { isOpen: boolean; cardId: string }) => void;
    deleteSecondEmployerDialog: { isOpen: boolean; cardId: string };
    setDeleteSecondEmployerDialog: (dialog: { isOpen: boolean; cardId: string }) => void;
    deleteSelfEmploymentDialog: { isOpen: boolean; cardId: string };
    setDeleteSelfEmploymentDialog: (dialog: { isOpen: boolean; cardId: string }) => void;
    
    // Event handlers
    handlePropertyRentalChange: (checked: boolean) => void;
    handleExpandAll: () => void;
    handleMinimizeAll: () => void;
    handleDeleteSocialSecurity: () => void;
    handleDeletePension: () => void;
    handleDeleteDisability: () => void;
    handleDeleteEmployer: (cardId: string) => void;
    handleDeleteSecondEmployer: (cardId: string) => void;
    handleDeleteSelfEmployment: (cardId: string) => void;
}

const IncomeFormsSection = ({
    fieldPrefix,
    title,
    borderColor,
    totalIncome,
    employerCards,
    setEmployerCards,
    secondEmployerCards,
    setSecondEmployerCards,
    selfEmploymentCards,
    setSelfEmploymentCards,
    propertyCardStates,
    setPropertyCardStates,
    secondPropertyCardStates,
    setSecondPropertyCardStates,
    selfEmploymentPropertyCardStates,
    setSelfEmploymentPropertyCardStates,
    getEmployerFieldPath,
    getSecondEmployerFieldPath,
    getSelfEmploymentFieldPath,
    employmentDates,
    setEmploymentDates,
    secondEmploymentDates,
    setSecondEmploymentDates,
    updateEmploymentDuration,
    updateSecondEmploymentDuration,
    showIncomeCardAnimation,
    setShowIncomeCardAnimation,
    isSocialSecurityOpen,
    setIsSocialSecurityOpen,
    isPensionOpen,
    setIsPensionOpen,
    isDisabilityOpen,
    setIsDisabilityOpen,
    propertyRentalDialog,
    setPropertyRentalDialog,
    deleteEmployerDialog,
    setDeleteEmployerDialog,
    deleteSecondEmployerDialog,
    setDeleteSecondEmployerDialog,
    deleteSelfEmploymentDialog,
    setDeleteSelfEmploymentDialog,
    handlePropertyRentalChange,
    handleExpandAll,
    handleMinimizeAll,
    handleDeleteSocialSecurity,
    handleDeletePension,
    handleDeleteDisability,
    handleDeleteEmployer,
    handleDeleteSecondEmployer,
    handleDeleteSelfEmployment
}: IncomeFormsSectionProps) => {
    const form = useFormContext<InsertClient>();

    return (
        <>
            <IncomeTypes
                prefix={fieldPrefix}
                title={title}
                totalIncome={totalIncome}
                onPropertyRentalChange={handlePropertyRentalChange}
                onExpandAll={handleExpandAll}
                onMinimizeAll={handleMinimizeAll}
                borderColor={borderColor}
            />

            {/* Employment Form - Show when employment is selected */}
            {form.watch(`${fieldPrefix}.incomeTypes.employment` as any) && (employerCards || ['default']).map((cardId) => {
                const propertyId = cardId === 'default' ? 'default' : cardId;
                const isOpen = propertyCardStates[propertyId] ?? true;

                return (
                    <EmploymentForm
                        key={cardId}
                        cardId={cardId}
                        propertyId={propertyId}
                        isOpen={isOpen}
                        onOpenChange={(open) => {
                            setPropertyCardStates(prev => ({ ...prev, [propertyId]: open }));
                        }}
                        onAddEmployer={() => {
                            if (employerCards.length < 3) {
                                const newId = `employer-${Date.now()}`;
                                setEmployerCards([...employerCards, newId]);
                            }
                        }}
                        onDeleteEmployer={() => {
                            setDeleteEmployerDialog({ isOpen: true, cardId: cardId });
                        }}
                        showAnimation={showIncomeCardAnimation['borrower-employment']}
                        getEmployerFieldPath={getEmployerFieldPath}
                        employmentDates={employmentDates}
                        updateEmploymentDuration={updateEmploymentDuration}
                        setEmploymentDates={setEmploymentDates}
                        calculatedAdjustedNewFhaMip=""
                        setShowIncomeCardAnimation={setShowIncomeCardAnimation}
                        showAddButton={employerCards.length < 3}
                    />
                );
            })}

            {/* Second Employment Form - Show when second employment is selected */}
            {form.watch(`${fieldPrefix}.incomeTypes.secondEmployment` as any) && (secondEmployerCards || ['default']).map((cardId) => {
                const propertyId = cardId === 'default' ? 'default' : cardId;
                const isOpen = secondPropertyCardStates[propertyId] ?? true;

                return (
                    <EmploymentForm
                        key={`second-${cardId}`}
                        cardId={cardId}
                        propertyId={propertyId}
                        isOpen={isOpen}
                        onOpenChange={(open) => {
                            setSecondPropertyCardStates(prev => ({ ...prev, [propertyId]: open }));
                        }}
                        onAddEmployer={() => {
                            if (secondEmployerCards.length < 2) {
                                const newId = `employer-${Date.now()}`;
                                setSecondEmployerCards([...secondEmployerCards, newId]);
                            }
                        }}
                        onDeleteEmployer={() => {
                            setDeleteSecondEmployerDialog({ isOpen: true, cardId: cardId });
                        }}
                        showAnimation={showIncomeCardAnimation['borrower-second-employment']}
                        getEmployerFieldPath={getSecondEmployerFieldPath}
                        employmentDates={secondEmploymentDates}
                        updateEmploymentDuration={updateSecondEmploymentDuration}
                        setEmploymentDates={setSecondEmploymentDates}
                        calculatedAdjustedNewFhaMip=""
                        setShowIncomeCardAnimation={setShowIncomeCardAnimation}
                        showAddButton={secondEmployerCards.length < 2}
                        title="Second Employer"
                    />
                );
            })}

            {/* Self Employment Form - Show when self employment is selected */}
            {form.watch(`${fieldPrefix}.incomeTypes.selfEmployment` as any) && (selfEmploymentCards || ['default']).map((cardId) => {
                const propertyId = cardId === 'default' ? 
                    (fieldPrefix === 'coBorrowerIncome' ? 'co-borrower-self-employment-template-card' : 'self-employment-template-card') : 
                    cardId;
                const isOpen = selfEmploymentPropertyCardStates[propertyId] ?? true;

                return (
                    <SelfEmploymentForm
                        key={cardId}
                        cardId={cardId}
                        propertyId={propertyId}
                        isOpen={isOpen}
                        onOpenChange={(open) => {
                            setSelfEmploymentPropertyCardStates(prev => ({ ...prev, [propertyId]: open }));
                        }}
                        onAddSelfEmployment={() => {
                            if (selfEmploymentCards.length < 2) {
                                const newId = `self-employment-${Date.now()}`;
                                setSelfEmploymentCards([...selfEmploymentCards, newId]);
                            }
                        }}
                        onDeleteSelfEmployment={() => {
                            setDeleteSelfEmploymentDialog({ isOpen: true, cardId: propertyId });
                        }}
                        showAnimation={showIncomeCardAnimation['borrower-self-employment']}
                        getSelfEmploymentFieldPath={getSelfEmploymentFieldPath}
                        setShowIncomeCardAnimation={setShowIncomeCardAnimation}
                        showAddButton={selfEmploymentCards.length < 2}
                        title={fieldPrefix === 'income' ? 'Borrower Self-Employment' : 'Co-Borrower Self-Employment'}
                    />
                );
            })}

            {/* Social Security Form - Show when social security is selected */}
            {form.watch(`${fieldPrefix}.incomeTypes.socialSecurity` as any) && (
                <SocialSecurityForm
                    isOpen={isSocialSecurityOpen}
                    onOpenChange={setIsSocialSecurityOpen}
                    onDeleteSocialSecurity={handleDeleteSocialSecurity}
                    fieldPrefix={fieldPrefix}
                />
            )}

            {/* Pension Form - Show when pension is selected */}
            {form.watch(`${fieldPrefix}.incomeTypes.pension` as any) && (
                <PensionForm
                    isOpen={isPensionOpen}
                    onOpenChange={setIsPensionOpen}
                    onDeletePension={handleDeletePension}
                    showAnimation={showIncomeCardAnimation['pension']}
                    setShowAnimation={setShowIncomeCardAnimation}
                    fieldPrefix={fieldPrefix}
                />
            )}

            {/* Disability Card - Show when VA benefits is selected */}
            {form.watch(`${fieldPrefix}.incomeTypes.vaBenefits` as any) && (
                <DisabilityCard
                    isOpen={isDisabilityOpen}
                    onOpenChange={setIsDisabilityOpen}
                    onDeleteDisability={handleDeleteDisability}
                    fieldPrefix={fieldPrefix}
                />
            )}

            {/* Property Rental Dialog */}
            <PropertyRentalDialog
                isOpen={propertyRentalDialog.isOpen}
                type={propertyRentalDialog.type}
                onClose={() => setPropertyRentalDialog({ isOpen: false, type: null })}
            />

            {/* Delete Employer Confirmation Dialog */}
            <DeleteConfirmationDialog
                isOpen={deleteEmployerDialog.isOpen}
                onClose={() => setDeleteEmployerDialog({ isOpen: false, cardId: '' })}
                onConfirm={() => handleDeleteEmployer(deleteEmployerDialog.cardId)}
                title="Delete Employer"
                description="Are you sure you want to delete this employer? This action cannot be undone and will remove all associated employment information."
                testId="dialog-delete-employer"
                confirmButtonTestId="button-delete-employer-confirm"
                cancelButtonTestId="button-delete-employer-cancel"
            />

            {/* Delete Second Employer Confirmation Dialog */}
            <DeleteConfirmationDialog
                isOpen={deleteSecondEmployerDialog.isOpen}
                onClose={() => setDeleteSecondEmployerDialog({ isOpen: false, cardId: '' })}
                onConfirm={() => handleDeleteSecondEmployer(deleteSecondEmployerDialog.cardId)}
                title="Delete Second Employer"
                description="Are you sure you want to delete this second employer? This action cannot be undone and will remove all associated employment information."
                testId="dialog-delete-second-employer"
                confirmButtonTestId="button-delete-second-employer-confirm"
                cancelButtonTestId="button-delete-second-employer-cancel"
            />

            {/* Delete Self Employment Confirmation Dialog */}
            <DeleteConfirmationDialog
                isOpen={deleteSelfEmploymentDialog.isOpen}
                onClose={() => setDeleteSelfEmploymentDialog({ isOpen: false, cardId: '' })}
                onConfirm={() => handleDeleteSelfEmployment(deleteSelfEmploymentDialog.cardId)}
                title="Delete Self Employment"
                description="Are you sure you want to delete this self employment? This action cannot be undone and will remove all associated self employment information."
                testId="dialog-delete-self-employment"
                confirmButtonTestId="button-delete-self-employment-confirm"
                cancelButtonTestId="button-delete-self-employment-cancel"
            />
        </>
    );
};

export default IncomeFormsSection;