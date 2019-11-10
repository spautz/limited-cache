import {
    lowLevelInit,
    lowLevelGet,
    lowLevelHas,
    lowLevelSet,
    lowLevelRemove,
    // type
    LimitedCacheMeta, LimitedCacheOptionsPartial,
} from './limitedCacheUtil'

interface LimitedCacheObjectInterface {
    [key: string]: any;
}


const proxyHandler = {
    get: (cacheMeta: LimitedCacheMeta, cacheKey: string) => {
        lowLevelGet(cacheMeta, cacheKey);
        return true;
    },
    has: lowLevelHas,
    set: (cacheMeta: LimitedCacheMeta, cacheKey: string, item: any) => {
        lowLevelSet(cacheMeta, cacheKey, item);
        return item;
    },
    deleteProperty: (cacheMeta: LimitedCacheMeta, cacheKey: string) => {
        lowLevelRemove(cacheMeta, cacheKey);
        return true;
    },
    ownKeys: (cacheMetaTarget: LimitedCacheMeta) => cacheMetaTarget.recentCacheKeys,
};

function LimitedCacheProxy(options: LimitedCacheOptionsPartial) : LimitedCacheObjectInterface {
    const cacheMeta = lowLevelInit(options);
    return new Proxy(cacheMeta, proxyHandler);
}

export default LimitedCacheProxy;
