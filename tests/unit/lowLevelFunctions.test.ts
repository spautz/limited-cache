/* eslint-env jest */
import defaultOptions from '../../src/core/defaultOptions';
import {
  lowLevelInit,
  lowLevelGetOne,
  lowLevelGetAll,
  lowLevelHas,
  lowLevelSet,
  lowLevelRemove,
  lowLevelReset,
} from '../../src/core/lowLevelFunctions';
import { LimitedCacheMeta } from '../../src/types';

describe('lowLevelFunctions', () => {
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
        autoMaintenanceCount: 10,
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
        warnIfItemPurgedBeforeTime: 5000,
        autoMaintenanceCount: 500,
        numItemsToExamineForPurge: 20,
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

  describe('lowLevelGetOne', () => {
    let myCacheMeta: LimitedCacheMeta;
    beforeEach(() => {
      myCacheMeta = lowLevelInit({
        maxCacheTime: 1000,
      });
    });

    it('get a missing key', () => {
      const result = lowLevelGetOne(myCacheMeta, 'abc');

      expect(result).toBeUndefined();
    });

    it('get a present key', () => {
      // Danger: Manually manipulating internals, because otherwise we can't test 'get' separately from 'set'
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cacheKeyTimestamps['abc'] = Date.now();
      myCacheMeta.recentCacheKeys = ['abc'];
      const result = lowLevelGetOne(myCacheMeta, 'abc');

      expect(result).toEqual(123);
    });

    it('get an expired key', () => {
      // Danger: Manually manipulating internals, because otherwise we can't test 'get' separately from 'set'
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cacheKeyTimestamps['abc'] = 1;
      myCacheMeta.recentCacheKeys = ['abc'];
      const result = lowLevelGetOne(myCacheMeta, 'abc');

      expect(result).toEqual(undefined);
    });
  });

  describe('lowLevelGetAll', () => {
    let myCacheMeta: LimitedCacheMeta;
    beforeEach(() => {
      myCacheMeta = lowLevelInit({
        maxCacheTime: 1000,
      });
    });

    it('get all when empty', () => {
      const result = lowLevelGetAll(myCacheMeta);

      expect(result).toEqual({});
    });

    it('get all when not empty', () => {
      // Danger: Manually manipulating internals, because otherwise we can't test 'get' separately from 'set'
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cache['def'] = 456;
      myCacheMeta.cacheKeyTimestamps['abc'] = Date.now();
      myCacheMeta.cacheKeyTimestamps['def'] = Date.now();
      myCacheMeta.recentCacheKeys = ['abc', 'def'];
      const result = lowLevelGetAll(myCacheMeta);

      expect(result).toEqual({ abc: 123, def: 456 });
    });

    it('get all when all expired', () => {
      // Danger: Manually manipulating internals, because otherwise we can't test 'get' separately from 'set'
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cache['def'] = 456;
      myCacheMeta.cacheKeyTimestamps['abc'] = 1;
      myCacheMeta.cacheKeyTimestamps['def'] = 1;
      myCacheMeta.recentCacheKeys = ['abc', 'def'];
      const result = lowLevelGetAll(myCacheMeta);

      expect(result).toEqual({});
    });

    it('get all when some expired', () => {
      // Danger: Manually manipulating internals, because otherwise we can't test 'get' separately from 'set'
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cache['def'] = 456;
      myCacheMeta.cacheKeyTimestamps['abc'] = 1;
      myCacheMeta.cacheKeyTimestamps['def'] = Date.now();
      myCacheMeta.recentCacheKeys = ['abc', 'def'];
      const result = lowLevelGetAll(myCacheMeta);

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
        autoMaintenanceCount: Number.MAX_SAFE_INTEGER,
        warnIfItemPurgedBeforeTime: 0,
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

    it('performs maintenance after many actions', () => {
      myCacheMeta = lowLevelInit({
        maxCacheSize: 10,
        maxCacheTime: 1000,
        autoMaintenanceCount: 1,
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

    it('removes an absent key', () => {
      myCacheMeta = lowLevelRemove(myCacheMeta, 'ghi');

      expect(myCacheMeta.cache).toEqual({ abc: 123 });
    });

    it('removes a present key', () => {
      myCacheMeta = lowLevelRemove(myCacheMeta, 'abc');

      expect(myCacheMeta.cache).toEqual({ abc: undefined });
    });

    it('removes a present key multiple times', () => {
      myCacheMeta = lowLevelRemove(myCacheMeta, 'abc');
      expect(myCacheMeta.cache).toEqual({ abc: undefined });

      myCacheMeta = lowLevelRemove(myCacheMeta, 'abc');
      expect(myCacheMeta.cache).toEqual({ abc: undefined });
    });
  });

  describe('lowLevelReset', () => {
    let myCacheMeta: LimitedCacheMeta;
    beforeEach(() => {
      myCacheMeta = lowLevelInit();
      myCacheMeta = lowLevelSet(myCacheMeta, 'abc', 123);
    });

    it('does what it says', () => {
      myCacheMeta = lowLevelReset(myCacheMeta);

      expect(myCacheMeta.cache).toEqual({});
    });
  });
});
