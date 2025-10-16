import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import LoanHeader from '../components/Loan/LoanHeader';
import LoanManagement, { type LoanType } from '../components/Loan/LoanManagement';
import RefinanceLoanCard from '../components/Loan/RefinanceLoanCard';
import PrimaryLoanCard from '../components/Loan/PrimaryLoanCard';

interface LoanData {
  id: string;
  type: 'refinance' | 'purchase' | 'primary';
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
  const form = useFormContext();
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
      } else if (loanType === 'current-primary') {
        const newLoanId = `primary-${Date.now()}`;
        setLoanCards(prev => [...prev, {
          id: newLoanId,
          type: 'primary',
          expanded: true
        }]);
      }
      // TODO: Implement other loan types (second, second+purchase, existing loans)
    } else {
      // Remove loan cards of the specific type and clear form data
      if (loanType === 'new-refinance') {
        // Clear refinance loan data
        form.setValue('abc' as any, undefined);
        setLoanCards(prev => prev.filter(loan => loan.type !== 'refinance'));
      } else if (loanType === 'new-purchase') {
        // Clear purchase loan data if applicable
        setLoanCards(prev => prev.filter(loan => loan.type !== 'purchase'));
      } else if (loanType === 'current-primary') {
        // Clear all primary loan data
        const primaryLoans = loanCards.filter(loan => loan.type === 'primary');
        primaryLoans.forEach(loan => {
          form.setValue(`currentLoan.${loan.id}` as any, undefined);
        });
        setLoanCards(prev => prev.filter(loan => loan.type !== 'primary'));
      }
      // TODO: Implement removal for other loan types
    }
  };

  const handleRemoveLoanCard = (loanId: string) => {
    // Find the loan to determine its type
    const loanToRemove = loanCards.find(loan => loan.id === loanId);

    if (loanToRemove) {
      // Clear form data based on loan type
      if (loanToRemove.type === 'primary') {
        // Clear primary loan data
        form.setValue(`currentLoan.${loanId}` as any, undefined);
      } else if (loanToRemove.type === 'refinance') {
        // Clear refinance loan data (uses 'abc' prefix)
        form.setValue('abc' as any, undefined);
      } else if (loanToRemove.type === 'purchase') {
        // Clear purchase loan data if applicable
        // Add field prefix for purchase loans when implemented
      }
    }

    // Remove the loan card from the list
    setLoanCards(prev => prev.filter(loan => loan.id !== loanId));
  };

  const handleAddPrimaryLoan = () => {
    const primaryLoansCount = loanCards.filter(loan => loan.type === 'primary').length;
    if (primaryLoansCount < 2) {
      const newLoanId = `primary-${Date.now()}`;
      setLoanCards(prev => [...prev, {
        id: newLoanId,
        type: 'primary',
        expanded: true
      }]);
    }
  };

  const handleLoanCardExpandChange = (loanId: string, expanded: boolean) => {
    setLoanCards(prev => prev.map(loan => 
      loan.id === loanId ? { ...loan, expanded } : loan
    ));
  };

  // Get current state of loans for checkboxes
  const hasNewRefinanceLoan = loanCards.some(loan => loan.type === 'refinance');
  const hasNewPurchaseLoan = loanCards.some(loan => loan.type === 'purchase');
  const hasCurrentPrimaryLoan = loanCards.some(loan => loan.type === 'primary');

  // Get count of primary loans
  const primaryLoansCount = loanCards.filter(loan => loan.type === 'primary').length;

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
        hasCurrentPrimaryLoan={hasCurrentPrimaryLoan}
        hasCurrentSecondLoan={currentSecondLoanCards.length > 0}
        hasCurrentThirdLoan={currentThirdLoanCards.length > 0}
        onExpandAll={handleExpandAllLoans}
        onMinimizeAll={handleMinimizeAllLoans}
      />

      {/* Render Loan Cards */}
      {loanCards.length > 0 && (
        <div className="space-y-4">
          {/* Refinance Loan Cards - Render First */}
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

          {/* Primary Loan Cards */}
          {loanCards
            .filter(loan => loan.type === 'primary')
            .map(loan => (
              <PrimaryLoanCard
                key={loan.id}
                loanId={loan.id}
                onRemove={handleRemoveLoanCard}
                onAdd={handleAddPrimaryLoan}
                currentCount={primaryLoansCount}
                maxCount={2}
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