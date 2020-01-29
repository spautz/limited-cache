import { useMemo, useRef, DependencyList } from 'react';

import {
  LimitedCache,
  LimitedCacheObject,
  // types
} from './index';
import { LimitedCacheInstance, LimitedCacheObjectInstance, LimitedCacheOptions } from './types';

const useLimitedCache = (
  options?: LimitedCacheOptions,
  deps?: DependencyList,
): LimitedCacheInstance => {
  const lastOptionsRef = useRef(options);
  const limitedCache = useRef(LimitedCache(options)).current;

  if (options !== lastOptionsRef.current) {
    lastOptionsRef.current = options;
    if (options) {
      limitedCache.setOptions(options);
    }
  }

  // Piggyback on useMemo's existing shallow comparison, to keep things small
  useMemo(limitedCache.reset, deps || []);

  return limitedCache;
};

const useLimitedCacheObject = (
  options?: LimitedCacheOptions,
  deps?: DependencyList,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): LimitedCacheObjectInstance<any> => {
  const limitedCacheRef = useRef<LimitedCacheObjectInstance>();

  // Piggyback on useMemo's existing shallow comparison, to keep things small
  useMemo(() => {
    limitedCacheRef.current = LimitedCacheObject(options);
  }, deps || []);

  return limitedCacheRef.current as LimitedCacheObjectInstance;
};

export { useLimitedCache, useLimitedCacheObject };
