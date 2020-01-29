import {
  lowLevelInit,
  lowLevelGet,
  lowLevelHas,
  lowLevelSet,
  lowLevelRemove,
  lowLevelSetOptions,
  lowLevelDoMaintenance,
} from './lowLevelFunctions';
import {
  LimitedCacheOptions,
  LimitedCacheOptionsReadonly,
  LimitedCacheInstance,
  LimitedCacheMeta,
} from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LimitedCache<T = any>(options?: LimitedCacheOptions): LimitedCacheInstance<T> {
  const cacheMeta = lowLevelInit(options);

  return {
    get: lowLevelGet.bind(null, cacheMeta),
    has: lowLevelHas.bind(null, cacheMeta),
    set: (cacheKey, item): T => {
      lowLevelSet(cacheMeta, cacheKey, item);
      return item;
    },
    remove: (cacheKey): true => {
      lowLevelRemove(cacheMeta, cacheKey);
      return true;
    },
    // remove: lowLevelRemove.bind(null, cacheMeta),
    getCacheMeta: (): LimitedCacheMeta => cacheMeta,
    getOptions: (): LimitedCacheOptionsReadonly => cacheMeta.options,
    setOptions: lowLevelSetOptions.bind(null, cacheMeta),
    doMaintenance: lowLevelDoMaintenance.bind(null, cacheMeta),
  };
}

export default LimitedCache;
