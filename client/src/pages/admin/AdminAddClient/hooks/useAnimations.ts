import { useState, useCallback } from 'react';

interface AnimationState {
  showEntry: boolean;
  showBorrower: boolean;
  showIncome: boolean;
  showProperty: boolean;
  showLoan: boolean;
  showCredit: boolean;
  showStatus: boolean;
  showVendors: boolean;
  showQuote: boolean;
  showNotes: boolean;
}

const initialAnimationState: AnimationState = {
  showEntry: false,
  showBorrower: false,
  showIncome: false,
  showProperty: false,
  showLoan: false,
  showCredit: false,
  showStatus: false,
  showVendors: false,
  showQuote: false,
  showNotes: false
};

export const useAnimations = () => {
  const [animations, setAnimations] = useState<AnimationState>(initialAnimationState);

  const triggerTabAnimation = useCallback((tabValue: string) => {
    const animationKey = `show${tabValue.charAt(0).toUpperCase() + tabValue.slice(1)}` as keyof AnimationState;
    
    if (tabValue === 'client' && !animations.showEntry) {
      // Only trigger borrower animation if not on initial page load
      setAnimations(prev => ({ ...prev, showBorrower: false }));
      requestAnimationFrame(() => {
        setAnimations(prev => ({ ...prev, showBorrower: true }));
        setTimeout(() => setAnimations(prev => ({ ...prev, showBorrower: false })), 1000);
      });
    } else if (animationKey in animations) {
      setAnimations(prev => ({ ...prev, [animationKey]: true }));
      setTimeout(() => setAnimations(prev => ({ ...prev, [animationKey]: false })), 1000);
    }
  }, [animations.showEntry]);

  const updateAnimation = useCallback((key: keyof AnimationState, value: boolean) => {
    setAnimations(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetAnimations = useCallback(() => {
    setAnimations(initialAnimationState);
  }, []);

  return {
    animations,
    triggerTabAnimation,
    updateAnimation,
    resetAnimations
  };
};