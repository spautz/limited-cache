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
const bindFunctionToCacheMeta = <ItemType>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (cacheMeta: LimitedCacheMeta<ItemType>, ...otherArgs: any) => any,
  cacheMeta: LimitedCacheMeta<ItemType>,
) => fn.bind(null, cacheMeta);

const LimitedCache = <ItemType = DefaultItemType>(
  options?: LimitedCacheOptions,
): LimitedCacheInstance<ItemType> => {
  const cacheMeta = lowLevelInit<ItemType>(options);

  return {
    get: bindFunctionToCacheMeta<ItemType>(lowLevelGetOne, cacheMeta),
    getAll: bindFunctionToCacheMeta<ItemType>(lowLevelGetAll, cacheMeta),
    has: bindFunctionToCacheMeta<ItemType>(lowLevelHas, cacheMeta),
    set: (cacheKey, item): ItemType => {
      lowLevelSet(cacheMeta, cacheKey, item);
      return item;
    },
    remove: (cacheKey): true => {
      lowLevelRemove(cacheMeta, cacheKey);
      return true;
    },
    reset: bindFunctionToCacheMeta<ItemType>(lowLevelReset, cacheMeta),
    getCacheMeta: (): LimitedCacheMeta<ItemType> => cacheMeta,
    getOptions: (): LimitedCacheOptionsReadonly => cacheMeta.options,
    setOptions: bindFunctionToCacheMeta<ItemType>(lowLevelSetOptions, cacheMeta),
    doMaintenance: bindFunctionToCacheMeta<ItemType>(lowLevelDoMaintenance, cacheMeta),
  };
};

export { LimitedCache };
