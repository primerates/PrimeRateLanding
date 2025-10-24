import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RateDetailsSectionProps {
    selectedRateIds: number[];
    selectedLoanCategory: string;
    rateBuydown: string;
    escrowReserves?: string;
    monthlyEscrow?: string;
}

const RateDetailsSection = ({
    selectedRateIds,
    selectedLoanCategory,
    rateBuydown,
    escrowReserves = 'escrow-not-included',
    monthlyEscrow = 'select'
}: RateDetailsSectionProps) => {
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
    const [vaFundingFeeValues, setVaFundingFeeValues] = useState<string[]>(Array(4).fill(''));
    const [fhaUpfrontMipValue, setFhaUpfrontMipValue] = useState('0');

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
    const calculatedTotalMonthlyEscrow = 0; // This would be calculated based on tax and insurance inputs

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

    const isVALoan = selectedLoanCategory?.startsWith('VA - ') || selectedLoanCategory?.startsWith('VA Jumbo - ');
    const isFHALoan = selectedLoanCategory?.startsWith('FHA - ');
    const showVAFHASection = isVALoan || isFHALoan;

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
                <Card
                    className="mt-8 transition-all duration-700 animate-roll-down border-l-4 border-l-green-500 hover:border-2 hover:border-green-500 transition-colors flex-none"
                    style={{ width: columnWidth, maxWidth: '100%' }}
                >
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
                            <div className="flex items-center justify-end pr-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isExistingLoanBalanceSameMode) {
                                            const firstValue = existingLoanBalanceValues[selectedRateIds[0]] || '';
                                            const newValues = [...existingLoanBalanceValues];
                                            selectedRateIds.forEach(id => newValues[id] = firstValue);
                                            setExistingLoanBalanceValues(newValues);
                                        }
                                        setIsExistingLoanBalanceSameMode(!isExistingLoanBalanceSameMode);
                                    }}
                                    className="text-base font-semibold text-right hover:text-blue-600 cursor-pointer"
                                    data-testid="button-existing-loan-balance-toggle"
                                >
                                    {isExistingLoanBalanceSameMode ? 'Same' : 'Existing Loan Balance:'}
                                </button>
                            </div>
                            {selectedRateIds.map((rateId) => {
                                const numVal = existingLoanBalanceValues[rateId] ? existingLoanBalanceValues[rateId].replace(/[^\d]/g, '') : '';
                                const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

                                return (
                                    <div key={rateId} className="flex justify-center">
                                        <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                                            <span className="text-muted-foreground text-sm">$</span>
                                            <Input
                                                type="text"
                                                placeholder=""
                                                value={displayValue}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^\d]/g, '');
                                                    const newValues = [...existingLoanBalanceValues];
                                                    newValues[rateId] = value;
                                                    setExistingLoanBalanceValues(newValues);
                                                }}
                                                className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                                                data-testid={`input-existing-loan-balance-${rateId}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Cash Out Amount */}
                        {showCashOut && (
                            <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
                                <div className="flex items-center justify-end pr-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isCashOutSameMode) {
                                                const firstValue = cashOutAmountValues[selectedRateIds[0]] || '';
                                                const newValues = [...cashOutAmountValues];
                                                selectedRateIds.forEach(id => newValues[id] = firstValue);
                                                setCashOutAmountValues(newValues);
                                            }
                                            setIsCashOutSameMode(!isCashOutSameMode);
                                        }}
                                        className="text-base font-semibold text-right hover:text-blue-600 cursor-pointer"
                                        data-testid="button-cash-out-toggle"
                                    >
                                        {isCashOutSameMode ? 'Same' : 'Cash Out Amount'}
                                    </button>
                                </div>
                                {selectedRateIds.map((rateId) => {
                                    const numVal = cashOutAmountValues[rateId] ? cashOutAmountValues[rateId].replace(/[^\d]/g, '') : '';
                                    const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

                                    return (
                                        <div key={rateId} className="flex justify-center">
                                            <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                                                <span className="text-muted-foreground text-sm">$</span>
                                                <Input
                                                    type="text"
                                                    placeholder=""
                                                    value={displayValue}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^\d]/g, '');
                                                        const newValues = [...cashOutAmountValues];
                                                        newValues[rateId] = value;
                                                        setCashOutAmountValues(newValues);
                                                    }}
                                                    className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                                                    data-testid={`input-cash-out-amount-${rateId}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Rate Buy Down Card */}
            {rateBuydown !== 'no' && (
                <Card
                    className="mt-8 transition-all duration-700 animate-roll-down border-l-4 border-l-cyan-500 hover:border-2 hover:border-cyan-500 transition-colors flex-none"
                    style={{ width: columnWidth, maxWidth: '100%' }}
                >
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
                            <div className="flex items-center justify-end pr-4">
                                <Label className="text-base font-semibold text-right">Rate Buy Down</Label>
                            </div>
                            {selectedRateIds.map((rateId) => {
                                const numVal = rateBuyDownValues[rateId] ? rateBuyDownValues[rateId].replace(/[^\d]/g, '') : '';
                                const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

                                return (
                                    <div key={rateId} className="flex justify-center">
                                        <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                                            <span className="text-muted-foreground text-sm">$</span>
                                            <Input
                                                type="text"
                                                placeholder=""
                                                value={displayValue}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^\d]/g, '');
                                                    const newValues = [...rateBuyDownValues];
                                                    newValues[rateId] = value;
                                                    setRateBuyDownValues(newValues);
                                                }}
                                                className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                                                data-testid={`input-rate-buy-down-${rateId}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* VA Funding Fee / FHA Upfront MIP Section */}
                        {showVAFHASection && (
                            <div className="border-t pt-6">
                                <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: gridCols }}>
                                    <div className="flex items-center justify-end pr-4 gap-2">
                                        <Label className="text-base font-semibold text-right">
                                            {isFHALoan ? 'New FHA Upfront MIP' : 'VA Funding Fee'}
                                        </Label>
                                    </div>
                                    {selectedRateIds.map((rateId) => {
                                        if (isVALoan) {
                                            // VA Loan: display-only input showing calculated values
                                            const rawVal = vaFundingFeeValues[rateId] || '';
                                            const cleanVal = rawVal.replace(/[^\d.]/g, '');

                                            let displayValue = '';
                                            if (cleanVal) {
                                                const parts = cleanVal.split('.');
                                                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                                displayValue = parts.join('.');
                                            }

                                            return (
                                                <div key={rateId} className="flex justify-center">
                                                    <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                                                        <span className="text-muted-foreground text-sm">$</span>
                                                        <Input
                                                            type="text"
                                                            placeholder=""
                                                            value={displayValue}
                                                            disabled
                                                            className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-100"
                                                            data-testid={`input-va-funding-fee-${rateId}`}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // FHA Loan: disabled input showing calculated value
                                        const displayValue = fhaUpfrontMipValue || '0';

                                        return (
                                            <div key={rateId} className="flex justify-center">
                                                <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                                                    <span className="text-muted-foreground text-sm">$</span>
                                                    <Input
                                                        type="text"
                                                        placeholder="0"
                                                        value={displayValue}
                                                        disabled
                                                        className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-100"
                                                        data-testid={`input-fha-upfront-mip-${rateId}`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Third Party Services Section */}
                        <div className={`${rateBuydown !== 'no' ? 'border-t' : ''} pt-6`}>
                            {currentThirdPartyServices.map((category, categoryIndex) => (
                                <div key={category.id} className={categoryIndex > 0 ? 'mt-6 pt-6 border-t border-border' : ''}>
                                    {/* Category Header */}
                                    <div className="grid gap-4 mb-2" style={{ gridTemplateColumns: gridCols }}>
                                        <div className="flex items-center justify-end pr-4 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const isInSameMode = categorySameModes[category.id];
                                                    if (isInSameMode) {
                                                        // Copy first field value to all fields for ALL services in this category
                                                        category.services.forEach(service => {
                                                            const firstValue = thirdPartyServiceValues[service.id]?.[selectedRateIds[0]] || '';
                                                            const newValues = [...thirdPartyServiceValues[service.id]];
                                                            selectedRateIds.forEach(id => newValues[id] = firstValue);
                                                            setThirdPartyServiceValues(prev => ({
                                                                ...prev,
                                                                [service.id]: newValues
                                                            }));
                                                        });
                                                    }
                                                    // Toggle the mode
                                                    setCategorySameModes(prev => ({
                                                        ...prev,
                                                        [category.id]: !isInSameMode
                                                    }));
                                                }}
                                                className="text-base font-semibold text-right hover:text-blue-600 cursor-pointer"
                                                data-testid={`button-category-toggle-${category.id}`}
                                            >
                                                {categorySameModes[category.id] ? 'Same' : category.categoryName}
                                            </button>
                                        </div>
                                        {selectedRateIds.map((rateId) => (
                                            <div key={rateId} className="flex justify-center">
                                                <div className="w-3/4"></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Services under this category */}
                                    {category.services.map((service, serviceIndex) => {
                                        // Filter logic for services based on loan category
                                        // Hide VA Funding Fee (s1) - it has its own section
                                        if (service.id === 's1') return null;

                                        // Hide Appraisal Inspection (s2) when VA Rate & Term or IRRRL is selected
                                        if (service.id === 's2' &&
                                            (selectedLoanCategory?.includes('Rate & Term') || selectedLoanCategory?.includes('IRRRL'))) {
                                            return null;
                                        }

                                        // Hide Appraisal Inspection (s2) when FHA Rate & Term or Streamline is selected
                                        if (service.id === 's2' && isFHALoan &&
                                            (selectedLoanCategory?.includes('Rate & Term') || selectedLoanCategory?.includes('Streamline'))) {
                                            return null;
                                        }

                                        // Hide Pay Off Interest (s6) - it has its own section
                                        if (service.id === 's6') return null;

                                        return (
                                            <div
                                                key={service.id}
                                                className={`grid gap-4 ${serviceIndex < category.services.length - 1 ? 'mb-2' : ''}`}
                                                style={{ gridTemplateColumns: gridCols }}
                                            >
                                                <div className="flex items-center justify-end pr-4">
                                                    <Label className="text-sm text-right text-muted-foreground">• {service.serviceName}</Label>
                                                </div>
                                                {selectedRateIds.map((rateId) => {
                                                    const numVal = thirdPartyServiceValues[service.id]?.[rateId]
                                                        ? thirdPartyServiceValues[service.id][rateId].replace(/[^\d]/g, '')
                                                        : '';
                                                    const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

                                                    return (
                                                        <div key={rateId} className="flex justify-center">
                                                            <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                                                                <span className="text-muted-foreground text-sm">$</span>
                                                                <Input
                                                                    type="text"
                                                                    placeholder=""
                                                                    value={displayValue}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.replace(/[^\d]/g, '');
                                                                        setThirdPartyServiceValues(prev => {
                                                                            const newValues = { ...prev };
                                                                            if (!newValues[service.id]) {
                                                                                newValues[service.id] = Array(4).fill('');
                                                                            }
                                                                            const updatedArray = [...newValues[service.id]];
                                                                            updatedArray[rateId] = value;
                                                                            newValues[service.id] = updatedArray;
                                                                            return newValues;
                                                                        });
                                                                    }}
                                                                    className="border-0 bg-transparent text-center text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                                                                    data-testid={`input-service-${service.id}-${rateId}`}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pay Off Interest & New Escrow Reserves Card */}
            <Card
                className="mt-8 transition-all duration-700 animate-roll-down border-l-4 border-l-violet-400 hover:border-2 hover:border-violet-400 transition-colors flex-none"
                style={{ width: columnWidth, maxWidth: '100%' }}
            >
                <CardContent className="pt-6 space-y-6">
                    {/* Pay Off Interest Section - Standalone */}
                    <div>
                        <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
                            <div className="flex items-center justify-end pr-4">
                                <Label className="text-base font-bold text-right whitespace-nowrap">Pay Off Interest</Label>
                            </div>
                            {selectedRateIds.map((rateId) => {
                                const numVal = payOffInterestValues[rateId] ? payOffInterestValues[rateId].replace(/[^\d]/g, '') : '';
                                const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

                                return (
                                    <div key={rateId} className="flex justify-center">
                                        <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                                            <span className="text-muted-foreground text-sm">$</span>
                                            <Input
                                                type="text"
                                                placeholder=""
                                                value={displayValue}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^\d]/g, '');
                                                    const newValues = [...payOffInterestValues];
                                                    newValues[rateId] = value;
                                                    setPayOffInterestValues(newValues);
                                                    // Also update thirdPartyServiceValues['s6'] to keep them in sync
                                                    setThirdPartyServiceValues(prev => ({
                                                        ...prev,
                                                        's6': newValues
                                                    }));
                                                }}
                                                className="border-0 bg-transparent text-center text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                                                data-testid={`input-payoff-interest-${rateId}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* New Escrow Reserves Section - Conditionally shown */}
                    {escrowReserves !== 'escrow-not-included' && (
                        <div className="border-t pt-6">
                            <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
                                <div className="flex flex-col items-end justify-center pr-4">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Label className="text-base font-bold text-right whitespace-nowrap">New Escrow Reserves</Label>
                                    </div>
                                    {monthlyEscrow && monthlyEscrow !== 'select' && (
                                        <span className="text-sm text-muted-foreground text-right mt-1">
                                            {monthlyEscrow === 'includes-tax-insurance' && 'Includes Tax & Insurance'}
                                            {monthlyEscrow === 'includes-tax-only' && 'Includes Tax Only'}
                                            {monthlyEscrow === 'includes-insurance-only' && 'Includes Insurance Only'}
                                        </span>
                                    )}
                                </div>
                                {selectedRateIds.map((rateId) => {
                                    const displayValue = calculatedTotalMonthlyEscrow > 0 ? calculatedTotalMonthlyEscrow.toLocaleString('en-US') : '';

                                    return (
                                        <div key={rateId} className="flex justify-center">
                                            <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                                                <span className="text-muted-foreground text-sm">$</span>
                                                <Input
                                                    type="text"
                                                    placeholder=""
                                                    value={displayValue}
                                                    readOnly
                                                    className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                                                    data-testid={`input-escrow-reserves-${rateId}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* New Est. Loan Amount & New Monthly Payment Card */}
            <Card
                className="mt-8 transition-all duration-700 animate-roll-down border-l-4 border-l-blue-500 hover:border-2 hover:border-blue-500 transition-colors flex-none"
                style={{ width: columnWidth, maxWidth: '100%' }}
            >
                <CardContent className="pt-6 space-y-6">
                    {/* New Est. Loan Amount Row */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
                        <div className="flex items-center justify-end pr-4 gap-2 flex-shrink-0">
                            {isMonthlyPaymentRowExpanded ? (
                                <ChevronDown
                                    className="h-4 w-4 flex-shrink-0 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                    onClick={() => setIsMonthlyPaymentRowExpanded(false)}
                                    data-testid="icon-collapse-monthly-payment"
                                />
                            ) : (
                                <ChevronUp
                                    className="h-4 w-4 flex-shrink-0 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                    onClick={() => setIsMonthlyPaymentRowExpanded(true)}
                                    data-testid="icon-expand-monthly-payment"
                                />
                            )}
                            <Label className="text-base font-bold text-right whitespace-nowrap">New Est. Loan Amount</Label>
                        </div>
                        {selectedRateIds.map((rateId) => {
                            const numVal = newEstLoanAmountValues[rateId] ? newEstLoanAmountValues[rateId].replace(/[^\d]/g, '') : '';
                            const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

                            return (
                                <div key={rateId} className="flex justify-center">
                                    <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                                        <span className="text-muted-foreground text-sm">$</span>
                                        <Input
                                            type="text"
                                            placeholder=""
                                            value={displayValue}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^\d]/g, '');
                                                const newValues = [...newEstLoanAmountValues];
                                                newValues[rateId] = value;
                                                setNewEstLoanAmountValues(newValues);
                                            }}
                                            className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                                            data-testid={`input-new-est-loan-amount-${rateId}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* New Monthly Payment Row - Collapsible */}
                    {isMonthlyPaymentRowExpanded && (
                        <div className="border-t pt-6">
                            <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
                                <div className="flex items-center justify-end pr-4 gap-2 flex-shrink-0">
                                    {isSavingsRowExpanded ? (
                                        <ChevronDown
                                            className="h-4 w-4 flex-shrink-0 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                            onClick={() => setIsSavingsRowExpanded(false)}
                                            data-testid="icon-collapse-savings"
                                        />
                                    ) : (
                                        <ChevronUp
                                            className="h-4 w-4 flex-shrink-0 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                            onClick={() => setIsSavingsRowExpanded(true)}
                                            data-testid="icon-expand-savings"
                                        />
                                    )}
                                    <Label className="text-base font-bold text-right whitespace-nowrap">New Monthly Payment</Label>
                                </div>
                                {selectedRateIds.map((rateId) => {
                                    const numVal = newMonthlyPaymentValues[rateId] ? newMonthlyPaymentValues[rateId].replace(/[^\d]/g, '') : '';
                                    const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

                                    return (
                                        <div key={rateId} className="flex justify-center">
                                            <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                                                <span className="text-muted-foreground text-sm">$</span>
                                                <Input
                                                    type="text"
                                                    placeholder=""
                                                    value={displayValue}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^\d]/g, '');
                                                        const newValues = [...newMonthlyPaymentValues];
                                                        newValues[rateId] = value;
                                                        setNewMonthlyPaymentValues(newValues);
                                                    }}
                                                    className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                                                    data-testid={`input-new-monthly-payment-${rateId}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Total Monthly Savings Row - Collapsible under New Monthly Payment */}
                    {isMonthlyPaymentRowExpanded && isSavingsRowExpanded && (
                        <div className="border-t pt-6">
                            <div className="grid gap-4" style={{ gridTemplateColumns: gridCols }}>
                                <div className="flex items-center justify-end pr-4">
                                    <Label className="text-base font-bold text-right whitespace-nowrap">Total Monthly Savings</Label>
                                </div>
                                {selectedRateIds.map((rateId) => {
                                    const numVal = totalMonthlySavingsValues[rateId] ? totalMonthlySavingsValues[rateId].replace(/[^\d]/g, '') : '';
                                    const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

                                    return (
                                        <div key={rateId} className="flex justify-center">
                                            <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                                                <span className="text-muted-foreground text-sm">$</span>
                                                <Input
                                                    type="text"
                                                    placeholder=""
                                                    value={displayValue}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^\d]/g, '');
                                                        const newValues = [...totalMonthlySavingsValues];
                                                        newValues[rateId] = value;
                                                        setTotalMonthlySavingsValues(newValues);
                                                    }}
                                                    className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                                                    data-testid={`input-total-monthly-savings-${rateId}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RateDetailsSection;
