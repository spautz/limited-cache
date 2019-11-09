const defaultOptions = {
    maxCacheSize: 500,
    maxCacheTime: 0,
    initialValues: null,
    warnIfItemPurgedBeforeTime: process.env.NODE_ENV === 'development' ? 5000 : 0,
    autoCleanupAfter: null,
    numItemsToExamineForPurge: 10,
};

/* Options processing */

const assignOptions = (baseOptions, additionalOptions) => {
    const newOptions = additionalOptions ? {...baseOptions, ...additionalOptions} : {...baseOptions};
    const needsToCalculateAutoCleanupCount = newOptions.autoCleanupAfter == null ||
        (additionalOptions && additionalOptions.maxCacheSize && !additionalOptions.autoCleanupAfter);
    if (needsToCalculateAutoCleanupCount) {
        newOptions.autoCleanupAfter = 2 * options.maxCacheSize;
    }
    return newOptions;
};

const createCacheMeta = () => ({
    isLimitedCacheMeta: true,
    options: defaultOptions,
    cache: {},
    recentCacheKeys: Array(500),
    cacheKeyTimestamps: Object.create(null),
    autoCleanupCount: 1000,
});

const lowLevelInit = (cacheMeta, options) => {
    // cacheMeta is optional: if it isn't there, the first argument must be the options
    if (cacheMeta && !options && !cacheMeta.isLimitedCacheMeta) {
        return lowLevelInit(null, cacheMeta)
    }

    const newCacheMeta = cacheMeta || createCacheMeta();
    const newOptions = assignOptions(newCacheMeta.options, options);
    newCacheMeta.options = newOptions;
    newCacheMeta.autoCleanupCount = newOptions.autoCleanupAfter;
    return newCacheMeta;
};

/* Internal utilities */

const lowLevelCleanup = (cacheMeta) => {

};

const _dropExpiredItemsAtIndex = (startIndex, now) => {}
const _purgeItemsToMakeRoom = (now) => {}

/* Accessors */

const lowLevelSet = (cacheMeta, cacheKey, value) => {
    // The cache itself is immutable (but the rest of cacheMeta is not)
    cacheMeta.cache = {
        ...cacheMeta.cache,
        [cacheKey]: item,
    };

    // If this was new, and we're at the cache limit, push something else out
    const { cacheKeyTimestamps, recentCacheKeys } = cacheMeta;
    if (!cacheKeyTimestamps[cacheKey]) {
        const now = Date.now();
        cacheKeyTimestamps[cacheKey] = now;
        recentCacheKeys.push(cacheKey);
        _dropExpiredItemsAtIndex(0, now);

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
    lowLevelCleanup,
};
