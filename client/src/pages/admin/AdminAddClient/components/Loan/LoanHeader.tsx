import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { type InsertClient } from '@shared/schema';
import CircularMetric from '../CircularMetric';

interface LoanHeaderProps {
  showLoanAnimation?: boolean;
  newRefinanceLoanCards?: string[];
  newPurchaseLoanCards?: string[];
}

const LoanHeader = ({
  showLoanAnimation = false,
  newRefinanceLoanCards = [],
  newPurchaseLoanCards = []
}: LoanHeaderProps) => {
  const form = useFormContext<InsertClient>();

  // Current Loan Purpose calculation
  const getCurrentLoanPurpose = () => {
    const loanPurpose = form.watch('currentLoan.loanPurpose') || '';
    
    if (!loanPurpose || loanPurpose.trim() === '' || loanPurpose === 'select') {
      return 'TBD';
    }
    
    // Apply mapping rules based on original code
    switch (loanPurpose) {
      case 'cash-out-refinance': return 'Cash Out';
      case 'rate-term-refinance': return 'Rate & Term';
      case 'term-reduction': return 'Term Reduction';
      case 'purchase': return 'Purchase';
      default: return loanPurpose
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  };

  // Calculate new loans count
  const getNewLoansCount = () => {
    return newRefinanceLoanCards.length + newPurchaseLoanCards.length;
  };

  return (
    <Card className="transition-all duration-700">
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
        <div className="space-y-2">
          <Label className="text-lg font-semibold">Loan Purpose</Label>
          <div className="mt-24">
            <span 
              className="text-muted-foreground" 
              style={{ 
                fontSize: '28px', 
                color: '#1a3373', 
                fontWeight: 'bold' 
              }}
            >
              {getCurrentLoanPurpose()}
            </span>
          </div>
        </div>
        
        <CircularMetric
          label="New Loans"
          value={getNewLoansCount()}
          showAnimation={showLoanAnimation}
          testId="text-current-loan-balance"
        />
        
        <CircularMetric
          label="Loan Category"
          value={0}
          showAnimation={showLoanAnimation}
          testId="text-new-loan-amount"
        />
        
        <CircularMetric
          label="Existing Loans"
          value={0}
          showAnimation={showLoanAnimation}
          testId="text-loan-term"
        />
      </CardContent>
    </Card>
  );
};

export default LoanHeader;