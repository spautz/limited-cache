import {
  defaultOptions,
  lowLevelInit,
  lowLevelGet,
  lowLevelHas,
  lowLevelSet,
  lowLevelRemove,
  lowLevelPerformMaintenance,
  lowLevelSetOptions,
} from './limitedCacheUtil';
import LimitedCache from './LimitedCache';
import LimitedCacheObject from './LimitedCacheObject';

export { LimitedCacheInstance } from './LimitedCache';
export { LimitedCacheObjectInterface } from './LimitedCacheObject';
export {
  LimitedCacheOptions,
  LimitedCacheOptionsPartial,
  LimitedCacheOptionsReadonly,
  LimitedCacheMeta,
} from './limitedCacheUtil';

export default LimitedCache;

export { LimitedCache, LimitedCacheObject, defaultOptions };

export const limitedCacheUtil = {
  init: lowLevelInit,
  get: lowLevelGet,
  has: lowLevelHas,
  set: lowLevelSet,
  remove: lowLevelRemove,
  performMaintenance: lowLevelPerformMaintenance,
  setOptions: lowLevelSetOptions,
};
