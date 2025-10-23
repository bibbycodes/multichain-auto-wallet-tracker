export const xMinutesAgo = (minutes: number) => {
    return new Date(Date.now() - minutes * 1000 * 60);
}

export const xSecondsAgo = (seconds: number) => {
    return new Date(Date.now() - seconds * 1000);
}

export const xHoursAgo = (hours: number) => {
    return new Date(Date.now() - hours * 1000 * 60 * 60);
}

export const xDaysAgo = (days: number) => {
    return new Date(Date.now() - days * 1000 * 60 * 60 * 24);
}

export const xMonthsAgo = (months: number) => {
    return new Date(Date.now() - months * 1000 * 60 * 60 * 24 * 30);
}

export const xYearsAgo = (years: number) => {
    return new Date(Date.now() - years * 1000 * 60 * 60 * 24 * 365);
}

export const xMinutesFromNow = (minutes: number) => {
    return new Date(Date.now() + minutes * 1000 * 60);
}

export const xSecondsFromNow = (seconds: number) => {
    return new Date(Date.now() + seconds * 1000);
}

export const xHoursFromNow = (hours: number) => {
    return new Date(Date.now() + hours * 1000 * 60 * 60);
}

export const xDaysFromNow = (days: number) => {
    return new Date(Date.now() + days * 1000 * 60 * 60 * 24);
}

export const xMonthsFromNow = (months: number) => {
    return new Date(Date.now() + months * 1000 * 60 * 60 * 24 * 30);
}

export const xYearsFromNow = (years: number) => {
    return new Date(Date.now() + years * 1000 * 60 * 60 * 24 * 365);
}