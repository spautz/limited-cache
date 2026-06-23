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

type LimitedCacheUtil = {
  init: typeof lowLevelInit;
  get: typeof lowLevelGetOne;
  getAll: typeof lowLevelGetAll;
  has: typeof lowLevelHas;
  set: typeof lowLevelSet;
  remove: typeof lowLevelRemove;
  reset: typeof lowLevelReset;
  doMaintenance: typeof lowLevelDoMaintenance;
  setOptions: typeof lowLevelSetOptions;
};

const limitedCacheUtil: LimitedCacheUtil = {
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
