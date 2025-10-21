import { sleep, getFulfilled } from '../async';

describe('async utils', () => {
  describe('sleep', () => {
    it('should delay execution for the specified time', async () => {
      const startTime = Date.now();
      await sleep(100);
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      
      // Allow for small timing variations
      expect(elapsed).toBeGreaterThanOrEqual(95);
      expect(elapsed).toBeLessThan(150);
    });

    it('should resolve without errors', async () => {
      await expect(sleep(10)).resolves.toBeUndefined();
    });

    it('should handle zero delay', async () => {
      const startTime = Date.now();
      await sleep(0);
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      
      expect(elapsed).toBeLessThan(50);
    });
  });

  describe('getFulfilled', () => {
    it('should return only fulfilled promise values', () => {
      const results: PromiseSettledResult<number>[] = [
        { status: 'fulfilled', value: 1 },
        { status: 'rejected', reason: new Error('failed') },
        { status: 'fulfilled', value: 2 },
        { status: 'fulfilled', value: 3 },
        { status: 'rejected', reason: new Error('failed again') },
      ];

      const fulfilled = getFulfilled(results);
      expect(fulfilled).toEqual([1, 2, 3]);
    });

    it('should return empty array when all promises are rejected', () => {
      const results: PromiseSettledResult<number>[] = [
        { status: 'rejected', reason: new Error('failed') },
        { status: 'rejected', reason: new Error('failed again') },
      ];

      const fulfilled = getFulfilled(results);
      expect(fulfilled).toEqual([]);
    });

    it('should return all values when all promises are fulfilled', () => {
      const results: PromiseSettledResult<string>[] = [
        { status: 'fulfilled', value: 'a' },
        { status: 'fulfilled', value: 'b' },
        { status: 'fulfilled', value: 'c' },
      ];

      const fulfilled = getFulfilled(results);
      expect(fulfilled).toEqual(['a', 'b', 'c']);
    });

    it('should return empty array for empty input', () => {
      const results: PromiseSettledResult<any>[] = [];
      const fulfilled = getFulfilled(results);
      expect(fulfilled).toEqual([]);
    });

    it('should handle different data types', () => {
      const results: PromiseSettledResult<any>[] = [
        { status: 'fulfilled', value: 42 },
        { status: 'fulfilled', value: 'string' },
        { status: 'fulfilled', value: { key: 'value' } },
        { status: 'fulfilled', value: [1, 2, 3] },
        { status: 'rejected', reason: new Error('failed') },
      ];

      const fulfilled = getFulfilled(results);
      expect(fulfilled).toEqual([42, 'string', { key: 'value' }, [1, 2, 3]]);
    });

    it('should work with Promise.allSettled results', async () => {
      const promises = [
        Promise.resolve(1),
        Promise.reject(new Error('fail')),
        Promise.resolve(2),
      ];

      const results = await Promise.allSettled(promises);
      const fulfilled = getFulfilled(results);
      
      expect(fulfilled).toEqual([1, 2]);
    });
  });
});

