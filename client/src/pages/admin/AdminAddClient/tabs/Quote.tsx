import { Card, CardContent } from '@/components/ui/card';
import ActionButtons from '../components/Quote/ActionButtons';
import QuoteFormRow1 from '../components/Quote/QuoteFormRow1';
import QuoteFormRow2 from '../components/Quote/QuoteFormRow2';
import QuoteFormRow3 from '../components/Quote/QuoteFormRow3';
import QuotePopupsContainer from '../components/Quote/QuotePopupsContainer';
import { useQuoteState } from '../hooks/useQuoteState';

const QuoteTab = () => {
    const state = useQuoteState();

    return (
        <Card className="mb-6 transition-all duration-700 animate-roll-down">
            <ActionButtons
                showCalculator={state.showCalculator}
                isCardsMinimized={state.isQuoteCardsMinimized}
                onPinClick={() => state.setShowPinPopup(true)}
                onPageClick={() => state.setShowPagePopup(true)}
                onStickyNotesClick={() => state.setIsStickyNotesOpen(true)}
                onGuidelinesClick={() => state.setShowLibraryDialog(true)}
                onCalculatorClick={() => state.setShowCalculator(!state.showCalculator)}
                onPrintClick={() => window.print()}
                onToggleMinimize={() => state.setIsQuoteCardsMinimized(!state.isQuoteCardsMinimized)}
            />

            {/* Completion Bar */}
            {!state.isQuoteCardsMinimized && (
                <div className="px-4 pt-3 pb-2">
                    <div className="relative flex gap-0 h-px">
                        {Array.from({ length: 15 }).map((_, index) => (
                            <div
                                key={index}
                                className={`flex-1 transition-colors duration-300`}
                                style={{ backgroundColor: index < state.completedFieldsCount ? '#1a3373' : '#D1D5DB' }}
                            />
                        ))}
                        {state.completedFieldsCount > 0 && state.completedFieldsCount < 15 && (
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300"
                                style={{
                                    backgroundColor: '#1a3373',
                                    left: `calc(${(state.completedFieldsCount / 15) * 100}% - 4px)`
                                }}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Quote Content */}
            {!state.isQuoteCardsMinimized && (
                <CardContent className="pt-6 space-y-6">
                    {/* Row 1: Loan Category, Loan Term, Loan Program, Property Use, Property Type */}
                    <QuoteFormRow1
                        selectedLoanCategory={state.selectedLoanCategory}
                        onLoanCategoryChange={state.setSelectedLoanCategory}
                        isVAExempt={state.isVAExempt}
                        onVAExemptChange={state.setIsVAExempt}
                        isVAJumboExempt={state.isVAJumboExempt}
                        onVAJumboExemptChange={state.setIsVAJumboExempt}
                        isCustomTerm={state.isCustomTerm}
                        onCustomTermModeChange={state.setIsCustomTerm}
                        loanTerm={state.loanTerm}
                        onLoanTermChange={state.setLoanTerm}
                        customTerm={state.customTerm}
                        onCustomTermValueChange={state.setCustomTerm}
                        selectedLoanProgram={state.selectedLoanProgram}
                        onLoanProgramChange={state.setSelectedLoanProgram}
                        selectedPropertyUse={state.selectedPropertyUse}
                        onPropertyUseChange={state.setSelectedPropertyUse}
                        selectedPropertyType={state.selectedPropertyType}
                        onPropertyTypeChange={state.setSelectedPropertyType}
                    />

                    {/* Row 2: Quote, State, Rate Buydown, Escrow Reserves, Monthly Escrow */}
                    <QuoteFormRow2
                        selectedRateIds={state.selectedRateIds}
                        onSelectedRateIdsChange={state.setSelectedRateIds}
                        isQuoteEnabled={state.isQuoteEnabled}
                        selectedState={state.selectedState}
                        onStateChange={state.setSelectedState}
                        rateBuydown={state.rateBuydown}
                        onRateBuydownChange={state.setRateBuydown}
                        escrowReserves={state.escrowReserves}
                        onEscrowReservesChange={state.setEscrowReserves}
                        monthlyEscrow={state.monthlyEscrow}
                        onMonthlyEscrowChange={state.setMonthlyEscrow}
                    />

                    {/* Row 3: Mid FICO, LTV Ratio, Lender, Title, Underwriting */}
                    <QuoteFormRow3
                        isMidFicoEstimateMode={state.isMidFicoEstimateMode}
                        onMidFicoEstimateModeChange={state.setIsMidFicoEstimateMode}
                        estimatedFicoValue={state.estimatedFicoValue}
                        onEstimatedFicoValueChange={state.setEstimatedFicoValue}
                        isLtvEstimateMode={state.isLtvEstimateMode}
                        onLtvEstimateModeChange={state.setIsLtvEstimateMode}
                        estimatedLtvValue={state.estimatedLtvValue}
                        onEstimatedLtvValueChange={state.setEstimatedLtvValue}
                        isLenderCreditMode={state.isLenderCreditMode}
                        onLenderCreditModeChange={state.setIsLenderCreditMode}
                        selectedLender={state.selectedLender}
                        onSelectedLenderChange={state.setSelectedLender}
                        lenderCreditAmount={state.lenderCreditAmount}
                        onLenderCreditAmountChange={state.setLenderCreditAmount}
                        isTitleSellerCreditMode={state.isTitleSellerCreditMode}
                        onTitleSellerCreditModeChange={state.setIsTitleSellerCreditMode}
                        selectedTitle={state.selectedTitle}
                        onSelectedTitleChange={state.setSelectedTitle}
                        titleSellerCreditAmount={state.titleSellerCreditAmount}
                        onTitleSellerCreditAmountChange={state.setTitleSellerCreditAmount}
                        isProcessingMode={state.isProcessingMode}
                        onProcessingModeChange={state.setIsProcessingMode}
                        underwriting={state.underwriting}
                        onUnderwritingChange={state.setUnderwriting}
                    />
                </CardContent>
            )}

            {/* All Popups */}
            <QuotePopupsContainer
                showPinPopup={state.showPinPopup}
                onPinPopupClose={() => state.setShowPinPopup(false)}
                pinPopupPosition={state.pinPopupPosition}
                onPinPopupPositionChange={state.setPinPopupPosition}
                pinPopupSize={state.pinPopupSize}
                onPinPopupSizeChange={state.setPinPopupSize}
                pinContent={state.pinContent}
                onPinContentChange={state.setPinContent}
                showPagePopup={state.showPagePopup}
                onPagePopupClose={() => state.setShowPagePopup(false)}
                pagePopupPosition={state.pagePopupPosition}
                onPagePopupPositionChange={state.setPagePopupPosition}
                pageContent={state.pageContent}
                onPageContentChange={state.setPageContent}
                pageFontSize={state.pageFontSize}
                onPageFontSizeChange={state.setPageFontSize}
                pageFontColor={state.pageFontColor}
                onPageFontColorChange={state.setPageFontColor}
                isStickyNotesOpen={state.isStickyNotesOpen}
                onStickyNotesOpenChange={state.setIsStickyNotesOpen}
                stickyNotes={state.stickyNotes}
                onStickyNotesChange={state.setStickyNotes}
                showLibraryDialog={state.showLibraryDialog}
                onLibraryDialogOpenChange={state.setShowLibraryDialog}
                libraryConfigurations={state.libraryConfigurations}
                onDeleteConfiguration={state.handleDeleteConfiguration}
                onLoadConfiguration={state.handleLoadConfiguration}
                showCalculator={state.showCalculator}
                onCalculatorClose={() => state.setShowCalculator(false)}
                calculatorPosition={state.calculatorPosition}
                onCalculatorPositionChange={state.setCalculatorPosition}
            />
        </Card>
    );
};

export default QuoteTab;
