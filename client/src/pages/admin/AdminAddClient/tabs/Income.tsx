import { useMemo, useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import IncomeHeader from '../components/IncomeHeader';
import IncomeTypes from '../components/IncomeTypes';
import EmploymentForm from '../components/EmploymentForm';
import SocialSecurityForm from '../components/SocialSecurityForm';
import PensionForm from '../components/PensionForm';
import DisabilityCard from '../components/DisabilityCard';
import PropertyRentalDialog from '../dialogs/PropertyRentalDialog';
import DeleteConfirmationDialog from '../dialogs/DeleteConfirmationDialog';
import { InsertClient } from '@shared/schema';
import { parseMonetaryValue, formatCurrency, calculateEmploymentDuration } from '../utils/formUtils';

interface IncomeTabProps {
    animations?: {
        showEntry: boolean;
        showIncome: boolean;
    };
}

const IncomeTab = ({ animations }: IncomeTabProps) => {
    const form = useFormContext<InsertClient>();

    // State for employment forms
    const [borrowerEmployerCards, setBorrowerEmployerCards] = useState<string[]>(['default']);
    const [propertyCardStates, setPropertyCardStates] = useState<Record<string, boolean>>({});
    const [showIncomeCardAnimation, setShowIncomeCardAnimation] = useState<Record<string, boolean>>({});
    const [employmentDates, setEmploymentDates] = useState<Record<string, any>>({});

    // State for Social Security form
    const [isSocialSecurityOpen, setIsSocialSecurityOpen] = useState(false);

    // State for Pension form
    const [isPensionOpen, setIsPensionOpen] = useState(true);

    // State for Disability form
    const [isDisabilityOpen, setIsDisabilityOpen] = useState(true);

    // Property rental dialog state
    const [propertyRentalDialog, setPropertyRentalDialog] = useState<{
        isOpen: boolean;
        type: 'add' | 'remove' | null;
    }>({ isOpen: false, type: null });

    // Delete employer dialog state
    const [deleteEmployerDialog, setDeleteEmployerDialog] = useState<{
        isOpen: boolean;
        cardId: string;
    }>({ isOpen: false, cardId: '' });

    // Helper function to generate dynamic field paths for employer cards
    const getEmployerFieldPath = (cardId: string, fieldName: string) => {
        const cleanCardId = cardId === 'default' ? 'default' : cardId;
        return `income.employers.${cleanCardId}.${fieldName}` as const;
    };

    // Update employment duration when dates change
    const updateEmploymentDuration = (cardId: string, startDate: string, endDate: string, isPresent: boolean) => {
        // Use utility function to calculate duration
        const { years, months, duration } = calculateEmploymentDuration(startDate, endDate, isPresent);

        // Update local state for UI
        setEmploymentDates(prev => ({
            ...prev,
            [cardId]: {
                ...prev[cardId],
                startDate,
                endDate,
                isPresent,
                duration
            }
        }));

        // Update form data using schema-compliant fields
        const yearsPath = `income.employers.${cardId}.yearsEmployedYears`;
        const monthsPath = `income.employers.${cardId}.yearsEmployedMonths`;
        form.setValue(yearsPath as any, years);
        form.setValue(monthsPath as any, months);
    };

    // Watch for employment checkbox changes and ensure default card exists when checked
    const isEmploymentChecked = form.watch('income.incomeTypes.employment');
    useEffect(() => {
        if (isEmploymentChecked && borrowerEmployerCards.length === 0) {
            setBorrowerEmployerCards(['default']);
        }
    }, [isEmploymentChecked, borrowerEmployerCards.length]);

    // Watch for pension checkbox changes and ensure default pension exists when checked
    const isPensionChecked = form.watch('income.incomeTypes.pension');
    useEffect(() => {
        if (isPensionChecked) {
            const currentPensions = form.watch('income.pensions') || [];
            if (currentPensions.length === 0) {
                const defaultPension = {
                    id: `pension-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                    payerName: '',
                    monthlyAmount: '',
                    startDate: ''
                };
                form.setValue('income.pensions', [defaultPension]);
            }
        }
    }, [isPensionChecked, form]);


    // Watch all individual employer income fields dynamically
    const allEmployerIncomes = borrowerEmployerCards.map(cardId =>
        form.watch(getEmployerFieldPath(cardId, 'monthlyIncome') as any)
    );

    // Calculate total borrower income - full implementation from AdminAddClient
    const totalBorrowerIncome = useMemo(() => {
        const borrowerIncomeData = form.watch('income');

        // Calculate total main employment income from all employer cards
        const employmentIncome = borrowerIncomeData?.employers && typeof borrowerIncomeData.employers === 'object'
            ? Object.values(borrowerIncomeData.employers).reduce((total, employer: any) => {
                return total + (employer && typeof employer === 'object' ? parseMonetaryValue(employer.monthlyIncome) : 0);
            }, 0)
            : parseMonetaryValue(borrowerIncomeData?.monthlyIncome); // fallback for backward compatibility

        // Calculate total second employment income from all cards
        const secondEmploymentIncome = borrowerIncomeData?.secondEmployers && typeof borrowerIncomeData.secondEmployers === 'object'
            ? Object.values(borrowerIncomeData.secondEmployers).reduce((total, employer: any) => {
                return total + (employer && typeof employer === 'object' ? parseMonetaryValue(employer.monthlyIncome) : 0);
            }, 0)
            : parseMonetaryValue(borrowerIncomeData?.secondMonthlyIncome); // fallback for backward compatibility

        // Calculate total self-employment income from all cards
        const businessIncome = borrowerIncomeData?.selfEmployers && typeof borrowerIncomeData.selfEmployers === 'object'
            ? Object.values(borrowerIncomeData.selfEmployers).reduce((total, business: any) => {
                return total + (business && typeof business === 'object' ? parseMonetaryValue(business.businessMonthlyIncome) : 0);
            }, 0)
            : parseMonetaryValue(borrowerIncomeData?.businessMonthlyIncome); // fallback for backward compatibility

        const pensionIncome = borrowerIncomeData?.pensions?.reduce((total: number, pension: any) => total + parseMonetaryValue(pension.monthlyAmount), 0) || 0;
        const socialSecurityIncome = parseMonetaryValue(borrowerIncomeData?.socialSecurityMonthlyAmount);
        const vaBenefitsIncome = parseMonetaryValue(borrowerIncomeData?.vaBenefitsMonthlyAmount);
        const disabilityIncome = parseMonetaryValue(borrowerIncomeData?.disabilityMonthlyAmount);
        const otherIncome = parseMonetaryValue(borrowerIncomeData?.otherIncomeMonthlyAmount);

        const total = employmentIncome + secondEmploymentIncome + businessIncome +
            pensionIncome + socialSecurityIncome + vaBenefitsIncome +
            disabilityIncome + otherIncome;

        return total;
    }, [form.watch('income'), form.watch('income.employers'), allEmployerIncomes]);

    const totalBorrowerIncomeFormatted = useMemo(() =>
        formatCurrency(totalBorrowerIncome),
        [totalBorrowerIncome]
    );

    const handlePropertyRentalChange = (checked: boolean) => {
        if (checked) {
            // Show popup for adding property rental
            setPropertyRentalDialog({ isOpen: true, type: 'add' });
        } else {
            // Show popup for removing property rental
            setPropertyRentalDialog({ isOpen: true, type: 'remove' });
        }
    };

    const handleExpandAll = () => {
        // Open all employment form cards
        setPropertyCardStates(prev => {
            const newState = { ...prev };
            // Set all cards to open (true)
            borrowerEmployerCards.forEach(cardId => {
                const propertyId = cardId === 'default' ? 'default' : cardId;
                newState[propertyId] = true;
            });
            return newState;
        });
        
        // Open social security form if it exists
        if (form.watch('income.incomeTypes.socialSecurity')) {
            setIsSocialSecurityOpen(true);
        }
        
        // Open pension form if it exists
        if (form.watch('income.incomeTypes.pension')) {
            setIsPensionOpen(true);
        }
        
        // Open disability form if it exists
        if (form.watch('income.incomeTypes.vaBenefits')) {
            setIsDisabilityOpen(true);
        }
    };

    const handleMinimizeAll = () => {
        // Close all employment form cards
        setPropertyCardStates(prev => {
            const newState = { ...prev };
            // Set all cards to closed (false)
            borrowerEmployerCards.forEach(cardId => {
                const propertyId = cardId === 'default' ? 'default' : cardId;
                newState[propertyId] = false;
            });
            return newState;
        });
        
        // Close social security form if it exists
        if (form.watch('income.incomeTypes.socialSecurity')) {
            setIsSocialSecurityOpen(false);
        }
        
        // Close pension form if it exists
        if (form.watch('income.incomeTypes.pension')) {
            setIsPensionOpen(false);
        }
        
        // Close disability form if it exists
        if (form.watch('income.incomeTypes.vaBenefits')) {
            setIsDisabilityOpen(false);
        }
    };

    const handleDeleteSocialSecurity = () => {
        // Clear the income type checkbox and close the section
        form.setValue('income.incomeTypes.socialSecurity', false);
        form.setValue('income.socialSecurityMonthlyAmount', '');
        form.setValue('income.socialSecurityStartDate', '');
        setIsSocialSecurityOpen(false);
    };

    const handleDeletePension = () => {
        // Clear the income type checkbox and close the section
        form.setValue('income.incomeTypes.pension', false);
        form.setValue('income.pensions', []);
        setIsPensionOpen(false);
    };

    const handleDeleteDisability = () => {
        // Clear the income type checkbox and close the section
        form.setValue('income.incomeTypes.vaBenefits', false);
        form.setValue('income.vaBenefitsMonthlyAmount', '');
        form.setValue('income.vaBenefitsStartDate', '');
        form.setValue('income.disabilityMonthlyAmount', '');
        form.setValue('income.disabilityStartDate', '');
        setIsDisabilityOpen(false);
    };

    const handleDeleteEmployer = (cardId: string) => {        
        // Remove the card from the array
        const updatedCards = borrowerEmployerCards.filter(id => id !== cardId);
        setBorrowerEmployerCards(updatedCards);
        
        // If this was the last employer, uncheck the employment checkbox
        if (updatedCards.length === 0) {
            form.setValue('income.incomeTypes.employment', false);
        }
        
        // Clean up related state
        const propertyId = cardId === 'default' ? 'default' : cardId;
        setPropertyCardStates(prev => {
            const newState = { ...prev };
            delete newState[propertyId];
            return newState;
        });
        
        setEmploymentDates(prev => {
            const newState = { ...prev };
            delete newState[cardId];
            return newState;
        });
        
        // Clear form data for this employer
        const fieldsToClean = [
            'employerName', 'jobTitle', 'monthlyIncome', 'employmentType',
            'yearsEmployedYears', 'yearsEmployedMonths', 'employerPhone',
            'employmentVerificationPhone', 'isShowingEmploymentVerification'
        ];
        const addressFieldsToClean = [
            'employerAddress.street', 'employerAddress.unit', 'employerAddress.city',
            'employerAddress.state', 'employerAddress.zip', 'employerAddress.county'
        ];
        fieldsToClean.forEach(field => {
            form.setValue(`income.employers.${cardId}.${field}` as any, '');
        });
        addressFieldsToClean.forEach(field => {
            form.setValue(`income.employers.${cardId}.${field}` as any, '');
        });
    };

    return (
        <>
            <Card>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
                    <IncomeHeader animations={animations} />
                </CardContent>
            </Card>

            <IncomeTypes
                prefix="income"
                title="Borrower Income"
                totalIncome={totalBorrowerIncomeFormatted}
                onPropertyRentalChange={handlePropertyRentalChange}
                onExpandAll={handleExpandAll}
                onMinimizeAll={handleMinimizeAll}
                borderColor="green"
            />

            {/* Employment Form - Show when employment is selected */}
            {form.watch('income.incomeTypes.employment') && (borrowerEmployerCards || ['default']).map((cardId) => {
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
                            if (borrowerEmployerCards.length < 3) {
                                const newId = `employer-${Date.now()}`;
                                setBorrowerEmployerCards(prev => [...prev, newId]);
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
                        showAddButton={borrowerEmployerCards.length < 3}
                    />
                );
            })}

            {/* Social Security Form - Show when social security is selected */}
            {form.watch('income.incomeTypes.socialSecurity') && (
                <SocialSecurityForm
                    isOpen={isSocialSecurityOpen}
                    onOpenChange={setIsSocialSecurityOpen}
                    onDeleteSocialSecurity={handleDeleteSocialSecurity}
                />
            )}

            {/* Pension Form - Show when pension is selected */}
            {form.watch('income.incomeTypes.pension') && (
                <PensionForm
                    isOpen={isPensionOpen}
                    onOpenChange={setIsPensionOpen}
                    onDeletePension={handleDeletePension}
                    showAnimation={showIncomeCardAnimation['pension']}
                    setShowAnimation={setShowIncomeCardAnimation}
                />
            )}

            {/* Disability Card - Show when VA benefits is selected */}
            {form.watch('income.incomeTypes.vaBenefits') && (
                <DisabilityCard
                    isOpen={isDisabilityOpen}
                    onOpenChange={setIsDisabilityOpen}
                    onDeleteDisability={handleDeleteDisability}
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
        </>
    );
};

export default IncomeTab;