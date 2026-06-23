import type {
  DefaultItemType,
  LimitedCacheMeta,
  LimitedCacheObjectInstance,
  LimitedCacheOptions,
} from '../types.js';
import {
  lowLevelGetAll,
  lowLevelGetOne,
  lowLevelHas,
  lowLevelInit,
  lowLevelRemove,
  lowLevelSet,
} from './lowLevelFunctions.js';

const proxyHandler: ProxyHandler<LimitedCacheMeta> = {
  get: (cacheMeta: LimitedCacheMeta, cacheKey: string) => {
    if (cacheKey === 'hasOwnProperty') {
      return Object.prototype.hasOwnProperty;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return lowLevelGetOne(cacheMeta, cacheKey);
  },
  getOwnPropertyDescriptor: (cacheMeta: LimitedCacheMeta, cacheKey: string) => {
    const hasResult = lowLevelHas(cacheMeta, cacheKey);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const getResult = lowLevelGetOne(cacheMeta, cacheKey);

    if (hasResult) {
      return {
        configurable: true,
        enumerable: hasResult,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value: getResult,
        writable: true,
      };
    }
    return;
  },
  has: lowLevelHas,
  set: <T>(cacheMeta: LimitedCacheMeta, cacheKey: string, item: T): T => {
    lowLevelSet(cacheMeta, cacheKey, item);
    return item;
  },
  deleteProperty: (cacheMeta: LimitedCacheMeta, cacheKey: string): true => {
    lowLevelRemove(cacheMeta, cacheKey);
    return true;
  },
  ownKeys: (cacheMeta: LimitedCacheMeta) => Object.keys(lowLevelGetAll(cacheMeta)),
};

/**
 * TypeScript's Proxy type models the runtime target, but LimitedCacheObject intentionally returns
 * a facade with a different surface from the internal cache metadata target.
 */
const internal_createLimitedCacheObjectProxy = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
): LimitedCacheObjectInstance<ItemType> => {
  return new Proxy(cacheMeta, proxyHandler) as unknown as LimitedCacheObjectInstance<ItemType>;
};

/**
 * So that we can retrieve the cacheMeta for a LimitedCacheObject, without polluting its properties, each proxy
 * is associated back to its internal cacheMeta here.
 */
const cacheMetasForProxies = new WeakMap();

const LimitedCacheObject = <ItemType = DefaultItemType>(
  options?: LimitedCacheOptions,
): LimitedCacheObjectInstance<ItemType> => {
  const cacheMeta = lowLevelInit<ItemType>(options);
  const limitedCacheObject = internal_createLimitedCacheObjectProxy(cacheMeta);

  cacheMetasForProxies.set(limitedCacheObject, cacheMeta);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return limitedCacheObject;
};

const getCacheMetaFromObject = (instance: LimitedCacheObjectInstance): LimitedCacheMeta => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return cacheMetasForProxies.get(instance);
};

export { getCacheMetaFromObject, LimitedCacheObject };
