// import LimitedCache from './limited-cache/LimitedCache';
// import LimitedCacheObject from './limited-cache/LimitedCacheObject';
// import limitedCacheUtil from './limited-cache/limitedCacheUtil';
// import defaultOptions from './limited-cache/defaultOptions';
import {
  LimitedCacheInternal,
  LimitedCacheObjectInternal,
  limitedCacheUtilInternal,
  defaultOptionsInternal,
} from './limited-cache';

// types
import { LimitedCacheInstance } from './limited-cache/LimitedCache';
import { LimitedCacheObjectInterface } from './limited-cache/LimitedCacheObject';
import { LimitedCacheMeta } from './limited-cache/lowLevelFunctions';
import {
  LimitedCacheOptions,
  LimitedCacheOptionsPartial,
  LimitedCacheOptionsReadonly,
} from './limited-cache/defaultOptions';

// export { LimitedCache, LimitedCacheObject, limitedCacheUtil, defaultOptions };

export const LimitedCache = LimitedCacheInternal;
export const LimitedCacheObject = LimitedCacheObjectInternal;
export const limitedCacheUtil = limitedCacheUtilInternal;
export const defaultOptions = defaultOptionsInternal;
// types
export {
  LimitedCacheInstance,
  LimitedCacheObjectInterface,
  LimitedCacheMeta,
  LimitedCacheOptions,
  LimitedCacheOptionsPartial,
  LimitedCacheOptionsReadonly,
};
