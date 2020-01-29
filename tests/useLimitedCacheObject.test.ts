import { DependencyList } from 'react';
import { renderHook } from '@testing-library/react-hooks';

import { LimitedCacheObject } from '../src';
import { useLimitedCacheObject } from '../src/hooks';
import { LimitedCacheObjectInstance, LimitedCacheOptions } from '../src/types';

type MockComponentProps =
  | {
      options: LimitedCacheOptions;
      deps: DependencyList;
    }
  | undefined;

describe('useLimitedCacheObject', () => {
  let result: { current: LimitedCacheObjectInstance };
  let rerender: (props: MockComponentProps) => void;
  beforeEach(() => {
    ({ result, rerender } = renderHook((props: MockComponentProps) => {
      const { options, deps } = props || {};
      return useLimitedCacheObject(options, deps);
    }));
  });

  it('should return a limitedCacheObject instance', () => {
    const blankLimitedCacheObjectInstance = LimitedCacheObject();
    expect(typeof result.current).toEqual(typeof blankLimitedCacheObjectInstance);
    expect(Object.keys(result.current)).toMatchObject(Object.keys(blankLimitedCacheObjectInstance));
  });

  it('should return the same, persistent limitedCacheObject instance', () => {
    const firstResult = result.current;

    rerender(undefined);

    expect(result.current).toStrictEqual(firstResult);
  });

  it('should update options when deps change', () => {
    ({ result, rerender } = renderHook((props: MockComponentProps) => {
      const { options, deps } = props || { deps: ['initial'] };
      return useLimitedCacheObject(options, deps);
    }));

    rerender({
      options: {
        maxCacheSize: 1,
        warnIfItemPurgedBeforeTime: 0,
      },
      deps: ['something new'],
    });
    const limitedCacheObject = result.current;

    limitedCacheObject.abc = 1;
    expect(limitedCacheObject.abc).toEqual(1);
    limitedCacheObject.def = 2;
    expect(limitedCacheObject.def).toEqual(2);
    expect(limitedCacheObject.abc).toEqual(undefined);
  });

  it("should not update options when deps don't change", () => {
    rerender({
      options: {
        maxCacheSize: 1,
      },
      deps: [],
    });
    const limitedCacheObject = result.current;

    limitedCacheObject.abc = 1;
    expect(limitedCacheObject.abc).toEqual(1);
    limitedCacheObject.def = 2;
    expect(limitedCacheObject.def).toEqual(2);
    expect(limitedCacheObject.abc).toEqual(1);
  });
});
