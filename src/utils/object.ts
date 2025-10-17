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
