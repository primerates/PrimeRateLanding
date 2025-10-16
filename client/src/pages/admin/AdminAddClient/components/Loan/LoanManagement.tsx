import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import FormCheckbox from '../FormCheckbox';

export type LoanType = 'new-refinance' | 'new-purchase' | 'new-second' | 'new-second-purchase' | 'current-primary' | 'current-second' | 'current-third';

interface LoanManagementProps {
  // Generic loan handler
  handleLoanTypeChange: (checked: boolean, loanType: LoanType) => void;

  // Checked states
  hasNewRefinanceLoan: boolean;
  hasNewPurchaseLoan: boolean;
  hasCurrentPrimaryLoan: boolean;
  hasCurrentSecondLoan: boolean;
  hasCurrentThirdLoan: boolean;

  // Expand/collapse handlers
  onExpandAll?: () => void;
  onMinimizeAll?: () => void;
}

const LoanManagement = ({
  handleLoanTypeChange,
  hasNewRefinanceLoan,
  hasNewPurchaseLoan,
  hasCurrentPrimaryLoan,
  hasCurrentSecondLoan,
  hasCurrentThirdLoan,
  onExpandAll,
  onMinimizeAll
}: LoanManagementProps) => {
  return (
    <Card className="transition-all duration-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Loan List</CardTitle>
          <div className="flex items-center gap-2">
            {/* Only show buttons if handlers are provided */}
            {onExpandAll && onMinimizeAll && (
              <>
                {/* Expand All Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onExpandAll}
                  className="text-gray-600 hover:bg-blue-500 hover:text-white"
                  title="Expand All Loan Cards"
                  data-testid="button-expand-all-loans"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                {/* Minimize All Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onMinimizeAll}
                  className="text-gray-600 hover:bg-orange-500 hover:text-white"
                  title="Minimize All Loan Cards"
                  data-testid="button-minimize-all-loans"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* First Row - New Loans */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormCheckbox
                id="property-type-abc-loan-tab"
                label="New Refinance Loan"
                checked={hasNewRefinanceLoan}
                onCheckedChange={(checked) => handleLoanTypeChange(checked, 'new-refinance')}
                testId="checkbox-property-abc-loan-tab"
              />

              <FormCheckbox
                id="property-type-bbb-loan-tab"
                label="New Purchase Loan"
                checked={hasNewPurchaseLoan}
                onCheckedChange={(checked) => handleLoanTypeChange(checked, 'new-purchase')}
                testId="checkbox-property-bbb-loan-tab"
              />

              <FormCheckbox
                id="property-type-second-home-loan-tab"
                label="New Second Loan"
                checked={false}
                onCheckedChange={(checked) => handleLoanTypeChange(checked, 'new-second')}
                disabled={true}
                testId="checkbox-property-second-home-loan-tab"
              />

              <FormCheckbox
                id="property-type-investment-loan-tab"
                label="New Second + Purchase Loan"
                checked={false}
                onCheckedChange={(checked) => handleLoanTypeChange(checked, 'new-second-purchase')}
                disabled={true}
                testId="checkbox-property-investment-loan-tab"
              />
            </div>
          </div>

          {/* Second Row - Current/Existing Loans */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormCheckbox
                id="current-primary-loan-tab"
                label="Existing Primary Loan"
                checked={hasCurrentPrimaryLoan}
                onCheckedChange={(checked) => handleLoanTypeChange(checked, 'current-primary')}
                testId="checkbox-current-primary-loan-tab"
              />

              <FormCheckbox
                id="current-second-loan-tab"
                label="Existing Second Loan"
                checked={hasCurrentSecondLoan}
                onCheckedChange={(checked) => handleLoanTypeChange(checked, 'current-second')}
                testId="checkbox-current-second-loan-tab"
              />

              <FormCheckbox
                id="current-third-loan-tab"
                label="Existing Third Loan"
                checked={hasCurrentThirdLoan}
                onCheckedChange={(checked) => handleLoanTypeChange(checked, 'current-third')}
                testId="checkbox-current-third-loan-tab"
              />

              <FormCheckbox
                id="brand-new-loan-tab"
                label="Other"
                checked={false}
                onCheckedChange={(checked) => handleLoanTypeChange(checked, 'current-third')}
                disabled={true}
                testId="checkbox-brand-new-loan-tab"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanManagement;