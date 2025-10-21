import {
  retryFunction,
  withRace,
  withTimeout,
  withRetryOrFail,
  withRetryOrReturnNull,
  withTryCatch,
} from '../fetch';

describe('fetch utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('retryFunction', () => {
    it('should return result on first successful attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await retryFunction(fn, 3);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');
      
      const result = await retryFunction(fn, 5);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after all retries are exhausted', async () => {
      const error = new Error('persistent failure');
      const fn = jest.fn().mockRejectedValue(error);
      
      await expect(retryFunction(fn, 3)).rejects.toThrow('persistent failure');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should respect delay between retries', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      
      const startTime = Date.now();
      await retryFunction(fn, 3, 50);
      const elapsed = Date.now() - startTime;
      
      expect(elapsed).toBeGreaterThanOrEqual(45);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should default to 5 retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      
      await expect(retryFunction(fn)).rejects.toThrow('fail');
      expect(fn).toHaveBeenCalledTimes(5);
    });
  });

  describe('withRace', () => {
    it('should return the first resolved promise', async () => {
      const promise1 = new Promise(resolve => setTimeout(() => resolve('first'), 100));
      const promise2 = new Promise(resolve => setTimeout(() => resolve('second'), 50));
      const promise3 = new Promise(resolve => setTimeout(() => resolve('third'), 150));
      
      const result = await withRace([promise1, promise2, promise3]);
      expect(result).toBe('second');
    });

    it('should return the first rejected promise if it rejects first', async () => {
      const promise1 = new Promise((_, reject) => setTimeout(() => reject(new Error('first')), 50));
      const promise2 = new Promise(resolve => setTimeout(() => resolve('second'), 100));
      
      await expect(withRace([promise1, promise2])).rejects.toThrow('first');
    });
  });

  describe('withTimeout', () => {
    it('should return promise result if it resolves before timeout', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 50));
      const result = await withTimeout(promise, 100);
      
      expect(result).toBe('success');
    });

    it('should throw timeout error if promise takes too long', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 200));
      
      await expect(withTimeout(promise, 50)).rejects.toThrow('Timeout');
    });

    it('should propagate promise rejection if it rejects before timeout', async () => {
      const promise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('failed')), 50)
      );
      
      await expect(withTimeout(promise, 100)).rejects.toThrow('failed');
    });
  });

  describe('withRetryOrFail', () => {
    it('should succeed on first try', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await withRetryOrFail(fn, 3);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry and eventually succeed', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      
      const result = await withRetryOrFail(fn, 3);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after exhausting retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      
      await expect(withRetryOrFail(fn, 2)).rejects.toThrow('fail');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('withRetryOrReturnNull', () => {
    it('should return result on success', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await withRetryOrReturnNull(fn, 3);
      
      expect(result).toBe('success');
    });

    it('should return null on failure after retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      const result = await withRetryOrReturnNull(fn, 2);
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should retry before returning null', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'));
      
      const result = await withRetryOrReturnNull(fn, 2);
      
      expect(result).toBeNull();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('withTryCatch', () => {
    it('should return result on success', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await withTryCatch(fn);
      
      expect(result).toBe('success');
    });

    it('should return null on error', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      const result = await withTryCatch(fn);
      
      expect(result).toBeNull();
    });

    it('should log error to console', async () => {
      const error = new Error('test error');
      const fn = jest.fn().mockRejectedValue(error);
      
      await withTryCatch(fn);
      
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error fetching data:'));
    });

    it('should handle non-Error rejections', async () => {
      const fn = jest.fn().mockRejectedValue('string error');
      const result = await withTryCatch(fn);
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });
});

