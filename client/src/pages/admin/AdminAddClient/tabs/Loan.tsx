import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import LoanHeader from '../components/Loan/LoanHeader';
import LoanManagement, { type LoanType } from '../components/Loan/LoanManagement';
import RefinanceLoanCard from '../components/Loan/RefinanceLoanCard';
import PrimaryLoanCard from '../components/Loan/PrimaryLoanCard';

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

  // Separate state for each loan type - matching original architecture
  const [newRefinanceLoanCards, setNewRefinanceLoanCards] = useState<string[]>([]);
  const [newPurchaseLoanCards, setNewPurchaseLoanCards] = useState<string[]>([]);
  const [currentPrimaryLoans, setCurrentPrimaryLoans] = useState<string[]>([]);

  // Separate collapsible/expanded states for each loan type
  const [newRefinanceLoanCardStates, setNewRefinanceLoanCardStates] = useState<Record<string, boolean>>({});
  const [newPurchaseLoanCardStates, setNewPurchaseLoanCardStates] = useState<Record<string, boolean>>({});
  const [currentPrimaryLoanCardStates, setCurrentPrimaryLoanCardStates] = useState<Record<string, boolean>>({});

  // Generic loan type handler
  const handleLoanTypeChange = (checked: boolean, loanType: LoanType) => {
    console.log(`Loan ${loanType}:`, checked);

    if (checked) {
      // Add new loan card
      if (loanType === 'new-refinance') {
        const newLoanId = `refinance-${Date.now()}`;
        setNewRefinanceLoanCards(prev => [...prev, newLoanId]);
        setNewRefinanceLoanCardStates(prev => ({ ...prev, [newLoanId]: true }));
      } else if (loanType === 'new-purchase') {
        const newLoanId = `purchase-${Date.now()}`;
        setNewPurchaseLoanCards(prev => [...prev, newLoanId]);
        setNewPurchaseLoanCardStates(prev => ({ ...prev, [newLoanId]: true }));
      } else if (loanType === 'current-primary') {
        const newLoanId = `primary-${Date.now()}`;
        setCurrentPrimaryLoans(prev => [...prev, newLoanId]);
        setCurrentPrimaryLoanCardStates(prev => ({ ...prev, [newLoanId]: true }));
      }
      // TODO: Implement other loan types (second, second+purchase, existing loans)
    } else {
      // Remove loan cards of the specific type and clear form data
      if (loanType === 'new-refinance') {
        // Clear refinance loan data
        form.setValue('abc' as any, undefined);
        setNewRefinanceLoanCards([]);
        setNewRefinanceLoanCardStates({});
      } else if (loanType === 'new-purchase') {
        // Clear purchase loan data if applicable
        setNewPurchaseLoanCards([]);
        setNewPurchaseLoanCardStates({});
      } else if (loanType === 'current-primary') {
        // Clear all primary loan data
        currentPrimaryLoans.forEach(loanId => {
          form.setValue(`currentLoan.${loanId}` as any, undefined);
        });
        setCurrentPrimaryLoans([]);
        setCurrentPrimaryLoanCardStates({});
      }
      // TODO: Implement removal for other loan types
    }
  };

  const handleRemoveLoanCard = (loanId: string) => {
    // Determine loan type from loanId prefix
    if (loanId.startsWith('primary-')) {
      // Clear primary loan data
      form.setValue(`currentLoan.${loanId}` as any, undefined);
      // Remove from primary loans
      setCurrentPrimaryLoans(prev => prev.filter(id => id !== loanId));
      setCurrentPrimaryLoanCardStates(prev => {
        const { [loanId]: _, ...rest } = prev;
        return rest;
      });
    } else if (loanId.startsWith('refinance-')) {
      // Clear refinance loan data (uses 'abc' prefix)
      form.setValue('abc' as any, undefined);
      // Remove from refinance loans
      setNewRefinanceLoanCards(prev => prev.filter(id => id !== loanId));
      setNewRefinanceLoanCardStates(prev => {
        const { [loanId]: _, ...rest } = prev;
        return rest;
      });
    } else if (loanId.startsWith('purchase-')) {
      // Clear purchase loan data if applicable
      // Remove from purchase loans
      setNewPurchaseLoanCards(prev => prev.filter(id => id !== loanId));
      setNewPurchaseLoanCardStates(prev => {
        const { [loanId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleAddPrimaryLoan = () => {
    if (currentPrimaryLoans.length < 2) {
      const newLoanId = `primary-${Date.now()}`;
      setCurrentPrimaryLoans(prev => [...prev, newLoanId]);
      setCurrentPrimaryLoanCardStates(prev => ({ ...prev, [newLoanId]: true }));
    }
  };

  const handleLoanCardExpandChange = (loanId: string, expanded: boolean) => {
    // Update the appropriate state based on loan type
    if (loanId.startsWith('primary-')) {
      setCurrentPrimaryLoanCardStates(prev => ({ ...prev, [loanId]: expanded }));
    } else if (loanId.startsWith('refinance-')) {
      setNewRefinanceLoanCardStates(prev => ({ ...prev, [loanId]: expanded }));
    } else if (loanId.startsWith('purchase-')) {
      setNewPurchaseLoanCardStates(prev => ({ ...prev, [loanId]: expanded }));
    }
  };

  // Get current state of loans for checkboxes
  const hasNewRefinanceLoan = newRefinanceLoanCards.length > 0;
  const hasNewPurchaseLoan = newPurchaseLoanCards.length > 0;
  const hasCurrentPrimaryLoan = currentPrimaryLoans.length > 0;

  // Get count of primary loans
  const primaryLoansCount = currentPrimaryLoans.length;

  // Expand/collapse handlers
  const handleExpandAllLoans = () => {
    // Expand all refinance loans
    const expandedRefinance: Record<string, boolean> = {};
    newRefinanceLoanCards.forEach(id => { expandedRefinance[id] = true; });
    setNewRefinanceLoanCardStates(expandedRefinance);

    // Expand all purchase loans
    const expandedPurchase: Record<string, boolean> = {};
    newPurchaseLoanCards.forEach(id => { expandedPurchase[id] = true; });
    setNewPurchaseLoanCardStates(expandedPurchase);

    // Expand all primary loans
    const expandedPrimary: Record<string, boolean> = {};
    currentPrimaryLoans.forEach(id => { expandedPrimary[id] = true; });
    setCurrentPrimaryLoanCardStates(expandedPrimary);
  };

  const handleMinimizeAllLoans = () => {
    // Minimize all refinance loans
    const minimizedRefinance: Record<string, boolean> = {};
    newRefinanceLoanCards.forEach(id => { minimizedRefinance[id] = false; });
    setNewRefinanceLoanCardStates(minimizedRefinance);

    // Minimize all purchase loans
    const minimizedPurchase: Record<string, boolean> = {};
    newPurchaseLoanCards.forEach(id => { minimizedPurchase[id] = false; });
    setNewPurchaseLoanCardStates(minimizedPurchase);

    // Minimize all primary loans
    const minimizedPrimary: Record<string, boolean> = {};
    currentPrimaryLoans.forEach(id => { minimizedPrimary[id] = false; });
    setCurrentPrimaryLoanCardStates(minimizedPrimary);
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
        hasNewRefinanceLoan={hasNewRefinanceLoan}
        hasNewPurchaseLoan={hasNewPurchaseLoan}
        hasCurrentPrimaryLoan={hasCurrentPrimaryLoan}
        hasCurrentSecondLoan={currentSecondLoanCards.length > 0}
        hasCurrentThirdLoan={currentThirdLoanCards.length > 0}
        onExpandAll={handleExpandAllLoans}
        onMinimizeAll={handleMinimizeAllLoans}
      />

      {/* Render Loan Cards */}
      {(newRefinanceLoanCards.length > 0 || newPurchaseLoanCards.length > 0 || currentPrimaryLoans.length > 0) && (
        <div className="space-y-4">
          {/* Refinance Loan Cards - Render First */}
          {newRefinanceLoanCards.map(loanId => (
            <RefinanceLoanCard
              key={loanId}
              loanId={loanId}
              onRemove={handleRemoveLoanCard}
              expanded={newRefinanceLoanCardStates[loanId] ?? true}
              onExpandChange={(expanded: boolean) => handleLoanCardExpandChange(loanId, expanded)}
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
              maxCount={2}
              expanded={currentPrimaryLoanCardStates[loanId] ?? true}
              onExpandChange={(expanded: boolean) => handleLoanCardExpandChange(loanId, expanded)}
            />
          ))}

          {/* Purchase Loan Cards - if implemented */}
          {/* TODO: Add purchase loan card rendering when implemented */}
        </div>
      )}
    </div>
  );
};

export default LoanTab;