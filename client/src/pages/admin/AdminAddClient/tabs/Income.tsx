import { useMemo, useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import IncomeHeader from '../components/Income/IncomeHeader';
import IncomeFormsSection from '../components/Income/IncomeFormsSection';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';
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
    const { hasCoBorrower } = useAdminAddClientStore();

    // State for employment forms
    const [borrowerEmployerCards, setBorrowerEmployerCards] = useState<string[]>(['default']);
    const [propertyCardStates, setPropertyCardStates] = useState<Record<string, boolean>>({});
    const [showIncomeCardAnimation, setShowIncomeCardAnimation] = useState<Record<string, boolean>>({});
    const [employmentDates, setEmploymentDates] = useState<Record<string, any>>({});

    // State for second employment forms
    const [secondEmployerCards, setSecondEmployerCards] = useState<string[]>(['default']);
    const [secondPropertyCardStates, setSecondPropertyCardStates] = useState<Record<string, boolean>>({});
    const [secondEmploymentDates, setSecondEmploymentDates] = useState<Record<string, any>>({});

    // State for self employment forms
    const [selfEmploymentCards, setSelfEmploymentCards] = useState<string[]>(['default']);
    const [selfEmploymentPropertyCardStates, setSelfEmploymentPropertyCardStates] = useState<Record<string, boolean>>({});

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

    // Delete second employer dialog state
    const [deleteSecondEmployerDialog, setDeleteSecondEmployerDialog] = useState<{
        isOpen: boolean;
        cardId: string;
    }>({ isOpen: false, cardId: '' });

    // Delete self employment dialog state
    const [deleteSelfEmploymentDialog, setDeleteSelfEmploymentDialog] = useState<{
        isOpen: boolean;
        cardId: string;
    }>({ isOpen: false, cardId: '' });

    // Co-borrower state variables
    const [coBorrowerEmployerCards, setCoBorrowerEmployerCards] = useState<string[]>(['default']);
    const [coBorrowerPropertyCardStates, setCoBorrowerPropertyCardStates] = useState<Record<string, boolean>>({});
    const [coBorrowerSecondEmployerCards, setCoBorrowerSecondEmployerCards] = useState<string[]>(['default']);
    const [coBorrowerSecondPropertyCardStates, setCoBorrowerSecondPropertyCardStates] = useState<Record<string, boolean>>({});
    const [coBorrowerSelfEmploymentCards, setCoBorrowerSelfEmploymentCards] = useState<string[]>(['default']);
    const [coBorrowerSelfEmploymentPropertyCardStates, setCoBorrowerSelfEmploymentPropertyCardStates] = useState<Record<string, boolean>>({});
    const [coBorrowerEmploymentDates, setCoBorrowerEmploymentDates] = useState<Record<string, any>>({});
    const [coBorrowerSecondEmploymentDates, setCoBorrowerSecondEmploymentDates] = useState<Record<string, any>>({});
    const [isCoBorrowerSocialSecurityOpen, setIsCoBorrowerSocialSecurityOpen] = useState(false);
    const [isCoBorrowerPensionOpen, setIsCoBorrowerPensionOpen] = useState(true);
    const [isCoBorrowerDisabilityOpen, setIsCoBorrowerDisabilityOpen] = useState(true);

    // Co-borrower dialog states
    const [coBorrowerPropertyRentalDialog, setCoBorrowerPropertyRentalDialog] = useState<{
        isOpen: boolean;
        type: 'add' | 'remove' | null;
    }>({ isOpen: false, type: null });
    const [deleteCoBorrowerEmployerDialog, setDeleteCoBorrowerEmployerDialog] = useState<{
        isOpen: boolean;
        cardId: string;
    }>({ isOpen: false, cardId: '' });
    const [deleteCoBorrowerSecondEmployerDialog, setDeleteCoBorrowerSecondEmployerDialog] = useState<{
        isOpen: boolean;
        cardId: string;
    }>({ isOpen: false, cardId: '' });
    const [deleteCoBorrowerSelfEmploymentDialog, setDeleteCoBorrowerSelfEmploymentDialog] = useState<{
        isOpen: boolean;
        cardId: string;
    }>({ isOpen: false, cardId: '' });


    // Helper function to generate dynamic field paths for employer cards
    const getEmployerFieldPath = (cardId: string, fieldName: string) => {
        const cleanCardId = cardId === 'default' ? 'default' : cardId;
        return `income.employers.${cleanCardId}.${fieldName}` as const;
    };

    // Helper function to generate dynamic field paths for second employer cards
    const getSecondEmployerFieldPath = (cardId: string, fieldName: string) => {
        const cleanCardId = cardId === 'default' ? 'default' : cardId;
        return `income.secondEmployers.${cleanCardId}.${fieldName}` as const;
    };

    // Helper function to generate dynamic field paths for co-borrower employer cards
    const getCoBorrowerEmployerFieldPath = (cardId: string, fieldName: string) => {
        const cleanCardId = cardId === 'default' ? 'default' : cardId;
        return `coBorrowerIncome.employers.${cleanCardId}.${fieldName}` as const;
    };

    // Helper function to generate dynamic field paths for co-borrower second employer cards
    const getCoBorrowerSecondEmployerFieldPath = (cardId: string, fieldName: string) => {
        const cleanCardId = cardId === 'default' ? 'default' : cardId;
        return `coBorrowerIncome.secondEmployers.${cleanCardId}.${fieldName}` as const;
    };

    // Helper function to generate dynamic field paths for self employment cards
    const getSelfEmploymentFieldPath = (cardId: string, fieldName: string) => {
        const cleanCardId = cardId === 'default' ? 'default' : cardId;
        return `income.selfEmployers.${cleanCardId}.${fieldName}` as const;
    };

    // Helper function to generate dynamic field paths for co-borrower self employment cards
    const getCoBorrowerSelfEmploymentFieldPath = (cardId: string, fieldName: string) => {
        const cleanCardId = cardId === 'default' ? 'default' : cardId;
        return `coBorrowerIncome.selfEmployers.${cleanCardId}.${fieldName}` as const;
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

    // Update second employment duration when dates change
    const updateSecondEmploymentDuration = (cardId: string, startDate: string, endDate: string, isPresent: boolean) => {
        // Use utility function to calculate duration
        const { years, months, duration } = calculateEmploymentDuration(startDate, endDate, isPresent);

        // Update local state for UI
        setSecondEmploymentDates(prev => ({
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
        const yearsPath = `income.secondEmployers.${cardId}.yearsEmployedYears`;
        const monthsPath = `income.secondEmployers.${cardId}.yearsEmployedMonths`;
        form.setValue(yearsPath as any, years);
        form.setValue(monthsPath as any, months);
    };

    // Update co-borrower employment duration when dates change
    const updateCoBorrowerEmploymentDuration = (cardId: string, startDate: string, endDate: string, isPresent: boolean) => {
        const { years, months, duration } = calculateEmploymentDuration(startDate, endDate, isPresent);

        setCoBorrowerEmploymentDates(prev => ({
            ...prev,
            [cardId]: {
                ...prev[cardId],
                startDate,
                endDate,
                isPresent,
                duration
            }
        }));

        const yearsPath = `coBorrowerIncome.employers.${cardId}.yearsEmployedYears`;
        const monthsPath = `coBorrowerIncome.employers.${cardId}.yearsEmployedMonths`;
        form.setValue(yearsPath as any, years);
        form.setValue(monthsPath as any, months);
    };

    // Update co-borrower second employment duration when dates change
    const updateCoBorrowerSecondEmploymentDuration = (cardId: string, startDate: string, endDate: string, isPresent: boolean) => {
        const { years, months, duration } = calculateEmploymentDuration(startDate, endDate, isPresent);

        setCoBorrowerSecondEmploymentDates(prev => ({
            ...prev,
            [cardId]: {
                ...prev[cardId],
                startDate,
                endDate,
                isPresent,
                duration
            }
        }));

        const yearsPath = `coBorrowerIncome.secondEmployers.${cardId}.yearsEmployedYears`;
        const monthsPath = `coBorrowerIncome.secondEmployers.${cardId}.yearsEmployedMonths`;
        form.setValue(yearsPath as any, years);
        form.setValue(monthsPath as any, months);
    };

    // Watch all income data once to minimize subscriptions
    const incomeData = form.watch('income') || {};
    const coBorrowerIncomeData = form.watch('coBorrowerIncome') || {};

    // Watch for employment checkbox changes and ensure default card exists when checked
    const isEmploymentChecked = incomeData?.incomeTypes?.employment;
    useEffect(() => {
        if (isEmploymentChecked && borrowerEmployerCards.length === 0) {
            setBorrowerEmployerCards(['default']);
        }
    }, [isEmploymentChecked, borrowerEmployerCards.length]);

    // Watch for second employment checkbox changes and ensure default card exists when checked
    const isSecondEmploymentChecked = incomeData?.incomeTypes?.secondEmployment;
    useEffect(() => {
        if (isSecondEmploymentChecked && secondEmployerCards.length === 0) {
            setSecondEmployerCards(['default']);
        }
    }, [isSecondEmploymentChecked, secondEmployerCards.length]);

    // Watch for pension checkbox changes and ensure default pension exists when checked
    const isPensionChecked = incomeData?.incomeTypes?.pension;
    useEffect(() => {
        if (isPensionChecked) {
            const currentPensions = incomeData.pensions || [];
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
    }, [isPensionChecked, form, incomeData.pensions]);

    // Watch for co-borrower employment checkbox changes and ensure default card exists when checked
    const isCoBorrowerEmploymentChecked = coBorrowerIncomeData?.incomeTypes?.employment;
    useEffect(() => {
        if (isCoBorrowerEmploymentChecked && coBorrowerEmployerCards.length === 0) {
            setCoBorrowerEmployerCards(['default']);
        }
    }, [isCoBorrowerEmploymentChecked, coBorrowerEmployerCards.length]);

    // Watch for co-borrower second employment checkbox changes and ensure default card exists when checked
    const isCoBorrowerSecondEmploymentChecked = coBorrowerIncomeData?.incomeTypes?.secondEmployment;
    useEffect(() => {
        if (isCoBorrowerSecondEmploymentChecked && coBorrowerSecondEmployerCards.length === 0) {
            setCoBorrowerSecondEmployerCards(['default']);
        }
    }, [isCoBorrowerSecondEmploymentChecked, coBorrowerSecondEmployerCards.length]);

    // Watch for co-borrower pension checkbox changes and ensure default pension exists when checked
    const isCoBorrowerPensionChecked = coBorrowerIncomeData?.incomeTypes?.pension;
    useEffect(() => {
        if (isCoBorrowerPensionChecked) {
            const currentPensions = coBorrowerIncomeData.pensions || [];
            if (currentPensions.length === 0) {
                const defaultPension = {
                    id: `pension-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                    payerName: '',
                    monthlyAmount: '',
                    startDate: ''
                };
                form.setValue('coBorrowerIncome.pensions', [defaultPension]);
            }
        }
    }, [isCoBorrowerPensionChecked, form, coBorrowerIncomeData.pensions]);

    // Create stable dependency for useMemo
    const incomeDataStr = JSON.stringify(incomeData);

    // Calculate total borrower income - full implementation from AdminAddClient
    const totalBorrowerIncome = useMemo(() => {
        // Calculate total main employment income from all employer cards
        const employmentIncome = incomeData?.employers && typeof incomeData.employers === 'object'
            ? Object.values(incomeData.employers).reduce((total, employer: any) => {
                return total + (employer && typeof employer === 'object' ? parseMonetaryValue(employer.monthlyIncome) : 0);
            }, 0)
            : parseMonetaryValue(incomeData?.monthlyIncome); // fallback for backward compatibility

        // Calculate total second employment income from all cards
        const secondEmploymentIncome = incomeData?.secondEmployers && typeof incomeData.secondEmployers === 'object'
            ? Object.values(incomeData.secondEmployers).reduce((total, employer: any) => {
                return total + (employer && typeof employer === 'object' ? parseMonetaryValue(employer.monthlyIncome) : 0);
            }, 0)
            : parseMonetaryValue(incomeData?.secondMonthlyIncome); // fallback for backward compatibility

        // Calculate total self-employment income from all cards
        const businessIncome = incomeData?.selfEmployers && typeof incomeData.selfEmployers === 'object'
            ? Object.values(incomeData.selfEmployers).reduce((total, business: any) => {
                return total + (business && typeof business === 'object' ? parseMonetaryValue(business.businessMonthlyIncome) : 0);
            }, 0)
            : parseMonetaryValue(incomeData?.businessMonthlyIncome); // fallback for backward compatibility

        const pensionIncome = incomeData?.pensions?.reduce((total: number, pension: any) => total + parseMonetaryValue(pension.monthlyAmount), 0) || 0;
        const socialSecurityIncome = parseMonetaryValue(incomeData?.socialSecurityMonthlyAmount);
        const vaBenefitsIncome = parseMonetaryValue(incomeData?.vaBenefitsMonthlyAmount);
        const disabilityIncome = parseMonetaryValue(incomeData?.disabilityMonthlyAmount);
        const otherIncome = parseMonetaryValue(incomeData?.otherIncomeMonthlyAmount);

        const total = employmentIncome + secondEmploymentIncome + businessIncome +
            pensionIncome + socialSecurityIncome + vaBenefitsIncome +
            disabilityIncome + otherIncome;

        return total;
    }, [incomeDataStr]);

    const totalBorrowerIncomeFormatted = useMemo(() =>
        formatCurrency(totalBorrowerIncome),
        [totalBorrowerIncome]
    );

    // Create stable dependency for co-borrower income useMemo
    const coBorrowerIncomeDataStr = JSON.stringify(coBorrowerIncomeData);

    // Calculate total co-borrower income
    const totalCoBorrowerIncome = useMemo(() => {
        // Calculate total main employment income from all employer cards
        const employmentIncome = coBorrowerIncomeData?.employers && typeof coBorrowerIncomeData.employers === 'object'
            ? Object.values(coBorrowerIncomeData.employers).reduce((total, employer: any) => {
                return total + (employer && typeof employer === 'object' ? parseMonetaryValue(employer.monthlyIncome) : 0);
            }, 0)
            : parseMonetaryValue(coBorrowerIncomeData?.monthlyIncome);

        // Calculate total second employment income from all cards
        const secondEmploymentIncome = coBorrowerIncomeData?.secondEmployers && typeof coBorrowerIncomeData.secondEmployers === 'object'
            ? Object.values(coBorrowerIncomeData.secondEmployers).reduce((total, employer: any) => {
                return total + (employer && typeof employer === 'object' ? parseMonetaryValue(employer.monthlyIncome) : 0);
            }, 0)
            : 0;

        const businessIncome = parseMonetaryValue(coBorrowerIncomeData?.businessMonthlyIncome);

        // Calculate pension income from pensions array
        const pensionIncome = coBorrowerIncomeData?.pensions && Array.isArray(coBorrowerIncomeData.pensions)
            ? coBorrowerIncomeData.pensions.reduce((total, pension: any) => {
                return total + parseMonetaryValue(pension?.monthlyAmount);
            }, 0)
            : 0;

        const socialSecurityIncome = parseMonetaryValue(coBorrowerIncomeData?.socialSecurityMonthlyAmount);
        const vaBenefitsIncome = parseMonetaryValue(coBorrowerIncomeData?.vaBenefitsMonthlyAmount);
        const disabilityIncome = parseMonetaryValue(coBorrowerIncomeData?.disabilityMonthlyAmount);
        const otherIncome = parseMonetaryValue(coBorrowerIncomeData?.otherIncomeMonthlyAmount);

        const total = employmentIncome + secondEmploymentIncome + businessIncome +
            pensionIncome + socialSecurityIncome + vaBenefitsIncome +
            disabilityIncome + otherIncome;

        return total;
    }, [coBorrowerIncomeDataStr]);

    const totalCoBorrowerIncomeFormatted = useMemo(() =>
        formatCurrency(totalCoBorrowerIncome),
        [totalCoBorrowerIncome]
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

        // Open all second employment form cards
        setSecondPropertyCardStates(prev => {
            const newState = { ...prev };
            // Set all cards to open (true)
            secondEmployerCards.forEach(cardId => {
                const propertyId = cardId === 'default' ? 'default' : cardId;
                newState[propertyId] = true;
            });
            return newState;
        });

        // Open social security form if it exists
        if (incomeData?.incomeTypes?.socialSecurity) {
            setIsSocialSecurityOpen(true);
        }

        // Open pension form if it exists
        if (incomeData?.incomeTypes?.pension) {
            setIsPensionOpen(true);
        }

        // Open disability form if it exists
        if (incomeData?.incomeTypes?.vaBenefits) {
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

        // Close all second employment form cards
        setSecondPropertyCardStates(prev => {
            const newState = { ...prev };
            // Set all cards to closed (false)
            secondEmployerCards.forEach(cardId => {
                const propertyId = cardId === 'default' ? 'default' : cardId;
                newState[propertyId] = false;
            });
            return newState;
        });

        // Close social security form if it exists
        if (incomeData?.incomeTypes?.socialSecurity) {
            setIsSocialSecurityOpen(false);
        }

        // Close pension form if it exists
        if (incomeData?.incomeTypes?.pension) {
            setIsPensionOpen(false);
        }

        // Close disability form if it exists
        if (incomeData?.incomeTypes?.vaBenefits) {
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

    const handleDeleteSecondEmployer = (cardId: string) => {        
        // Remove the card from the array
        const updatedCards = secondEmployerCards.filter(id => id !== cardId);
        setSecondEmployerCards(updatedCards);
        
        // If this was the last employer, uncheck the second employment checkbox
        if (updatedCards.length === 0) {
            form.setValue('income.incomeTypes.secondEmployment', false);
        }
        
        // Clean up related state
        const propertyId = cardId === 'default' ? 'default' : cardId;
        setSecondPropertyCardStates(prev => {
            const newState = { ...prev };
            delete newState[propertyId];
            return newState;
        });
        
        setSecondEmploymentDates(prev => {
            const newState = { ...prev };
            delete newState[cardId];
            return newState;
        });
        
        // Clear form data for this second employer
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
            form.setValue(`income.secondEmployers.${cardId}.${field}` as any, '');
        });
        addressFieldsToClean.forEach(field => {
            form.setValue(`income.secondEmployers.${cardId}.${field}` as any, '');
        });
    };

    const handleDeleteSelfEmployment = (propertyId: string) => {        
        // Map propertyId back to original cardId
        const originalCardId = propertyId === 'self-employment-template-card' ? 'default' : propertyId;
        
        // Remove the card from the array
        const updatedCards = selfEmploymentCards.filter(id => id !== originalCardId);
        setSelfEmploymentCards(updatedCards);
        
        // If this was the last self employment, uncheck the self employment checkbox
        if (updatedCards.length === 0) {
            form.setValue('income.incomeTypes.selfEmployment', false);
        }
        
        // Clean up related state
        setSelfEmploymentPropertyCardStates(prev => {
            const newState = { ...prev };
            delete newState[propertyId];
            return newState;
        });
        
        // Clear form data for this self employment
        const fieldsToClean = [
            'businessName', 'businessPhone', 'businessMonthlyIncome', 'formationDate', 'yearsInBusinessYears', 'yearsInBusinessMonths', 'businessAddress.street', 'businessAddress.unit', 'businessAddress.city', 
            'businessAddress.state', 'businessAddress.zip', 'businessAddress.county', 'formation', 'businessDescription', 'taxesPreparedBy'
        ];
        fieldsToClean.forEach(field => {
            form.setValue(`income.selfEmployers.${originalCardId}.${field}` as any, '');
        });
    };

    // Co-borrower event handlers
    const handleCoBorrowerPropertyRentalChange = (checked: boolean) => {
        if (checked) {
            setCoBorrowerPropertyRentalDialog({ isOpen: true, type: 'add' });
        } else {
            setCoBorrowerPropertyRentalDialog({ isOpen: true, type: 'remove' });
        }
    };

    const handleCoBorrowerExpandAll = () => {
        setCoBorrowerPropertyCardStates(prev => {
            const newState = { ...prev };
            coBorrowerEmployerCards.forEach(cardId => {
                const propertyId = cardId === 'default' ? 'default' : cardId;
                newState[propertyId] = true;
            });
            return newState;
        });

        setCoBorrowerSecondPropertyCardStates(prev => {
            const newState = { ...prev };
            coBorrowerSecondEmployerCards.forEach(cardId => {
                const propertyId = cardId === 'default' ? 'default' : cardId;
                newState[propertyId] = true;
            });
            return newState;
        });

        setIsCoBorrowerSocialSecurityOpen(true);
        setIsCoBorrowerPensionOpen(true);
        setIsCoBorrowerDisabilityOpen(true);
    };

    const handleCoBorrowerMinimizeAll = () => {
        setCoBorrowerPropertyCardStates(prev => {
            const newState = { ...prev };
            coBorrowerEmployerCards.forEach(cardId => {
                const propertyId = cardId === 'default' ? 'default' : cardId;
                newState[propertyId] = false;
            });
            return newState;
        });

        setCoBorrowerSecondPropertyCardStates(prev => {
            const newState = { ...prev };
            coBorrowerSecondEmployerCards.forEach(cardId => {
                const propertyId = cardId === 'default' ? 'default' : cardId;
                newState[propertyId] = false;
            });
            return newState;
        });

        setIsCoBorrowerSocialSecurityOpen(false);
        setIsCoBorrowerPensionOpen(false);
        setIsCoBorrowerDisabilityOpen(false);
    };

    const handleDeleteCoBorrowerSocialSecurity = () => {
        form.setValue('coBorrowerIncome.incomeTypes.socialSecurity', false);
        form.setValue('coBorrowerIncome.socialSecurityMonthlyAmount', '');
        form.setValue('coBorrowerIncome.socialSecurityStartDate', '');
        setIsCoBorrowerSocialSecurityOpen(false);
    };

    const handleDeleteCoBorrowerPension = () => {
        form.setValue('coBorrowerIncome.incomeTypes.pension', false);
        form.setValue('coBorrowerIncome.pensions', []);
        setIsCoBorrowerPensionOpen(false);
    };

    const handleDeleteCoBorrowerDisability = () => {
        form.setValue('coBorrowerIncome.incomeTypes.vaBenefits', false);
        form.setValue('coBorrowerIncome.vaBenefitsMonthlyAmount', '');
        form.setValue('coBorrowerIncome.vaBenefitsStartDate', '');
        form.setValue('coBorrowerIncome.disabilityMonthlyAmount', '');
        form.setValue('coBorrowerIncome.disabilityStartDate', '');
        setIsCoBorrowerDisabilityOpen(false);
    };

    const handleDeleteCoBorrowerEmployer = (cardId: string) => {        
        const updatedCards = coBorrowerEmployerCards.filter(id => id !== cardId);
        setCoBorrowerEmployerCards(updatedCards);
        
        if (updatedCards.length === 0) {
            form.setValue('coBorrowerIncome.incomeTypes.employment', false);
        }
        
        const propertyId = cardId === 'default' ? 'default' : cardId;
        setCoBorrowerPropertyCardStates(prev => {
            const newState = { ...prev };
            delete newState[propertyId];
            return newState;
        });
        
        setCoBorrowerEmploymentDates(prev => {
            const newState = { ...prev };
            delete newState[cardId];
            return newState;
        });
        
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
            form.setValue(`coBorrowerIncome.employers.${cardId}.${field}` as any, '');
        });
        addressFieldsToClean.forEach(field => {
            form.setValue(`coBorrowerIncome.employers.${cardId}.${field}` as any, '');
        });
    };

    const handleDeleteCoBorrowerSecondEmployer = (cardId: string) => {        
        const updatedCards = coBorrowerSecondEmployerCards.filter(id => id !== cardId);
        setCoBorrowerSecondEmployerCards(updatedCards);
        
        if (updatedCards.length === 0) {
            form.setValue('coBorrowerIncome.incomeTypes.secondEmployment', false);
        }
        
        const propertyId = cardId === 'default' ? 'default' : cardId;
        setCoBorrowerSecondPropertyCardStates(prev => {
            const newState = { ...prev };
            delete newState[propertyId];
            return newState;
        });
        
        setCoBorrowerSecondEmploymentDates(prev => {
            const newState = { ...prev };
            delete newState[cardId];
            return newState;
        });
        
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
            form.setValue(`coBorrowerIncome.secondEmployers.${cardId}.${field}` as any, '');
        });
        addressFieldsToClean.forEach(field => {
            form.setValue(`coBorrowerIncome.secondEmployers.${cardId}.${field}` as any, '');
        });
    };

    const handleDeleteCoBorrowerSelfEmployment = (propertyId: string) => {        
        // Map propertyId back to original cardId
        const originalCardId = propertyId === 'co-borrower-self-employment-template-card' ? 'default' : propertyId;
        
        const updatedCards = coBorrowerSelfEmploymentCards.filter(id => id !== originalCardId);
        setCoBorrowerSelfEmploymentCards(updatedCards);
        
        if (updatedCards.length === 0) {
            form.setValue('coBorrowerIncome.incomeTypes.selfEmployment', false);
        }
        
        setCoBorrowerSelfEmploymentPropertyCardStates(prev => {
            const newState = { ...prev };
            delete newState[propertyId];
            return newState;
        });
        
        const fieldsToClean = [
            'businessName', 'businessPhone', 'businessMonthlyIncome', 'formationDate', 'yearsInBusinessYears', 'yearsInBusinessMonths', 'businessAddress.street', 'businessAddress.unit', 'businessAddress.city', 
            'businessAddress.state', 'businessAddress.zip', 'businessAddress.county', 'formation', 'businessDescription', 'taxesPreparedBy'
        ];
        fieldsToClean.forEach(field => {
            form.setValue(`coBorrowerIncome.selfEmployers.${originalCardId}.${field}` as any, '');
        });
    };

    return (
        <>
            <Card>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
                    <IncomeHeader animations={animations} />
                </CardContent>
            </Card>

            <IncomeFormsSection
                fieldPrefix="income"
                title="Borrower Income"
                borderColor="green"
                totalIncome={totalBorrowerIncomeFormatted}
                employerCards={borrowerEmployerCards}
                setEmployerCards={setBorrowerEmployerCards}
                secondEmployerCards={secondEmployerCards}
                setSecondEmployerCards={setSecondEmployerCards}
                selfEmploymentCards={selfEmploymentCards}
                setSelfEmploymentCards={setSelfEmploymentCards}
                propertyCardStates={propertyCardStates}
                setPropertyCardStates={setPropertyCardStates}
                secondPropertyCardStates={secondPropertyCardStates}
                setSecondPropertyCardStates={setSecondPropertyCardStates}
                selfEmploymentPropertyCardStates={selfEmploymentPropertyCardStates}
                setSelfEmploymentPropertyCardStates={setSelfEmploymentPropertyCardStates}
                getEmployerFieldPath={getEmployerFieldPath}
                getSecondEmployerFieldPath={getSecondEmployerFieldPath}
                getSelfEmploymentFieldPath={getSelfEmploymentFieldPath}
                employmentDates={employmentDates}
                setEmploymentDates={setEmploymentDates}
                secondEmploymentDates={secondEmploymentDates}
                setSecondEmploymentDates={setSecondEmploymentDates}
                updateEmploymentDuration={updateEmploymentDuration}
                updateSecondEmploymentDuration={updateSecondEmploymentDuration}
                showIncomeCardAnimation={showIncomeCardAnimation}
                setShowIncomeCardAnimation={setShowIncomeCardAnimation}
                isSocialSecurityOpen={isSocialSecurityOpen}
                setIsSocialSecurityOpen={setIsSocialSecurityOpen}
                isPensionOpen={isPensionOpen}
                setIsPensionOpen={setIsPensionOpen}
                isDisabilityOpen={isDisabilityOpen}
                setIsDisabilityOpen={setIsDisabilityOpen}
                propertyRentalDialog={propertyRentalDialog}
                setPropertyRentalDialog={setPropertyRentalDialog}
                deleteEmployerDialog={deleteEmployerDialog}
                setDeleteEmployerDialog={setDeleteEmployerDialog}
                deleteSecondEmployerDialog={deleteSecondEmployerDialog}
                setDeleteSecondEmployerDialog={setDeleteSecondEmployerDialog}
                deleteSelfEmploymentDialog={deleteSelfEmploymentDialog}
                setDeleteSelfEmploymentDialog={setDeleteSelfEmploymentDialog}
                handlePropertyRentalChange={handlePropertyRentalChange}
                handleExpandAll={handleExpandAll}
                handleMinimizeAll={handleMinimizeAll}
                handleDeleteSocialSecurity={handleDeleteSocialSecurity}
                handleDeletePension={handleDeletePension}
                handleDeleteDisability={handleDeleteDisability}
                handleDeleteEmployer={handleDeleteEmployer}
                handleDeleteSecondEmployer={handleDeleteSecondEmployer}
                handleDeleteSelfEmployment={handleDeleteSelfEmployment}
            />

            {/* Co-borrower Income Section - Only show when co-borrower is added */}
            {hasCoBorrower && (
                <IncomeFormsSection
                    fieldPrefix="coBorrowerIncome"
                    title="Co-Borrower Income"
                    borderColor="blue"
                    totalIncome={totalCoBorrowerIncomeFormatted}
                    employerCards={coBorrowerEmployerCards}
                    setEmployerCards={setCoBorrowerEmployerCards}
                    secondEmployerCards={coBorrowerSecondEmployerCards}
                    setSecondEmployerCards={setCoBorrowerSecondEmployerCards}
                    selfEmploymentCards={coBorrowerSelfEmploymentCards}
                    setSelfEmploymentCards={setCoBorrowerSelfEmploymentCards}
                    propertyCardStates={coBorrowerPropertyCardStates}
                    setPropertyCardStates={setCoBorrowerPropertyCardStates}
                    secondPropertyCardStates={coBorrowerSecondPropertyCardStates}
                    setSecondPropertyCardStates={setCoBorrowerSecondPropertyCardStates}
                    selfEmploymentPropertyCardStates={coBorrowerSelfEmploymentPropertyCardStates}
                    setSelfEmploymentPropertyCardStates={setCoBorrowerSelfEmploymentPropertyCardStates}
                    getEmployerFieldPath={getCoBorrowerEmployerFieldPath}
                    getSecondEmployerFieldPath={getCoBorrowerSecondEmployerFieldPath}
                    getSelfEmploymentFieldPath={getCoBorrowerSelfEmploymentFieldPath}
                    employmentDates={coBorrowerEmploymentDates}
                    setEmploymentDates={setCoBorrowerEmploymentDates}
                    secondEmploymentDates={coBorrowerSecondEmploymentDates}
                    setSecondEmploymentDates={setCoBorrowerSecondEmploymentDates}
                    updateEmploymentDuration={updateCoBorrowerEmploymentDuration}
                    updateSecondEmploymentDuration={updateCoBorrowerSecondEmploymentDuration}
                    showIncomeCardAnimation={showIncomeCardAnimation}
                    setShowIncomeCardAnimation={setShowIncomeCardAnimation}
                    isSocialSecurityOpen={isCoBorrowerSocialSecurityOpen}
                    setIsSocialSecurityOpen={setIsCoBorrowerSocialSecurityOpen}
                    isPensionOpen={isCoBorrowerPensionOpen}
                    setIsPensionOpen={setIsCoBorrowerPensionOpen}
                    isDisabilityOpen={isCoBorrowerDisabilityOpen}
                    setIsDisabilityOpen={setIsCoBorrowerDisabilityOpen}
                    propertyRentalDialog={coBorrowerPropertyRentalDialog}
                    setPropertyRentalDialog={setCoBorrowerPropertyRentalDialog}
                    deleteEmployerDialog={deleteCoBorrowerEmployerDialog}
                    setDeleteEmployerDialog={setDeleteCoBorrowerEmployerDialog}
                    deleteSecondEmployerDialog={deleteCoBorrowerSecondEmployerDialog}
                    setDeleteSecondEmployerDialog={setDeleteCoBorrowerSecondEmployerDialog}
                    deleteSelfEmploymentDialog={deleteCoBorrowerSelfEmploymentDialog}
                    setDeleteSelfEmploymentDialog={setDeleteCoBorrowerSelfEmploymentDialog}
                    handlePropertyRentalChange={handleCoBorrowerPropertyRentalChange}
                    handleExpandAll={handleCoBorrowerExpandAll}
                    handleMinimizeAll={handleCoBorrowerMinimizeAll}
                    handleDeleteSocialSecurity={handleDeleteCoBorrowerSocialSecurity}
                    handleDeletePension={handleDeleteCoBorrowerPension}
                    handleDeleteDisability={handleDeleteCoBorrowerDisability}
                    handleDeleteEmployer={handleDeleteCoBorrowerEmployer}
                    handleDeleteSecondEmployer={handleDeleteCoBorrowerSecondEmployer}
                    handleDeleteSelfEmployment={handleDeleteCoBorrowerSelfEmployment}
                />
            )}
        </>
    );
};

export default IncomeTab;