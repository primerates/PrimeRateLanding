import QuoteRateSelect from './QuoteRateSelect';
import FormSelect from '../FormSelect';
import {
    US_STATES,
    RATE_BUYDOWN_OPTIONS,
    ESCROW_RESERVES_OPTIONS,
    MONTHLY_ESCROW_OPTIONS
} from '../../data/formOptions';

interface QuoteFormRow2Props {
    // Quote Rate
    selectedRateIds: number[];
    onSelectedRateIdsChange: (ids: number[]) => void;
    isQuoteEnabled: boolean;

    // State
    selectedState: string;
    onStateChange: (value: string) => void;

    // Rate Buydown
    rateBuydown: string;
    onRateBuydownChange: (value: string) => void;

    // Escrow Reserves
    escrowReserves: string;
    onEscrowReservesChange: (value: string) => void;

    // Monthly Escrow
    monthlyEscrow: string;
    onMonthlyEscrowChange: (value: string) => void;
}

const QuoteFormRow2 = ({
    selectedRateIds,
    onSelectedRateIdsChange,
    isQuoteEnabled,
    selectedState,
    onStateChange,
    rateBuydown,
    onRateBuydownChange,
    escrowReserves,
    onEscrowReservesChange,
    monthlyEscrow,
    onMonthlyEscrowChange,
}: QuoteFormRow2Props) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <QuoteRateSelect
                selectedRateIds={selectedRateIds}
                onSelectedRateIdsChange={onSelectedRateIdsChange}
                isEnabled={isQuoteEnabled}
                testId="button-quote-select"
                className="space-y-2"
            />

            <FormSelect
                label="State"
                value={selectedState}
                onValueChange={onStateChange}
                options={US_STATES}
                placeholder="Select"
                testId="select-state"
                className="space-y-2"
            />

            <FormSelect
                label="Rate Buydown"
                value={rateBuydown}
                onValueChange={onRateBuydownChange}
                options={RATE_BUYDOWN_OPTIONS}
                placeholder="Yes"
                testId="select-rate-buydown"
                className="space-y-2"
            />

            <FormSelect
                label="Escrow Reserves"
                value={escrowReserves}
                onValueChange={onEscrowReservesChange}
                options={ESCROW_RESERVES_OPTIONS}
                placeholder="New Escrow Reserves"
                testId="select-escrow-reserves"
                className="space-y-2"
            />

            <FormSelect
                label="Monthly Escrow"
                value={monthlyEscrow}
                onValueChange={onMonthlyEscrowChange}
                options={MONTHLY_ESCROW_OPTIONS}
                placeholder="Includes Tax & Insurance"
                testId="select-monthly-escrow"
                className="space-y-2"
            />
        </div>
    );
};

export default QuoteFormRow2;
