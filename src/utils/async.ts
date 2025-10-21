export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getFulfilled<T>(promises: PromiseSettledResult<T>[]): T[] {
  return promises
    .filter((promise): promise is PromiseFulfilledResult<T> => promise.status === 'fulfilled')
    .map(promise => promise.value)
}