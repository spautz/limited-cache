import { useRef } from 'react';

// import LimitedCache from './limited-cache/LimitedCache';
// import LimitedCacheObject from './limited-cache/LimitedCacheObject';
import { LimitedCache, LimitedCacheObject } from './main';

// types
import { LimitedCacheInstance } from './limited-cache/LimitedCache';
import { LimitedCacheObjectInterface } from './limited-cache/LimitedCacheObject';
import { LimitedCacheOptionsPartial } from './limited-cache/defaultOptions';

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
