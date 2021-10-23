import { hasOwnProperty } from './builtIns';
import {
  lowLevelInit,
  lowLevelGetOne,
  lowLevelGetAll,
  lowLevelHas,
  lowLevelSet,
  lowLevelRemove,
} from './lowLevelFunctions';
import {
  LimitedCacheOptions,
  LimitedCacheObjectInstance,
  LimitedCacheMeta,
  DefaultItemType,
} from '../types';

// The `any` here doesn't escape out anywhere: it's overridden by the constructor below
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proxyHandler: ProxyHandler<LimitedCacheObjectInstance<any>> = {
  get: (cacheMeta: LimitedCacheMeta, cacheKey: string) => {
    if (cacheKey === 'hasOwnProperty') {
      return hasOwnProperty;
    }

    return lowLevelGetOne(cacheMeta, cacheKey);
  },
  getOwnPropertyDescriptor: (cacheMeta: LimitedCacheMeta, cacheKey: string) => {
    const hasResult = lowLevelHas(cacheMeta, cacheKey);
    const getResult = lowLevelGetOne(cacheMeta, cacheKey);

    if (hasResult) {
      return {
        configurable: true,
        enumerable: hasResult,
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

const LimitedCacheObject = <ItemType = DefaultItemType>(
  options?: LimitedCacheOptions,
): LimitedCacheObjectInstance<ItemType> => {
  const cacheMeta = lowLevelInit(options);
  return new Proxy(cacheMeta, proxyHandler);
};

export { LimitedCacheObject };
