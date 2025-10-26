import LoanCategorySelect from './LoanCategorySelect';
import LoanTermSelect from './LoanTermSelect';
import LoanProgramSelect from './LoanProgramSelect';
import ManageableSelect from '../ManageableSelect';
import { BUILT_IN_PROPERTY_USES, BUILT_IN_PROPERTY_TYPES } from '../../data/formOptions';

interface QuoteFormRow1Props {
    // Loan Category
    selectedLoanCategory: string;
    onLoanCategoryChange: (value: string) => void;
    isVAExempt: boolean;
    onVAExemptChange: (value: boolean) => void;
    isVAJumboExempt: boolean;
    onVAJumboExemptChange: (value: boolean) => void;

    // Loan Term
    isCustomTerm: boolean;
    onCustomTermModeChange: (value: boolean) => void;
    loanTerm: string;
    onLoanTermChange: (value: string) => void;
    customTerm: string;
    onCustomTermValueChange: (value: string) => void;

    // Loan Program
    selectedLoanProgram: string;
    onLoanProgramChange: (value: string) => void;

    // Property Use
    selectedPropertyUse: string;
    onPropertyUseChange: (value: string) => void;

    // Property Type
    selectedPropertyType: string;
    onPropertyTypeChange: (value: string) => void;
}

const QuoteFormRow1 = ({
    selectedLoanCategory,
    onLoanCategoryChange,
    isVAExempt,
    onVAExemptChange,
    isVAJumboExempt,
    onVAJumboExemptChange,
    isCustomTerm,
    onCustomTermModeChange,
    loanTerm,
    onLoanTermChange,
    customTerm,
    onCustomTermValueChange,
    selectedLoanProgram,
    onLoanProgramChange,
    selectedPropertyUse,
    onPropertyUseChange,
    selectedPropertyType,
    onPropertyTypeChange,
}: QuoteFormRow1Props) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <LoanCategorySelect
                selectedCategory={selectedLoanCategory}
                onCategoryChange={onLoanCategoryChange}
                isVAExempt={isVAExempt}
                isVAJumboExempt={isVAJumboExempt}
                onVAExemptChange={onVAExemptChange}
                onVAJumboExemptChange={onVAJumboExemptChange}
            />

            <LoanTermSelect
                isCustomMode={isCustomTerm}
                onCustomModeChange={onCustomTermModeChange}
                selectValue={loanTerm}
                onSelectChange={onLoanTermChange}
                inputValue={customTerm}
                onInputChange={onCustomTermValueChange}
                className="space-y-2"
            />

            <LoanProgramSelect
                value={selectedLoanProgram}
                onValueChange={onLoanProgramChange}
                className="space-y-2"
            />

            <ManageableSelect
                label="Property Use"
                value={selectedPropertyUse}
                onValueChange={onPropertyUseChange}
                builtInOptions={BUILT_IN_PROPERTY_USES}
                optionType="propertyUse"
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
                onValueChange={onPropertyTypeChange}
                builtInOptions={BUILT_IN_PROPERTY_TYPES}
                optionType="propertyType"
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
    );
};

export default QuoteFormRow1;
