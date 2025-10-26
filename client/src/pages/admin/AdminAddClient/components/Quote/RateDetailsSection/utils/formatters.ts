/**
 * Format a numeric string as currency with comma separators
 * @param value - Raw numeric string
 * @returns Formatted string with commas (e.g., "1,234,567")
 */
export const formatCurrency = (value: string): string => {
  const numVal = value.replace(/[^\d]/g, '');
  return numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
};

/**
 * Parse a string to extract only numeric characters
 * @param value - Input string (may contain non-numeric chars)
 * @returns String with only digits
 */
export const parseNumeric = (value: string): string => {
  return value.replace(/[^\d]/g, '');
};

/**
 * Format a decimal number with comma separators
 * @param value - Raw string with potential decimal
 * @returns Formatted string with commas preserving decimal (e.g., "1,234.56")
 */
export const formatDecimalCurrency = (value: string): string => {
  const cleanVal = value.replace(/[^\d.]/g, '');

  if (!cleanVal) return '';

  const parts = cleanVal.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
};
