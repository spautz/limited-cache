import {
  lowLevelInit,
  lowLevelGet,
  lowLevelHas,
  lowLevelSet,
  lowLevelRemove,
} from './lowLevelFunctions';
import { LimitedCacheOptions, LimitedCacheMeta } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface LimitedCacheObjectInterface<T = any> {
  [key: string]: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proxyHandler: ProxyHandler<any> = {
  get: (cacheMeta: LimitedCacheMeta, cacheKey: string) => {
    if (cacheKey === 'hasOwnProperty') {
      return Object.prototype.hasOwnProperty;
    }

    return lowLevelGet(cacheMeta, cacheKey);
  },
  getOwnPropertyDescriptor: (cacheMeta: LimitedCacheMeta, cacheKey: string) => {
    const hasResult = lowLevelHas(cacheMeta, cacheKey);
    const getResult = lowLevelGet(cacheMeta, cacheKey);

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
  ownKeys: (cacheMeta: LimitedCacheMeta) => Object.keys(lowLevelGet(cacheMeta)),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LimitedCacheObject<T = any>(
  options?: LimitedCacheOptions,
): LimitedCacheObjectInterface<T> {
  const cacheMeta = lowLevelInit(options);
  return new Proxy(cacheMeta, proxyHandler);
}

export default LimitedCacheObject;
