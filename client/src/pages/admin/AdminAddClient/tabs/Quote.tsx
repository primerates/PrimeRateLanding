import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ActionButtons from '../components/ActionButtons';
import LoanCategorySelect from '../components/Quote/LoanCategorySelect';
import LoanTermSelect from '../components/Quote/LoanTermSelect';
import LoanProgramSelect from '../components/Quote/LoanProgramSelect';
import LenderTitleSelect from '../components/Quote/LenderTitleSelect';
import CalculatedEstimatedInput from '../components/Quote/CalculatedEstimatedInput';
import UnderwritingProcessingSelect from '../components/Quote/UnderwritingProcessingSelect';
import QuoteRateSelect from '../components/Quote/QuoteRateSelect';
import ManageableSelect from '../components/ManageableSelect';
import FormSelect from '../components/FormSelect';
import {
    BUILT_IN_PROPERTY_USES,
    BUILT_IN_PROPERTY_TYPES,
    US_STATES,
    RATE_BUYDOWN_OPTIONS,
    ESCROW_RESERVES_OPTIONS,
    MONTHLY_ESCROW_OPTIONS,
    BUILT_IN_LENDERS,
    BUILT_IN_TITLES
} from '../data/formOptions';

const QuoteTab = () => {
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

    return (
        <Card className="mb-6 transition-all duration-700 animate-roll-down">
            <ActionButtons
                showCalculator={showCalculator}
                isCardsMinimized={isQuoteCardsMinimized}
                onPinClick={() => setShowPinPopup(true)}
                onPageClick={() => setShowPagePopup(true)}
                onStickyNotesClick={() => setIsStickyNotesOpen(true)}
                onGuidelinesClick={() => setShowLibraryDialog(true)}
                onCalculatorClick={() => setShowCalculator(!showCalculator)}
                onPrintClick={() => window.print()}
                onToggleMinimize={() => setIsQuoteCardsMinimized(!isQuoteCardsMinimized)}
            />

            {/* Completion Bar */}
            {!isQuoteCardsMinimized && (
                <div className="px-4 pt-3 pb-2">
                    <div className="relative flex gap-0 h-px">
                        {Array.from({ length: 15 }).map((_, index) => (
                            <div
                                key={index}
                                className={`flex-1 transition-colors duration-300`}
                                style={{ backgroundColor: index < 6 ? '#1a3373' : '#D1D5DB' }}
                            />
                        ))}
                        {6 > 0 && 6 < 15 && (
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300"
                                style={{
                                    backgroundColor: '#1a3373',
                                    left: `calc(${(6 / 15) * 100}% - 4px)`
                                }}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Quote Content */}
            {!isQuoteCardsMinimized && (
                <CardContent className="pt-6 space-y-6">
                    {/* Row 1: 5 Fields with titles above */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <LoanCategorySelect
                            selectedCategory={selectedLoanCategory}
                            onCategoryChange={setSelectedLoanCategory}
                            isVAExempt={isVAExempt}
                            isVAJumboExempt={isVAJumboExempt}
                            onVAExemptChange={setIsVAExempt}
                            onVAJumboExemptChange={setIsVAJumboExempt}
                        />

                        <LoanTermSelect
                            isCustomMode={isCustomTerm}
                            onCustomModeChange={setIsCustomTerm}
                            selectValue={loanTerm}
                            onSelectChange={setLoanTerm}
                            inputValue={customTerm}
                            onInputChange={setCustomTerm}
                            className="space-y-2"
                        />

                        <LoanProgramSelect
                            value={selectedLoanProgram}
                            onValueChange={setSelectedLoanProgram}
                            className="space-y-2"
                        />

                        <ManageableSelect
                            label="Property Use"
                            value={selectedPropertyUse}
                            onValueChange={setSelectedPropertyUse}
                            builtInOptions={BUILT_IN_PROPERTY_USES}
                            testId="select-property"
                            addDialogTitle="Add New Property Use"
                            removeDialogTitle="Remove Property Use"
                            addDialogDescription="Enter a name for the new property use option."
                            removeDialogDescription="Select a built-in property use to remove from the options."
                            inputLabel="Property Use Name"
                            inputPlaceholder="Enter property use name"
                            selectLabel="Property Use to Remove"
                            className="space-y-2"
                        />

                        <ManageableSelect
                            label="Property Type"
                            value={selectedPropertyType}
                            onValueChange={setSelectedPropertyType}
                            builtInOptions={BUILT_IN_PROPERTY_TYPES}
                            testId="select-property-type"
                            addDialogTitle="Add New Property Type"
                            removeDialogTitle="Remove Property Type"
                            addDialogDescription="Enter a name for the new property type option."
                            removeDialogDescription="Select a built-in property type to remove from the options."
                            inputLabel="Property Type Name"
                            inputPlaceholder="Enter property type name"
                            selectLabel="Property Type to Remove"
                            className="space-y-2"
                        />
                    </div>

                    {/* Row 2: Quote, State, Rate Buydown, Escrow Reserves, Monthly Escrow */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <QuoteRateSelect
                            selectedRateIds={selectedRateIds}
                            onSelectedRateIdsChange={setSelectedRateIds}
                            isEnabled={isQuoteEnabled}
                            testId="button-quote-select"
                            className="space-y-2"
                        />

                        <FormSelect
                            label="State"
                            value={selectedState}
                            onValueChange={setSelectedState}
                            options={US_STATES}
                            placeholder="Select"
                            testId="select-state"
                            className="space-y-2"
                        />

                        <FormSelect
                            label="Rate Buydown"
                            value={rateBuydown}
                            onValueChange={setRateBuydown}
                            options={RATE_BUYDOWN_OPTIONS}
                            placeholder="Yes"
                            testId="select-rate-buydown"
                            className="space-y-2"
                        />

                        <FormSelect
                            label="Escrow Reserves"
                            value={escrowReserves}
                            onValueChange={setEscrowReserves}
                            options={ESCROW_RESERVES_OPTIONS}
                            placeholder="New Escrow Reserves"
                            testId="select-escrow-reserves"
                            className="space-y-2"
                        />

                        <FormSelect
                            label="Monthly Escrow"
                            value={monthlyEscrow}
                            onValueChange={setMonthlyEscrow}
                            options={MONTHLY_ESCROW_OPTIONS}
                            placeholder="Includes Tax & Insurance"
                            testId="select-monthly-escrow"
                            className="space-y-2"
                        />
                    </div>

                    {/* Row 3: Mid FICO, LTV Ratio, Lender, Title, Underwriting */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <CalculatedEstimatedInput
                            label="Mid FICO"
                            estimatedLabel="Estimated FICO"
                            isEstimateMode={isMidFicoEstimateMode}
                            onEstimateModeChange={setIsMidFicoEstimateMode}
                            estimatedValue={estimatedFicoValue}
                            onEstimatedValueChange={setEstimatedFicoValue}
                            calculatedValue=""
                            maxLength={3}
                            testId="mid-fico"
                            className="space-y-2"
                        />

                        <CalculatedEstimatedInput
                            label="LTV Ratio"
                            estimatedLabel="Estimated LTV"
                            isEstimateMode={isLtvEstimateMode}
                            onEstimateModeChange={setIsLtvEstimateMode}
                            estimatedValue={estimatedLtvValue}
                            onEstimatedValueChange={setEstimatedLtvValue}
                            calculatedValue=""
                            maxLength={3}
                            suffix="%"
                            testId="ltv-ratio"
                            className="space-y-2"
                        />

                        <LenderTitleSelect
                            label="Lender"
                            toggledLabel="Lender Credit"
                            isToggled={isLenderCreditMode}
                            onToggleChange={setIsLenderCreditMode}
                            selectValue={selectedLender}
                            onSelectChange={setSelectedLender}
                            builtInOptions={BUILT_IN_LENDERS}
                            inputValue={lenderCreditAmount}
                            onInputChange={setLenderCreditAmount}
                            addDialogTitle="Add New Lender"
                            removeDialogTitle="Remove Lender"
                            addDialogDescription="Enter a name for the new lender option."
                            removeDialogDescription="Select a lender to remove from the list."
                            inputLabel="Lender Name"
                            inputPlaceholder="Enter lender name"
                            selectLabel="Lender to Remove"
                            testId="select-lender"
                            className="space-y-2"
                        />

                        <LenderTitleSelect
                            label="Title"
                            toggledLabel="Seller Credit"
                            isToggled={isTitleSellerCreditMode}
                            onToggleChange={setIsTitleSellerCreditMode}
                            selectValue={selectedTitle}
                            onSelectChange={setSelectedTitle}
                            builtInOptions={BUILT_IN_TITLES}
                            inputValue={titleSellerCreditAmount}
                            onInputChange={setTitleSellerCreditAmount}
                            addDialogTitle="Add New Title Company"
                            removeDialogTitle="Remove Title Company"
                            addDialogDescription="Enter a name for the new title company option."
                            removeDialogDescription="Select a title company to remove from the list."
                            inputLabel="Title Company Name"
                            inputPlaceholder="Enter title company name"
                            selectLabel="Title Company to Remove"
                            testId="select-title"
                            className="space-y-2"
                        />

                        <UnderwritingProcessingSelect
                            isProcessingMode={isProcessingMode}
                            onProcessingModeChange={setIsProcessingMode}
                            value={underwriting}
                            onValueChange={setUnderwriting}
                            testId="select-underwriting"
                            className="space-y-2"
                        />
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default QuoteTab;