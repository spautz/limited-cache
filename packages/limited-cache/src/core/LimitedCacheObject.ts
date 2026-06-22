import type {
  DefaultItemType,
  LimitedCacheMeta,
  LimitedCacheObjectInstance,
  LimitedCacheOptions,
} from '../types.js';
import { hasOwnProperty } from './builtIns.js';
import {
  lowLevelGetAll,
  lowLevelGetOne,
  lowLevelHas,
  lowLevelInit,
  lowLevelRemove,
  lowLevelSet,
} from './lowLevelFunctions.js';

// The `any` here doesn't escape out anywhere: it's overridden by the constructor below

const proxyHandler: ProxyHandler<LimitedCacheObjectInstance> = {
  get: (cacheMeta: LimitedCacheMeta, cacheKey: string) => {
    if (cacheKey === 'hasOwnProperty') {
      return hasOwnProperty;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: (cacheMeta: LimitedCacheMeta, cacheKey: string, item: any): any => {
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
 * So that we can retrieve the cacheMeta for a LimitedCacheObject, without polluting its properties, each proxy
 * is associated back to its internal cacheMeta here.
 */
const cacheMetasForProxies = new WeakMap();

const LimitedCacheObject = <ItemType = DefaultItemType>(
  options?: LimitedCacheOptions,
): LimitedCacheObjectInstance<ItemType> => {
  const cacheMeta = lowLevelInit(options);
  const limitedCacheObject = new Proxy(cacheMeta, proxyHandler);

  cacheMetasForProxies.set(limitedCacheObject, cacheMeta);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return limitedCacheObject;
};

const getCacheMetaFromObject = (instance: LimitedCacheObjectInstance): LimitedCacheMeta => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return cacheMetasForProxies.get(instance);
};

export { getCacheMetaFromObject, LimitedCacheObject };
