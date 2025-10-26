import { useState } from 'react';

/**
 * Custom hook to manage all rate-related values and monetary inputs
 */
export const useRateValues = () => {
  // Rate values state
  const [rateValues, setRateValues] = useState<string[]>(Array(4).fill(''));
  const [editingRateIndex, setEditingRateIndex] = useState<number | null>(null);

  // Existing Loan Balance state
  const [existingLoanBalanceValues, setExistingLoanBalanceValues] = useState<string[]>(Array(4).fill(''));
  const [isExistingLoanBalanceSameMode, setIsExistingLoanBalanceSameMode] = useState(false);

  // Cash Out Amount state
  const [cashOutAmountValues, setCashOutAmountValues] = useState<string[]>(Array(4).fill(''));
  const [isCashOutSameMode, setIsCashOutSameMode] = useState(false);

  // Rate Buy Down state
  const [rateBuyDownValues, setRateBuyDownValues] = useState<string[]>(Array(4).fill(''));

  // VA Funding Fee / FHA MIP state
  const [vaFundingFeeValues, setVaFundingFeeValues] = useState<string[]>(Array(4).fill(''));
  const [fhaUpfrontMipValue, setFhaUpfrontMipValue] = useState('0');

  // Pay Off Interest state
  const [payOffInterestValues, setPayOffInterestValues] = useState<string[]>(Array(4).fill(''));

  // New Est. Loan Amount & New Monthly Payment state
  const [newEstLoanAmountValues, setNewEstLoanAmountValues] = useState<string[]>(Array(4).fill(''));
  const [newMonthlyPaymentValues, setNewMonthlyPaymentValues] = useState<string[]>(Array(4).fill(''));

  // Total Monthly Savings state
  const [totalMonthlySavingsValues, setTotalMonthlySavingsValues] = useState<string[]>(Array(4).fill(''));

  // Collapse/expand states
  const [isMonthlyPaymentRowExpanded, setIsMonthlyPaymentRowExpanded] = useState(true);
  const [isSavingsRowExpanded, setIsSavingsRowExpanded] = useState(true);

  return {
    // Rate values
    rateValues,
    setRateValues,
    editingRateIndex,
    setEditingRateIndex,

    // Existing Loan Balance
    existingLoanBalanceValues,
    setExistingLoanBalanceValues,
    isExistingLoanBalanceSameMode,
    setIsExistingLoanBalanceSameMode,

    // Cash Out
    cashOutAmountValues,
    setCashOutAmountValues,
    isCashOutSameMode,
    setIsCashOutSameMode,

    // Rate Buy Down
    rateBuyDownValues,
    setRateBuyDownValues,

    // VA/FHA
    vaFundingFeeValues,
    setVaFundingFeeValues,
    fhaUpfrontMipValue,
    setFhaUpfrontMipValue,

    // Pay Off Interest
    payOffInterestValues,
    setPayOffInterestValues,

    // Loan Amount & Payment
    newEstLoanAmountValues,
    setNewEstLoanAmountValues,
    newMonthlyPaymentValues,
    setNewMonthlyPaymentValues,

    // Savings
    totalMonthlySavingsValues,
    setTotalMonthlySavingsValues,

    // Expand/collapse
    isMonthlyPaymentRowExpanded,
    setIsMonthlyPaymentRowExpanded,
    isSavingsRowExpanded,
    setIsSavingsRowExpanded,
  };
};
