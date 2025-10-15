import { deepMerge, deepMergeAll } from './index';

describe('deepMerge', () => {
  describe('basic merging', () => {
    it('should merge two simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should prefer source values over target values', () => {
      const target = { name: 'old', value: 1 };
      const source = { name: 'new' };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ name: 'new', value: 1 });
    });
  });

  describe('null, undefined, and empty string handling', () => {
    it('should skip null values from source', () => {
      const target: any = { a: 1, b: 2 };
      const source: any = { b: null, c: 3 };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should skip undefined values from source', () => {
      const target: any = { a: 1, b: 2 };
      const source: any = { b: undefined, c: 3 };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should skip empty strings from source', () => {
      const target = { a: 'hello', b: 'world' };
      const source = { b: '', c: 'test' };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: 'hello', b: 'world', c: 'test' });
    });

    it('should allow falsy values like 0 and false', () => {
      const target = { a: 1, b: true };
      const source = { a: 0, b: false };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: 0, b: false });
    });
  });

  describe('nested object merging', () => {
    it('should deep merge nested objects', () => {
      const target: any = {
        user: { name: 'John', age: 30 },
        settings: { theme: 'dark' }
      };
      const source: any = {
        user: { age: 31, city: 'NYC' },
        settings: { language: 'en' }
      };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({
        user: { name: 'John', age: 31, city: 'NYC' },
        settings: { theme: 'dark', language: 'en' }
      });
    });

    it('should handle deeply nested objects', () => {
      const target: any = {
        level1: {
          level2: {
            level3: { a: 1, b: 2 }
          }
        }
      };
      const source: any = {
        level1: {
          level2: {
            level3: { b: 3, c: 4 }
          }
        }
      };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({
        level1: {
          level2: {
            level3: { a: 1, b: 3, c: 4 }
          }
        }
      });
    });
  });

  describe('empty object handling', () => {
    it('should not create empty objects from null/undefined nested values', () => {
      const target: any = { a: 1 };
      const source: any = { b: { c: null, d: undefined, e: '' } };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: 1 });
      expect(result.b).toBeUndefined();
    });

    it('should merge objects with some valid nested values', () => {
      const target: any = { a: 1 };
      const source: any = { b: { c: null, d: 'value' } };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: 1, b: { d: 'value' } });
    });

    it('should not set nested objects that become empty after merge', () => {
      const target: any = {};
      const source: any = { 
        empty: {},
        hasNull: { a: null, b: undefined },
        hasValue: { a: null, b: 'test' }
      };
      const result = deepMerge(target, source);
      
      expect(result.empty).toBeUndefined();
      expect(result.hasNull).toBeUndefined();
      expect(result.hasValue).toEqual({ b: 'test' });
    });
  });

  describe('array handling', () => {
    it('should not recursively merge arrays', () => {
      const target = { items: [1, 2, 3] };
      const source = { items: [4, 5] };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ items: [4, 5] });
    });

    it('should treat arrays as primitive values', () => {
      const target = { a: [1, 2], b: 'test' };
      const source = { a: [3, 4, 5] };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: [3, 4, 5], b: 'test' });
    });

    it('should handle empty arrays from source', () => {
      const target = { items: [1, 2, 3] };
      const source = { items: [] };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ items: [] });
    });

    it('should handle empty arrays from target', () => {
      const target = { items: [] };
      const source = { items: [1, 2, 3] };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ items: [1, 2, 3] });
    });

    it('should handle null array values', () => {
      const target: any = { items: [1, 2, 3] };
      const source: any = { items: null };
      const result = deepMerge(target, source);
      
      // null should be skipped, preserving target value
      expect(result).toEqual({ items: [1, 2, 3] });
    });

    it('should handle arrays with objects', () => {
      const target = { items: [{ id: 1 }, { id: 2 }] };
      const source = { items: [{ id: 3 }] };
      const result = deepMerge(target, source);
      
      // Source array replaces target array entirely
      expect(result).toEqual({ items: [{ id: 3 }] });
    });

    it('should handle nested arrays', () => {
      const target = { matrix: [[1, 2], [3, 4]] };
      const source = { matrix: [[5, 6]] };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ matrix: [[5, 6]] });
    });
  });

  describe('social media use case', () => {
    it('should merge social media objects correctly', () => {
      const birdeye: any = {
        twitter: 'https://twitter.com/token',
        website: 'https://token.com',
        discord: '',
        telegram: undefined
      };
      const gmgn: any = {
        twitter: '',
        website: undefined,
        discord: 'https://discord.gg/token',
        telegram: 'https://t.me/token'
      };
      const result = deepMerge(birdeye, gmgn);
      
      expect(result).toEqual({
        twitter: 'https://twitter.com/token',
        website: 'https://token.com',
        discord: 'https://discord.gg/token',
        telegram: 'https://t.me/token'
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty target', () => {
      const target = {};
      const source = { a: 1, b: 2 };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should handle empty source', () => {
      const target = { a: 1, b: 2 };
      const source = {};
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should not mutate original objects', () => {
      const target: any = { a: 1, b: { c: 2 } };
      const source: any = { b: { d: 3 } };
      const result = deepMerge(target, source);
      
      expect(target).toEqual({ a: 1, b: { c: 2 } });
      expect(source).toEqual({ b: { d: 3 } });
      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 } });
    });

    it('should handle Date objects as primitives', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-12-31');
      const target = { created: date1 };
      const source = { created: date2 };
      const result = deepMerge(target, source);
      
      expect(result.created).toBe(date2);
    });
  });
});

describe('deepMergeAll', () => {
  it('should merge multiple objects preserving first values', () => {
    const objects: any[] = [
      { a: 1, b: 2 },
      { b: 3, c: 4 },
      { c: 5, d: 6 }
    ];
    const result = deepMergeAll(objects);
    
    // First non-empty value wins: a from obj1, b from obj1, c from obj2, d from obj3
    expect(result).toEqual({ a: 1, b: 2, c: 4, d: 6 });
  });

  it('should prefer first non-empty value', () => {
    const objects: any[] = [
      { name: '', age: null, city: 'NYC' },
      { name: 'John', age: 30, city: 'LA' },
      { name: 'Jane', age: 25, city: 'SF' }
    ];
    const result = deepMergeAll(objects);
    
    expect(result).toEqual({ name: 'John', age: 30, city: 'NYC' });
  });

  it('should handle nested objects across multiple sources', () => {
    const objects: any[] = [
      { user: { name: 'John' } },
      { user: { age: 30 } },
      { user: { city: 'NYC' } }
    ];
    const result = deepMergeAll(objects);
    
    expect(result).toEqual({ user: { name: 'John', age: 30, city: 'NYC' } });
  });

  it('should handle empty array', () => {
    const result = deepMergeAll([]);
    
    expect(result).toEqual({});
  });

  it('should handle single object', () => {
    const objects = [{ a: 1, b: 2 }];
    const result = deepMergeAll(objects);
    
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should merge social media from multiple sources', () => {
    const sources: any[] = [
      { twitter: 'https://twitter.com/token', website: '' },
      { twitter: '', website: 'https://token.com', telegram: null },
      { telegram: 'https://t.me/token', discord: 'https://discord.gg/token' }
    ];
    const result = deepMergeAll(sources);
    
    expect(result).toEqual({
      twitter: 'https://twitter.com/token',
      website: 'https://token.com',
      telegram: 'https://t.me/token',
      discord: 'https://discord.gg/token'
    });
  });

  it('should skip all empty/null/undefined values across sources', () => {
    const sources: any[] = [
      { a: null, b: undefined, c: '' },
      { a: 1, b: null, c: undefined },
      { a: 2, b: 3, c: 4 }
    ];
    const result = deepMergeAll(sources);
    
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  describe('array handling in deepMergeAll', () => {
    it('should prefer first non-empty array', () => {
      const objects: any[] = [
        { tags: ['crypto', 'defi'] },
        { tags: ['nft', 'web3'] },
        { tags: [] }
      ];
      const result = deepMergeAll(objects);
      
      // First non-empty array wins
      expect(result).toEqual({ tags: ['crypto', 'defi'] });
    });

    it('should skip null arrays and use first valid one', () => {
      const objects: any[] = [
        { items: null },
        { items: [1, 2, 3] },
        { items: [4, 5] }
      ];
      const result = deepMergeAll(objects);
      
      expect(result).toEqual({ items: [1, 2, 3] });
    });

    it('should handle empty arrays correctly', () => {
      const objects: any[] = [
        { tags: [] },
        { tags: ['tag1', 'tag2'] }
      ];
      const result = deepMergeAll(objects);
      
      // Empty array is a valid value, so it should be used
      expect(result).toEqual({ tags: [] });
    });
  });

  describe('token merge use case', () => {
    it('should merge token data from multiple sources', () => {
      const tokens: any[] = [
        {
          address: '0x123',
          name: 'Token',
          symbol: 'TKN',
          socials: { twitter: 'https://twitter.com/token' }
        },
        {
          address: '0x123',
          name: null,
          decimals: 18,
          socials: { website: 'https://token.com', twitter: '' }
        },
        {
          address: '0x123',
          pairAddress: '0x456',
          socials: { telegram: 'https://t.me/token' }
        }
      ];
      const result = deepMergeAll(tokens);
      
      expect(result).toEqual({
        address: '0x123',
        name: 'Token',
        symbol: 'TKN',
        decimals: 18,
        pairAddress: '0x456',
        socials: {
          twitter: 'https://twitter.com/token',
          website: 'https://token.com',
          telegram: 'https://t.me/token'
        }
      });
    });
  });
});

