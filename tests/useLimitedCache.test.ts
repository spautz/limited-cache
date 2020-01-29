import { renderHook } from '@testing-library/react-hooks';

import { LimitedCache } from '../src';
import { useLimitedCache } from '../src/hooks';
import { LimitedCacheInstance, LimitedCacheOptions } from '../src/types';

describe('useLimitedCache', () => {
  let result: { current: LimitedCacheInstance };
  let rerender: (options?: LimitedCacheOptions) => void;
  beforeEach(() => {
    ({ result, rerender } = renderHook((options: LimitedCacheOptions = null) =>
      useLimitedCache(options),
    ));
  });

  it('should return a limitedCache instance', () => {
    const blankLimitedCacheInstance = LimitedCache();
    expect(typeof result.current).toEqual(typeof blankLimitedCacheInstance);
    expect(Object.keys(result.current)).toMatchObject(Object.keys(blankLimitedCacheInstance));

    const cacheMeta = result.current.getCacheMeta();
    expect(typeof cacheMeta).toBe('object');
    expect(typeof cacheMeta.options).toBe('object');
  });

  it('should return the same, persistent limitedCache instance', () => {
    const firstResult = result.current;

    rerender();

    expect(result.current).toStrictEqual(firstResult);
  });

  it('should update options', () => {
    const firstResult = result.current;

    rerender({
      maxCacheSize: 123,
    });

    expect(result.current).toStrictEqual(firstResult);
    const cacheMeta = result.current.getCacheMeta();
    expect(typeof cacheMeta).toBe('object');
    expect(typeof cacheMeta.options).toBe('object');

    expect(cacheMeta.options.maxCacheSize).toEqual(123);
  });

  it('should not update options when not necessary', () => {
    const firstResultOptions = result.current.getOptions();
    const firstResultOptionValues = { ...firstResultOptions };

    rerender(null);

    const newOptions = result.current.getOptions();
    expect(newOptions).toStrictEqual(firstResultOptions);
    expect(newOptions).toMatchObject(firstResultOptionValues);
  });
});
