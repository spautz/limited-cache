import {
    lowLevelInit,
    lowLevelGet,
    lowLevelHas,
    lowLevelSet,
    lowLevelRemove,
} from './limitedCacheUtil'

const proxyHandler = {
    // Because the low-level functions all receive the cacheMeta target as the first argument, followed by the same
    // arguments as the proxy handlers use, they can be used directly in this handler
    get: lowLevelGet,
    has: lowLevelHas,
    set: lowLevelSet,
    deleteProperty: lowLevelRemove,
    // @TODO: ownKeys: (cacheMetaTarget) => Object.getOwnPropertyNames(cacheMetaTarget.cache),
};

function LimitedCacheProxy(options) {
    const cacheMeta = lowLevelInit(options);
    return new Proxy(cacheMeta, proxyHandler);
}

export default LimitedCacheProxy;
