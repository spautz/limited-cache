// biome-ignore-all lint/performance/noDelete: Delete is explicitly used to unset items for these tests
// biome-ignore-all lint/suspicious/noAssignInExpressions: Assignment expressions are explicitly tested

import { beforeEach, describe, expect, it } from 'vitest';
import { defaultOptions } from '../core/defaultOptions.js';
import { getCacheMetaFromObject, LimitedCacheObject } from '../core/LimitedCacheObject.js';
import type { LimitedCacheObjectInstance } from '../types.js';

describe('LimitedCacheObject', () => {
  it('initializes without options', () => {
    const myCache: LimitedCacheObjectInstance = LimitedCacheObject();

    expect(myCache).toBeTruthy();
  });

  it('initializes with options', () => {
    const myCache: LimitedCacheObjectInstance = LimitedCacheObject({
      maxCacheSize: 123,
      maxCacheTime: 456,
      warnIfItemPurgedBeforeTime: 999,
      opLimit: 10,
      scanLimit: 100,
    });

    expect(myCache).toBeTruthy();
  });

  describe('look like a standard object', () => {
    let myCache: LimitedCacheObjectInstance<number>;
    beforeEach(() => {
      myCache = LimitedCacheObject<number>();
    });

    it('has: when missing, via prototype hasOwnProperty', () => {
      const result = Object.hasOwn(myCache, 'asdf');
      expect(result).toEqual(false);
    });

    it('has: when missing, via local hasOwnProperty', () => {
      // eslint-disable-next-line no-prototype-builtins
      const result = Object.hasOwn(myCache, 'asdf');
      expect(result).toEqual(false);
    });

    it('has: when missing, via "in"', () => {
      const result = 'asdf' in myCache;
      expect(result).toEqual(false);
    });

    it('has: when present, via prototype hasOwnProperty', () => {
      myCache['abc'] = 123;

      const result = Object.hasOwn(myCache, 'abc');
      expect(result).toEqual(true);
    });

    it('has: when present, via local hasOwnProperty', () => {
      myCache['abc'] = 123;

      // eslint-disable-next-line no-prototype-builtins
      const result = Object.hasOwn(myCache, 'abc');
      expect(result).toEqual(true);
    });

    it('has: when present, via "in"', () => {
      myCache['abc'] = 123;

      const result = 'abc' in myCache;
      expect(result).toEqual(true);
    });

    it('get: when missing', () => {
      const result = myCache['asdf'];
      expect(result).toBeUndefined();
    });

    it('get: when present', () => {
      myCache['abc'] = 123;

      const result = myCache['abc'];
      expect(result).toEqual(123);
    });

    it('set: when new', () => {
      const result = (myCache['abc'] = 123);
      expect(result).toEqual(123);
    });

    it('set: when already present', () => {
      myCache['abc'] = 123;

      const result = (myCache['abc'] = 456);
      expect(result).toEqual(456);
    });

    it('delete and return value', () => {
      myCache['abc'] = 123;

      const result = delete myCache['abc'];
      expect(result).toEqual(true);
    });

    it('delete, then check', () => {
      myCache['abc'] = 123;
      delete myCache['abc'];

      const result = Object.hasOwn(myCache, 'abc');
      expect(result).toEqual(false);
    });

    it('delete, then get', () => {
      myCache['abc'] = 123;
      delete myCache['abc'];

      const result = myCache['abc'];
      expect(result).toEqual(undefined);
    });

    it('keys: when empty', () => {
      const result = Object.keys(myCache);
      expect(result).toEqual([]);
    });

    it('keys: when populated', () => {
      myCache['abc'] = 123;

      const result = Object.keys(myCache);
      expect(result).toEqual(['abc']);
    });

    it('keys: when all are removed', () => {
      myCache['abc'] = 123;
      delete myCache['abc'];

      const result = Object.keys(myCache);
      expect(result).toEqual([]);
    });
  });

  it('offers a way to get the cacheMeta', () => {
    const myCache = LimitedCacheObject<number>();
    const result = getCacheMetaFromObject(myCache);

    expect(result).toEqual({
      limitedCacheMetaVersion: 2,
      options: defaultOptions,
      cache: {},
      keyList: [],
      keyInfo: {},
      opsLeft: 200,
    });
  });
});
