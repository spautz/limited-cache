import { LimitedCacheObject, LimitedCacheObjectInterface } from '../src';

// To avoid race conditions or timing issues, since some expect() checks can take 10+ ms when busy,
// we use a long cache timeout even for 'immediate' expiration, and use delays slightly longer than that
const CACHE_TIMEOUT = 20;
const timeoutPromise = (): Promise<null> =>
  new Promise((resolve) => setTimeout(resolve, CACHE_TIMEOUT + 2));

describe('maxCacheTime scenarios', () => {
  let myCache: LimitedCacheObjectInterface;
  beforeEach(() => {
    myCache = LimitedCacheObject({
      maxCacheTime: CACHE_TIMEOUT,
      maxCacheSize: Number.MAX_SAFE_INTEGER,
      autoMaintenanceMultiplier: Number.MAX_SAFE_INTEGER,
    });
  });

  it("doesn't have keys for expired items", async () => {
    myCache.abc = 123;
    myCache.def = 456;
    await timeoutPromise();
    myCache.ghi = 789;

    const { hasOwnProperty } = Object.prototype;
    expect(hasOwnProperty.call(myCache, 'abc')).toEqual(false);
    expect(hasOwnProperty.call(myCache, 'def')).toEqual(false);

    expect(Object.keys(myCache)).toEqual(['ghi']);
  });

  it('removes expired items on get', async () => {
    myCache.abc = 123;
    myCache.def = 456;
    await timeoutPromise();

    expect(myCache.abc).toEqual(undefined);
    expect(myCache.def).toEqual(undefined);
    expect(Object.keys(myCache)).toEqual([]);
  });

  it('removes expired items on set', async () => {
    myCache.abc = 123;
    myCache.def = 456;
    await timeoutPromise();
    myCache.ghi = 789;

    const { hasOwnProperty } = Object.prototype;
    expect(hasOwnProperty.call(myCache, 'abc')).toEqual(false);
    expect(hasOwnProperty.call(myCache, 'def')).toEqual(false);
    expect(hasOwnProperty.call(myCache, 'ghi')).toEqual(true);
    expect(myCache.abc).toEqual(undefined);
    expect(myCache.def).toEqual(undefined);
    expect(myCache.ghi).toEqual(789);
    expect(Object.keys(myCache)).toEqual(['ghi']);
  });

  it('removes older items before newer ones', async () => {
    myCache = LimitedCacheObject({
      maxCacheTime: Number.MAX_SAFE_INTEGER,
      maxCacheSize: 3,
      autoMaintenanceMultiplier: Number.MAX_SAFE_INTEGER,
    });

    myCache.abc = 123;
    await timeoutPromise();
    myCache.def = 456;
    await timeoutPromise();
    myCache.ghi = 789;
    await timeoutPromise();

    // Now write over the 'oldest' key to reset its timestamp
    myCache.abc = 123;

    // Now, adding a new value (over maxCacheSize) should remove the actual oldest
    myCache.newOne = 100;
    expect(myCache.def).toEqual(undefined);
    expect(Object.keys(myCache)).toEqual(['abc', 'ghi', 'newOne']);

    // And then the next oldest, after that
    myCache.newTwo = 200;
    expect(myCache.ghi).toEqual(undefined);
    expect(Object.keys(myCache)).toEqual(['abc', 'newOne', 'newTwo']);
  });

  it('removes expired items before old ones', async () => {
    myCache = LimitedCacheObject({
      maxCacheTime: CACHE_TIMEOUT * 2,
      maxCacheSize: 5,
      autoMaintenanceMultiplier: Number.MAX_SAFE_INTEGER,
    });

    // This first set will expire after the second set gets added
    myCache.abc = 123;
    myCache.def = 456;
    myCache.ghi = 789;
    await timeoutPromise();
    myCache.jkl = 321;
    myCache.mno = 654;
    myCache.abc = 1000;
    await timeoutPromise();

    // Now, adding a new value (over maxCacheSize) should remove both of the remaining expired values
    myCache.newOne = 100;
    expect(myCache.def).toEqual(undefined);
    expect(myCache.ghi).toEqual(undefined);
    expect(Object.keys(myCache)).toEqual(['abc', 'jkl', 'mno', 'newOne']);

    // And then the next can go in without having to remove anything
    myCache.newTwo = 200;
    expect(myCache.jkl).toEqual(321);
    expect(myCache.mno).toEqual(654);
    expect(myCache.abc).toEqual(1000);
    expect(Object.keys(myCache)).toEqual(['abc', 'jkl', 'mno', 'newOne', 'newTwo']);
  });
});
