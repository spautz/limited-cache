/* eslint-env jest */
/* eslint-disable no-prototype-builtins, @typescript-eslint/no-explicit-any */

import LimitedCacheObject, { LimitedCacheObjectInterface } from '../src/LimitedCacheObject';

describe('LimitedCacheObject', () => {
  it('initializes without options', () => {
    const myCache: LimitedCacheObjectInterface = LimitedCacheObject();

    expect(myCache).toBeTruthy();
  });

  it('initializes with options', () => {
    const myCache: LimitedCacheObjectInterface = LimitedCacheObject({
      maxCacheSize: 123,
      maxCacheTime: 456,
      initialValues: {},
      warnIfItemPurgedBeforeTime: 789,
      autoMaintenanceMultiplier: 10,
      numItemsToExamineForPurge: 100,
    });

    expect(myCache).toBeTruthy();
  });

  describe('looks like a standard object', () => {
    let myCache: LimitedCacheObjectInterface<any>;
    beforeEach(() => {
      myCache = LimitedCacheObject<any>();
    });

    it('has, missing, prototype', () => {
      const result = Object.prototype.hasOwnProperty.call(myCache, 'asdf');

      expect(result).toEqual(false);
    });

    it('has, missing, local', () => {
      const result = myCache.hasOwnProperty('asdf');

      expect(result).toEqual(false);
    });

    it('has, missing, in', () => {
      const result = 'asdf' in myCache;

      expect(result).toEqual(false);
    });

    it('get, missing', () => {
      const result = myCache.asdf;

      expect(result).toBeUndefined();
    });

    it('keys, empty', () => {
      const result = Object.keys(myCache);

      expect(result).toEqual([]);
    });

    it('set', () => {
      const result = (myCache.abc = 123);

      expect(result).toEqual(123);
    });

    it('has, present, prototype', () => {
      myCache.abc = 123;

      const result = Object.prototype.hasOwnProperty.call(myCache, 'abc');

      expect(result).toEqual(true);
    });

    it('has, present, local', () => {
      myCache.abc = 123;

      const result = myCache.hasOwnProperty('abc');

      expect(result).toEqual(true);
    });

    it('has present, in', () => {
      myCache.abc = 123;

      const result = 'abc' in myCache;

      expect(result).toEqual(true);
    });

    it('get, present', () => {
      myCache.abc = 123;
      const result = myCache.abc;

      expect(result).toEqual(123);
    });

    it('delete, return', () => {
      myCache.abc = 123;
      const result = delete myCache.abc;

      expect(result).toEqual(true);
    });

    it('delete, effect, has', () => {
      myCache.abc = 123;
      delete myCache.abc;
      const result = Object.prototype.hasOwnProperty.call(myCache, 'abc');

      expect(result).toEqual(false);
    });

    it('remove, effect, get', () => {
      myCache.abc = 123;
      delete myCache.abc;
      const result = myCache.abc;

      expect(result).toEqual(undefined);
    });

    it('keys', () => {
      myCache.abc = 123;
      const result = Object.keys(myCache);

      expect(result).toEqual(['abc']);
    });
  });
});
