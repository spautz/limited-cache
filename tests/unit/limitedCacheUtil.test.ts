import {
  LimitedCacheMeta,
  defaultOptions,
  lowLevelInit,
  lowLevelGet,
  lowLevelHas,
  lowLevelSet,
  lowLevelRemove,
} from '../../src/limited-cache/limitedCacheUtil';

describe('LimitedCacheUtil', () => {
  describe('lowLevelInit', () => {
    it('clones the default options', () => {
      const myCacheMeta = lowLevelInit();

      expect(myCacheMeta.options).toEqual(defaultOptions);
      expect(myCacheMeta.options === defaultOptions).toBe(false);
    });

    it('clones provided options', () => {
      const myOptions = {
        maxCacheSize: 123,
        maxCacheTime: 456,
        warnIfItemPurgedBeforeTime: 789,
        autoMaintenanceMultiplier: 10,
        numItemsToExamineForPurge: 100,
      };

      const myCacheMeta = lowLevelInit(myOptions);

      expect(myCacheMeta.options).toEqual(myOptions);
      expect(myCacheMeta.options === myOptions).toBe(false);
    });

    it('merges provided options with defaults', () => {
      const myOptions = {
        maxCacheSize: 123,
        maxCacheTime: 456,
      };

      const myCacheMeta = lowLevelInit(myOptions);

      expect(myCacheMeta.options).toEqual({
        maxCacheSize: 123,
        maxCacheTime: 456,
        warnIfItemPurgedBeforeTime: 0,
        autoMaintenanceMultiplier: 2,
        numItemsToExamineForPurge: 10,
      });
    });
  });

  describe('lowLevelHas', () => {
    let myCacheMeta: LimitedCacheMeta;
    beforeEach(() => {
      myCacheMeta = lowLevelInit({
        maxCacheTime: 1000,
      });
    });

    it('has a missing key', () => {
      const result = lowLevelHas(myCacheMeta, 'abc');

      expect(result).toBe(false);
    });

    it('has a present key', () => {
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cacheKeyTimestamps['abc'] = Date.now();
      const result = lowLevelHas(myCacheMeta, 'abc');

      expect(result).toBe(true);
    });

    it('has an expired key', () => {
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cacheKeyTimestamps['abc'] = 1;
      const result = lowLevelHas(myCacheMeta, 'abc');

      expect(result).toBe(false);
    });
  });

  describe('lowLevelGet', () => {
    let myCacheMeta: LimitedCacheMeta;
    beforeEach(() => {
      myCacheMeta = lowLevelInit({
        maxCacheTime: 1000,
      });
    });

    it('get a missing key', () => {
      const result = lowLevelGet(myCacheMeta, 'abc');

      expect(result).toBeUndefined();
    });

    it('get a present key', () => {
      // Danger: Manually manipulating internals, because otherwise we can't test 'get' separately from 'set'
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cacheKeyTimestamps['abc'] = Date.now();
      myCacheMeta.recentCacheKeys = ['abc'];
      const result = lowLevelGet(myCacheMeta, 'abc');

      expect(result).toEqual(123);
    });

    it('get an expired key', () => {
      // Danger: Manually manipulating internals, because otherwise we can't test 'get' separately from 'set'
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cacheKeyTimestamps['abc'] = 1;
      myCacheMeta.recentCacheKeys = ['abc'];
      const result = lowLevelGet(myCacheMeta, 'abc');

      expect(result).toEqual(undefined);
    });

    it('getAll: when empty', () => {
      const result = lowLevelGet(myCacheMeta);

      expect(result).toEqual({});
    });

    it('getAll: when all present', () => {
      // Danger: Manually manipulating internals, because otherwise we can't test 'get' separately from 'set'
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cache['def'] = 456;
      myCacheMeta.cacheKeyTimestamps['abc'] = Date.now();
      myCacheMeta.cacheKeyTimestamps['def'] = Date.now();
      myCacheMeta.recentCacheKeys = ['abc', 'def'];
      const result = lowLevelGet(myCacheMeta);

      expect(result).toEqual({ abc: 123, def: 456 });
    });

    it('getAll: when all expired', () => {
      // Danger: Manually manipulating internals, because otherwise we can't test 'get' separately from 'set'
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cache['def'] = 456;
      myCacheMeta.cacheKeyTimestamps['abc'] = 1;
      myCacheMeta.cacheKeyTimestamps['def'] = 1;
      myCacheMeta.recentCacheKeys = ['abc', 'def'];
      const result = lowLevelGet(myCacheMeta);

      expect(result).toEqual({});
    });

    it('getAll: when some expired', () => {
      // Danger: Manually manipulating internals, because otherwise we can't test 'get' separately from 'set'
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cache['def'] = 456;
      myCacheMeta.cacheKeyTimestamps['abc'] = 1;
      myCacheMeta.cacheKeyTimestamps['def'] = Date.now();
      myCacheMeta.recentCacheKeys = ['abc', 'def'];
      const result = lowLevelGet(myCacheMeta);

      expect(result).toEqual({ def: 456 });
    });
  });

  describe('lowLevelSet', () => {
    let myCacheMeta: LimitedCacheMeta;
    beforeEach(() => {
      myCacheMeta = lowLevelInit({
        maxCacheTime: 1000,
      });
    });

    it('returns a mutated cacheMeta', () => {
      const returnedCacheMeta = lowLevelSet(myCacheMeta, 'abc', 123);

      expect(returnedCacheMeta).toStrictEqual(myCacheMeta);
    });

    it('set a new key', () => {
      myCacheMeta = lowLevelSet(myCacheMeta, 'abc', 123);

      expect(myCacheMeta.cache).toEqual({ abc: 123 });
    });

    it('set several new keys', () => {
      myCacheMeta = lowLevelSet(myCacheMeta, 'abc', 123);
      myCacheMeta = lowLevelSet(myCacheMeta, 'def', 456);

      expect(myCacheMeta.cache).toEqual({ abc: 123, def: 456 });
    });

    it('overwrite a key', () => {
      myCacheMeta = lowLevelSet(myCacheMeta, 'abc', 123);
      myCacheMeta = lowLevelSet(myCacheMeta, 'abc', 456);

      expect(myCacheMeta.cache).toEqual({ abc: 456 });
    });

    it('removes items to stay within the cache size', () => {
      myCacheMeta = lowLevelInit({
        maxCacheSize: 5,
        maxCacheTime: 1000,
        autoMaintenanceMultiplier: Number.MAX_SAFE_INTEGER,
      });

      // Set 5 items, then 5 more
      for (let n = 1; n <= 5; n++) {
        myCacheMeta = lowLevelSet(myCacheMeta, `n=${n}`, n);
      }
      expect(myCacheMeta.cache).toEqual({
        'n=1': 1,
        'n=2': 2,
        'n=3': 3,
        'n=4': 4,
        'n=5': 5,
      });

      for (let n = 6; n <= 10; n++) {
        myCacheMeta = lowLevelSet(myCacheMeta, `n=${n}`, n);
      }

      expect(myCacheMeta.cache).toEqual({
        'n=1': undefined,
        'n=2': undefined,
        'n=3': undefined,
        'n=4': undefined,
        'n=5': undefined,
        'n=6': 6,
        'n=7': 7,
        'n=8': 8,
        'n=9': 9,
        'n=10': 10,
      });
      // Double-check the keys, because jest can give false positives on the undefined ones above
      expect(Object.keys(myCacheMeta.cache)).toEqual([
        'n=1',
        'n=2',
        'n=3',
        'n=4',
        'n=5',
        'n=6',
        'n=7',
        'n=8',
        'n=9',
        'n=10',
      ]);

      // And even though the cache hasn't been cleaned up yet, the keys should reflect the proper state
      expect(lowLevelHas(myCacheMeta, 'n=1')).toEqual(false);
      expect(lowLevelHas(myCacheMeta, 'n=5')).toEqual(false);
      expect(lowLevelHas(myCacheMeta, 'n=8')).toEqual(true);
      expect(lowLevelHas(myCacheMeta, 'n=10')).toEqual(true);
    });

    it.only('performs maintenance after many actions', () => {
      myCacheMeta = lowLevelInit({
        maxCacheSize: 10,
        maxCacheTime: 1000,
        autoMaintenanceMultiplier: 1,
      });

      // Automaintenance should be done after 10 "set" actions (i.e., on the 11th)
      for (let n = 1; n <= 10; n++) {
        myCacheMeta = lowLevelSet(myCacheMeta, `n=${n}`, n);
      }
      for (let n = 2; n <= 9; n++) {
        myCacheMeta = lowLevelRemove(myCacheMeta, `n=${n}`);
      }
      expect(myCacheMeta.cache).toEqual({
        'n=1': 1,
        'n=2': undefined,
        'n=3': undefined,
        'n=4': undefined,
        'n=5': undefined,
        'n=6': undefined,
        'n=7': undefined,
        'n=8': undefined,
        'n=9': undefined,
        'n=10': 10,
      });
      // Double-check the keys, because jest can give false positives on the undefined ones above
      expect(Object.keys(myCacheMeta.cache)).toEqual([
        'n=1',
        'n=2',
        'n=3',
        'n=4',
        'n=5',
        'n=6',
        'n=7',
        'n=8',
        'n=9',
        'n=10',
      ]);

      myCacheMeta = lowLevelSet(myCacheMeta, 'n=11', 11);

      // Now the internal data (including keys) should be trimmed
      expect(myCacheMeta.cache).toEqual({ 'n=1': 1, 'n=10': 10, 'n=11': 11 });
      expect(Object.keys(myCacheMeta.cache)).toEqual(['n=1', 'n=10', 'n=11']);
    });
  });

  describe('lowLevelRemove', () => {
    let myCacheMeta: LimitedCacheMeta;
    beforeEach(() => {
      myCacheMeta = lowLevelInit();
      myCacheMeta = lowLevelSet(myCacheMeta, 'abc', 123);
    });

    it('remove an absent key', () => {
      myCacheMeta = lowLevelRemove(myCacheMeta, 'ghi');

      expect(myCacheMeta.cache).toEqual({ abc: 123 });
    });

    it('remove a present key', () => {
      myCacheMeta = lowLevelRemove(myCacheMeta, 'abc');

      expect(myCacheMeta.cache).toEqual({ abc: undefined });
    });
  });
});
