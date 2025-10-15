import React from 'react';
import LoanHeader from '../components/Loan/LoanHeader';
import LoanManagement, { type LoanType } from '../components/Loan/LoanManagement';

interface LoanTabProps {
  showLoanAnimation?: boolean;
  newRefinanceLoanCards?: string[];
  newPurchaseLoanCards?: string[];
  currentPrimaryLoanCards?: string[];
  currentSecondLoanCards?: string[];
  currentThirdLoanCards?: string[];
}

const LoanTab = ({
  showLoanAnimation = false,
  newRefinanceLoanCards = [],
  newPurchaseLoanCards = [],
  currentPrimaryLoanCards = [],
  currentSecondLoanCards = [],
  currentThirdLoanCards = []
}: LoanTabProps) => {
  // Generic loan type handler
  const handleLoanTypeChange = (checked: boolean, loanType: LoanType) => {
    console.log(`Loan ${loanType}:`, checked);
    // Future implementation:
    // - Add/remove loan cards based on type
    // - Update form state
    // - Trigger card animations
    // - Manage loan card state arrays
  };

  return (
    <div className="space-y-6">
      <LoanHeader
        showLoanAnimation={showLoanAnimation}
        newRefinanceLoanCards={newRefinanceLoanCards}
        newPurchaseLoanCards={newPurchaseLoanCards}
      />

      <LoanManagement
        handleLoanTypeChange={handleLoanTypeChange}
        hasNewRefinanceLoan={newRefinanceLoanCards.length > 0}
        hasNewPurchaseLoan={newPurchaseLoanCards.length > 0}
        hasCurrentPrimaryLoan={currentPrimaryLoanCards.length > 0}
        hasCurrentSecondLoan={currentSecondLoanCards.length > 0}
        hasCurrentThirdLoan={currentThirdLoanCards.length > 0}
      />
    </div>
  );
};

export default LoanTab;