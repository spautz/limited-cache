import { limitedCacheUtil, LimitedCacheMeta } from '../src';

describe('value types', () => {
  let myCacheMeta: LimitedCacheMeta;
  beforeEach(() => {
    myCacheMeta = limitedCacheUtil.init();
  });

  it('null', () => {
    limitedCacheUtil.set(myCacheMeta, 'test', null);

    expect(limitedCacheUtil.has(myCacheMeta, 'test')).toEqual(true);
    expect(limitedCacheUtil.get(myCacheMeta, 'test')).toEqual(null);
  });

  // Setting an explicit `undefined` treats the value as absent
  it('undefined', () => {
    limitedCacheUtil.set(myCacheMeta, 'test', undefined);

    expect(limitedCacheUtil.has(myCacheMeta, 'test')).toEqual(false);
    expect(limitedCacheUtil.get(myCacheMeta, 'test')).toEqual(undefined);
  });

  it('object', () => {
    limitedCacheUtil.set(myCacheMeta, 'test', { foo: 'bar' });

    expect(limitedCacheUtil.has(myCacheMeta, 'test')).toEqual(true);
    expect(limitedCacheUtil.get(myCacheMeta, 'test')).toEqual({ foo: 'bar' });
  });

  it('array', () => {
    limitedCacheUtil.set(myCacheMeta, 'test', [1, 2, 3]);

    expect(limitedCacheUtil.has(myCacheMeta, 'test')).toEqual(true);
    expect(limitedCacheUtil.get(myCacheMeta, 'test')).toEqual([1, 2, 3]);
  });

  it('function', () => {
    function testFunction(): null {
      return null;
    }

    limitedCacheUtil.set(myCacheMeta, 'test', testFunction);

    expect(limitedCacheUtil.has(myCacheMeta, 'test')).toEqual(true);
    expect(limitedCacheUtil.get(myCacheMeta, 'test')).toEqual(testFunction);
  });
});
