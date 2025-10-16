import React, { useState } from 'react';
import LoanHeader from '../components/Loan/LoanHeader';
import LoanManagement, { type LoanType } from '../components/Loan/LoanManagement';
import RefinanceLoanCard from '../components/Loan/RefinanceLoanCard';

interface LoanData {
  id: string;
  type: 'refinance' | 'purchase';
  expanded: boolean;
}

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
  const [loanCards, setLoanCards] = useState<LoanData[]>([]);

  // Generic loan type handler
  const handleLoanTypeChange = (checked: boolean, loanType: LoanType) => {
    console.log(`Loan ${loanType}:`, checked);
    
    if (checked) {
      // Add new loan card
      if (loanType === 'new-refinance') {
        const newLoanId = `refinance-${Date.now()}`;
        setLoanCards(prev => [...prev, {
          id: newLoanId,
          type: 'refinance',
          expanded: true
        }]);
      } else if (loanType === 'new-purchase') {
        const newLoanId = `purchase-${Date.now()}`;
        setLoanCards(prev => [...prev, {
          id: newLoanId,
          type: 'purchase',
          expanded: true
        }]);
      }
      // TODO: Implement other loan types (second, second+purchase, existing loans)
    } else {
      // Remove loan cards of the specific type
      if (loanType === 'new-refinance') {
        setLoanCards(prev => prev.filter(loan => loan.type !== 'refinance'));
      } else if (loanType === 'new-purchase') {
        setLoanCards(prev => prev.filter(loan => loan.type !== 'purchase'));
      }
      // TODO: Implement removal for other loan types
    }
  };

  const handleRemoveLoanCard = (loanId: string) => {
    setLoanCards(prev => prev.filter(loan => loan.id !== loanId));
  };

  const handleLoanCardExpandChange = (loanId: string, expanded: boolean) => {
    setLoanCards(prev => prev.map(loan => 
      loan.id === loanId ? { ...loan, expanded } : loan
    ));
  };

  // Get current state of loans for checkboxes
  const hasNewRefinanceLoan = loanCards.some(loan => loan.type === 'refinance');
  const hasNewPurchaseLoan = loanCards.some(loan => loan.type === 'purchase');

  // Expand/collapse handlers
  const handleExpandAllLoans = () => {
    setLoanCards(prev => prev.map(loan => ({ ...loan, expanded: true })));
  };

  const handleMinimizeAllLoans = () => {
    setLoanCards(prev => prev.map(loan => ({ ...loan, expanded: false })));
  };

  return (
    <div className="space-y-6">
      <LoanHeader
        showLoanAnimation={showLoanAnimation}
        newRefinanceLoanCards={loanCards.filter(loan => loan.type === 'refinance').map(loan => loan.id)}
        newPurchaseLoanCards={loanCards.filter(loan => loan.type === 'purchase').map(loan => loan.id)}
      />

      <LoanManagement
        handleLoanTypeChange={handleLoanTypeChange}
        hasNewRefinanceLoan={hasNewRefinanceLoan}
        hasNewPurchaseLoan={hasNewPurchaseLoan}
        hasCurrentPrimaryLoan={currentPrimaryLoanCards.length > 0}
        hasCurrentSecondLoan={currentSecondLoanCards.length > 0}
        hasCurrentThirdLoan={currentThirdLoanCards.length > 0}
        onExpandAll={handleExpandAllLoans}
        onMinimizeAll={handleMinimizeAllLoans}
      />

      {/* Render Loan Cards */}
      {loanCards.length > 0 && (
        <div className="space-y-4">
          {loanCards
            .filter(loan => loan.type === 'refinance')
            .map(loan => (
              <RefinanceLoanCard
                key={loan.id}
                loanId={loan.id}
                onRemove={handleRemoveLoanCard}
                expanded={loan.expanded}
                onExpandChange={(expanded: boolean) => handleLoanCardExpandChange(loan.id, expanded)}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default LoanTab;