import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
}

const LoanManagement = ({
  handleLoanTypeChange,
  hasNewRefinanceLoan,
  hasNewPurchaseLoan,
  hasCurrentPrimaryLoan,
  hasCurrentSecondLoan,
  hasCurrentThirdLoan
}: LoanManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan List</CardTitle>
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
              
              {/* Empty space for 4-column grid alignment */}
              <div></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanManagement;