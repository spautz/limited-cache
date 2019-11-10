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
} from './limitedCacheUtil'

export interface LimitedCacheInstance {
    get: (cacheKey?: string) => any,
    has: (cacheKey: string) => boolean,
    set: (cacheKey: string, item: any) => any,
    remove: (cacheKey: string) => any,
    getCacheMeta: () => LimitedCacheMeta,
    getOptions: () => LimitedCacheOptionsReadonly,
    setOptions: (newOptions: LimitedCacheOptionsPartial) => LimitedCacheOptionsReadonly,
    performMaintenance: () => LimitedCacheMeta,
}

function LimitedCache(options: LimitedCacheOptionsPartial) : LimitedCacheInstance {
    const cacheMeta = lowLevelInit(options);

    return {
        get: lowLevelGet.bind(null, cacheMeta),
        has: lowLevelHas.bind(null, cacheMeta),
        set: (cacheKey, item) => {
            lowLevelSet(cacheMeta, cacheKey, item);
            return item;
        },
        remove: lowLevelRemove.bind(null, cacheMeta),
        getCacheMeta: () => cacheMeta,
        getOptions: () => cacheMeta.options,
        setOptions: lowLevelSetOptions.bind(null, cacheMeta),
        performMaintenance: lowLevelPerformMaintenance.bind(null, cacheMeta),
    };
}

export default LimitedCache;
