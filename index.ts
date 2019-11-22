import {
  lowLevelGet,
  lowLevelHas,
  lowLevelInit,
  lowLevelPerformMaintenance,
  lowLevelRemove,
  lowLevelSet,
  lowLevelSetOptions,
} from './src/limitedCacheUtil';

import LimitedCache from './src/LimitedCache';
import LimitedCacheObject from './src/LimitedCacheObject';

export { LimitedCacheInstance } from './src/LimitedCache';
export { LimitedCacheObjectInterface } from './src/LimitedCacheObject';
export { LimitedCacheMeta } from './src/limitedCacheUtil';
export {
  defaultOptions,
  LimitedCacheOptions,
  LimitedCacheOptionsPartial,
  LimitedCacheOptionsReadonly,
} from './src/options';

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
