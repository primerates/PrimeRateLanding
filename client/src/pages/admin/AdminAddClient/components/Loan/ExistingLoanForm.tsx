import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import ExistingLoanRateDetails from './ExistingLoanRateDetails';

interface ExistingLoanFormProps {
  loanId: string;
  loanType: 'second' | 'third';
}

const LOAN_CATEGORY_OPTIONS = [
  { value: 'select', label: 'Select' },
  { value: 'heloc', label: 'HELOC' },
  { value: 'fixed', label: 'FIXED' }
];

const LOAN_TERM_OPTIONS = [
  { value: 'select', label: 'Select' },
  { value: 'heloc', label: 'HELOC' },
  { value: 'fixed-second-loan', label: 'Fixed Second Loan' },
  { value: 'adjustable-second-loan', label: 'Adjustable Second Loan' },
  { value: 'home-improvement-loan', label: 'Home Improvement Loan' },
  { value: 'other', label: 'Other' }
];

const LOAN_DURATION_OPTIONS = [
  { value: 'select', label: 'Select' },
  { value: '30-years', label: '30 Years' },
  { value: '25-years', label: '25 Years' },
  { value: '20-years', label: '20 Years' },
  { value: '15-years', label: '15 Years' },
  { value: '10-years', label: '10 Years' }
];

const ExistingLoanForm = ({ loanId, loanType }: ExistingLoanFormProps) => {
  const form = useFormContext();

  // Use unique field prefix based on loan type and loanId
  // second loans use `currentSecondLoan.${loanId}`, third loans use `currentThirdLoan.${loanId}`
  const fieldPrefix = loanType === 'second' ? `currentSecondLoan.${loanId}` : `currentThirdLoan.${loanId}`;

  return (
    <div className="space-y-6">
      {/* Row 1: Lender Name, Loan Number, Loan Category, Loan Term, Loan Duration */}
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
          label="Loan Category"
          value={form.watch(`${fieldPrefix}.loanCategory` as any) || 'select'}
          onValueChange={(value) => form.setValue(`${fieldPrefix}.loanCategory` as any, value)}
          options={LOAN_CATEGORY_OPTIONS}
          placeholder="Select"
          testId={`select-${loanId}-loanCategory`}
          className="space-y-2"
        />

        <FormSelect
          label="Loan Term"
          value={form.watch(`${fieldPrefix}.loanProgram` as any) || 'select'}
          onValueChange={(value) => form.setValue(`${fieldPrefix}.loanProgram` as any, value)}
          options={LOAN_TERM_OPTIONS}
          placeholder="Select"
          testId={`select-${loanId}-loanProgram`}
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
      </div>

      {/* Row 2: Rate Details */}
      <ExistingLoanRateDetails loanId={loanId} loanType={loanType} />
    </div>
  );
};

export default ExistingLoanForm;
