import { getRandomElement, getRandomValueFromEnum } from '../array';

describe('array utils', () => {
  describe('getRandomElement', () => {
    it('should return an element from the array', () => {
      const array = [1, 2, 3, 4, 5];
      const result = getRandomElement(array);
      expect(array).toContain(result);
    });

    it('should return the only element from a single-element array', () => {
      const array = ['only'];
      const result = getRandomElement(array);
      expect(result).toBe('only');
    });

    it('should handle arrays of different types', () => {
      const stringArray = ['a', 'b', 'c'];
      const numberArray = [10, 20, 30];
      const objectArray = [{ id: 1 }, { id: 2 }];

      expect(stringArray).toContain(getRandomElement(stringArray));
      expect(numberArray).toContain(getRandomElement(numberArray));
      expect(objectArray).toContain(getRandomElement(objectArray));
    });

    it('should distribute randomly across multiple calls', () => {
      const array = [1, 2, 3, 4, 5];
      const results = new Set();
      
      // Run 100 times to increase likelihood of getting different values
      for (let i = 0; i < 100; i++) {
        results.add(getRandomElement(array));
      }
      
      // With 100 iterations, we should get more than 1 unique value
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('getRandomValueFromEnum', () => {
    enum TestEnum {
      FIRST = 'first',
      SECOND = 'second',
      THIRD = 'third'
    }

    enum NumericEnum {
      ONE = 1,
      TWO = 2,
      THREE = 3
    }

    it('should return a valid enum value for string enum', () => {
      const result = getRandomValueFromEnum(TestEnum);
      expect(Object.values(TestEnum)).toContain(result);
    });

    it('should return a valid enum value for numeric enum', () => {
      const result = getRandomValueFromEnum(NumericEnum);
      expect(Object.values(NumericEnum)).toContain(result);
    });

    it('should distribute randomly across multiple calls', () => {
      const results = new Set();
      
      // Run 100 times to increase likelihood of getting different values
      for (let i = 0; i < 100; i++) {
        results.add(getRandomValueFromEnum(TestEnum));
      }
      
      // With 100 iterations, we should get more than 1 unique value
      expect(results.size).toBeGreaterThan(1);
    });

    it('should handle enum with single value', () => {
      enum SingleEnum {
        ONLY = 'only'
      }
      
      const result = getRandomValueFromEnum(SingleEnum);
      expect(result).toBe('only');
    });
  });
});

