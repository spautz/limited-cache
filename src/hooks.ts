import { useRef } from 'react';

import {
  LimitedCache,
  LimitedCacheObject,
  // types
} from './index';
import { LimitedCacheInstance, LimitedCacheObjectInterface, LimitedCacheOptions } from './types';

const useLimitedCache = (options?: LimitedCacheOptions): LimitedCacheInstance => {
  const lastOptionsRef = useRef(options);
  const limitedCacheRef = useRef(LimitedCache(options));

  if (options !== lastOptionsRef.current) {
    lastOptionsRef.current = options;
    if (options) {
      limitedCacheRef.current.setOptions(options);
    }
  }

  return limitedCacheRef.current;
};

const useLimitedCacheObject = (
  options: LimitedCacheOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): LimitedCacheObjectInterface<any> => {
  const lastOptionsRef = useRef(options);
  const limitedCacheRef = useRef(LimitedCacheObject(options));

  if (options !== lastOptionsRef.current) {
    lastOptionsRef.current = options;
    limitedCacheRef.current.setOptions(options);
  }

  return limitedCacheRef.current;
};

export { useLimitedCache, useLimitedCacheObject };
