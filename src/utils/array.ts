export function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

export function getRandomValueFromEnum<T extends { [key: string]: any }>(enumType: T): T[keyof T] {
    const values = Object.values(enumType);
    return getRandomElement(values) as T[keyof T];
}