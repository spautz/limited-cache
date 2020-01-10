import { useRef } from 'react';

import { LimitedCache, LimitedCacheObject, limitedCacheUtil } from './limited-cache';

// types
import {
  LimitedCacheInstance,
  LimitedCacheObjectInterface,
  LimitedCacheOptionsPartial,
  LimitedCacheMeta,
} from './limited-cache';

const useLimitedCache = (options?: LimitedCacheOptionsPartial): LimitedCacheInstance => {
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
  options: LimitedCacheOptionsPartial,
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

const useLimitedCacheMeta = (options: LimitedCacheOptionsPartial): LimitedCacheMeta => {
  const lastOptionsRef = useRef(options);
  const limitedCacheMetaRef = useRef(limitedCacheUtil.init(options));

  if (options !== lastOptionsRef.current) {
    lastOptionsRef.current = options;
    limitedCacheUtil.setOptions(limitedCacheMetaRef.current, options);
  }

  return limitedCacheMetaRef.current;
};

export { useLimitedCache, useLimitedCacheObject, useLimitedCacheMeta };
