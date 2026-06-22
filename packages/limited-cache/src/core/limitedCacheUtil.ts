import {
  lowLevelDoMaintenance,
  lowLevelGetAll,
  lowLevelGetOne,
  lowLevelHas,
  lowLevelInit,
  lowLevelRemove,
  lowLevelReset,
  lowLevelSet,
  lowLevelSetOptions,
} from './lowLevelFunctions.js';

const limitedCacheUtil = {
  init: lowLevelInit,
  get: lowLevelGetOne,
  getAll: lowLevelGetAll,
  has: lowLevelHas,
  set: lowLevelSet,
  remove: lowLevelRemove,
  reset: lowLevelReset,
  doMaintenance: lowLevelDoMaintenance,
  setOptions: lowLevelSetOptions,
};

export { limitedCacheUtil };
