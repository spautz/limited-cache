import {
    lowLevelInit,
    lowLevelGet,
    lowLevelHas,
    lowLevelSet,
    lowLevelRemove,
    lowLevelSetOptions,
    lowLevelPerformMaintenance,
} from './limitedCacheUtil'

function LimitedCache(options) {
    const cacheMeta = lowLevelInit(options)

    return {
        get: lowLevelGet.bind(null, cacheMeta),
        has: lowLevelHas.bind(null, cacheMeta),
        set: lowLevelSet.bind(null, cacheMeta),
        remove: lowLevelRemove.bind(null, cacheMeta),
        getCacheMeta: () => cacheMeta,
        getOptions: () => cacheMeta.options,
        setOptions: lowLevelSetOptions.bind(null, cacheMeta),
        performMaintenance: lowLevelPerformMaintenance.bind(null, cacheMeta),
    };
}

export default LimitedCache;
