import { useMemo } from 'react';

interface FhaMipCalculationsProps {
  fhaMipLoanStartMonthYear: string;
  fhaMipStartingLoanBalance: string;
  fhaMipCostFactor: string;
  fhaMipRemainingMonths: string;
  fhaNewLoanAmount: string;
  fhaNewMipCostFactor: string;
}

/**
 * Custom hook for FHA MIP calculations
 * Calculates various FHA Upfront MIP values based on input parameters
 */
export const useFhaMipCalculations = ({
  fhaMipLoanStartMonthYear,
  fhaMipStartingLoanBalance,
  fhaMipCostFactor,
  fhaMipRemainingMonths,
  fhaNewLoanAmount,
  fhaNewMipCostFactor,
}: FhaMipCalculationsProps) => {

  // Auto-calculate Prior FHA MIP Cost
  const calculatedFhaMipCost = useMemo(() => {
    const balance = parseFloat(fhaMipStartingLoanBalance.replace(/[^\d]/g, '') || '0');
    const factor = parseFloat(fhaMipCostFactor || '0');
    const cost = balance * (factor / 100);
    return cost > 0 ? Math.round(cost).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  }, [fhaMipStartingLoanBalance, fhaMipCostFactor]);

  // Auto-calculate Remaining Refund Value (percentage based on remaining months)
  const calculatedRemainingRefundValue = useMemo(() => {
    const remainingMonths = parseInt(fhaMipRemainingMonths || '0', 10);
    if (remainingMonths <= 0 || remainingMonths > 36) return '';
    const percentage = (remainingMonths / 36) * 100;
    return percentage.toFixed(2);
  }, [fhaMipRemainingMonths]);

  // Auto-calculate Estimated Prior FHA Upfront MIP Refund
  const calculatedEstimatedMipRefund = useMemo(() => {
    const cost = parseInt(calculatedFhaMipCost.replace(/[^\d]/g, '') || '0', 10);
    const refundPercent = parseFloat(calculatedRemainingRefundValue || '0');
    const refund = cost * (refundPercent / 100);
    return refund > 0 ? Math.round(refund).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  }, [calculatedFhaMipCost, calculatedRemainingRefundValue]);

  // Auto-calculate New FHA MIP Cost
  const calculatedNewFhaMipCost = useMemo(() => {
    const balance = parseFloat(fhaNewLoanAmount.replace(/[^\d]/g, '') || '0');
    const factor = parseFloat(fhaNewMipCostFactor || '0');
    const cost = balance * (factor / 100);
    return cost > 0 ? Math.round(cost).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  }, [fhaNewLoanAmount, fhaNewMipCostFactor]);

  // Auto-calculate New FHA Upfront MIP Estimate (New MIP Cost - Prior MIP Refund)
  const calculatedAdjustedNewFhaMip = useMemo(() => {
    const newMipCost = parseInt(calculatedNewFhaMipCost.replace(/[^\d]/g, '') || '0', 10);
    const priorRefund = parseInt(calculatedEstimatedMipRefund.replace(/[^\d]/g, '') || '0', 10);
    const estimate = newMipCost - priorRefund;
    return estimate > 0 ? estimate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
  }, [calculatedNewFhaMipCost, calculatedEstimatedMipRefund]);

  return {
    calculatedFhaMipCost,
    calculatedRemainingRefundValue,
    calculatedEstimatedMipRefund,
    calculatedNewFhaMipCost,
    calculatedAdjustedNewFhaMip,
  };
};
