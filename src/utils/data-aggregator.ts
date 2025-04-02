type KeyPath = (string | number)[];

interface RequiredKeysSpec {
  [key: string]: boolean | RequiredKeysSpec;
}

type DataFetcher<T> = () => Promise<Partial<T>>;

/**
 * Checks if a value exists at the given key path in an object
 */
function hasValueAtPath(obj: any, path: KeyPath): boolean {
  let current = obj;
  for (const key of path) {
    if (current === undefined || current === null) return false;
    current = current[key];
  }
  return current !== undefined && current !== null;
}

/**
 * Checks if all required keys are present in the data object
 */
function hasAllRequiredKeys(data: any, requiredKeys: RequiredKeysSpec, prefix: KeyPath = []): boolean {
  for (const [key, value] of Object.entries(requiredKeys)) {
    const currentPath = [...prefix, key];
    
    if (typeof value === 'boolean') {
      if (value && !hasValueAtPath(data, currentPath)) {
        return false;
      }
    } else if (typeof value === 'object') {
      if (!hasValueAtPath(data, currentPath) || !hasAllRequiredKeys(data, value, currentPath)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Deep merges two objects, preferring values from the source that aren't null/undefined
 */
function deepMerge<T extends Record<string, any>>(target: Partial<T>, source: Partial<T>): Partial<T> {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (sourceValue === null || sourceValue === undefined) {
      continue;
    }

    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      result[key] = deepMerge(
        (targetValue as Record<string, any>) || {},
        sourceValue as Record<string, any>
      );
    } else {
      result[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Aggregates data from multiple sources until all required keys are filled
 * @param fetchers Array of functions that fetch partial data
 * @param requiredKeys Specification of which keys are required (including nested keys)
 * @returns Merged data object with all required keys filled, or throws if impossible
 */
export async function aggregateData<T extends Record<string, any>>(
  fetchers: DataFetcher<T>[],
  requiredKeys: RequiredKeysSpec
): Promise<Partial<T>> {
  let mergedData: Partial<T> = {};

  for (const fetcher of fetchers) {
    // Skip if we already have all required data
    if (hasAllRequiredKeys(mergedData, requiredKeys)) {
      break;
    }

    try {
      const newData = await fetcher();
      mergedData = deepMerge(mergedData, newData);
    } catch (error) {
      console.warn('Failed to fetch data from source:', error);
      // Continue to next fetcher
    }
  }

  if (!hasAllRequiredKeys(mergedData, requiredKeys)) {
    throw new Error('Could not fulfill all required keys after exhausting all data sources');
  }

  return mergedData;
} 