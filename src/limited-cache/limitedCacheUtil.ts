import {
  defaultOptions,
  // types
  LimitedCacheOptionsPartial,
  LimitedCacheOptionsReadonly,
} from './options';

/* Types */

export interface LimitedCacheMeta {
  limitedCacheMetaVersion: number;
  options: LimitedCacheOptionsReadonly;
  cache: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [propName: string]: any;
  };
  recentCacheKeys: Array<string>;
  cacheKeyTimestamps: { [propName: string]: number | undefined };
  autoMaintenanceCount: number;
}

// from https://github.com/Microsoft/TypeScript/issues/21309#issuecomment-376338415
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RequestIdleCallbackHandle = any;
type RequestIdleCallbackOptions = {
  timeout: number;
};
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
};

declare global {
  const requestIdleCallback: (
    callback: (deadline: RequestIdleCallbackDeadline) => void,
    opts?: RequestIdleCallbackOptions,
  ) => RequestIdleCallbackHandle;
  const cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void;
}

/* Initialization and options */

const lowLevelInit = (options?: LimitedCacheOptionsPartial): LimitedCacheMeta => {
  // This is the cacheMeta. It is created once, and persists per instance
  return {
    limitedCacheMetaVersion: 1,
    options: options ? { ...defaultOptions, ...options } : { ...defaultOptions },
    cache: {},
    recentCacheKeys: [],
    cacheKeyTimestamps: Object.create(null),
    autoMaintenanceCount: 0,
  };
};

const lowLevelSetOptions = (
  cacheMeta: LimitedCacheMeta,
  options: LimitedCacheOptionsPartial,
): LimitedCacheOptionsReadonly => {
  return Object.assign(cacheMeta.options, options);
};

/* Internal cache manipulation */

const { hasOwnProperty } = Object.prototype;

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

const lowLevelPerformMaintenance = (cacheMeta: LimitedCacheMeta): LimitedCacheMeta => {
  const { cache, cacheKeyTimestamps, recentCacheKeys } = cacheMeta;
  const now = Date.now();

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
      [] as LimitedCacheMeta['recentCacheKeys'],
      {} as LimitedCacheMeta['cache'],
      Object.create(null) as LimitedCacheMeta['cacheKeyTimestamps'],
    ],
  );

  cacheMeta.recentCacheKeys = newRecentKeys;
  cacheMeta.cache = newCache;
  cacheMeta.cacheKeyTimestamps = newTimestamps;

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

const lowLevelRemove = (cacheMeta: LimitedCacheMeta, cacheKey: string): LimitedCacheMeta => {
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

const lowLevelHas = (cacheMeta: LimitedCacheMeta, cacheKey: string): boolean => {
  const { cache } = cacheMeta;
  if (hasOwnProperty.call(cache, cacheKey) && cache[cacheKey] !== undefined) {
    if (!_cacheKeyHasExpired(cacheMeta, cacheKey, Date.now())) {
      return true;
    }
    // If it's expired, clear the value so that we can short-circuit future lookups
    cache[cacheKey] = undefined;
  }
  return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lowLevelGet = (cacheMeta: LimitedCacheMeta, cacheKey?: string): object | any => {
  if (cacheKey !== undefined) {
    if (lowLevelHas(cacheMeta, cacheKey)) {
      return cacheMeta.cache[cacheKey];
    }
    return;
  }
  // Remove all expired values, and return whatever's left
  lowLevelPerformMaintenance(cacheMeta);
  return cacheMeta.cache;
};

const lowLevelSet = (
  cacheMeta: LimitedCacheMeta,
  cacheKey: string,
  item: any, // eslint-disable-line @typescript-eslint/no-explicit-any
): LimitedCacheMeta => {
  const now = Date.now();
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
    const { autoMaintenanceMultiplier, maxCacheSize } = options;

    cacheKeyTimestamps[cacheKey] = now;
    recentCacheKeys.push(cacheKey);
    _dropExpiredItemsAtIndex(cacheMeta, 0, now);

    cacheMeta.autoMaintenanceCount = cacheMeta.autoMaintenanceCount + 1;
    if (cacheMeta.autoMaintenanceCount > maxCacheSize * autoMaintenanceMultiplier) {
      // Time for an oil change
      lowLevelPerformMaintenance(cacheMeta);
    }
    if (cacheMeta.recentCacheKeys.length > maxCacheSize) {
      // We're still over the limit: purge at least one item
      _purgeItemsToMakeRoom(cacheMeta, now);
    }
  } else {
    // It's not new. Update its timestamp to keep it around longer
    cacheKeyTimestamps[cacheKey] = now;
  }

  return cacheMeta;
};

// These are for the tests only
export const internalFunctions = {};

export {
  defaultOptions,
  lowLevelInit,
  lowLevelGet,
  lowLevelHas,
  lowLevelSet,
  lowLevelRemove,
  lowLevelPerformMaintenance,
  lowLevelSetOptions,
};
