import {
  lowLevelGet,
  lowLevelHas,
  lowLevelInit,
  lowLevelPerformMaintenance,
  lowLevelRemove,
  lowLevelSet,
  lowLevelSetOptions,
} from './limited-cache/limitedCacheUtil';

import LimitedCache from './limited-cache/LimitedCache';
import LimitedCacheObject from './limited-cache/LimitedCacheObject';

export { LimitedCacheInstance } from './limited-cache/LimitedCache';
export { LimitedCacheObjectInterface } from './limited-cache/LimitedCacheObject';
export { LimitedCacheMeta } from './limited-cache/limitedCacheUtil';
export {
  defaultOptions,
  LimitedCacheOptions,
  LimitedCacheOptionsPartial,
  LimitedCacheOptionsReadonly,
} from './limited-cache/options';

export { LimitedCache, LimitedCacheObject };

export const limitedCacheUtil = {
  init: lowLevelInit,
  get: lowLevelGet,
  has: lowLevelHas,
  set: lowLevelSet,
  remove: lowLevelRemove,
  performMaintenance: lowLevelPerformMaintenance,
  setOptions: lowLevelSetOptions,
};
