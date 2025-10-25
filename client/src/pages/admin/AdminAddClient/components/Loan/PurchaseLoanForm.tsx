import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import ToggleAmountInput from '../ToggleAmountInput';
import PurchaseLoanRateDetails from './PurchaseLoanRateDetails';
import {
  LOAN_CATEGORY_OPTIONS,
  DOC_TYPE_OPTIONS,
  LOAN_TERM_OPTIONS,
  PREPAYMENT_PENALTY_OPTIONS
} from '../../data/formOptions';

interface PurchaseLoanFormProps {
  loanId: string;
}

const PurchaseLoanForm = ({ loanId }: PurchaseLoanFormProps) => {
  const form = useFormContext();

  // Always use bbb prefix for purchase loans (matching original code)
  const fieldPrefix = 'newPurchaseLoan';

  // Purchase-specific loan purpose options
  const PURCHASE_LOAN_PURPOSE_OPTIONS = [
    { value: 'select', label: 'Select' },
    { value: 'existing-build', label: 'Existing Build' },
    { value: 'new-build', label: 'New Build' }
  ];

  return (
    <div className="space-y-6">
      {/* First Row: Lender Name, Loan Number, Loan Category, Loan Purpose, Doc Type */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <FormInput
          label="Lender Name"
          value={form.watch(`${fieldPrefix}.lenderName` as any) || ''}
          onChange={(value) => form.setValue(`${fieldPrefix}.lenderName` as any, value)}
          id={`${fieldPrefix}-lenderName`}
          testId={`input-${fieldPrefix}-lenderName`}
          className="space-y-2"
        />

        <FormInput
          label="Loan Number"
          value={form.watch(`${fieldPrefix}.loanNumber` as any) || ''}
          onChange={(value) => form.setValue(`${fieldPrefix}.loanNumber` as any, value)}
          id={`${fieldPrefix}-loanNumber`}
          testId={`input-${fieldPrefix}-loanNumber`}
          className="space-y-2"
        />

        <FormSelect
          label="Loan Category"
          value={form.watch(`${fieldPrefix}.loanCategory` as any) || 'select'}
          onValueChange={(value) => form.setValue(`${fieldPrefix}.loanCategory` as any, value)}
          options={LOAN_CATEGORY_OPTIONS}
          placeholder="Select"
          testId={`select-${fieldPrefix}-loanCategory`}
          className="space-y-2"
        />

        <FormSelect
          label="Loan Purpose"
          value={form.watch(`${fieldPrefix}.loanPurpose` as any) || 'select'}
          onValueChange={(value) => form.setValue(`${fieldPrefix}.loanPurpose` as any, value)}
          options={PURCHASE_LOAN_PURPOSE_OPTIONS}
          placeholder="Select"
          testId={`select-${fieldPrefix}-loanPurpose`}
          className="space-y-2"
        />

        <FormSelect
          label="Doc Type"
          value={form.watch(`${fieldPrefix}.docType` as any) || 'select'}
          onValueChange={(value) => form.setValue(`${fieldPrefix}.docType` as any, value)}
          options={DOC_TYPE_OPTIONS}
          placeholder="Select"
          testId={`select-${fieldPrefix}-docType`}
          className="space-y-2"
        />
      </div>

      {/* Second Row: New Loan Amount, Loan Term, Pre-Payment Penalty, Lender Credit, Seller Credit */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <ToggleAmountInput
          fieldPrefix={fieldPrefix}
          fieldName="loanAmount"
          defaultLabel="New Loan Amount"
          testId={`input-${fieldPrefix}-loanAmount`}
          className="space-y-2"
          showToggle={false}
        />

        <FormSelect
          label="Loan Term"
          value={form.watch(`${fieldPrefix}.loanTerm` as any) || 'select'}
          onValueChange={(value) => form.setValue(`${fieldPrefix}.loanTerm` as any, value)}
          options={LOAN_TERM_OPTIONS}
          placeholder="Select"
          testId={`select-${fieldPrefix}-loanTerm`}
          className="space-y-2"
        />

        <FormSelect
          label="Pre-Payment Penalty"
          value={form.watch(`${fieldPrefix}.prepaymentPenalty` as any) || 'select'}
          onValueChange={(value) => form.setValue(`${fieldPrefix}.prepaymentPenalty` as any, value)}
          options={PREPAYMENT_PENALTY_OPTIONS}
          placeholder="Select"
          testId={`select-${fieldPrefix}-prepaymentPenalty`}
          className="space-y-2"
        />

        <ToggleAmountInput
          fieldPrefix={fieldPrefix}
          fieldName="lenderCredit"
          toggleFieldName="brokerCreditToggle"
          defaultLabel="Lender Credit"
          toggledLabel="Broker Credit"
          testId={`input-${fieldPrefix}-lenderCredit`}
          className="space-y-2"
        />

        <ToggleAmountInput
          fieldPrefix={fieldPrefix}
          fieldName="cashOutAmount"
          toggleFieldName="cashOutAmountToggle"
          defaultLabel="Seller Credit"
          toggledLabel="Other Credit"
          testId={`input-${fieldPrefix}-cashOutAmount`}
          className="space-y-2"
        />
      </div>

      {/* Row 3 & 4: Rate Details - Mid FICO through Attached to Property */}
      <PurchaseLoanRateDetails />
    </div>
  );
};

export default PurchaseLoanForm;
