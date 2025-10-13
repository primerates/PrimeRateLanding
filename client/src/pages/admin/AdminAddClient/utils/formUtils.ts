/**
 * Utility functions for form data processing in AdminAddClient
 */

/**
 * Parse monetary value and convert to number
 * Handles formatted currency values like "$1,500" and converts to 1500
 * @param value - The monetary string value to parse
 * @returns Parsed number value or 0 if invalid
 */
export const parseMonetaryValue = (value: string | undefined): number => {
    if (!value || value.trim() === '') return 0;
    // Remove $ signs, commas, and convert to number
    const cleaned = value.replace(/[$,]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format a number as currency string
 * @param value - Number to format
 * @returns Formatted currency string like "$1,500"
 */
export const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

/**
 * Calculate employment duration in decimal years format
 * @param startDate - Start date string
 * @param endDate - End date string or null if present
 * @param isPresent - Whether employment is current
 * @returns Object with years, months, and formatted duration
 */
export const calculateEmploymentDuration = (
    startDate: string, 
    endDate: string, 
    isPresent: boolean
): { years: string; months: string; duration: string } => {
    let years = '0';
    let months = '0';
    let duration = '0 years';

    if (startDate) {
        const start = new Date(startDate);
        const end = isPresent ? new Date() : (endDate ? new Date(endDate) : new Date());

        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
            let yearsDiff = end.getFullYear() - start.getFullYear();
            let monthsDiff = end.getMonth() - start.getMonth();
            let daysDiff = end.getDate() - start.getDate();

            // If day difference is negative, borrow from months
            if (daysDiff < 0) {
                monthsDiff -= 1;
            }

            // If month difference is negative, borrow from years
            if (monthsDiff < 0) {
                yearsDiff -= 1;
                monthsDiff += 12;
            }

            years = Math.max(0, yearsDiff).toString();
            months = Math.max(0, monthsDiff).toString();

            // Create display duration in decimal years format
            const totalYears = yearsDiff + (monthsDiff / 12);
            if (totalYears >= 1) {
                duration = `${totalYears.toFixed(1)} years`;
            } else if (monthsDiff > 0) {
                duration = `${(monthsDiff / 12).toFixed(1)} years`;
            } else {
                duration = '0.1 years';
            }

            if (isPresent) {
                duration += ' (Present)';
            }
        }
    }

    return { years, months, duration };
};