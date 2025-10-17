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
 * Checks if an object is empty (has no own properties or all values are undefined/null/empty string)
 */
function isEmptyObject(obj: any): boolean {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }
  
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return true;
  }
  
  // Check if all values are effectively empty
  return keys.every(key => {
    const value = obj[key];
    return value === null || value === undefined || value === '' || isEmptyObject(value);
  });
}

/**
 * Checks if a value is considered "nullish" (null, undefined, or empty string)
 */
function isNullish(value: any): boolean {
  return value === null || value === undefined || value === '';
}

/**
 * Deep merges two objects, preferring non-nullish values
 * When both target and source have values, source wins unless source is nullish
 * When target has nullish value and source has non-nullish, source wins
 */
export function deepMerge<T extends Record<string, any>>(target: Partial<T>, source: Partial<T>): Partial<T> {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    // Skip if source is nullish AND target has a non-nullish value
    if (isNullish(sourceValue) && !isNullish(targetValue)) {
      continue;
    }

    // If source is nullish and target is also nullish, skip
    if (isNullish(sourceValue) && isNullish(targetValue)) {
      continue;
    }

    // Check if value is a plain object that should be recursively merged
    const isPlainObject = sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      !((sourceValue as any) instanceof Date) &&
      !((sourceValue as any) instanceof RegExp);

    if (isPlainObject) {
      const merged = deepMerge(
        (targetValue as Record<string, any>) || {},
        sourceValue as Record<string, any>
      );

      // Only set the merged value if it's not an empty object
      if (!isEmptyObject(merged)) {
        result[key] = merged as any;
      }
    } else {
      result[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Deep merges an array of objects, taking the first non-empty value for each field
 * @param objects Array of objects to merge
 * @returns Merged object with all non-empty values from the array
 */
export function deepMergeAll<T extends Record<string, any>>(objects: Partial<T>[]): Partial<T> {
  // Reverse the merge order so that first non-empty values win
  return objects.reduce((merged, current) => deepMerge(current, merged), {} as Partial<T>);
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

