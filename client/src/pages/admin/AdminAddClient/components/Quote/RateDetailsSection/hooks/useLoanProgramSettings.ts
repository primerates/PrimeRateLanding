import { useState, useRef } from 'react';

/**
 * Custom hook to manage loan program text and styling settings
 */
export const useLoanProgramSettings = () => {
  const [quoteLoanProgram, setQuoteLoanProgram] = useState('');
  const [showLoanProgramControls, setShowLoanProgramControls] = useState(false);
  const [loanProgramFontSize, setLoanProgramFontSize] = useState('text-2xl');
  const [loanProgramColor, setLoanProgramColor] = useState('text-foreground');
  const loanProgramTextareaRef = useRef<HTMLTextAreaElement>(null);

  return {
    quoteLoanProgram,
    setQuoteLoanProgram,
    showLoanProgramControls,
    setShowLoanProgramControls,
    loanProgramFontSize,
    setLoanProgramFontSize,
    loanProgramColor,
    setLoanProgramColor,
    loanProgramTextareaRef,
  };
};
