import { DependencyList, useMemo, useRef } from 'react';

import {
  LimitedCache,
  LimitedCacheObject,
  // types
} from './index';
import { LimitedCacheInstance, LimitedCacheObjectInterface, LimitedCacheOptions } from './types';

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
): LimitedCacheObjectInterface<any> => {
  const lastOptionsRef = useRef(options);
  const limitedCacheRef = useRef<LimitedCacheObjectInterface>();

  // Piggyback on useMemo's existing shallow comparison, to keep things small
  useMemo(() => {
    limitedCacheRef.current = LimitedCacheObject(options);
  }, deps || []);
  const limitedCache = limitedCacheRef.current as LimitedCacheObjectInterface;

  if (options !== lastOptionsRef.current) {
    lastOptionsRef.current = options;
    limitedCache.setOptions(options);
  }

  return limitedCache;
};

export { useLimitedCache, useLimitedCacheObject };
