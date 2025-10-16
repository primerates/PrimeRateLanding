import { useState } from 'react';

export const useQuoteState = () => {
    // UI State
    const [showPinPopup, setShowPinPopup] = useState(false);
    const [showPagePopup, setShowPagePopup] = useState(false);
    const [isStickyNotesOpen, setIsStickyNotesOpen] = useState(false);
    const [showLibraryDialog, setShowLibraryDialog] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [isQuoteCardsMinimized, setIsQuoteCardsMinimized] = useState(false);

    // Loan Category state
    const [selectedLoanCategory, setSelectedLoanCategory] = useState('');
    const [isVAExempt, setIsVAExempt] = useState(false);
    const [isVAJumboExempt, setIsVAJumboExempt] = useState(false);

    // Property Use and Type state
    const [selectedPropertyUse, setSelectedPropertyUse] = useState('');
    const [selectedPropertyType, setSelectedPropertyType] = useState('');

    // Loan Term state
    const [isCustomTerm, setIsCustomTerm] = useState(false);
    const [loanTerm, setLoanTerm] = useState('');
    const [customTerm, setCustomTerm] = useState('');

    // Loan Program state
    const [selectedLoanProgram, setSelectedLoanProgram] = useState('select');

    // Row 2 state - Quote, State, Rate Buydown, Escrow Reserves, Monthly Escrow
    const [selectedRateIds, setSelectedRateIds] = useState<number[]>([]);
    const [selectedState, setSelectedState] = useState('select');
    const [rateBuydown, setRateBuydown] = useState('yes');
    const [escrowReserves, setEscrowReserves] = useState('new-escrow-reserves');
    const [monthlyEscrow, setMonthlyEscrow] = useState('includes-tax-insurance');

    // Lender state
    const [isLenderCreditMode, setIsLenderCreditMode] = useState(false);
    const [selectedLender, setSelectedLender] = useState('');
    const [lenderCreditAmount, setLenderCreditAmount] = useState('');

    // Title state
    const [isTitleSellerCreditMode, setIsTitleSellerCreditMode] = useState(false);
    const [selectedTitle, setSelectedTitle] = useState('');
    const [titleSellerCreditAmount, setTitleSellerCreditAmount] = useState('');

    // Mid FICO state
    const [isMidFicoEstimateMode, setIsMidFicoEstimateMode] = useState(false);
    const [estimatedFicoValue, setEstimatedFicoValue] = useState('');

    // LTV Ratio state
    const [isLtvEstimateMode, setIsLtvEstimateMode] = useState(false);
    const [estimatedLtvValue, setEstimatedLtvValue] = useState('');

    // Underwriting/Processing state
    const [isProcessingMode, setIsProcessingMode] = useState(false);
    const [underwriting, setUnderwriting] = useState('financed');

    // Pin Reference state
    const [pinPopupPosition, setPinPopupPosition] = useState({ x: 250, y: 100 });
    const [pinPopupSize, setPinPopupSize] = useState({ width: 600, height: 700 });
    const [pinContent, setPinContent] = useState<{ type: 'text' | 'image'; data: string } | null>(null);

    // Page Editor state
    const [pagePopupPosition, setPagePopupPosition] = useState({ x: 150, y: 150 });
    const [pageContent, setPageContent] = useState('');
    const [pageFontSize, setPageFontSize] = useState('16');
    const [pageFontColor, setPageFontColor] = useState('#000000');

    // Sticky Notes state
    const [stickyNotes, setStickyNotes] = useState('');

    // Guidelines Library state
    const [libraryConfigurations, setLibraryConfigurations] = useState<Record<string, any>>({});

    // Calculator state
    const [calculatorPosition, setCalculatorPosition] = useState({ x: 100, y: 100 });

    // Handler functions for library
    const handleDeleteConfiguration = (key: string) => {
        setLibraryConfigurations(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
    };

    const handleLoadConfiguration = (config: any) => {
        // This would load the configuration into the current form state
        // Implementation depends on how you want to handle the loaded data
        console.log('Loading configuration:', config);
    };

    // Calculate if all fields are completed to enable Quote selection
    const getCompletedFieldsCount = () => {
        return [
            !!selectedLoanCategory && selectedLoanCategory !== '',  // 1. Loan Category
            (isCustomTerm && !!customTerm) || (!isCustomTerm && !!loanTerm && loanTerm !== 'select'),  // 2. Loan Term
            true,  // 3. Loan Program (has default)
            !!selectedPropertyUse && selectedPropertyUse !== 'select',  // 4. Property Use
            !!selectedPropertyType && selectedPropertyType !== 'select',  // 5. Property Type
            !!selectedState && selectedState !== 'select',  // 6. State
            true,  // 7. Rate Buydown (has default)
            true,  // 8. Escrow Reserves (has default)
            true,  // 9. Monthly Escrow (has default)
            (isMidFicoEstimateMode && !!estimatedFicoValue) || (!isMidFicoEstimateMode),  // 10. Mid FICO
            (isLtvEstimateMode && !!estimatedLtvValue) || (!isLtvEstimateMode),  // 11. LTV Ratio
            (isLenderCreditMode && !!lenderCreditAmount) || (!isLenderCreditMode && !!selectedLender),  // 12. Lender
            (isTitleSellerCreditMode && !!titleSellerCreditAmount) || (!isTitleSellerCreditMode && !!selectedTitle),  // 13. Title
            true,  // 14. Underwriting (has default)
        ].filter(Boolean).length;
    };

    const isQuoteEnabled = getCompletedFieldsCount() === 14;

    return {
        // UI State
        showPinPopup,
        setShowPinPopup,
        showPagePopup,
        setShowPagePopup,
        isStickyNotesOpen,
        setIsStickyNotesOpen,
        showLibraryDialog,
        setShowLibraryDialog,
        showCalculator,
        setShowCalculator,
        isQuoteCardsMinimized,
        setIsQuoteCardsMinimized,

        // Loan Category
        selectedLoanCategory,
        setSelectedLoanCategory,
        isVAExempt,
        setIsVAExempt,
        isVAJumboExempt,
        setIsVAJumboExempt,

        // Property
        selectedPropertyUse,
        setSelectedPropertyUse,
        selectedPropertyType,
        setSelectedPropertyType,

        // Loan Term
        isCustomTerm,
        setIsCustomTerm,
        loanTerm,
        setLoanTerm,
        customTerm,
        setCustomTerm,

        // Loan Program
        selectedLoanProgram,
        setSelectedLoanProgram,

        // Row 2
        selectedRateIds,
        setSelectedRateIds,
        selectedState,
        setSelectedState,
        rateBuydown,
        setRateBuydown,
        escrowReserves,
        setEscrowReserves,
        monthlyEscrow,
        setMonthlyEscrow,

        // Lender
        isLenderCreditMode,
        setIsLenderCreditMode,
        selectedLender,
        setSelectedLender,
        lenderCreditAmount,
        setLenderCreditAmount,

        // Title
        isTitleSellerCreditMode,
        setIsTitleSellerCreditMode,
        selectedTitle,
        setSelectedTitle,
        titleSellerCreditAmount,
        setTitleSellerCreditAmount,

        // Mid FICO
        isMidFicoEstimateMode,
        setIsMidFicoEstimateMode,
        estimatedFicoValue,
        setEstimatedFicoValue,

        // LTV Ratio
        isLtvEstimateMode,
        setIsLtvEstimateMode,
        estimatedLtvValue,
        setEstimatedLtvValue,

        // Underwriting
        isProcessingMode,
        setIsProcessingMode,
        underwriting,
        setUnderwriting,

        // Pin Reference
        pinPopupPosition,
        setPinPopupPosition,
        pinPopupSize,
        setPinPopupSize,
        pinContent,
        setPinContent,

        // Page Editor
        pagePopupPosition,
        setPagePopupPosition,
        pageContent,
        setPageContent,
        pageFontSize,
        setPageFontSize,
        pageFontColor,
        setPageFontColor,

        // Sticky Notes
        stickyNotes,
        setStickyNotes,

        // Library
        libraryConfigurations,
        setLibraryConfigurations,
        handleDeleteConfiguration,
        handleLoadConfiguration,

        // Calculator
        calculatorPosition,
        setCalculatorPosition,

        // Computed
        isQuoteEnabled,
        completedFieldsCount: getCompletedFieldsCount(),
    };
};
