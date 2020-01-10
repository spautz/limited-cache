import {
  lowLevelGet,
  lowLevelHas,
  lowLevelInit,
  lowLevelDoMaintenance,
  lowLevelRemove,
  lowLevelSet,
  lowLevelSetOptions,
  // types
  LimitedCacheMeta,
} from './lowLevelFunctions';

const limitedCacheUtil = {
  init: lowLevelInit,
  get: lowLevelGet,
  has: lowLevelHas,
  set: lowLevelSet,
  remove: lowLevelRemove,
  doMaintenance: lowLevelDoMaintenance,
  setOptions: lowLevelSetOptions,
};

export default limitedCacheUtil;
export { LimitedCacheMeta };
