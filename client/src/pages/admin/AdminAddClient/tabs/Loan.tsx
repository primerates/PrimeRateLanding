import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';
import LoanHeader from '../components/Loan/LoanHeader';
import LoanManagement, { type LoanType } from '../components/Loan/LoanManagement';
import RefinanceLoanCard from '../components/Loan/RefinanceLoanCard';
import PurchaseLoanCard from '../components/Loan/PurchaseLoanCard';
import PrimaryLoanCard from '../components/Loan/PrimaryLoanCard';
import ExistingLoanCard from '../components/Loan/ExistingLoanCard';
import CreditScoresDialog from '../dialogs/CreditScoresDialog';

type FicoType = 'mid-fico' | 'borrower-scores' | 'co-borrower-scores';

interface LoanTabProps {
  showLoanAnimation?: boolean;
  currentPrimaryLoanCards?: string[];
  currentSecondLoanCards?: string[];
  currentThirdLoanCards?: string[];
}

const LoanTab = ({
  showLoanAnimation = false,
  currentPrimaryLoanCards = [],
  currentSecondLoanCards = [],
  currentThirdLoanCards = []
}: LoanTabProps) => {
  const form = useFormContext();

  // Use Zustand store for loan state
  const {
    newRefinanceLoanCards,
    newPurchaseLoanCards,
    currentPrimaryLoans,
    currentSecondLoans,
    currentThirdLoans,
    loanCardStates,
    addLoan,
    removeLoan,
    clearLoansOfType,
    setLoanCardExpanded,
    expandAllLoans,
    minimizeAllLoans
  } = useAdminAddClientStore();

  // Credit scores state for refinance loan
  const [ficoType, setFicoType] = useState<FicoType>('mid-fico');
  const [borrowerScores, setBorrowerScores] = useState({
    experian: '',
    equifax: '',
    transunion: '',
    midFico: ''
  });
  const [coBorrowerScores, setCoBorrowerScores] = useState({
    experian: '',
    equifax: '',
    transunion: '',
    midFico: ''
  });
  const [isBorrowerDialogOpen, setIsBorrowerDialogOpen] = useState(false);
  const [isCoBorrowerDialogOpen, setIsCoBorrowerDialogOpen] = useState(false);

  // Generic loan type handler
  const handleLoanTypeChange = (checked: boolean, loanType: LoanType) => {
    console.log(`Loan ${loanType}:`, checked);

    if (checked) {
      // Add new loan card
      if (loanType === 'new-refinance') {
        addLoan('refinance');
      } else if (loanType === 'new-purchase') {
        addLoan('purchase');
      } else if (loanType === 'current-primary') {
        addLoan('primary');
      } else if (loanType === 'current-second') {
        addLoan('second');
      } else if (loanType === 'current-third') {
        addLoan('third');
      }
    } else {
      // Remove loan cards of the specific type and clear form data
      if (loanType === 'new-refinance') {
        // Clear refinance loan data
        form.setValue('newRefinanceLoan' as any, undefined);
        clearLoansOfType('refinance');
      } else if (loanType === 'new-purchase') {
        // Clear purchase loan data
        form.setValue('newPurchaseLoan' as any, undefined);
        clearLoansOfType('purchase');
      } else if (loanType === 'current-primary') {
        // Clear all primary loan data
        currentPrimaryLoans.forEach(loanId => {
          form.setValue(`currentLoan.${loanId}` as any, undefined);
        });
        clearLoansOfType('primary');
      } else if (loanType === 'current-second') {
        // Clear all second loan data
        currentSecondLoans.forEach(loanId => {
          form.setValue(`currentSecondLoan.${loanId}` as any, undefined);
        });
        clearLoansOfType('second');
      } else if (loanType === 'current-third') {
        // Clear all third loan data
        currentThirdLoans.forEach(loanId => {
          form.setValue(`currentThirdLoan.${loanId}` as any, undefined);
        });
        clearLoansOfType('third');
      }
    }
  };

  const handleRemoveLoanCard = (loanId: string) => {
    // Clear form data based on loan type
    if (loanId.startsWith('primary-')) {
      form.setValue(`currentLoan.${loanId}` as any, undefined);
    } else if (loanId.startsWith('second-')) {
      form.setValue(`currentSecondLoan.${loanId}` as any, undefined);
    } else if (loanId.startsWith('third-')) {
      form.setValue(`currentThirdLoan.${loanId}` as any, undefined);
    } else if (loanId.startsWith('refinance-')) {
      form.setValue('newRefinanceLoan' as any, undefined);
    } else if (loanId.startsWith('purchase-')) {
      form.setValue('newPurchaseLoan' as any, undefined);
    }

    // Remove from Zustand store
    removeLoan(loanId);
  };

  const handleAddPrimaryLoan = () => {
    if (currentPrimaryLoans.length < 10) {
      addLoan('primary');
    }
  };

  const handleAddSecondLoan = () => {
    if (currentSecondLoans.length < 10) {
      addLoan('second');
    }
  };

  const handleAddThirdLoan = () => {
    if (currentThirdLoans.length < 10) {
      addLoan('third');
    }
  };

  const handleLoanCardExpandChange = (loanId: string, expanded: boolean) => {
    setLoanCardExpanded(loanId, expanded);
  };

  // Credit scores handlers
  const handleCycleFicoType = () => {
    setFicoType(prev => {
      if (prev === 'mid-fico') return 'borrower-scores';
      if (prev === 'borrower-scores') return 'co-borrower-scores';
      return 'mid-fico';
    });
  };

  const handleOpenBorrowerScores = () => {
    setIsBorrowerDialogOpen(true);
  };

  const handleOpenCoBorrowerScores = () => {
    setIsCoBorrowerDialogOpen(true);
  };

  const calculateMidFico = () => {
    // Get the mid FICO from borrower and co-borrower scores
    const borrowerMidFico = parseInt(borrowerScores.midFico) || 0;
    const coBorrowerMidFico = parseInt(coBorrowerScores.midFico) || 0;

    if (borrowerMidFico > 0 && coBorrowerMidFico > 0) {
      // Return the lower of the two
      return Math.min(borrowerMidFico, coBorrowerMidFico).toString();
    } else if (borrowerMidFico > 0) {
      return borrowerMidFico.toString();
    } else if (coBorrowerMidFico > 0) {
      return coBorrowerMidFico.toString();
    }
    return '';
  };

  // Check if co-borrower exists
  const hasCoBorrower = () => {
    const borrowers = form.watch('borrower.borrowers') || [];
    return borrowers.some((b: any) => b.borrowerType === 'co-borrower');
  };

  // Get current state of loans for checkboxes
  const hasNewRefinanceLoan = newRefinanceLoanCards.length > 0;
  const hasNewPurchaseLoan = newPurchaseLoanCards.length > 0;
  const hasCurrentPrimaryLoan = currentPrimaryLoans.length > 0;
  const hasCurrentSecondLoan = currentSecondLoans.length > 0;
  const hasCurrentThirdLoan = currentThirdLoans.length > 0;

  // Get count of primary loans
  const primaryLoansCount = currentPrimaryLoans.length;
  const secondLoansCount = currentSecondLoans.length;
  const thirdLoansCount = currentThirdLoans.length;

  return (
    <div className="space-y-6">
      <LoanHeader
        showLoanAnimation={showLoanAnimation}
        newRefinanceLoanCards={newRefinanceLoanCards}
        newPurchaseLoanCards={newPurchaseLoanCards}
        currentPrimaryLoans={currentPrimaryLoans}
        currentSecondLoans={currentSecondLoans}
        currentThirdLoans={currentThirdLoans}
      />

      <LoanManagement
        handleLoanTypeChange={handleLoanTypeChange}
        hasNewRefinanceLoan={hasNewRefinanceLoan}
        hasNewPurchaseLoan={hasNewPurchaseLoan}
        hasCurrentPrimaryLoan={hasCurrentPrimaryLoan}
        hasCurrentSecondLoan={hasCurrentSecondLoan}
        hasCurrentThirdLoan={hasCurrentThirdLoan}
        onExpandAll={expandAllLoans}
        onMinimizeAll={minimizeAllLoans}
      />

      {/* Render Loan Cards */}
      {(newRefinanceLoanCards.length > 0 || newPurchaseLoanCards.length > 0 || currentPrimaryLoans.length > 0 || currentSecondLoans.length > 0 || currentThirdLoans.length > 0) && (
        <div className="space-y-4">
          {/* Refinance Loan Cards - Render First */}
          {newRefinanceLoanCards.map(loanId => (
            <RefinanceLoanCard
              key={loanId}
              loanId={loanId}
              onRemove={handleRemoveLoanCard}
              expanded={loanCardStates[loanId] ?? true}
              onExpandChange={(expanded: boolean) => handleLoanCardExpandChange(loanId, expanded)}
              ficoType={ficoType}
              onCycleFicoType={handleCycleFicoType}
              onOpenBorrowerScores={handleOpenBorrowerScores}
              onOpenCoBorrowerScores={handleOpenCoBorrowerScores}
              calculatedMidFico={calculateMidFico()}
              hasCoBorrower={hasCoBorrower()}
            />
          ))}

          {/* Primary Loan Cards */}
          {currentPrimaryLoans.map(loanId => (
            <PrimaryLoanCard
              key={loanId}
              loanId={loanId}
              onRemove={handleRemoveLoanCard}
              onAdd={handleAddPrimaryLoan}
              currentCount={primaryLoansCount}
              maxCount={10}
              expanded={loanCardStates[loanId] ?? true}
              onExpandChange={(expanded: boolean) => handleLoanCardExpandChange(loanId, expanded)}
            />
          ))}

          {/* Second Loan Cards */}
          {currentSecondLoans.map(loanId => (
            <ExistingLoanCard
              key={loanId}
              loanId={loanId}
              loanType="second"
              onRemove={handleRemoveLoanCard}
              onAdd={handleAddSecondLoan}
              currentCount={secondLoansCount}
              maxCount={10}
              expanded={loanCardStates[loanId] ?? true}
              onExpandChange={(expanded: boolean) => handleLoanCardExpandChange(loanId, expanded)}
            />
          ))}

          {/* Third Loan Cards */}
          {currentThirdLoans.map(loanId => (
            <ExistingLoanCard
              key={loanId}
              loanId={loanId}
              loanType="third"
              onRemove={handleRemoveLoanCard}
              onAdd={handleAddThirdLoan}
              currentCount={thirdLoansCount}
              maxCount={10}
              expanded={loanCardStates[loanId] ?? true}
              onExpandChange={(expanded: boolean) => handleLoanCardExpandChange(loanId, expanded)}
            />
          ))}

          {/* Purchase Loan Cards */}
          {newPurchaseLoanCards.map(loanId => (
            <PurchaseLoanCard
              key={loanId}
              loanId={loanId}
              onRemove={handleRemoveLoanCard}
              expanded={loanCardStates[loanId] ?? true}
              onExpandChange={(expanded: boolean) => handleLoanCardExpandChange(loanId, expanded)}
            />
          ))}
        </div>
      )}

      {/* Credit Scores Dialogs */}
      <CreditScoresDialog
        isOpen={isBorrowerDialogOpen}
        onClose={() => setIsBorrowerDialogOpen(false)}
        title="Borrower Credit Scores"
        scores={borrowerScores}
        onScoresChange={setBorrowerScores}
        testIdPrefix="borrower-credit-scores"
      />

      <CreditScoresDialog
        isOpen={isCoBorrowerDialogOpen}
        onClose={() => setIsCoBorrowerDialogOpen(false)}
        title="Co-Borrower Credit Scores"
        scores={coBorrowerScores}
        onScoresChange={setCoBorrowerScores}
        testIdPrefix="co-borrower-credit-scores"
      />
    </div>
  );
};

export default LoanTab;