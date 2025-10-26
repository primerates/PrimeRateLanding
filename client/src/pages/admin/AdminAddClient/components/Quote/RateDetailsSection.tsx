import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
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

interface RateDetailsSectionProps {
    selectedRateIds: number[];
    selectedLoanCategory: string;
    rateBuydown: string;
    escrowReserves?: string;
    monthlyEscrow?: string;
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
        monthlyEscrow = 'select'
    },
    ref
) => {
    // Loan Program state
    const [quoteLoanProgram, setQuoteLoanProgram] = useState('');
    const [showLoanProgramControls, setShowLoanProgramControls] = useState(false);
    const [loanProgramFontSize, setLoanProgramFontSize] = useState('text-2xl');
    const [loanProgramColor, setLoanProgramColor] = useState('text-foreground');
    const loanProgramTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Rate values state
    const [rateValues, setRateValues] = useState<string[]>(Array(4).fill(''));
    const [editingRateIndex, setEditingRateIndex] = useState<number | null>(null);

    // Existing Loan Balance state
    const [existingLoanBalanceValues, setExistingLoanBalanceValues] = useState<string[]>(Array(4).fill(''));
    const [isExistingLoanBalanceSameMode, setIsExistingLoanBalanceSameMode] = useState(false);

    // Cash Out Amount state
    const [cashOutAmountValues, setCashOutAmountValues] = useState<string[]>(Array(4).fill(''));
    const [isCashOutSameMode, setIsCashOutSameMode] = useState(false);

    // Rate Buy Down state
    const [rateBuyDownValues, setRateBuyDownValues] = useState<string[]>(Array(4).fill(''));

    // VA Funding Fee / FHA MIP state
    const [vaFundingFeeValues] = useState<string[]>(Array(4).fill(''));
    const [fhaUpfrontMipValue] = useState('0');

    // Third Party Services state
    const [thirdPartyServiceValues, setThirdPartyServiceValues] = useState<{
        [serviceId: string]: string[];
    }>({
        's1': Array(4).fill(''), // VA Funding Fee
        's2': Array(4).fill(''), // Appraisal Inspection
        's4': Array(4).fill(''), // Underwriting Services
        's8': Array(4).fill(''), // Processing Services
        's9': Array(4).fill(''), // Credit Report Services
        's5': Array(4).fill(''), // Title & Escrow Services
        's6': Array(4).fill(''), // Pay Off Interest
        's7': Array(4).fill(''), // State Tax & Recording
    });

    const [categorySameModes, setCategorySameModes] = useState<{ [categoryId: string]: boolean }>({
        '1': false, // Third Party Services
    });

    // Define Third Party Services structure
    const currentThirdPartyServices = [
        {
            id: '1',
            categoryName: 'Third Party Services',
            services: [
                { id: 's1', serviceName: 'VA Funding Fee' },
                { id: 's2', serviceName: 'Appraisal Inspection' },
                { id: 's4', serviceName: 'Underwriting Services' },
                { id: 's8', serviceName: 'Processing Services' },
                { id: 's9', serviceName: 'Credit Report Services' },
                { id: 's5', serviceName: 'Title & Escrow Services' },
                { id: 's7', serviceName: 'State Tax & Recording' },
            ]
        }
    ];

    // Pay Off Interest state
    const [payOffInterestValues, setPayOffInterestValues] = useState<string[]>(Array(4).fill(''));

    // New Escrow Reserves state
    const [isEscrowInfoOpen, setIsEscrowInfoOpen] = useState(false);
    const [propertyInsurance, setPropertyInsurance] = useState('');
    const [propertyTax, setPropertyTax] = useState('');
    const [statementEscrowBalance, setStatementEscrowBalance] = useState('');

    // Auto-calculate Total Monthly Escrow
    const calculatedTotalMonthlyEscrow =
        parseInt(propertyInsurance || '0', 10) + parseInt(propertyTax || '0', 10);

    // State for Estimated New Loan Amount dialog
    const [isEstLoanAmountInfoOpen, setIsEstLoanAmountInfoOpen] = useState(false);

    // State for New Monthly Payment dialog
    const [isNewPaymentInfoOpen, setIsNewPaymentInfoOpen] = useState(false);
    const [monthlyInsurance, setMonthlyInsurance] = useState('');
    const [monthlyPropertyTax, setMonthlyPropertyTax] = useState('');
    const [newLoanAmountMip, setNewLoanAmountMip] = useState('');
    const [monthlyFhaMip, setMonthlyFhaMip] = useState('');

    // Auto-calculate Total Monthly Escrow for New Payment dialog
    const calculatedNewPaymentEscrow =
        parseInt(monthlyInsurance || '0', 10) + parseInt(monthlyPropertyTax || '0', 10);

    // Check if loan is FHA
    const isFHALoan = selectedLoanCategory?.startsWith('FHA - ');

    // State for Existing Monthly Payments dialog (Total Monthly Savings)
    const [isMonthlySavingsInfoOpen, setIsMonthlySavingsInfoOpen] = useState(false);
    const [existingMortgagePayment, setExistingMortgagePayment] = useState('');
    const [monthlyPaymentDebtsPayOff, setMonthlyPaymentDebtsPayOff] = useState('');
    const [monthlyPaymentOtherDebts, setMonthlyPaymentOtherDebts] = useState('');

    // Auto-calculate Total Existing Monthly Payments
    const calculatedTotalExistingPayments =
        parseInt(existingMortgagePayment || '0', 10) +
        parseInt(monthlyPaymentDebtsPayOff || '0', 10) +
        parseInt(monthlyPaymentOtherDebts || '0', 10);

    // New Est. Loan Amount & New Monthly Payment state
    const [newEstLoanAmountValues, setNewEstLoanAmountValues] = useState<string[]>(Array(4).fill(''));
    const [newMonthlyPaymentValues, setNewMonthlyPaymentValues] = useState<string[]>(Array(4).fill(''));

    // Total Monthly Savings state
    const [totalMonthlySavingsValues, setTotalMonthlySavingsValues] = useState<string[]>(Array(4).fill(''));

    // State for row collapse/expand in New Est. Loan Amount & New Monthly Payment card
    const [isMonthlyPaymentRowExpanded, setIsMonthlyPaymentRowExpanded] = useState(true);
    const [isSavingsRowExpanded, setIsSavingsRowExpanded] = useState(true);

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
                    loanProgram: quoteLoanProgram,
                    rate: rateValues[rateId] || '',
                    existingLoanBalance: existingLoanBalanceValues[rateId] || '',
                    cashOutAmount: cashOutAmountValues[rateId] || '',
                    rateBuyDown: rateBuyDownValues[rateId] || '',
                    vaFundingFee: vaFundingFeeValues[rateId] || '',
                    fhaUpfrontMip: fhaUpfrontMipValue,
                    thirdPartyServices: {
                        appraisalInspection: thirdPartyServiceValues['s2']?.[rateId] || '',
                        underwritingServices: thirdPartyServiceValues['s4']?.[rateId] || '',
                        processingServices: thirdPartyServiceValues['s8']?.[rateId] || '',
                        creditReportServices: thirdPartyServiceValues['s9']?.[rateId] || '',
                        titleEscrowServices: thirdPartyServiceValues['s5']?.[rateId] || '',
                        stateTaxRecording: thirdPartyServiceValues['s7']?.[rateId] || '',
                    },
                    payOffInterest: payOffInterestValues[rateId] || '',
                    newEscrowReserves: calculatedTotalMonthlyEscrow > 0 ? calculatedTotalMonthlyEscrow.toString() : '',
                    propertyInsurance: propertyInsurance || '',
                    propertyTax: propertyTax || '',
                    statementEscrowBalance: statementEscrowBalance || '',
                    newEstLoanAmount: newEstLoanAmountValues[rateId] || '',
                    newMonthlyPayment: newMonthlyPaymentValues[rateId] || '',
                    totalMonthlySavings: totalMonthlySavingsValues[rateId] || '',
                };
            });

            return {
                // Top-level quote fields from New Monthly Payment dialog
                monthlyInsurance: monthlyInsurance || '',
                monthlyPropertyTax: monthlyPropertyTax || '',
                newLoanAmountMip: newLoanAmountMip || '',
                monthlyFhaMip: monthlyFhaMip || '',
                // Top-level quote fields from Existing Monthly Payments dialog
                existingMortgagePayment: existingMortgagePayment || '',
                monthlyPaymentDebtsPayOff: monthlyPaymentDebtsPayOff || '',
                monthlyPaymentOtherDebts: monthlyPaymentOtherDebts || '',
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
                                value={quoteLoanProgram}
                                onChange={(e) => setQuoteLoanProgram(e.target.value)}
                                onFocus={() => setShowLoanProgramControls(true)}
                                onBlur={() => setTimeout(() => setShowLoanProgramControls(false), 200)}
                                rows={2}
                                className={`bg-transparent border-0 ${loanProgramFontSize} ${loanProgramColor} font-semibold text-center focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40 resize-none w-full`}
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
                                            value={loanProgramFontSize}
                                            onValueChange={(value) => {
                                                setLoanProgramFontSize(value);
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
                                            value={loanProgramColor}
                                            onValueChange={(value) => {
                                                setLoanProgramColor(value);
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
                                        value={rateValues[rateId]}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^\d.]/g, '');
                                            const newValues = [...rateValues];
                                            newValues[rateId] = value;
                                            setRateValues(newValues);
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
                                    {rateValues[rateId] ? `${rateValues[rateId]}%` : '%'}
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
                    existingLoanBalanceValues={existingLoanBalanceValues}
                    setExistingLoanBalanceValues={setExistingLoanBalanceValues}
                    isExistingLoanBalanceSameMode={isExistingLoanBalanceSameMode}
                    setIsExistingLoanBalanceSameMode={setIsExistingLoanBalanceSameMode}
                    cashOutAmountValues={cashOutAmountValues}
                    setCashOutAmountValues={setCashOutAmountValues}
                    isCashOutSameMode={isCashOutSameMode}
                    setIsCashOutSameMode={setIsCashOutSameMode}
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
                    rateBuyDownValues={rateBuyDownValues}
                    setRateBuyDownValues={setRateBuyDownValues}
                    vaFundingFeeValues={vaFundingFeeValues}
                    fhaUpfrontMipValue={fhaUpfrontMipValue}
                    thirdPartyServiceValues={thirdPartyServiceValues}
                    setThirdPartyServiceValues={setThirdPartyServiceValues}
                    categorySameModes={categorySameModes}
                    setCategorySameModes={setCategorySameModes}
                    currentThirdPartyServices={currentThirdPartyServices}
                    columnWidth={columnWidth}
                    gridCols={gridCols}
                />
            )}

            {/* Pay Off Interest & New Escrow Reserves Card */}
            <PayOffInterestCard
                selectedRateIds={selectedRateIds}
                payOffInterestValues={payOffInterestValues}
                setPayOffInterestValues={setPayOffInterestValues}
                setThirdPartyServiceValues={setThirdPartyServiceValues}
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
                newEstLoanAmountValues={newEstLoanAmountValues}
                setNewEstLoanAmountValues={setNewEstLoanAmountValues}
                newMonthlyPaymentValues={newMonthlyPaymentValues}
                setNewMonthlyPaymentValues={setNewMonthlyPaymentValues}
                totalMonthlySavingsValues={totalMonthlySavingsValues}
                setTotalMonthlySavingsValues={setTotalMonthlySavingsValues}
                isMonthlyPaymentRowExpanded={isMonthlyPaymentRowExpanded}
                setIsMonthlyPaymentRowExpanded={setIsMonthlyPaymentRowExpanded}
                isSavingsRowExpanded={isSavingsRowExpanded}
                setIsSavingsRowExpanded={setIsSavingsRowExpanded}
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
                propertyInsurance={propertyInsurance}
                onPropertyInsuranceChange={setPropertyInsurance}
                propertyTax={propertyTax}
                onPropertyTaxChange={setPropertyTax}
                statementEscrowBalance={statementEscrowBalance}
                onStatementEscrowBalanceChange={setStatementEscrowBalance}
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
                monthlyInsurance={monthlyInsurance}
                onMonthlyInsuranceChange={setMonthlyInsurance}
                monthlyPropertyTax={monthlyPropertyTax}
                onMonthlyPropertyTaxChange={setMonthlyPropertyTax}
                newLoanAmountMip={newLoanAmountMip}
                onNewLoanAmountMipChange={setNewLoanAmountMip}
                monthlyFhaMip={monthlyFhaMip}
                onMonthlyFhaMipChange={setMonthlyFhaMip}
                calculatedEscrow={calculatedNewPaymentEscrow}
                escrowReserves={escrowReserves}
                isFHALoan={isFHALoan}
            />

            {/* Existing Monthly Payments Dialog */}
            <ExistingMonthlyPaymentsDialog
                isOpen={isMonthlySavingsInfoOpen}
                onClose={() => setIsMonthlySavingsInfoOpen(false)}
                existingMortgagePayment={existingMortgagePayment}
                onExistingMortgagePaymentChange={setExistingMortgagePayment}
                monthlyPaymentDebtsPayOff={monthlyPaymentDebtsPayOff}
                onMonthlyPaymentDebtsPayOffChange={setMonthlyPaymentDebtsPayOff}
                monthlyPaymentOtherDebts={monthlyPaymentOtherDebts}
                onMonthlyPaymentOtherDebtsChange={setMonthlyPaymentOtherDebts}
                calculatedTotal={calculatedTotalExistingPayments}
            />
        </div>
    );
});

RateDetailsSection.displayName = 'RateDetailsSection';

export default RateDetailsSection;
