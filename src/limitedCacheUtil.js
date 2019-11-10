const defaultOptions = {
    maxCacheSize: 500,
    maxCacheTime: 0,
    initialValues: null,
    warnIfItemPurgedBeforeTime: process.env.NODE_ENV === 'development' ? 5000 : 0,
    autoMaintenanceMultiplier: 2,
    numItemsToExamineForPurge: 10,
};

/* Options processing */

const assignOptions = (baseOptions, additionalOptions) => {
    if (additionalOptions) {
        return  {...baseOptions, ...additionalOptions };
    }
    return {...baseOptions};
};

const createCacheMeta = () => ({
    limitedCacheMetaVersion: 1,
    options: defaultOptions,
    cache: {},
    recentCacheKeys: [],
    cacheKeyTimestamps: Object.create(null),
    autoMaintenanceCount: 1000,
});

const lowLevelInit = (cacheMeta, options) => {
    // cacheMeta is optional: if it isn't there, the first argument must be the options
    if (cacheMeta && !options && !cacheMeta.limitedCacheMetaVersion) {
        return lowLevelInit(null, cacheMeta)
    }

    const newCacheMeta = cacheMeta || createCacheMeta();
    const newOptions = assignOptions(newCacheMeta.options, options);
    newCacheMeta.options = newOptions;
    newCacheMeta.autoMaintenanceCount = newOptions.maxCacheSize * newOptions.autoMaintenanceMultiplier;
    return newCacheMeta;
};

/* Internal cache manipulation */

const lowLevelMaintenance = (cacheMeta) => {
    // Rebuild cache from recentCacheKeys only, checking timestamps to auto-remove expired
    // Purge/rebuild cacheKeyTimestamps
};

const _dropExpiredItemsAtIndex = (startIndex, now) => {
    // Check item and as many following items as we can, and drop any/all that are expired
};

const _purgeItemsToMakeRoom = (now) => {
    // Search numItemsToExamineForPurge and force-remove the oldest one
    // Warn if the purged item was still fresh
    // _dropExpiredItemsAtIndex from there, in case we had a hop
};

/* Accessors */

const lowLevelSet = (cacheMeta, cacheKey, item) => {
    // The cache itself is immutable (but the rest of cacheMeta is not)
    cacheMeta.cache = {
        ...cacheMeta.cache,
        [cacheKey]: item,
    };

    // If this was new, and we're at the cache limit, push something else out
    const { cacheKeyTimestamps, options, recentCacheKeys } = cacheMeta;
    if (!cacheKeyTimestamps[cacheKey]) {
        const { autoMaintenanceMultiplier, maxCacheSize } = options;

        const now = Date.now();
        cacheKeyTimestamps[cacheKey] = now;
        recentCacheKeys.push(cacheKey);
        _dropExpiredItemsAtIndex(0, now);

        cacheMeta.autoMaintenanceCount = cacheMeta.autoMaintenanceCount - 1;
        if (cacheMeta.autoMaintenanceCount < 0) {
            // Time for an oil change
            lowLevelMaintenance(cacheMeta);
            cacheMeta.autoMaintenanceCount = maxCacheSize * autoMaintenanceMultiplier;
        }
        if (recentCacheKeys.length > maxCacheSize) {
            // We're still over the limit: purge some items
            _purgeItemsToMakeRoom(now);
        }
    }

    return cacheMeta;
};

const lowLevelGet = (cacheMeta, cacheKey) => {
    const { cache } = cacheMeta;
    if (cacheKey) {
        if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
            return cache[cacheKey];
        }
        return null;
    }
    return cache;
};

export {
    defaultOptions,
    lowLevelInit,
    lowLevelSet,
    lowLevelGet,
    lowLevelMaintenance,
};
