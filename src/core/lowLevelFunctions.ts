import defaultOptions from './defaultOptions';
import {
  LimitedCacheOptions,
  LimitedCacheOptionsReadonly,
  LimitedCacheMeta,
  LimitedCacheOptionsFull,
  DefaultItemType,
} from '../types';

// To help minimization
const {
  create: objectCreate,
  assign: objectAssign,
  prototype: { hasOwnProperty },
} = Object;
const dateNow = Date.now;

/* Initialization and options */

const positiveNumberOrZero = (value: number): number => Math.max(value, 0) || 0;

const normalizeOptions = (cacheMetaOptions: LimitedCacheOptionsFull): LimitedCacheOptionsFull => {
  cacheMetaOptions.autoMaintenanceCount = positiveNumberOrZero(
    cacheMetaOptions.autoMaintenanceCount,
  );
  cacheMetaOptions.maxCacheSize = positiveNumberOrZero(cacheMetaOptions.maxCacheSize);
  cacheMetaOptions.maxCacheTime = positiveNumberOrZero(cacheMetaOptions.maxCacheTime);
  if (process.env.NODE_ENV !== 'production') {
    cacheMetaOptions.warnIfItemPurgedBeforeTime = positiveNumberOrZero(
      cacheMetaOptions.warnIfItemPurgedBeforeTime,
    );
  }
  return cacheMetaOptions;
};

const lowLevelSetOptions = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
  options: LimitedCacheOptions,
): LimitedCacheOptionsReadonly => {
  return normalizeOptions(objectAssign(cacheMeta.options, options));
};

const lowLevelInit = <ItemType = DefaultItemType>(
  options?: LimitedCacheOptions,
): LimitedCacheMeta<ItemType> => {
  // This is the cacheMeta. It is created once, and persists per instance
  const newCacheMeta = {
    limitedCacheMetaVersion: 1,
    options: normalizeOptions({ ...defaultOptions, ...options }),
    cache: {},
    recentCacheKeys: [],
    cacheKeyTimestamps: objectCreate(null),
    autoMaintenanceCount: 0,
  };
  newCacheMeta.autoMaintenanceCount = positiveNumberOrZero(
    newCacheMeta.options.autoMaintenanceCount,
  );
  return newCacheMeta;
};

/* Internal cache manipulation */

const _cacheKeyHasExpired = (
  cacheMeta: LimitedCacheMeta,
  cacheKey: string,
  now: number,
): boolean => {
  const {
    cacheKeyTimestamps: { [cacheKey]: cacheKeyTimestamp },
    options: { maxCacheTime },
  } = cacheMeta;
  return !cacheKeyTimestamp || (!!maxCacheTime && now - cacheKeyTimestamp > maxCacheTime);
};

const lowLevelDoMaintenance = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
): LimitedCacheMeta<ItemType> => {
  const { cache, cacheKeyTimestamps, recentCacheKeys } = cacheMeta;
  const now = dateNow();

  // Rebuild cache from recentCacheKeys only, checking timestamps to auto-remove expired
  const [newRecentKeys, newCache, newTimestamps] = recentCacheKeys.reduce(
    (acc, cacheKey) => {
      const [accRecentKeys, accCache, accTimestamps] = acc;
      if (!_cacheKeyHasExpired(cacheMeta, cacheKey, now)) {
        accRecentKeys.push(cacheKey);
        accCache[cacheKey] = cache[cacheKey];
        accTimestamps[cacheKey] = cacheKeyTimestamps[cacheKey];
      }
      return acc;
    },
    [
      [] as typeof cacheMeta['recentCacheKeys'],
      {} as typeof cacheMeta['cache'],
      objectCreate(null) as typeof cacheMeta['cacheKeyTimestamps'],
    ],
  );

  cacheMeta.recentCacheKeys = newRecentKeys;
  cacheMeta.cache = newCache;
  cacheMeta.cacheKeyTimestamps = newTimestamps;
  cacheMeta.autoMaintenanceCount = cacheMeta.options.autoMaintenanceCount;

  return cacheMeta;
};

const _dropExpiredItemsAtIndex = (
  cacheMeta: LimitedCacheMeta,
  startIndex: number,
  now: number,
): void => {
  const { cache, recentCacheKeys, cacheKeyTimestamps } = cacheMeta;

  // Check item and remove it if it's expired, along with any neighbors who have also expired
  let numItemsRemoved = 0;
  let cacheKeyToCheck = recentCacheKeys[startIndex];
  const recentCacheKeysLength = recentCacheKeys.length;
  while (cacheKeyToCheck && _cacheKeyHasExpired(cacheMeta, cacheKeyToCheck, now)) {
    cache[cacheKeyToCheck] = undefined;
    cacheKeyTimestamps[cacheKeyToCheck] = undefined;
    numItemsRemoved += 1;

    const nextIndex = startIndex + numItemsRemoved;
    if (nextIndex <= recentCacheKeysLength) {
      cacheKeyToCheck = recentCacheKeys[nextIndex];
    }
  }
  if (numItemsRemoved) {
    recentCacheKeys.splice(startIndex, numItemsRemoved);
  }
};

const _purgeItemsToMakeRoom = (cacheMeta: LimitedCacheMeta, now: number): void => {
  const {
    cache,
    recentCacheKeys,
    cacheKeyTimestamps,
    options: { maxCacheTime, numItemsToExamineForPurge, warnIfItemPurgedBeforeTime },
  } = cacheMeta;

  // These track the oldest thing we've found
  let oldestItemIndex = 0;
  let oldestItemKey = recentCacheKeys[0];
  let oldestItemTimestamp = cacheKeyTimestamps[oldestItemKey];

  // Search numItemsToExamineForPurge and force-remove the oldest one
  let indexToCheck = 0;
  const recentCacheKeysLength = recentCacheKeys.length;
  while (indexToCheck < numItemsToExamineForPurge && indexToCheck < recentCacheKeysLength) {
    const cacheKeyForIndex = recentCacheKeys[indexToCheck];
    const timestampForIndex = cacheKeyTimestamps[cacheKeyForIndex];
    if (!timestampForIndex || _cacheKeyHasExpired(cacheMeta, cacheKeyForIndex, now)) {
      // We found an expired item! This wins automatically
      oldestItemIndex = indexToCheck;
      oldestItemTimestamp = 0;
      break;
    }
    if (!oldestItemTimestamp || timestampForIndex < oldestItemTimestamp) {
      // We have a new leader
      oldestItemIndex = indexToCheck;
      oldestItemKey = cacheKeyForIndex;
      oldestItemTimestamp = timestampForIndex;
    }
    indexToCheck += 1;
  }

  if (!oldestItemTimestamp && maxCacheTime) {
    // Remove the expired item, plus any expired neighbors
    _dropExpiredItemsAtIndex(cacheMeta, oldestItemIndex, now);
  } else {
    // Remove the oldest item -- but warn if it's more recent than we'd like
    if (
      process.env.NODE_ENV !== 'production' &&
      warnIfItemPurgedBeforeTime &&
      oldestItemTimestamp &&
      now - oldestItemTimestamp < warnIfItemPurgedBeforeTime
    ) {
      console.warn(
        'Purged an item from cache while it was still fresh: you may want to increase maxCacheSize',
        {
          currentTime: now,
          key: oldestItemKey,
          item: cache[oldestItemKey],
          itemTime: oldestItemTimestamp,
        },
      );
    }
    cache[oldestItemKey] = undefined;
    cacheKeyTimestamps[oldestItemKey] = undefined;
    recentCacheKeys.splice(oldestItemIndex, 1);
  }
};

/* Accessors */

const lowLevelRemove = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
  cacheKey: string,
): LimitedCacheMeta<ItemType> => {
  if (cacheMeta.cacheKeyTimestamps[cacheKey]) {
    if (cacheMeta.cache[cacheKey] !== undefined) {
      cacheMeta.cache = {
        ...cacheMeta.cache,
        [cacheKey]: undefined,
      };
    }
    cacheMeta.cacheKeyTimestamps[cacheKey] = undefined;
  }
  return cacheMeta;
};

const lowLevelReset = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
): LimitedCacheMeta<ItemType> => {
  cacheMeta.cache = {};
  cacheMeta.recentCacheKeys = [];
  cacheMeta.cacheKeyTimestamps = objectCreate(null);
  cacheMeta.autoMaintenanceCount = cacheMeta.options.autoMaintenanceCount;
  return cacheMeta;
};

const lowLevelHas = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
  cacheKey: string,
): boolean => {
  const { cache } = cacheMeta;
  if (hasOwnProperty.call(cache, cacheKey) && cache[cacheKey] !== undefined) {
    if (!_cacheKeyHasExpired(cacheMeta, cacheKey, dateNow())) {
      return true;
    }
    // If it's expired, clear the value so that we can short-circuit future lookups
    cache[cacheKey] = undefined;
  }
  return false;
};

const lowLevelGetOne = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
  cacheKey: string,
): ItemType | undefined => {
  if (lowLevelHas(cacheMeta, cacheKey)) {
    return cacheMeta.cache[cacheKey];
  }
  return;
};

const lowLevelGetAll = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
): Record<string, ItemType> => {
  // Remove all expired values, and return whatever's left
  lowLevelDoMaintenance(cacheMeta);
  // Retype because there won't be any `undefined` values after doMaintenance
  return cacheMeta.cache as Record<string, ItemType>;
};

const lowLevelSet = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
  cacheKey: string,
  item: ItemType,
): LimitedCacheMeta<ItemType> => {
  const now = dateNow();
  if (cacheMeta.cache[cacheKey] !== item) {
    // The cache itself is immutable (but the rest of cacheMeta is not)
    cacheMeta.cache = {
      ...cacheMeta.cache,
      [cacheKey]: item,
    };
  }

  // If this was new, and we're at the cache limit, push something else out
  const { cacheKeyTimestamps, options, recentCacheKeys } = cacheMeta;
  if (!cacheKeyTimestamps[cacheKey]) {
    const { maxCacheSize } = options;

    cacheKeyTimestamps[cacheKey] = now;
    recentCacheKeys.push(cacheKey);
    _dropExpiredItemsAtIndex(cacheMeta, 0, now);

    cacheMeta.autoMaintenanceCount--;
    if (cacheMeta.autoMaintenanceCount <= 0) {
      // Time for an oil change
      lowLevelDoMaintenance(cacheMeta);
    }
    if (maxCacheSize && cacheMeta.recentCacheKeys.length > maxCacheSize) {
      // We're still over the limit: purge at least one item
      _purgeItemsToMakeRoom(cacheMeta, now);
    }
  } else {
    // It's not new. Update its timestamp to keep it around longer
    cacheKeyTimestamps[cacheKey] = now;
  }

  return cacheMeta;
};

export {
  hasOwnProperty,
  lowLevelInit,
  lowLevelGetOne,
  lowLevelGetAll,
  lowLevelHas,
  lowLevelSet,
  lowLevelRemove,
  lowLevelReset,
  lowLevelDoMaintenance,
  lowLevelSetOptions,
};
