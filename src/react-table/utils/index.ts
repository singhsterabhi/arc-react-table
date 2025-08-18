export function isNullOrUndefinedOrEmpty(value: any) {
    return value === undefined || value === null || value === '';
}

export const convertToPercent = (value: number) => {
    return (value * 100).toFixed(2);
};

export function forceDecimalPlaces(value: any, precision: number): any {
    let floatValue = Number.parseFloat(value);
    if (isNaN(floatValue)) return { value: value ?? '-', isNumber: false };

    if (isNullOrUndefinedOrEmpty(value)) value = 0;

    return {
        value: floatValue.toLocaleString(undefined, {
            maximumFractionDigits: precision,
            minimumFractionDigits: precision,
        }),
        isNumber: true,
    };
}

/**
 * Converts a string to title case
 * @param str - The input string to convert
 * @returns The string with the first letter of each word capitalized
 */
export function toTitleCase(str: string): string {
    if (!str) return '';

    return ('' + str)
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
