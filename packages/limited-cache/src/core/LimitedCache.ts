import type {
  DefaultItemType,
  LimitedCacheInstance,
  LimitedCacheMeta,
  LimitedCacheOptions,
  LimitedCacheOptionsReadonly,
} from '../types.js';
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

// Most public functions just call a low-level function directly, passing the cacheMeta.
// Doing this via a helper function makes the typeChecks easier, and minifies better.
const bindFunctionToCacheMeta = <ItemType, OtherArgs extends unknown[], ReturnValue>(
  fn: (cacheMeta: LimitedCacheMeta<ItemType>, ...otherArgs: OtherArgs) => ReturnValue,
  cacheMeta: LimitedCacheMeta<ItemType>,
): ((...otherArgs: OtherArgs) => ReturnValue) => fn.bind(null, cacheMeta);

const LimitedCache = <ItemType = DefaultItemType>(
  options?: LimitedCacheOptions,
): LimitedCacheInstance<ItemType> => {
  const cacheMeta = lowLevelInit<ItemType>(options);

  return {
    get: bindFunctionToCacheMeta(lowLevelGetOne, cacheMeta),
    getAll: bindFunctionToCacheMeta(lowLevelGetAll, cacheMeta),
    has: bindFunctionToCacheMeta(lowLevelHas, cacheMeta),
    set: (cacheKey, item): ItemType => {
      lowLevelSet(cacheMeta, cacheKey, item);
      return item;
    },
    remove: (cacheKey): true => {
      lowLevelRemove(cacheMeta, cacheKey);
      return true;
    },
    reset: bindFunctionToCacheMeta(lowLevelReset, cacheMeta),
    getCacheMeta: (): LimitedCacheMeta<ItemType> => cacheMeta,
    getOptions: (): LimitedCacheOptionsReadonly => cacheMeta.options,
    setOptions: bindFunctionToCacheMeta(lowLevelSetOptions, cacheMeta),
    doMaintenance: bindFunctionToCacheMeta(lowLevelDoMaintenance, cacheMeta),
  };
};

export { LimitedCache };
