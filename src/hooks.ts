import { useRef } from 'react';

import {
  LimitedCache,
  LimitedCacheInstance,
  LimitedCacheObject,
  // types
  LimitedCacheObjectInterface,
  LimitedCacheOptionsPartial,
} from './main';

const useLimitedCache = (options: LimitedCacheOptionsPartial): LimitedCacheInstance => {
  const lastOptionsRef = useRef(options);
  const limitedCacheRef = useRef(LimitedCache(options));

  if (options !== lastOptionsRef.current) {
    lastOptionsRef.current = options;
    limitedCacheRef.current.setOptions(options);
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

export { useLimitedCache, useLimitedCacheObject };
