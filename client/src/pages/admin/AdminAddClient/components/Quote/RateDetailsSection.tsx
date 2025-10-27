import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ExistingLoanCard from './RateDetailsSection/components/ExistingLoanCard';
import RateBuyDownCard from './RateDetailsSection/components/RateBuyDownCard';
import PayOffInterestCard from './RateDetailsSection/components/PayOffInterestCard';
import LoanAmountPaymentCard from './RateDetailsSection/components/LoanAmountPaymentCard';
import EscrowInfoDialog from './RateDetailsSection/components/EscrowInfoDialog';
import EstimatedNewLoanAmountDialog from './RateDetailsSection/components/EstimatedNewLoanAmountDialog';
import NewMonthlyPaymentDialog from './RateDetailsSection/components/NewMonthlyPaymentDialog';
import ExistingMonthlyPaymentsDialog from './RateDetailsSection/components/ExistingMonthlyPaymentsDialog';
import VAFundingFeeCalculatorDialog from './RateDetailsSection/components/VAFundingFeeCalculatorDialog';
import CustomizeClosingCostsDialog from './RateDetailsSection/components/CustomizeClosingCostsDialog';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';

interface RateDetailsSectionProps {
    selectedRateIds: number[];
    selectedLoanCategory: string;
    rateBuydown: string;
    escrowReserves?: string;
    monthlyEscrow?: string;
    isVAExempt?: boolean;
    isVAJumboExempt?: boolean;
}

export interface RateDetailsSectionRef {
    getQuoteData: () => Partial<QuoteData['quotes']>;
}

export interface QuoteData {
    quotes: {
        // Top-level 15 quote fields (will be populated by QuoteTab)
        loanCategory?: string;
        loanTerm?: string;
        loanProgram?: string;
        propertyUse?: string;
        propertyType?: string;
        selectedState?: string;
        rateBuydown?: string;
        escrowReserves?: string;
        monthlyEscrow?: string;
        midFico?: string;
        ltvRatio?: string;
        lender?: string;
        lenderCredit?: string;
        title?: string;
        titleSellerCredit?: string;
        underwriting?: string;

        // New Monthly Payment dialog fields
        monthlyInsurance?: string;
        monthlyPropertyTax?: string;
        newLoanAmountMip?: string;
        monthlyFhaMip?: string;

        // Existing Monthly Payments dialog fields (Total Monthly Savings)
        existingMortgagePayment?: string;
        monthlyPaymentDebtsPayOff?: string;
        monthlyPaymentOtherDebts?: string;

        // Nested rates object
        rates: {
            [key: string]: {
                loanProgram: string;
                rate: string;
                existingLoanBalance?: string;
                cashOutAmount?: string;
                rateBuyDown?: string;
                vaFundingFee?: string;
                fhaUpfrontMip?: string;
                thirdPartyServices?: {
                    appraisalInspection?: string;
                    underwritingServices?: string;
                    processingServices?: string;
                    creditReportServices?: string;
                    titleEscrowServices?: string;
                    stateTaxRecording?: string;
                };
                payOffInterest?: string;
                newEscrowReserves?: string;
                propertyInsurance?: string;
                propertyTax?: string;
                statementEscrowBalance?: string;
                newEstLoanAmount?: string;
                newMonthlyPayment?: string;
                totalMonthlySavings?: string;
            };
        };
    };
}

const RateDetailsSection = forwardRef<RateDetailsSectionRef, RateDetailsSectionProps>((
    {
        selectedRateIds,
        selectedLoanCategory,
        rateBuydown,
        escrowReserves = 'escrow-not-included',
        monthlyEscrow = 'select',
        isVAExempt = false,
        isVAJumboExempt = false
    },
    ref
) => {
    // Get quote data from Zustand store
    const quoteData = useAdminAddClientStore(state => state.quoteData);
    const updateQuoteData = useAdminAddClientStore(state => state.updateQuoteData);
    const thirdPartyServiceCategories = useAdminAddClientStore(state => state.thirdPartyServiceCategories);
    const setThirdPartyServiceCategories = useAdminAddClientStore(state => state.setThirdPartyServiceCategories);

    // Local UI state (not persisted)
    const [showLoanProgramControls, setShowLoanProgramControls] = useState(false);
    const loanProgramTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [editingRateIndex, setEditingRateIndex] = useState<number | null>(null);
    const [isEscrowInfoOpen, setIsEscrowInfoOpen] = useState(false);
    const [isEstLoanAmountInfoOpen, setIsEstLoanAmountInfoOpen] = useState(false);
    const [isNewPaymentInfoOpen, setIsNewPaymentInfoOpen] = useState(false);
    const [isMonthlySavingsInfoOpen, setIsMonthlySavingsInfoOpen] = useState(false);
    const [showVAFundingFeeDialog, setShowVAFundingFeeDialog] = useState(false);
    const [showCustomizeClosingCostsDialog, setShowCustomizeClosingCostsDialog] = useState(false);

    const fhaUpfrontMipValue = '0';

    // Auto-calculate Total Monthly Escrow
    const calculatedTotalMonthlyEscrow =
        parseInt(quoteData.propertyInsurance || '0', 10) + parseInt(quoteData.propertyTax || '0', 10);

    // Auto-calculate Total Monthly Escrow for New Payment dialog
    const calculatedNewPaymentEscrow =
        parseInt(quoteData.monthlyInsurance || '0', 10) + parseInt(quoteData.monthlyPropertyTax || '0', 10);

    // Check if loan is FHA
    const isFHALoan = selectedLoanCategory?.startsWith('FHA - ');

    // Auto-calculate Total Existing Monthly Payments
    const calculatedTotalExistingPayments =
        parseInt(quoteData.existingMortgagePayment || '0', 10) +
        parseInt(quoteData.monthlyPaymentDebtsPayOff || '0', 10) +
        parseInt(quoteData.monthlyPaymentOtherDebts || '0', 10);

    // Sync thirdPartyServiceValues['s1'] to vaFundingFeeValues
    useEffect(() => {
        if (quoteData.thirdPartyServiceValues['s1']) {
            updateQuoteData({ vaFundingFeeValues: quoteData.thirdPartyServiceValues['s1'] });
        }
    }, [quoteData.thirdPartyServiceValues, updateQuoteData]);

    if (selectedRateIds.length === 0) return null;

    const columnWidth = `${250 * (selectedRateIds.length + 1)}px`;
    const gridCols = `repeat(${selectedRateIds.length + 1}, minmax(0, 1fr))`;

    const showExistingLoanBalance =
        selectedLoanCategory !== 'Second Loan - HELOC' &&
        selectedLoanCategory !== 'Second Loan - Fixed Second' &&
        !selectedLoanCategory.includes('Purchase');

    const showCashOut = selectedLoanCategory.includes('Cash Out');

    // Expose getQuoteData method to parent components
    useImperativeHandle(ref, () => ({
        getQuoteData: (): Partial<QuoteData['quotes']> => {
            const rates: QuoteData['quotes']['rates'] = {};

            selectedRateIds.forEach((rateId, index) => {
                const rateKey = `rate${index + 1}`;

                rates[rateKey] = {
                    loanProgram: quoteData.quoteLoanProgram,
                    rate: quoteData.rateValues[rateId] || '',
                    existingLoanBalance: quoteData.existingLoanBalanceValues[rateId] || '',
                    cashOutAmount: quoteData.cashOutAmountValues[rateId] || '',
                    rateBuyDown: quoteData.rateBuyDownValues[rateId] || '',
                    vaFundingFee: quoteData.vaFundingFeeValues[rateId] || '',
                    fhaUpfrontMip: fhaUpfrontMipValue,
                    thirdPartyServices: {
                        underwritingServices: quoteData.thirdPartyServiceValues['s4']?.[rateId] || '',
                        processingServices: quoteData.thirdPartyServiceValues['s8']?.[rateId] || '',
                        creditReportServices: quoteData.thirdPartyServiceValues['s9']?.[rateId] || '',
                        titleEscrowServices: quoteData.thirdPartyServiceValues['s5']?.[rateId] || '',
                        stateTaxRecording: quoteData.thirdPartyServiceValues['s7']?.[rateId] || '',
                    },
                    payOffInterest: quoteData.payOffInterestValues[rateId] || '',
                    newEscrowReserves: calculatedTotalMonthlyEscrow > 0 ? calculatedTotalMonthlyEscrow.toString() : '',
                    propertyInsurance: quoteData.propertyInsurance || '',
                    propertyTax: quoteData.propertyTax || '',
                    statementEscrowBalance: quoteData.statementEscrowBalance || '',
                    newEstLoanAmount: quoteData.newEstLoanAmountValues[rateId] || '',
                    newMonthlyPayment: quoteData.newMonthlyPaymentValues[rateId] || '',
                    totalMonthlySavings: quoteData.totalMonthlySavingsValues[rateId] || '',
                };
            });

            return {
                // Top-level quote fields from New Monthly Payment dialog
                monthlyInsurance: quoteData.monthlyInsurance || '',
                monthlyPropertyTax: quoteData.monthlyPropertyTax || '',
                newLoanAmountMip: quoteData.newLoanAmountMip || '',
                monthlyFhaMip: quoteData.monthlyFhaMip || '',
                // Top-level quote fields from Existing Monthly Payments dialog
                existingMortgagePayment: quoteData.existingMortgagePayment || '',
                monthlyPaymentDebtsPayOff: quoteData.monthlyPaymentDebtsPayOff || '',
                monthlyPaymentOtherDebts: quoteData.monthlyPaymentOtherDebts || '',
                // Rates object
                rates
            };
        }
    }));

    return (
        <div id="quote-printable-content">
            {/* Rate Circles with Loan Program */}
            <div className="animate-roll-down px-4" style={{ marginTop: '64px', width: columnWidth, maxWidth: '100%' }}>
                <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
                    {/* Loan Program Textarea */}
                    <div className="relative flex items-center justify-center">
                        <div className="w-full">
                            <textarea
                                ref={loanProgramTextareaRef}
                                placeholder="Loan Type"
                                value={quoteData.quoteLoanProgram}
                                onChange={(e) => updateQuoteData({ quoteLoanProgram: e.target.value })}
                                onFocus={() => setShowLoanProgramControls(true)}
                                onBlur={() => setTimeout(() => setShowLoanProgramControls(false), 200)}
                                rows={2}
                                className={`bg-transparent border-0 ${quoteData.loanProgramFontSize} ${quoteData.loanProgramColor} font-semibold text-center focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40 resize-none w-full`}
                                data-testid="input-quote-loan-program"
                            />

                            {/* Font Controls */}
                            {showLoanProgramControls && (
                                <div
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border border-border rounded-md shadow-lg p-3 z-50 flex gap-4"
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-xs text-muted-foreground">Font Size</Label>
                                        <Select
                                            value={quoteData.loanProgramFontSize}
                                            onValueChange={(value) => {
                                                updateQuoteData({ loanProgramFontSize: value });
                                                setTimeout(() => loanProgramTextareaRef.current?.focus(), 0);
                                            }}
                                        >
                                            <SelectTrigger className="w-32 h-8" data-testid="select-loan-program-font-size">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text-xl">Small</SelectItem>
                                                <SelectItem value="text-2xl">Medium</SelectItem>
                                                <SelectItem value="text-3xl">Large</SelectItem>
                                                <SelectItem value="text-4xl">X-Large</SelectItem>
                                                <SelectItem value="text-5xl">XX-Large</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Label className="text-xs text-muted-foreground">Font Color</Label>
                                        <Select
                                            value={quoteData.loanProgramColor}
                                            onValueChange={(value) => {
                                                updateQuoteData({ loanProgramColor: value });
                                                setTimeout(() => loanProgramTextareaRef.current?.focus(), 0);
                                            }}
                                        >
                                            <SelectTrigger className="w-32 h-8" data-testid="select-loan-program-color">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text-foreground">Default</SelectItem>
                                                <SelectItem value="text-primary">Primary</SelectItem>
                                                <SelectItem value="text-blue-600">Blue</SelectItem>
                                                <SelectItem value="text-green-600">Green</SelectItem>
                                                <SelectItem value="text-red-600">Red</SelectItem>
                                                <SelectItem value="text-purple-600">Purple</SelectItem>
                                                <SelectItem value="text-orange-600">Orange</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rate Circles */}
                    {selectedRateIds.map((rateId) => (
                        <div key={rateId} className="flex justify-center items-center">
                            {editingRateIndex === rateId ? (
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={quoteData.rateValues[rateId]}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^\d.]/g, '');
                                            const newValues = [...quoteData.rateValues];
                                            newValues[rateId] = value;
                                            updateQuoteData({ rateValues: newValues });
                                        }}
                                        onBlur={() => setEditingRateIndex(null)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setEditingRateIndex(null);
                                            }
                                        }}
                                        placeholder="0.00"
                                        autoFocus
                                        className="w-[86px] h-[86px] text-center text-xl font-semibold rounded-full border-4 border-blue-500 bg-white focus:ring-2 focus:ring-blue-300"
                                        data-testid={`input-rate-${rateId}`}
                                    />
                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                                        %
                                    </span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setEditingRateIndex(rateId)}
                                    className="w-[86px] h-[86px] rounded-full transition-colors duration-200 flex items-center justify-center text-white font-semibold text-lg shadow-lg hover:shadow-xl border-2"
                                    style={{
                                        backgroundColor: '#1a3373',
                                        borderColor: '#0d1a3d'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#0d1a3d';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1a3373';
                                    }}
                                    data-testid={`button-rate-circle-${rateId}`}
                                >
                                    {quoteData.rateValues[rateId] ? `${quoteData.rateValues[rateId]}%` : '%'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Existing Loan Balance Card */}
            {showExistingLoanBalance && (
                <ExistingLoanCard
                    selectedRateIds={selectedRateIds}
                    existingLoanBalanceValues={quoteData.existingLoanBalanceValues}
                    setExistingLoanBalanceValues={(values) => updateQuoteData({ existingLoanBalanceValues: values })}
                    isExistingLoanBalanceSameMode={quoteData.isExistingLoanBalanceSameMode}
                    setIsExistingLoanBalanceSameMode={(mode) => updateQuoteData({ isExistingLoanBalanceSameMode: mode })}
                    cashOutAmountValues={quoteData.cashOutAmountValues}
                    setCashOutAmountValues={(values) => updateQuoteData({ cashOutAmountValues: values })}
                    isCashOutSameMode={quoteData.isCashOutSameMode}
                    setIsCashOutSameMode={(mode) => updateQuoteData({ isCashOutSameMode: mode })}
                    showCashOut={showCashOut}
                    columnWidth={columnWidth}
                    gridCols={gridCols}
                />
            )}

            {/* Rate Buy Down Card */}
            {rateBuydown !== 'no' && (
                <RateBuyDownCard
                    selectedRateIds={selectedRateIds}
                    selectedLoanCategory={selectedLoanCategory}
                    rateBuyDownValues={quoteData.rateBuyDownValues}
                    setRateBuyDownValues={(values) => updateQuoteData({ rateBuyDownValues: values })}
                    vaFundingFeeValues={quoteData.vaFundingFeeValues}
                    fhaUpfrontMipValue={fhaUpfrontMipValue}
                    thirdPartyServiceValues={quoteData.thirdPartyServiceValues}
                    setThirdPartyServiceValues={(values) => updateQuoteData({ thirdPartyServiceValues: values })}
                    categorySameModes={quoteData.categorySameModes}
                    setCategorySameModes={(modes) => updateQuoteData({ categorySameModes: modes })}
                    currentThirdPartyServices={thirdPartyServiceCategories}
                    columnWidth={columnWidth}
                    gridCols={gridCols}
                    onVAFundingFeeClick={() => setShowVAFundingFeeDialog(true)}
                    onCustomizeClosingCostsClick={() => setShowCustomizeClosingCostsDialog(true)}
                />
            )}

            {/* Pay Off Interest & New Escrow Reserves Card */}
            <PayOffInterestCard
                selectedRateIds={selectedRateIds}
                payOffInterestValues={quoteData.payOffInterestValues}
                setPayOffInterestValues={(values) => updateQuoteData({ payOffInterestValues: values })}
                setThirdPartyServiceValues={(values) => updateQuoteData({ thirdPartyServiceValues: values })}
                escrowReserves={escrowReserves}
                monthlyEscrow={monthlyEscrow}
                calculatedTotalMonthlyEscrow={calculatedTotalMonthlyEscrow}
                columnWidth={columnWidth}
                gridCols={gridCols}
                onEscrowInfoClick={() => setIsEscrowInfoOpen(true)}
            />

            {/* New Est. Loan Amount & New Monthly Payment Card */}
            <LoanAmountPaymentCard
                selectedRateIds={selectedRateIds}
                newEstLoanAmountValues={quoteData.newEstLoanAmountValues}
                setNewEstLoanAmountValues={(values) => updateQuoteData({ newEstLoanAmountValues: values })}
                newMonthlyPaymentValues={quoteData.newMonthlyPaymentValues}
                setNewMonthlyPaymentValues={(values) => updateQuoteData({ newMonthlyPaymentValues: values })}
                totalMonthlySavingsValues={quoteData.totalMonthlySavingsValues}
                setTotalMonthlySavingsValues={(values) => updateQuoteData({ totalMonthlySavingsValues: values })}
                isMonthlyPaymentRowExpanded={quoteData.isMonthlyPaymentRowExpanded}
                setIsMonthlyPaymentRowExpanded={(expanded) => updateQuoteData({ isMonthlyPaymentRowExpanded: expanded })}
                isSavingsRowExpanded={quoteData.isSavingsRowExpanded}
                setIsSavingsRowExpanded={(expanded) => updateQuoteData({ isSavingsRowExpanded: expanded })}
                columnWidth={columnWidth}
                gridCols={gridCols}
                onEstLoanAmountInfoClick={() => setIsEstLoanAmountInfoOpen(true)}
                onNewPaymentInfoClick={() => setIsNewPaymentInfoOpen(true)}
                onMonthlySavingsInfoClick={() => setIsMonthlySavingsInfoOpen(true)}
            />

            {/* Escrow Information Dialog */}
            <EscrowInfoDialog
                isOpen={isEscrowInfoOpen}
                onClose={() => setIsEscrowInfoOpen(false)}
                propertyInsurance={quoteData.propertyInsurance}
                onPropertyInsuranceChange={(value) => updateQuoteData({ propertyInsurance: value })}
                propertyTax={quoteData.propertyTax}
                onPropertyTaxChange={(value) => updateQuoteData({ propertyTax: value })}
                statementEscrowBalance={quoteData.statementEscrowBalance}
                onStatementEscrowBalanceChange={(value) => updateQuoteData({ statementEscrowBalance: value })}
                calculatedTotal={calculatedTotalMonthlyEscrow}
            />

            {/* Estimated New Loan Amount Dialog */}
            <EstimatedNewLoanAmountDialog
                isOpen={isEstLoanAmountInfoOpen}
                onClose={() => setIsEstLoanAmountInfoOpen(false)}
            />

            {/* New Monthly Payment Dialog */}
            <NewMonthlyPaymentDialog
                isOpen={isNewPaymentInfoOpen}
                onClose={() => setIsNewPaymentInfoOpen(false)}
                monthlyInsurance={quoteData.monthlyInsurance}
                onMonthlyInsuranceChange={(value) => updateQuoteData({ monthlyInsurance: value })}
                monthlyPropertyTax={quoteData.monthlyPropertyTax}
                onMonthlyPropertyTaxChange={(value) => updateQuoteData({ monthlyPropertyTax: value })}
                newLoanAmountMip={quoteData.newLoanAmountMip}
                onNewLoanAmountMipChange={(value) => updateQuoteData({ newLoanAmountMip: value })}
                monthlyFhaMip={quoteData.monthlyFhaMip}
                onMonthlyFhaMipChange={(value) => updateQuoteData({ monthlyFhaMip: value })}
                calculatedEscrow={calculatedNewPaymentEscrow}
                escrowReserves={escrowReserves}
                isFHALoan={isFHALoan}
            />

            {/* Existing Monthly Payments Dialog */}
            <ExistingMonthlyPaymentsDialog
                isOpen={isMonthlySavingsInfoOpen}
                onClose={() => setIsMonthlySavingsInfoOpen(false)}
                existingMortgagePayment={quoteData.existingMortgagePayment}
                onExistingMortgagePaymentChange={(value) => updateQuoteData({ existingMortgagePayment: value })}
                monthlyPaymentDebtsPayOff={quoteData.monthlyPaymentDebtsPayOff}
                onMonthlyPaymentDebtsPayOffChange={(value) => updateQuoteData({ monthlyPaymentDebtsPayOff: value })}
                monthlyPaymentOtherDebts={quoteData.monthlyPaymentOtherDebts}
                onMonthlyPaymentOtherDebtsChange={(value) => updateQuoteData({ monthlyPaymentOtherDebts: value })}
                calculatedTotal={calculatedTotalExistingPayments}
            />

            {/* VA Funding Fee Calculator Dialog */}
            <VAFundingFeeCalculatorDialog
                isOpen={showVAFundingFeeDialog}
                onClose={() => setShowVAFundingFeeDialog(false)}
                selectedLoanCategory={selectedLoanCategory}
                selectedRateIds={selectedRateIds}
                isVAExempt={isVAExempt}
                isVAJumboExempt={isVAJumboExempt}
                vaFirstTimeCashOut={quoteData.vaFirstTimeCashOut}
                onVaFirstTimeCashOutChange={(value) => updateQuoteData({ vaFirstTimeCashOut: value })}
                vaSubsequentCashOut={quoteData.vaSubsequentCashOut}
                onVaSubsequentCashOutChange={(value) => updateQuoteData({ vaSubsequentCashOut: value })}
                vaRateTerm={quoteData.vaRateTerm}
                onVaRateTermChange={(value) => updateQuoteData({ vaRateTerm: value })}
                vaIRRRL={quoteData.vaIRRRL}
                onVaIRRRLChange={(value) => updateQuoteData({ vaIRRRL: value })}
                isVACalculated={quoteData.isVACalculated}
                onIsVACalculatedChange={(value) => updateQuoteData({ isVACalculated: value })}
                selectedVARow={quoteData.selectedVARow}
                onSelectedVARowChange={(value) => updateQuoteData({ selectedVARow: value })}
                newEstLoanAmount={parseFloat(quoteData.newEstLoanAmountValues[selectedRateIds[0]]?.replace(/[^\d.]/g, '') || '0')}
                vaFundingFeeValue={parseFloat(quoteData.thirdPartyServiceValues['s1']?.[selectedRateIds[0]]?.replace(/[^\d.]/g, '') || '0')}
                onApplyToRate={(value) => {
                    // Apply selected VA category value to all selected rates
                    const newS1Values = [...(quoteData.thirdPartyServiceValues['s1'] || Array(4).fill(''))];
                    selectedRateIds.forEach(rateId => {
                        newS1Values[rateId] = value;
                    });
                    updateQuoteData({
                        thirdPartyServiceValues: {
                            ...quoteData.thirdPartyServiceValues,
                            's1': newS1Values
                        }
                    });
                }}
                onClearAllValues={() => {
                    // Clear VA funding fee values in the table for selected rates
                    const newS1Values = [...(quoteData.thirdPartyServiceValues['s1'] || Array(4).fill(''))];
                    selectedRateIds.forEach(rateId => {
                        newS1Values[rateId] = '0.00';
                    });
                    updateQuoteData({
                        thirdPartyServiceValues: {
                            ...quoteData.thirdPartyServiceValues,
                            's1': newS1Values
                        }
                    });
                }}
            />

            {/* Customize Closing Costs Dialog */}
            <CustomizeClosingCostsDialog
                isOpen={showCustomizeClosingCostsDialog}
                onClose={() => setShowCustomizeClosingCostsDialog(false)}
                thirdPartyServices={thirdPartyServiceCategories}
                thirdPartyServiceValues={quoteData.thirdPartyServiceValues}
                onThirdPartyServiceValuesChange={(values) => updateQuoteData({ thirdPartyServiceValues: values })}
                selectedRateIds={selectedRateIds}
                selectedLoanCategory={selectedLoanCategory}
                onCategoriesChange={setThirdPartyServiceCategories}
            />
        </div>
    );
});

RateDetailsSection.displayName = 'RateDetailsSection';

export default RateDetailsSection;
