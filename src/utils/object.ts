export const ensureAllKeysAreDefined = <T extends Record<string, unknown>>(obj: T, keys: (keyof T)[]): T => {
    return keys.reduce((acc, key) => {
        if (key in obj) {
            acc[key] = obj[key]
        }
        return acc
    }, { ...obj } as T)
}
