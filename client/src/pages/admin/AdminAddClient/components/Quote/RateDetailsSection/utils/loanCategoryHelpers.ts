/**
 * Determine if Existing Loan Balance should be shown based on loan category
 * @param selectedLoanCategory - The current loan category
 * @returns true if Existing Loan Balance should be displayed
 */
export const showExistingLoanBalance = (selectedLoanCategory: string): boolean => {
  return (
    selectedLoanCategory !== 'Second Loan - HELOC' &&
    selectedLoanCategory !== 'Second Loan - Fixed Second' &&
    !selectedLoanCategory.includes('Purchase')
  );
};

/**
 * Determine if Cash Out section should be shown
 * @param selectedLoanCategory - The current loan category
 * @returns true if Cash Out should be displayed
 */
export const showCashOut = (selectedLoanCategory: string): boolean => {
  return selectedLoanCategory.includes('Cash Out');
};

/**
 * Check if the selected loan is a VA loan
 * @param selectedLoanCategory - The current loan category
 * @returns true if it's a VA or VA Jumbo loan
 */
export const isVALoan = (selectedLoanCategory: string): boolean => {
  return selectedLoanCategory?.startsWith('VA - ') || selectedLoanCategory?.startsWith('VA Jumbo - ');
};

/**
 * Check if the selected loan is an FHA loan
 * @param selectedLoanCategory - The current loan category
 * @returns true if it's an FHA loan
 */
export const isFHALoan = (selectedLoanCategory: string): boolean => {
  return selectedLoanCategory?.startsWith('FHA - ');
};

/**
 * Determine if VA/FHA section should be shown
 * @param selectedLoanCategory - The current loan category
 * @returns true if VA Funding Fee or FHA MIP section should be displayed
 */
export const showVAFHASection = (selectedLoanCategory: string): boolean => {
  return isVALoan(selectedLoanCategory) || isFHALoan(selectedLoanCategory);
};
