import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { type InsertClient } from '@shared/schema';
import CircularMetric from '../CircularMetric';

interface LoanHeaderProps {
  showLoanAnimation?: boolean;
  newRefinanceLoanCards?: string[];
  newPurchaseLoanCards?: string[];
  currentPrimaryLoans?: string[];
  currentSecondLoans?: string[];
  currentThirdLoans?: string[];
}

const LoanHeader = ({
  showLoanAnimation = false,
  newRefinanceLoanCards = [],
  newPurchaseLoanCards = [],
  currentPrimaryLoans = [],
  currentSecondLoans = [],
  currentThirdLoans = []
}: LoanHeaderProps) => {
  const form = useFormContext<InsertClient>();

  // Current Loan Purpose calculation
  const getCurrentLoanPurpose = () => {
    // Only show loan purpose value if refinance or purchase loan is selected
    const hasRefinanceOrPurchase = newRefinanceLoanCards.length > 0 || newPurchaseLoanCards.length > 0;

    if (!hasRefinanceOrPurchase) {
      return '';
    }

    // Get loan purpose from refinance loan (abc) or purchase loan (bbb)
    const refinanceLoanPurpose = form.watch('abc.loanPurpose' as any) || '';
    const purchaseLoanPurpose = form.watch('bbb.loanPurpose' as any) || '';

    // Use refinance loan purpose if available, otherwise use purchase loan purpose
    const loanPurpose = refinanceLoanPurpose || purchaseLoanPurpose;

    if (!loanPurpose || (typeof loanPurpose === 'string' && loanPurpose.trim() === '') || loanPurpose === 'select') {
      return '';
    }

    // Apply mapping rules based on original code
    const purposeStr = String(loanPurpose);
    switch (purposeStr) {
      case 'cash-out-refinance': return 'Cash Out';
      case 'rate-term-refinance': return 'Rate & Term';
      case 'term-reduction': return 'Term Reduction';
      case 'purchase': return 'Purchase';
      case 'refinance-rate-term': return 'Rate & Term';
      case 'refinance-cash-out': return 'Cash Out';
      default: return purposeStr
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  };

  // Calculate new loans count
  const getNewLoansCount = () => {
    return newRefinanceLoanCards.length + newPurchaseLoanCards.length;
  };

  // Calculate existing loans count
  const getExistingLoansCount = () => {
    return currentPrimaryLoans.length + currentSecondLoans.length + currentThirdLoans.length;
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
          value={getExistingLoansCount()}
          showAnimation={showLoanAnimation}
          testId="text-loan-term"
        />
      </CardContent>
    </Card>
  );
};

export default LoanHeader;