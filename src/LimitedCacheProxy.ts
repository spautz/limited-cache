import {
  lowLevelInit,
  lowLevelGet,
  lowLevelHas,
  lowLevelSet,
  lowLevelRemove,
  // type
  LimitedCacheMeta,
  LimitedCacheOptionsPartial,
} from './limitedCacheUtil';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface LimitedCacheObjectInterface<T = any> {
  [key: string]: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proxyHandler: ProxyHandler<any> = {
  get: (cacheMeta: LimitedCacheMeta, cacheKey: string) => {
    return lowLevelGet(cacheMeta, cacheKey);
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
  ownKeys: (cacheMetaTarget: LimitedCacheMeta) => cacheMetaTarget.recentCacheKeys,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LimitedCacheProxy<T = any>(
  options: LimitedCacheOptionsPartial,
): LimitedCacheObjectInterface<T> {
  const cacheMeta = lowLevelInit(options);
  return new Proxy(cacheMeta, proxyHandler);
}

export default LimitedCacheProxy;
