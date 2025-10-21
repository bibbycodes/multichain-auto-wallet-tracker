export const ensureAllKeysAreDefined = <T extends Record<string, unknown>>(obj: T, keys: (keyof T)[]): T => {
    return keys.reduce((acc, key) => {
        if (key in obj) {
            acc[key] = obj[key]
        }
        return acc
    }, { ...obj } as T)
}

/**
 * Converts null, undefined, or empty string to undefined
 * Useful for normalizing database values that may be empty strings to undefined
 * @param value The value to check
 * @returns undefined if the value is nullish or empty string, otherwise returns the value
 */
export function nullishToUndefined<T>(value: T | null | undefined | ''): T | undefined {
    return (value === null || value === undefined || value === '') ? undefined : value;
}

/**
 * Converts empty strings to null
 * Useful when preparing data for database storage where empty strings should be null
 * @param value The value to check
 * @returns null if the value is an empty string, otherwise returns the value
 */
export function emptyStringToNull<T>(value: T | ''): T | null {
    return value === '' ? null : value;
}


export const isNullOrUndefined = (value: any): boolean => {
    return value === null || value === undefined;
}

/**
 * Safely parse a value to boolean, returning undefined for invalid/missing values
 * Handles various formats: boolean, number (0/1), string ("0"/"1", "true"/"false")
 */
export function safeParseBoolean(value: any): boolean | undefined {
    if (value === null || value === undefined) return undefined;
    if (value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === '1') return true;
        if (lower === 'false' || lower === '0') return false;
    }
    return undefined;
}

/**
 * Safely parse a value to number, returning undefined for invalid/missing values
 */
export function safeParseNumber(value: any): number | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (value === '') return undefined;
    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = Number(value);
        return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
}