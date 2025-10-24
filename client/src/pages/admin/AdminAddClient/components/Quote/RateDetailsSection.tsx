import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RateDetailsSectionProps {
    selectedRateIds: number[];
    selectedLoanCategory: string;
    rateBuydown: string;
}

const RateDetailsSection = ({
    selectedRateIds,
    selectedLoanCategory,
    rateBuydown
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

    if (selectedRateIds.length === 0) return null;

    const columnWidth = `${250 * (selectedRateIds.length + 1)}px`;
    const gridCols = `repeat(${selectedRateIds.length + 1}, minmax(0, 1fr))`;

    const showExistingLoanBalance =
        selectedLoanCategory !== 'Second Loan - HELOC' &&
        selectedLoanCategory !== 'Second Loan - Fixed Second' &&
        !selectedLoanCategory.includes('Purchase');

    const showCashOut = selectedLoanCategory.includes('Cash Out');

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
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RateDetailsSection;
