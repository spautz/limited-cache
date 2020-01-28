// combine modules

import defaultOptions from './defaultOptions';
import LimitedCache from './LimitedCache';
import LimitedCacheObject from './LimitedCacheObject';
import limitedCacheUtil from './limitedCacheUtil';

export { defaultOptions, LimitedCache, LimitedCacheObject, limitedCacheUtil };

// combine types

import { LimitedCacheInstance } from './LimitedCache';
import { LimitedCacheObjectInterface } from './LimitedCacheObject';
import { LimitedCacheMeta } from './lowLevelFunctions';
import {
  LimitedCacheOptions,
  LimitedCacheOptionsPartial,
  LimitedCacheOptionsReadonly,
} from './defaultOptions';

export {
  LimitedCacheInstance,
  LimitedCacheObjectInterface,
  LimitedCacheMeta,
  LimitedCacheOptions,
  LimitedCacheOptionsPartial,
  LimitedCacheOptionsReadonly,
};
