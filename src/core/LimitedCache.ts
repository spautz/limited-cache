import {
  lowLevelInit,
  lowLevelGet,
  lowLevelHas,
  lowLevelSet,
  lowLevelRemove,
  lowLevelSetOptions,
  lowLevelDoMaintenance,
  // types
  LimitedCacheMeta,
} from './lowLevelFunctions';
import { LimitedCacheOptionsPartial, LimitedCacheOptionsReadonly } from './defaultOptions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface LimitedCacheInstance<T = any> {
  get: (cacheKey?: string) => T;
  has: (cacheKey: string) => boolean;
  set: (cacheKey: string, item: T) => T;
  remove: (cacheKey: string) => true;
  getCacheMeta: () => LimitedCacheMeta;
  getOptions: () => LimitedCacheOptionsReadonly;
  setOptions: (newOptions: LimitedCacheOptionsPartial) => LimitedCacheOptionsReadonly;
  doMaintenance: () => LimitedCacheMeta;
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
    doMaintenance: lowLevelDoMaintenance.bind(null, cacheMeta),
  };
}

export default LimitedCache;
// types
export { LimitedCacheInstance };
