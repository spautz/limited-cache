import {
  lowLevelInit,
  lowLevelGet,
  lowLevelHas,
  lowLevelSet,
  lowLevelRemove,
  lowLevelSetOptions,
  lowLevelPerformMaintenance,
  // types
  LimitedCacheOptionsPartial,
  LimitedCacheOptionsReadonly,
  LimitedCacheMeta,
} from './limitedCacheUtil';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface LimitedCacheInstance<T = any> {
  get: (cacheKey?: string) => T;
  has: (cacheKey: string) => boolean;
  set: (cacheKey: string, item: T) => T;
  remove: (cacheKey: string) => true;
  getCacheMeta: () => LimitedCacheMeta;
  getOptions: () => LimitedCacheOptionsReadonly;
  setOptions: (newOptions: LimitedCacheOptionsPartial) => LimitedCacheOptionsReadonly;
  performMaintenance: () => LimitedCacheMeta;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LimitedCache<T = any>(options?: LimitedCacheOptionsPartial): LimitedCacheInstance<T> {
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
    performMaintenance: lowLevelPerformMaintenance.bind(null, cacheMeta),
  };
}

export default LimitedCache;
