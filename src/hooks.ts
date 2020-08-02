import { useMemo, useRef, DependencyList } from 'react';

import LimitedCache from './core/LimitedCache';
import LimitedCacheObject from './core/LimitedCacheObject';

import {
  DefaultItemType,
  LimitedCacheInstance,
  LimitedCacheObjectInstance,
  LimitedCacheOptions,
} from './types';

const useLimitedCache = <ItemType = DefaultItemType>(
  options?: LimitedCacheOptions,
  deps: DependencyList = [],
): LimitedCacheInstance<ItemType> => {
  const lastOptionsRef = useRef(options);
  const limitedCache = useRef(LimitedCache<ItemType>(options)).current;

  if (options !== lastOptionsRef.current) {
    lastOptionsRef.current = options;
    if (options) {
      limitedCache.setOptions(options);
    }
  }

  // Piggyback on useMemo's existing shallow comparison, to keep things small
  useMemo(limitedCache.reset, deps);

  return limitedCache;
};

const useLimitedCacheObject = <ItemType = DefaultItemType>(
  options?: LimitedCacheOptions,
  deps: DependencyList = [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): LimitedCacheObjectInstance<ItemType> => {
  const limitedCacheRef = useRef<LimitedCacheObjectInstance>();

  // Piggyback on useMemo's existing shallow comparison, to keep things small
  useMemo(() => {
    limitedCacheRef.current = LimitedCacheObject<ItemType>(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return limitedCacheRef.current as LimitedCacheObjectInstance<ItemType>;
};

export { useLimitedCache, useLimitedCacheObject };
