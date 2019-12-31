import { limitedCacheUtil, LimitedCacheMeta } from '../index';

describe('key names', () => {
  let myCacheMeta: LimitedCacheMeta;
  beforeEach(() => {
    myCacheMeta = limitedCacheUtil.init();
  });

  it('builtins: hasOwnProperty', () => {
    expect(limitedCacheUtil.has(myCacheMeta, 'hasOwnProperty')).toEqual(false);
    expect(limitedCacheUtil.get(myCacheMeta, 'hasOwnProperty')).toEqual(undefined);

    limitedCacheUtil.set(myCacheMeta, 'hasOwnProperty', 123);

    expect(limitedCacheUtil.has(myCacheMeta, 'hasOwnProperty')).toEqual(true);
    expect(limitedCacheUtil.get(myCacheMeta, 'hasOwnProperty')).toEqual(123);
  });

  it('builtins: constructor', () => {
    expect(limitedCacheUtil.has(myCacheMeta, 'constructor')).toEqual(false);
    expect(limitedCacheUtil.get(myCacheMeta, 'constructor')).toEqual(undefined);

    limitedCacheUtil.set(myCacheMeta, 'constructor', 123);

    expect(limitedCacheUtil.has(myCacheMeta, 'constructor')).toEqual(true);
    expect(limitedCacheUtil.get(myCacheMeta, 'constructor')).toEqual(123);
  });

  it('empty string', () => {
    limitedCacheUtil.set(myCacheMeta, '', 123);

    expect(limitedCacheUtil.has(myCacheMeta, '')).toEqual(true);
    expect(limitedCacheUtil.get(myCacheMeta, '')).toEqual(123);
  });

  it('number', () => {
    /* eslint-disable @typescript-eslint/ban-ts-ignore */
    // @ts-ignore
    limitedCacheUtil.set(myCacheMeta, 123, 123);

    // @ts-ignore
    expect(limitedCacheUtil.has(myCacheMeta, 123)).toEqual(true);
    // @ts-ignore
    expect(limitedCacheUtil.get(myCacheMeta, 123)).toEqual(123);
    /* eslint-enable */
  });

  it('special character: "-"', () => {
    limitedCacheUtil.set(myCacheMeta, 'abc-123', 123);

    expect(limitedCacheUtil.has(myCacheMeta, 'abc-123')).toEqual(true);
    expect(limitedCacheUtil.get(myCacheMeta, 'abc-123')).toEqual(123);
  });

  it('special character: "."', () => {
    limitedCacheUtil.set(myCacheMeta, 'abc.123', 123);

    expect(limitedCacheUtil.has(myCacheMeta, 'abc.123')).toEqual(true);
    expect(limitedCacheUtil.get(myCacheMeta, 'abc.123')).toEqual(123);
  });

  it('special character: " "', () => {
    limitedCacheUtil.set(myCacheMeta, 'abc 123', 123);

    expect(limitedCacheUtil.has(myCacheMeta, 'abc 123')).toEqual(true);
    expect(limitedCacheUtil.get(myCacheMeta, 'abc 123')).toEqual(123);
  });
});
