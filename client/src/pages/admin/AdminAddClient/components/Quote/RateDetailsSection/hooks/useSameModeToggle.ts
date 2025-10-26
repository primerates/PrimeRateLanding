/**
 * Generic hook for "Same" mode toggle logic
 * @param isSameMode - Current same mode state
 * @param selectedRateIds - Array of selected rate IDs
 * @returns Toggle function to sync all values to the first rate's value
 */
export const useSameModeToggle = (
  isSameMode: boolean,
  selectedRateIds: number[]
) => {
  /**
   * Toggle same mode and sync values if entering same mode
   * @param values - Current array of values
   * @param setValues - Setter function for values
   * @param setIsSameMode - Setter function for same mode state
   */
  const toggleSameMode = (
    values: string[],
    setValues: (values: string[]) => void,
    setIsSameMode: (mode: boolean) => void
  ) => {
    if (isSameMode) {
      // Entering same mode: copy first value to all
      const firstValue = values[selectedRateIds[0]] || '';
      const newValues = [...values];
      selectedRateIds.forEach(id => newValues[id] = firstValue);
      setValues(newValues);
    }
    setIsSameMode(!isSameMode);
  };

  return { toggleSameMode };
};
