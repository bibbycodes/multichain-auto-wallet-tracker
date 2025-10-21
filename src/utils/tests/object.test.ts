import {
  ensureAllKeysAreDefined,
  nullishToUndefined,
  emptyStringToNull,
  isNullOrUndefined,
  safeParseBoolean,
  safeParseNumber,
} from '../object';

describe('object utils', () => {
  describe('ensureAllKeysAreDefined', () => {
    it('should return object with specified keys', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = ensureAllKeysAreDefined(obj, ['a', 'b', 'c']);
      
      expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });

    it('should keep all properties even if some keys are not in the list', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = ensureAllKeysAreDefined(obj, ['a']);
      
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should not add keys that are not in the original object', () => {
      const obj = { a: 1, b: 2 };
      const result = ensureAllKeysAreDefined(obj, ['a', 'b', 'c'] as any);
      
      expect(result).toEqual({ a: 1, b: 2 });
      expect(result).not.toHaveProperty('c');
    });

    it('should handle empty keys array', () => {
      const obj = { a: 1, b: 2 };
      const result = ensureAllKeysAreDefined(obj, []);
      
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should create a new object (not mutate)', () => {
      const obj = { a: 1, b: 2 };
      const result = ensureAllKeysAreDefined(obj, ['a']);
      
      expect(result).not.toBe(obj);
      expect(result).toEqual(obj);
    });
  });

  describe('nullishToUndefined', () => {
    it('should return undefined for null', () => {
      expect(nullishToUndefined(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(nullishToUndefined(undefined)).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(nullishToUndefined('')).toBeUndefined();
    });

    it('should return value for non-empty string', () => {
      expect(nullishToUndefined('hello')).toBe('hello');
    });

    it('should return value for number', () => {
      expect(nullishToUndefined(0)).toBe(0);
      expect(nullishToUndefined(42)).toBe(42);
      expect(nullishToUndefined(-1)).toBe(-1);
    });

    it('should return value for boolean', () => {
      expect(nullishToUndefined(true)).toBe(true);
      expect(nullishToUndefined(false)).toBe(false);
    });

    it('should return value for object', () => {
      const obj = { key: 'value' };
      expect(nullishToUndefined(obj)).toBe(obj);
    });

    it('should return value for array', () => {
      const arr = [1, 2, 3];
      expect(nullishToUndefined(arr)).toBe(arr);
    });
  });

  describe('emptyStringToNull', () => {
    it('should return null for empty string', () => {
      expect(emptyStringToNull('')).toBeNull();
    });

    it('should return value for non-empty string', () => {
      expect(emptyStringToNull('hello')).toBe('hello');
    });

    it('should return value for whitespace string', () => {
      expect(emptyStringToNull(' ')).toBe(' ');
      expect(emptyStringToNull('  ')).toBe('  ');
    });

    it('should return value for number', () => {
      expect(emptyStringToNull(0 as any)).toBe(0);
      expect(emptyStringToNull(42 as any)).toBe(42);
    });

    it('should return value for boolean', () => {
      expect(emptyStringToNull(true as any)).toBe(true);
      expect(emptyStringToNull(false as any)).toBe(false);
    });

    it('should return value for object', () => {
      const obj = { key: 'value' };
      expect(emptyStringToNull(obj as any)).toBe(obj);
    });
  });

  describe('isNullOrUndefined', () => {
    it('should return true for null', () => {
      expect(isNullOrUndefined(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isNullOrUndefined(undefined)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isNullOrUndefined('')).toBe(false);
    });

    it('should return false for zero', () => {
      expect(isNullOrUndefined(0)).toBe(false);
    });

    it('should return false for false', () => {
      expect(isNullOrUndefined(false)).toBe(false);
    });

    it('should return false for non-nullish values', () => {
      expect(isNullOrUndefined('hello')).toBe(false);
      expect(isNullOrUndefined(42)).toBe(false);
      expect(isNullOrUndefined(true)).toBe(false);
      expect(isNullOrUndefined({})).toBe(false);
      expect(isNullOrUndefined([])).toBe(false);
    });
  });

  describe('safeParseBoolean', () => {
    it('should return undefined for null', () => {
      expect(safeParseBoolean(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(safeParseBoolean(undefined)).toBeUndefined();
    });

    it('should return boolean for boolean input', () => {
      expect(safeParseBoolean(true)).toBe(true);
      expect(safeParseBoolean(false)).toBe(false);
    });

    it('should convert number 0 to false', () => {
      expect(safeParseBoolean(0)).toBe(false);
    });

    it('should convert non-zero numbers to true', () => {
      expect(safeParseBoolean(1)).toBe(true);
      expect(safeParseBoolean(-1)).toBe(true);
      expect(safeParseBoolean(42)).toBe(true);
    });

    it('should parse string "true" to true', () => {
      expect(safeParseBoolean('true')).toBe(true);
      expect(safeParseBoolean('True')).toBe(true);
      expect(safeParseBoolean('TRUE')).toBe(true);
    });

    it('should parse string "false" to false', () => {
      expect(safeParseBoolean('false')).toBe(false);
      expect(safeParseBoolean('False')).toBe(false);
      expect(safeParseBoolean('FALSE')).toBe(false);
    });

    it('should parse string "1" to true', () => {
      expect(safeParseBoolean('1')).toBe(true);
    });

    it('should parse string "0" to false', () => {
      expect(safeParseBoolean('0')).toBe(false);
    });

    it('should return undefined for invalid string values', () => {
      expect(safeParseBoolean('yes')).toBeUndefined();
      expect(safeParseBoolean('no')).toBeUndefined();
      expect(safeParseBoolean('invalid')).toBeUndefined();
      expect(safeParseBoolean('')).toBeUndefined();
    });

    it('should return undefined for objects and arrays', () => {
      expect(safeParseBoolean({})).toBeUndefined();
      expect(safeParseBoolean([])).toBeUndefined();
    });
  });

  describe('safeParseNumber', () => {
    it('should return undefined for null', () => {
      expect(safeParseNumber(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(safeParseNumber(undefined)).toBeUndefined();
    });

    it('should return number for number input', () => {
      expect(safeParseNumber(0)).toBe(0);
      expect(safeParseNumber(42)).toBe(42);
      expect(safeParseNumber(-10)).toBe(-10);
      expect(safeParseNumber(3.14)).toBe(3.14);
    });

    it('should return undefined for NaN', () => {
      expect(safeParseNumber(NaN)).toBeUndefined();
    });

    it('should parse valid number strings', () => {
      expect(safeParseNumber('42')).toBe(42);
      expect(safeParseNumber('0')).toBe(0);
      expect(safeParseNumber('-10')).toBe(-10);
      expect(safeParseNumber('3.14')).toBe(3.14);
    });

    it('should parse scientific notation strings', () => {
      expect(safeParseNumber('1e5')).toBe(100000);
      expect(safeParseNumber('1.5e2')).toBe(150);
    });

    it('should return undefined for invalid strings', () => {
      expect(safeParseNumber('invalid')).toBeUndefined();
      expect(safeParseNumber('abc123')).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      // Empty string should be treated as invalid/missing data
      expect(safeParseNumber('')).toBeUndefined();
    });

    it('should parse string with whitespace', () => {
      expect(safeParseNumber('  42  ')).toBe(42);
    });

    it('should return undefined for objects and arrays', () => {
      expect(safeParseNumber({})).toBeUndefined();
      expect(safeParseNumber([])).toBeUndefined();
    });

    it('should handle Infinity', () => {
      expect(safeParseNumber(Infinity)).toBe(Infinity);
      expect(safeParseNumber(-Infinity)).toBe(-Infinity);
    });

    it('should parse Infinity strings', () => {
      expect(safeParseNumber('Infinity')).toBe(Infinity);
      expect(safeParseNumber('-Infinity')).toBe(-Infinity);
    });
  });
});

