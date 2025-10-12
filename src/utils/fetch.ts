export const retryFunction = async (fn: () => Promise<any>, retries: number = 5, delay: number = 0) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn()
        } catch (error) {
            if (i === retries - 1) {
                throw error
            }
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
}

export const withRace = async <T>(promises: Promise<T>[]) => {
    return await Promise.race(promises)
}

export const withTimeout = async <T>(promise: Promise<T>, timeout: number): Promise<T> => {
    return withRace([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))])
}

export const withRetryOrFail = async <T>(fn: () => Promise<T>, retries: number = 1, delay: number = 0): Promise<T> => {
    return await retryFunction(fn, retries, delay)
}

export const withRetryOrReturnNull = async <T>(fn: () => Promise<T>, retries: number = 1, delay: number = 0): Promise<T | null> => {
    return withTryCatch( () => retryFunction(fn, retries, delay))
}

export const withTryCatch = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    try {
        return await fn()
    } catch (error) {
        console.error(`Error fetching data: ${error}`)
        return null 
    }
}
