import {
  lowLevelGet,
  lowLevelHas,
  lowLevelInit,
  lowLevelDoMaintenance,
  lowLevelRemove,
  lowLevelReset,
  lowLevelSet,
  lowLevelSetOptions,
} from './lowLevelFunctions';

const limitedCacheUtil = {
  init: lowLevelInit,
  get: lowLevelGet,
  has: lowLevelHas,
  set: lowLevelSet,
  remove: lowLevelRemove,
  reset: lowLevelReset,
  doMaintenance: lowLevelDoMaintenance,
  setOptions: lowLevelSetOptions,
};

export default limitedCacheUtil;
