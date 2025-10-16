import CalculatedEstimatedInput from './CalculatedEstimatedInput';
import LenderTitleSelect from './LenderTitleSelect';
import UnderwritingProcessingSelect from './UnderwritingProcessingSelect';
import { BUILT_IN_LENDERS, BUILT_IN_TITLES } from '../../data/formOptions';

interface QuoteFormRow3Props {
    // Mid FICO
    isMidFicoEstimateMode: boolean;
    onMidFicoEstimateModeChange: (value: boolean) => void;
    estimatedFicoValue: string;
    onEstimatedFicoValueChange: (value: string) => void;

    // LTV Ratio
    isLtvEstimateMode: boolean;
    onLtvEstimateModeChange: (value: boolean) => void;
    estimatedLtvValue: string;
    onEstimatedLtvValueChange: (value: string) => void;

    // Lender
    isLenderCreditMode: boolean;
    onLenderCreditModeChange: (value: boolean) => void;
    selectedLender: string;
    onSelectedLenderChange: (value: string) => void;
    lenderCreditAmount: string;
    onLenderCreditAmountChange: (value: string) => void;

    // Title
    isTitleSellerCreditMode: boolean;
    onTitleSellerCreditModeChange: (value: boolean) => void;
    selectedTitle: string;
    onSelectedTitleChange: (value: string) => void;
    titleSellerCreditAmount: string;
    onTitleSellerCreditAmountChange: (value: string) => void;

    // Underwriting
    isProcessingMode: boolean;
    onProcessingModeChange: (value: boolean) => void;
    underwriting: string;
    onUnderwritingChange: (value: string) => void;
}

const QuoteFormRow3 = ({
    isMidFicoEstimateMode,
    onMidFicoEstimateModeChange,
    estimatedFicoValue,
    onEstimatedFicoValueChange,
    isLtvEstimateMode,
    onLtvEstimateModeChange,
    estimatedLtvValue,
    onEstimatedLtvValueChange,
    isLenderCreditMode,
    onLenderCreditModeChange,
    selectedLender,
    onSelectedLenderChange,
    lenderCreditAmount,
    onLenderCreditAmountChange,
    isTitleSellerCreditMode,
    onTitleSellerCreditModeChange,
    selectedTitle,
    onSelectedTitleChange,
    titleSellerCreditAmount,
    onTitleSellerCreditAmountChange,
    isProcessingMode,
    onProcessingModeChange,
    underwriting,
    onUnderwritingChange,
}: QuoteFormRow3Props) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <CalculatedEstimatedInput
                label="Mid FICO"
                estimatedLabel="Estimated FICO"
                isEstimateMode={isMidFicoEstimateMode}
                onEstimateModeChange={onMidFicoEstimateModeChange}
                estimatedValue={estimatedFicoValue}
                onEstimatedValueChange={onEstimatedFicoValueChange}
                calculatedValue=""
                maxLength={3}
                testId="mid-fico"
                className="space-y-2"
            />

            <CalculatedEstimatedInput
                label="LTV Ratio"
                estimatedLabel="Estimated LTV"
                isEstimateMode={isLtvEstimateMode}
                onEstimateModeChange={onLtvEstimateModeChange}
                estimatedValue={estimatedLtvValue}
                onEstimatedValueChange={onEstimatedLtvValueChange}
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
                onToggleChange={onLenderCreditModeChange}
                selectValue={selectedLender}
                onSelectChange={onSelectedLenderChange}
                builtInOptions={BUILT_IN_LENDERS}
                inputValue={lenderCreditAmount}
                onInputChange={onLenderCreditAmountChange}
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
                onToggleChange={onTitleSellerCreditModeChange}
                selectValue={selectedTitle}
                onSelectChange={onSelectedTitleChange}
                builtInOptions={BUILT_IN_TITLES}
                inputValue={titleSellerCreditAmount}
                onInputChange={onTitleSellerCreditAmountChange}
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
                onProcessingModeChange={onProcessingModeChange}
                value={underwriting}
                onValueChange={onUnderwritingChange}
                testId="select-underwriting"
                className="space-y-2"
            />
        </div>
    );
};

export default QuoteFormRow3;
