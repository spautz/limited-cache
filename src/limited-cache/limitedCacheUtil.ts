import {
  lowLevelGet,
  lowLevelHas,
  lowLevelInit,
  lowLevelDoMaintenance,
  lowLevelRemove,
  lowLevelSet,
  lowLevelSetOptions,
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
