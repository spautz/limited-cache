import {
    defaultOptions,
    lowLevelInit,
    lowLevelSet,
    lowLevelGet,
    lowLevelMaintenance,
} from './limitedCacheUtil'

function LimitedCache(options) {
    const cacheMeta = lowLevelInit(null, options)

    return {
        _cacheMeta: cacheMeta,
        get: (cacheKey) => lowLevelGet(cacheMeta, cacheKey),
        set: (cacheKey, item) => lowLevelSet(cacheMeta, cacheKey, item),
        applyOptions: (options) => lowLevelInit(cacheMeta, options),
        performMaintenance: () => lowLevelMaintenance(cacheMeta),
    };
}

export default LimitedCache;
