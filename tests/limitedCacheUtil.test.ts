import {
  LimitedCacheMeta,
  defaultOptions,
  lowLevelInit,
  lowLevelGet,
  lowLevelHas,
  lowLevelSet,
  lowLevelRemove,
  // lowLevelPerformMaintenance,
} from '../../src/limitedCacheUtil';

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
        maxCacheTime: 500,
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
        maxCacheTime: 500,
      });
    });

    it('get a missing key', () => {
      const result = lowLevelGet(myCacheMeta, 'abc');

      expect(result).toBeUndefined();
    });

    it('get a present key', () => {
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cacheKeyTimestamps['abc'] = Date.now();
      const result = lowLevelGet(myCacheMeta, 'abc');

      expect(result).toEqual(123);
    });

    it('get an expired key', () => {
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cacheKeyTimestamps['abc'] = 1;
      const result = lowLevelGet(myCacheMeta, 'abc');

      expect(result).toEqual(undefined);
    });

    it('getAll: when empty', () => {
      const result = lowLevelGet(myCacheMeta);

      expect(result).toEqual({});
    });

    it('getAll: when all present', () => {
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cache['def'] = 456;
      myCacheMeta.cacheKeyTimestamps['abc'] = Date.now();
      myCacheMeta.cacheKeyTimestamps['def'] = Date.now();
      const result = lowLevelGet(myCacheMeta);

      expect(result).toEqual({ abc: 123, def: 456 });
    });

    it('getAll: when all expired', () => {
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cache['def'] = 456;
      myCacheMeta.cacheKeyTimestamps['abc'] = 1;
      myCacheMeta.cacheKeyTimestamps['def'] = 1;
      const result = lowLevelGet(myCacheMeta);

      expect(result).toEqual({});
    });

    it('getAll: when some expired', () => {
      myCacheMeta.cache['abc'] = 123;
      myCacheMeta.cache['def'] = 456;
      myCacheMeta.cacheKeyTimestamps['abc'] = 1;
      myCacheMeta.cacheKeyTimestamps['def'] = Date.now();
      const result = lowLevelGet(myCacheMeta);

      expect(result).toEqual({ def: 456 });
    });
  });

  describe('lowLevelSet', () => {
    let myCacheMeta: LimitedCacheMeta;
    beforeEach(() => {
      myCacheMeta = lowLevelInit({
        maxCacheTime: 500,
      });
    });

    it('returns a mutated cacheMeta', () => {
      const result = lowLevelSet(myCacheMeta, 'abc', 123);

      expect(result).toStrictEqual(myCacheMeta);
    });

    it('set a new key', () => {
      const result = lowLevelSet(myCacheMeta, 'abc', 123);

      expect(result.cache).toEqual({ abc: 123 });
    });

    it('set multiple keys', () => {
      lowLevelSet(myCacheMeta, 'abc', 123);
      lowLevelSet(myCacheMeta, 'def', 456);

      expect(myCacheMeta.cache).toEqual({ abc: 123, def: 456 });
    });
  });

  describe('lowLevelRemove', () => {
    let myCacheMeta: LimitedCacheMeta;
    beforeEach(() => {
      myCacheMeta = lowLevelInit();
      lowLevelSet(myCacheMeta, 'abc', 123);
    });

    it('remove an absent key', () => {
      const result = lowLevelRemove(myCacheMeta, 'ghi');

      expect(result.cache).toEqual({ abc: 123 });
    });

    it('remove a present key', () => {
      const result = lowLevelRemove(myCacheMeta, 'abc');

      expect(result.cache).toEqual({ abc: undefined });
    });
  });
});
