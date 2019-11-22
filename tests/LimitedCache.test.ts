/* eslint-env jest */
/* eslint-disable @typescript-eslint/no-explicit-any */

import LimitedCache, { LimitedCacheInstance } from '../src/LimitedCache';
import { defaultOptions } from '../src/options';

describe('LimitedCache', () => {
  it('initializes without options', () => {
    const myCache: LimitedCacheInstance = LimitedCache();

    expect(myCache).toBeTruthy();
  });

  it('initializes with options', () => {
    const myCache: LimitedCacheInstance = LimitedCache({
      maxCacheSize: 123,
      maxCacheTime: 456,
      initialValues: {},
      warnIfItemPurgedBeforeTime: 789,
      autoMaintenanceMultiplier: 10,
      numItemsToExamineForPurge: 100,
    });

    expect(myCache).toBeTruthy();
  });

  describe('works as a standard cache', () => {
    let myCache: LimitedCacheInstance<any>;
    beforeEach(() => {
      myCache = LimitedCache<any>();
    });

    it('has, missing', () => {
      const result = myCache.has('asdf');

      expect(result).toEqual(false);
    });

    it('get, missing', () => {
      const result = myCache.get('asdf');

      expect(result).toBeUndefined();
    });

    it('getAll, empty', () => {
      const result = myCache.get();

      expect(result).toEqual({});
    });

    it('set', () => {
      const result = myCache.set('abc', 123);

      expect(result).toEqual(123);
    });

    it('has, present', () => {
      myCache.set('abc', 123);
      const result = myCache.has('abc');

      expect(result).toEqual(true);
    });

    it('get, present', () => {
      myCache.set('abc', 123);
      const result = myCache.get('abc');

      expect(result).toEqual(123);
    });

    it('getAll, present', () => {
      myCache.set('abc', 123);
      const result = myCache.get();

      expect(result).toEqual({ abc: 123 });
    });

    it('remove, return', () => {
      myCache.set('abc', 123);
      const result = myCache.remove('abc');

      expect(result).toEqual(true);
    });

    it('remove, effect, has', () => {
      myCache.set('abc', 123);
      myCache.remove('abc');
      const result = myCache.has('abc');

      expect(result).toEqual(false);
    });

    it('remove, effect, get', () => {
      myCache.set('abc', 123);
      myCache.remove('abc');
      const result = myCache.get('abc');

      expect(result).toEqual(undefined);
    });
  });

  describe('provides functions for managing options and meta', () => {
    let myCache: LimitedCacheInstance<any>;
    beforeEach(() => {
      myCache = LimitedCache<any>();
    });

    it('getCacheMeta', () => {
      const result = myCache.getCacheMeta();

      expect(result).toEqual({
        autoMaintenanceCount: 0,
        cache: {},
        cacheKeyTimestamps: {},
        limitedCacheMetaVersion: 1,
        options: defaultOptions,
        recentCacheKeys: [],
      });
    });

    it('getOptions', () => {
      const result = myCache.getOptions();

      expect(result).toEqual(defaultOptions);
    });

    it('setOptions, return', () => {
      const result = myCache.setOptions({
        maxCacheSize: 123,
        maxCacheTime: 456,
        warnIfItemPurgedBeforeTime: 789,
        autoMaintenanceMultiplier: 10,
        numItemsToExamineForPurge: 100,
      });

      expect(result).toEqual({
        ...defaultOptions,
        maxCacheSize: 123,
        maxCacheTime: 456,
        warnIfItemPurgedBeforeTime: 789,
        autoMaintenanceMultiplier: 10,
        numItemsToExamineForPurge: 100,
      });
    });

    it('setOptions, effect', () => {
      myCache.setOptions({
        maxCacheSize: 123,
        maxCacheTime: 456,
        warnIfItemPurgedBeforeTime: 789,
        autoMaintenanceMultiplier: 10,
        numItemsToExamineForPurge: 100,
      });
      const result = myCache.getOptions();

      expect(result).toEqual({
        ...defaultOptions,
        maxCacheSize: 123,
        maxCacheTime: 456,
        warnIfItemPurgedBeforeTime: 789,
        autoMaintenanceMultiplier: 10,
        numItemsToExamineForPurge: 100,
      });
    });

    it('performMaintenance', () => {
      // should not throw
      myCache.performMaintenance();
    });
  });
});
