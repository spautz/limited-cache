/* eslint-env jest */
import { LimitedCache, LimitedCacheInstance } from '../src';

// To avoid race conditions or timing issues, since some expect() checks can take 10+ ms when busy,
// we use a long cache timeout even for 'immediate' expiration, and use delays slightly longer than that
const CACHE_TIMEOUT = 20;
const timeoutPromise = (): Promise<null> =>
  new Promise((resolve) => setTimeout(resolve, CACHE_TIMEOUT + 2));

describe('maxCacheSize scenarios', () => {
  let myCache: LimitedCacheInstance;
  beforeEach(() => {
    myCache = LimitedCache({
      maxCacheSize: 20,
      maxCacheTime: Number.MAX_SAFE_INTEGER,
      autoMaintenanceMultiplier: Number.MAX_SAFE_INTEGER,
    });
  });

  it('removes items to stay within the cache size, with unique keys', () => {
    // Populate items into new keys: there should remain 20 items
    for (let n = 1; n <= 1000; n++) {
      myCache.set(`n=${n}`, n);

      const allKeys = Object.keys(myCache.get());
      expect(allKeys.length).toEqual(Math.min(20, n));
    }
  });

  it('removes items to stay within the cache size, with overlapping keys', () => {
    // Populate 20 items
    for (let n = 1; n <= 20; n++) {
      myCache.set(`n=${n}`, n);
    }

    // Populate items into progressive larger sets of keys: there should remain 20 items
    for (let n = 1; n <= 10; n++) {
      myCache.set(`n=${n}`, n);

      const allKeys = Object.keys(myCache.get());
      expect(allKeys.length).toEqual(20);
    }
    for (let n = 1; n <= 100; n++) {
      myCache.set(`n=${n}`, n);

      const allKeys = Object.keys(myCache.get());
      expect(allKeys.length).toEqual(20);
    }
    for (let n = 1; n <= 1000; n++) {
      myCache.set(`n=${n}`, n);

      const allKeys = Object.keys(myCache.get());
      expect(allKeys.length).toEqual(20);
    }
  });

  it('removes items to stay within the cache size, with randomized keys', () => {
    // Populate 20 items
    for (let n = 1; n <= 20; n++) {
      myCache.set(`n=${n}`, n);
    }

    // Now keep populating random values into a limited set of keys: there should remain 20 items
    for (let i = 0; i < 1000; i++) {
      // Keys will span 1 to 100
      const n = Math.floor(Math.random() * 100) + 1;
      myCache.set(`n=${n}`, i);

      const allKeys = Object.keys(myCache.get());
      expect(allKeys.length).toEqual(20);
    }
  });

  it('removes expired items aggressively', async () => {
    myCache = LimitedCache({
      maxCacheSize: 5,
      maxCacheTime: CACHE_TIMEOUT,
      autoMaintenanceMultiplier: Number.MAX_SAFE_INTEGER,
    });

    // Fill the cache
    for (let n = 1; n <= 5; n++) {
      myCache.set(`n=${n}`, n);
    }
    expect(Object.keys(myCache.get())).toEqual(['n=1', 'n=2', 'n=3', 'n=4', 'n=5']);

    await timeoutPromise();

    // Fill with different values
    for (let n = 6; n <= 10; n++) {
      myCache.set(`n=${n}`, n);
    }
    expect(Object.keys(myCache.get())).toEqual(['n=6', 'n=7', 'n=8', 'n=9', 'n=10']);
  });

  it('warns if a freshly-added item is pushed out too quickly', async () => {
    myCache = LimitedCache({
      maxCacheSize: 5,
      maxCacheTime: 1000,
      autoMaintenanceMultiplier: Number.MAX_SAFE_INTEGER,
      warnIfItemPurgedBeforeTime: 1000,
    });

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockReturnValueOnce();

    for (let n = 1; n <= 5; n++) {
      myCache.set(`n=${n}`, n);
    }
    // This pushes out the still-fresh `n=1`
    myCache.set('abc', 123);

    expect(Object.keys(myCache.get())).toEqual(['n=2', 'n=3', 'n=4', 'n=5', 'abc']);

    // And we should have seen a warning about the force-removed key
    const consoleWarnCalls = consoleWarnSpy.mock.calls;
    expect(consoleWarnCalls.length).toBe(1);
    const [warningString, warningObject] = consoleWarnCalls[0];
    expect(warningString).toBe(
      'Purged an item from cache while it was still fresh: you may want to increase maxCacheSize',
    );
    expect(typeof warningObject).toBe('object');
    expect(warningObject.key).toBe('n=1');
  });
});
