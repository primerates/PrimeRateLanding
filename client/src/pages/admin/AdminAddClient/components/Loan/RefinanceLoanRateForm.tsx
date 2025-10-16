import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import ToggleAmountInput from '../ToggleAmountInput';
import {
  LOAN_CATEGORY_OPTIONS,
  LOAN_PURPOSE_OPTIONS,
  DOC_TYPE_OPTIONS,
  LOAN_TERM_OPTIONS,
  PREPAYMENT_PENALTY_OPTIONS,
  RATE_LOCK_STATUS_OPTIONS
} from '../../data/formOptions';

interface RefinanceLoanFormProps {
  loanId: string;
}

const RefinanceLoanRateForm = ({ loanId }: RefinanceLoanFormProps) => {
  const form = useFormContext();

  // Always use abc prefix for refinance loans (matching original code)
  const fieldPrefix = 'abc';

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
          options={LOAN_PURPOSE_OPTIONS}
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

      {/* Second Row: New Loan Amount, Loan Term, Cash Out/Benefits, Total Debt Pay Off, Pre-Payment Penalty */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <ToggleAmountInput
          fieldPrefix={fieldPrefix}
          fieldName="loanBalance"
          defaultLabel="New Loan Amount"
          testId={`input-${fieldPrefix}-loanBalance`}
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

        <ToggleAmountInput
          fieldPrefix={fieldPrefix}
          fieldName="cashOutAmount"
          toggleFieldName="cashOutAmountToggle"
          defaultLabel="Cash Out Amount"
          toggledLabel="Benefits Summary"
          testId={`input-${fieldPrefix}-cashOutAmount`}
          className="space-y-2"
        />

        <ToggleAmountInput
          fieldPrefix={fieldPrefix}
          fieldName="totalDebtPayOff"
          toggleFieldName="totalDebtPayOffToggle"
          defaultLabel="Total Debt Pay Off"
          toggledLabel="Total Debt Pay Off Payments"
          testId={`input-${fieldPrefix}-totalDebtPayOff`}
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
      </div>

      {/* Row 3: Mid FICO, Rate Lock Status, Rate Lock Date, Rate Lock Expiration, Lender Credit/Broker Credit */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <FormInput
          label="Mid FICO"
          value={form.watch(`${fieldPrefix}.midFico` as any) || ''}
          onChange={(value) => form.setValue(`${fieldPrefix}.midFico` as any, value)}
          id={`${fieldPrefix}-midFico`}
          testId={`input-${fieldPrefix}-midFico`}
          className="space-y-2"
          type="number"
        />

        <FormSelect
          label="Rate Lock Status"
          value={form.watch(`${fieldPrefix}.rateLockStatus` as any) || 'select'}
          onValueChange={(value) => form.setValue(`${fieldPrefix}.rateLockStatus` as any, value)}
          options={RATE_LOCK_STATUS_OPTIONS}
          placeholder="Select"
          testId={`select-${fieldPrefix}-rateLockStatus`}
          className="space-y-2"
        />

        <FormInput
          label="Rate Lock Date"
          value={form.watch(`${fieldPrefix}.rateLockDate` as any) || ''}
          onChange={(value) => form.setValue(`${fieldPrefix}.rateLockDate` as any, value)}
          id={`${fieldPrefix}-rateLockDate`}
          testId={`input-${fieldPrefix}-rateLockDate`}
          className="space-y-2"
          type="date"
        />

        <FormInput
          label="Rate Lock Expiration"
          value={form.watch(`${fieldPrefix}.rateLockExpiration` as any) || ''}
          onChange={(value) => form.setValue(`${fieldPrefix}.rateLockExpiration` as any, value)}
          id={`${fieldPrefix}-rateLockExpiration`}
          testId={`input-${fieldPrefix}-rateLockExpiration`}
          className="space-y-2"
          type="date"
        />

        <ToggleAmountInput
          fieldPrefix={fieldPrefix}
          fieldName="lenderCredit"
          toggleFieldName="lenderCreditToggle"
          defaultLabel="Lender Credit"
          toggledLabel="Broker Credit"
          testId={`input-${fieldPrefix}-lenderCredit`}
          className="space-y-2"
        />
      </div>
    </div>
  );
};

export default RefinanceLoanRateForm;