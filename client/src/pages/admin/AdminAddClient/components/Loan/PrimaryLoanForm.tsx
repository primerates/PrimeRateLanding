import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormInput from '../FormInput';
import DateInput from '../DateInput';
import FormSelect from '../FormSelect';
import CurrencyInputWithToggle from '../CurrencyInputWithToggle';
import PrimaryLoanRateDetails from './PrimaryLoanRateDetails';
import {
  LOAN_CATEGORY_OPTIONS,
  PREPAYMENT_PENALTY_OPTIONS
} from '../../data/formOptions';

interface PrimaryLoanFormProps {
  loanId: string;
}

const LOAN_PURPOSE_OPTIONS = [
  { value: 'select', label: 'Select' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'refinance-rate-term', label: 'Refinance Rate & Term' },
  { value: 'refinance-cash-out', label: 'Refinance Cash Out' },
  { value: 'construction', label: 'Construction' },
  { value: 'other', label: 'Other' }
];

const LOAN_TERM_OPTIONS = [
  { value: 'select', label: 'Select' },
  { value: 'fixed-rate', label: 'Fixed Rate' },
  { value: 'adjustable', label: 'Adjustable' },
  { value: 'other', label: 'Other' }
];

const LOAN_DURATION_OPTIONS = [
  { value: 'select', label: 'Select' },
  { value: '30-years', label: '30 years' },
  { value: '25-years', label: '25 years' },
  { value: '20-years', label: '20 years' },
  { value: '15-years', label: '15 years' },
  { value: '10-years', label: '10 years' },
  { value: 'other', label: 'Other' }
];

const PrimaryLoanForm = ({ loanId }: PrimaryLoanFormProps) => {
  const form = useFormContext();

  // Use unique field prefix for each primary loan based on loanId
  const fieldPrefix = `currentLoan.${loanId}`;

  return (
    <div className="space-y-6">
      {/* Row 1: Lender Name, Loan Number, Loan Purpose, Loan Start Date, Remaining Term */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <FormInput
          label="Lender Name"
          value={form.watch(`${fieldPrefix}.lenderName` as any) || ''}
          onChange={(value) => form.setValue(`${fieldPrefix}.lenderName` as any, value)}
          id={`${loanId}-lenderName`}
          testId={`input-${loanId}-lenderName`}
          className="space-y-2"
        />

        <FormInput
          label="Loan Number"
          value={form.watch(`${fieldPrefix}.loanNumber` as any) || ''}
          onChange={(value) => form.setValue(`${fieldPrefix}.loanNumber` as any, value)}
          id={`${loanId}-loanNumber`}
          testId={`input-${loanId}-loanNumber`}
          className="space-y-2"
        />

        <FormSelect
          label="Loan Purpose"
          value={form.watch(`${fieldPrefix}.loanPurpose` as any) || 'select'}
          onValueChange={(value) => form.setValue(`${fieldPrefix}.loanPurpose` as any, value)}
          options={LOAN_PURPOSE_OPTIONS}
          placeholder="Select"
          testId={`select-${loanId}-loanPurpose`}
          className="space-y-2"
        />

        <DateInput
          label="Loan Start Date"
          value={form.watch(`${fieldPrefix}.loanStartDate` as any) || ''}
          onChange={(value) => form.setValue(`${fieldPrefix}.loanStartDate` as any, value)}
          id={`${loanId}-loanStartDate`}
          testId={`input-${loanId}-loanStartDate`}
          className="space-y-2"
        />

        <FormInput
          label="Remaining Term On Credit Report"
          value={form.watch(`${fieldPrefix}.remainingTerm` as any) || ''}
          onChange={(value) => form.setValue(`${fieldPrefix}.remainingTerm` as any, value)}
          id={`${loanId}-remainingTerm`}
          placeholder="Years/Months"
          testId={`input-${loanId}-remainingTerm`}
          className="space-y-2"
        />
      </div>

      {/* Row 2: Loan Category, Loan Balance, Loan Term, Loan Duration, Pre-Payment Penalty */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <FormSelect
          label="Loan Category"
          value={form.watch(`${fieldPrefix}.loanCategory` as any) || 'select'}
          onValueChange={(value) => form.setValue(`${fieldPrefix}.loanCategory` as any, value)}
          options={LOAN_CATEGORY_OPTIONS}
          placeholder="Select"
          testId={`select-${loanId}-loanCategory`}
          className="space-y-2"
        />

        <CurrencyInputWithToggle
          fieldPrefix={fieldPrefix}
          fieldName="loanBalance"
          defaultLabel="Loan Balance"
          testId={`input-${loanId}-loanBalance`}
          showToggle={false}
        />

        <FormSelect
          label="Loan Term"
          value={form.watch(`${fieldPrefix}.loanTerm` as any) || 'select'}
          onValueChange={(value) => form.setValue(`${fieldPrefix}.loanTerm` as any, value)}
          options={LOAN_TERM_OPTIONS}
          placeholder="Select"
          testId={`select-${loanId}-loanTerm`}
          className="space-y-2"
        />

        <FormSelect
          label="Loan Duration"
          value={form.watch(`${fieldPrefix}.loanDuration` as any) || 'select'}
          onValueChange={(value) => form.setValue(`${fieldPrefix}.loanDuration` as any, value)}
          options={LOAN_DURATION_OPTIONS}
          placeholder="Select"
          testId={`select-${loanId}-loanDuration`}
          className="space-y-2"
        />

        <FormSelect
          label="Pre-Payment Penalty"
          value={form.watch(`${fieldPrefix}.prepaymentPenalty` as any) || 'select'}
          onValueChange={(value) => form.setValue(`${fieldPrefix}.prepaymentPenalty` as any, value)}
          options={PREPAYMENT_PENALTY_OPTIONS}
          placeholder="Select"
          testId={`select-${loanId}-prepaymentPenalty`}
          className="space-y-2"
        />
      </div>

      {/* Row 3: Rate Details */}
      <PrimaryLoanRateDetails loanId={loanId} />
    </div>
  );
};

export default PrimaryLoanForm;
