import { useState } from 'react';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';

export const useQuoteState = () => {
    // Get all quote form data from Zustand store to persist across tab switches
    const quoteData = useAdminAddClientStore(state => state.quoteData);
    const updateQuoteData = useAdminAddClientStore(state => state.updateQuoteData);

    // Create setter functions for each field
    const setSelectedLoanCategory = (value: string) => updateQuoteData({ selectedLoanCategory: value });
    const setIsVAExempt = (value: boolean) => updateQuoteData({ isVAExempt: value });
    const setIsVAJumboExempt = (value: boolean) => updateQuoteData({ isVAJumboExempt: value });
    const setIsCustomTerm = (value: boolean) => updateQuoteData({ isCustomTerm: value });
    const setLoanTerm = (value: string) => updateQuoteData({ loanTerm: value });
    const setCustomTerm = (value: string) => updateQuoteData({ customTerm: value });
    const setSelectedLoanProgram = (value: string) => updateQuoteData({ selectedLoanProgram: value });
    const setSelectedPropertyUse = (value: string) => updateQuoteData({ selectedPropertyUse: value });
    const setSelectedPropertyType = (value: string) => updateQuoteData({ selectedPropertyType: value });
    const setSelectedRateIds = (ids: number[] | ((prev: number[]) => number[])) => {
        const newIds = typeof ids === 'function' ? ids(quoteData.selectedRateIds) : ids;
        updateQuoteData({ selectedRateIds: newIds });
    };
    const setSelectedState = (value: string) => updateQuoteData({ selectedState: value });
    const setRateBuydown = (value: string) => updateQuoteData({ rateBuydown: value });
    const setEscrowReserves = (value: string) => updateQuoteData({ escrowReserves: value });
    const setMonthlyEscrow = (value: string) => updateQuoteData({ monthlyEscrow: value });
    const setIsMidFicoEstimateMode = (value: boolean) => updateQuoteData({ isMidFicoEstimateMode: value });
    const setEstimatedFicoValue = (value: string) => updateQuoteData({ estimatedFicoValue: value });
    const setIsLtvEstimateMode = (value: boolean) => updateQuoteData({ isLtvEstimateMode: value });
    const setEstimatedLtvValue = (value: string) => updateQuoteData({ estimatedLtvValue: value });
    const setIsLenderCreditMode = (value: boolean) => updateQuoteData({ isLenderCreditMode: value });
    const setSelectedLender = (value: string) => updateQuoteData({ selectedLender: value });
    const setLenderCreditAmount = (value: string) => updateQuoteData({ lenderCreditAmount: value });
    const setIsTitleSellerCreditMode = (value: boolean) => updateQuoteData({ isTitleSellerCreditMode: value });
    const setSelectedTitle = (value: string) => updateQuoteData({ selectedTitle: value });
    const setTitleSellerCreditAmount = (value: string) => updateQuoteData({ titleSellerCreditAmount: value });
    const setIsProcessingMode = (value: boolean) => updateQuoteData({ isProcessingMode: value });
    const setUnderwriting = (value: string) => updateQuoteData({ underwriting: value });

    // UI State (not persisted)
    const [showPinPopup, setShowPinPopup] = useState(false);
    const [showPagePopup, setShowPagePopup] = useState(false);
    const [isStickyNotesOpen, setIsStickyNotesOpen] = useState(false);
    const [showLibraryDialog, setShowLibraryDialog] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [isQuoteCardsMinimized, setIsQuoteCardsMinimized] = useState(false);

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
            !!quoteData.selectedLoanCategory && quoteData.selectedLoanCategory !== '',  // 1. Loan Category
            (quoteData.isCustomTerm && !!quoteData.customTerm) || (!quoteData.isCustomTerm && !!quoteData.loanTerm && quoteData.loanTerm !== 'select'),  // 2. Loan Term
            true,  // 3. Loan Program (has default)
            !!quoteData.selectedPropertyUse && quoteData.selectedPropertyUse !== 'select',  // 4. Property Use
            !!quoteData.selectedPropertyType && quoteData.selectedPropertyType !== 'select',  // 5. Property Type
            !!quoteData.selectedState && quoteData.selectedState !== 'select',  // 6. State
            true,  // 7. Rate Buydown (has default)
            true,  // 8. Escrow Reserves (has default)
            true,  // 9. Monthly Escrow (has default)
            (quoteData.isMidFicoEstimateMode && !!quoteData.estimatedFicoValue) || (!quoteData.isMidFicoEstimateMode),  // 10. Mid FICO
            (quoteData.isLtvEstimateMode && !!quoteData.estimatedLtvValue) || (!quoteData.isLtvEstimateMode),  // 11. LTV Ratio
            (quoteData.isLenderCreditMode && !!quoteData.lenderCreditAmount) || (!quoteData.isLenderCreditMode && !!quoteData.selectedLender && quoteData.selectedLender !== 'select'),  // 12. Lender
            (quoteData.isTitleSellerCreditMode && !!quoteData.titleSellerCreditAmount) || (!quoteData.isTitleSellerCreditMode && !!quoteData.selectedTitle && quoteData.selectedTitle !== 'select'),  // 13. Title
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
        selectedLoanCategory: quoteData.selectedLoanCategory,
        setSelectedLoanCategory,
        isVAExempt: quoteData.isVAExempt,
        setIsVAExempt,
        isVAJumboExempt: quoteData.isVAJumboExempt,
        setIsVAJumboExempt,

        // Property
        selectedPropertyUse: quoteData.selectedPropertyUse,
        setSelectedPropertyUse,
        selectedPropertyType: quoteData.selectedPropertyType,
        setSelectedPropertyType,

        // Loan Term
        isCustomTerm: quoteData.isCustomTerm,
        setIsCustomTerm,
        loanTerm: quoteData.loanTerm,
        setLoanTerm,
        customTerm: quoteData.customTerm,
        setCustomTerm,

        // Loan Program
        selectedLoanProgram: quoteData.selectedLoanProgram,
        setSelectedLoanProgram,

        // Row 2
        selectedRateIds: quoteData.selectedRateIds,
        setSelectedRateIds,
        selectedState: quoteData.selectedState,
        setSelectedState,
        rateBuydown: quoteData.rateBuydown,
        setRateBuydown,
        escrowReserves: quoteData.escrowReserves,
        setEscrowReserves,
        monthlyEscrow: quoteData.monthlyEscrow,
        setMonthlyEscrow,

        // Lender
        isLenderCreditMode: quoteData.isLenderCreditMode,
        setIsLenderCreditMode,
        selectedLender: quoteData.selectedLender,
        setSelectedLender,
        lenderCreditAmount: quoteData.lenderCreditAmount,
        setLenderCreditAmount,

        // Title
        isTitleSellerCreditMode: quoteData.isTitleSellerCreditMode,
        setIsTitleSellerCreditMode,
        selectedTitle: quoteData.selectedTitle,
        setSelectedTitle,
        titleSellerCreditAmount: quoteData.titleSellerCreditAmount,
        setTitleSellerCreditAmount,

        // Mid FICO
        isMidFicoEstimateMode: quoteData.isMidFicoEstimateMode,
        setIsMidFicoEstimateMode,
        estimatedFicoValue: quoteData.estimatedFicoValue,
        setEstimatedFicoValue,

        // LTV Ratio
        isLtvEstimateMode: quoteData.isLtvEstimateMode,
        setIsLtvEstimateMode,
        estimatedLtvValue: quoteData.estimatedLtvValue,
        setEstimatedLtvValue,

        // Underwriting
        isProcessingMode: quoteData.isProcessingMode,
        setIsProcessingMode,
        underwriting: quoteData.underwriting,
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
