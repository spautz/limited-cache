/* eslint-env jest */
/* eslint-disable @typescript-eslint/no-explicit-any */

import defaultOptions from '../../src/core/defaultOptions';
import LimitedCache from '../../src/core/LimitedCache';
import { LimitedCacheInstance } from '../../src/types';

describe('LimitedCache', () => {
  it('initializes without options', () => {
    const myCache: LimitedCacheInstance = LimitedCache();

    expect(myCache).toBeTruthy();
  });

  it('initializes with options', () => {
    const myCache: LimitedCacheInstance = LimitedCache({
      maxCacheSize: 123,
      maxCacheTime: 456,
      warnIfItemPurgedBeforeTime: 999,
      opLimit: 10,
      scanLimit: 100,
    });

    expect(myCache).toBeTruthy();
  });

  describe('works as a standard cache', () => {
    let myCache: LimitedCacheInstance<any>;
    beforeEach(() => {
      myCache = LimitedCache<any>();
    });

    it('has: when missing', () => {
      const result = myCache.has('asdf');
      expect(result).toEqual(false);
    });

    it('has: when present', () => {
      myCache.set('abc', 123);

      const result = myCache.has('abc');
      expect(result).toEqual(true);
    });

    it('get: when missing', () => {
      const result = myCache.get('asdf');
      expect(result).toBeUndefined();
    });

    it('get: when present', () => {
      myCache.set('abc', 123);

      const result = myCache.get('abc');
      expect(result).toEqual(123);
    });

    it('getAll: when empty', () => {
      const result = myCache.getAll();
      expect(result).toEqual({});
    });

    it('getAll: when present', () => {
      myCache.set('abc', 123);

      const result = myCache.getAll();
      expect(result).toEqual({ abc: 123 });
    });

    it('set: when new', () => {
      const result = myCache.set('abc', 123);
      expect(result).toEqual(123);
    });

    it('set: when already present', () => {
      myCache.set('abc', 123);

      const result = myCache.set('abc', 456);
      expect(result).toEqual(456);
    });

    it('remove and return value', () => {
      myCache.set('abc', 123);

      const result = myCache.remove('abc');
      expect(result).toEqual(true);
    });

    it('remove, then check', () => {
      myCache.set('abc', 123);
      myCache.remove('abc');

      const result = myCache.has('abc');
      expect(result).toEqual(false);
    });

    it('remove, then get', () => {
      myCache.set('abc', 123);
      myCache.remove('abc');

      const result = myCache.get('abc');
      expect(result).toEqual(undefined);
    });

    it('remove undefined values', () => {
      myCache.set('abc', 123);
      myCache.remove('abc');

      const result = myCache.get('abc');
      expect(result).toEqual(undefined);

      myCache.set('abc', undefined);
      myCache.remove('abc');

      const result2 = myCache.get('abc');
      expect(result2).toEqual(undefined);
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
        limitedCacheMetaVersion: 2,
        options: defaultOptions,
        cache: {},
        keyList: [],
        keyInfo: {},
        opsLeft: 200,
      });
    });

    it('getOptions', () => {
      const result = myCache.getOptions();

      expect(result).toEqual(defaultOptions);
    });

    it('setOptions and return value', () => {
      const result = myCache.setOptions({
        maxCacheSize: 123,
        maxCacheTime: 456,
        warnIfItemPurgedBeforeTime: 999,
        opLimit: 10,
        scanLimit: 100,
      });

      expect(result).toEqual({
        ...defaultOptions,
        maxCacheSize: 123,
        maxCacheTime: 456,
        warnIfItemPurgedBeforeTime: 999,
        opLimit: 10,
        scanLimit: 100,
      });
    });

    it('setOptions as mutation', () => {
      myCache.setOptions({
        maxCacheSize: 123,
        maxCacheTime: 456,
        warnIfItemPurgedBeforeTime: 999,
        opLimit: 10,
        scanLimit: 100,
      });

      const result = myCache.getOptions();
      expect(result).toEqual({
        ...defaultOptions,
        maxCacheSize: 123,
        maxCacheTime: 456,
        warnIfItemPurgedBeforeTime: 999,
        opLimit: 10,
        scanLimit: 100,
      });
    });

    it('doMaintenance', () => {
      // should not throw
      myCache.doMaintenance();
    });
  });
});
