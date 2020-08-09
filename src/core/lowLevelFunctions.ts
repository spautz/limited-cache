import { objectAssign, objectCreate, dateNow, hasOwnProperty } from './builtIns';
import defaultOptions from './defaultOptions';
import {
  LimitedCacheOptions,
  LimitedCacheOptionsReadonly,
  LimitedCacheMeta,
  LimitedCacheOptionsFull,
  DefaultItemType,
} from '../types';

/* Initialization and options */

const CURRENT_META_VERSION = 2;

const positiveNumberOrZero = (value: number): number => Math.max(value, 0) || 0;

const normalizeOptions = (cacheMetaOptions: LimitedCacheOptionsFull): LimitedCacheOptionsFull => {
  objectAssign(cacheMetaOptions, {
    maxCacheSize: positiveNumberOrZero(cacheMetaOptions.maxCacheSize),
    maxCacheTime: positiveNumberOrZero(cacheMetaOptions.maxCacheTime),
    opLimit: positiveNumberOrZero(cacheMetaOptions.opLimit),
  });

  if (process.env.NODE_ENV !== 'production') {
    cacheMetaOptions.warnIfItemPurgedBeforeTime = positiveNumberOrZero(
      cacheMetaOptions.warnIfItemPurgedBeforeTime,
    );
  }
  return cacheMetaOptions;
};

const isCacheMeta = (cacheMeta: LimitedCacheMeta): boolean => {
  return !!cacheMeta && !!cacheMeta.limitedCacheMetaVersion;
};

const upgradeCacheMeta = (cacheMeta: LimitedCacheMeta): void => {
  if (!isCacheMeta(cacheMeta)) {
    throw new Error('Limited-cache metadata is missing: please check your usage');
  }
  if (cacheMeta.limitedCacheMetaVersion !== CURRENT_META_VERSION) {
    // Version is out of date! (Today the only prior version is 1)
    // Version 1: Cache meta cannot be migrated because timestamps and keys are incompatible
    console.warn('Limited-cache metadata is from an incompatible version (1). It must be reset.');
    cacheMeta.limitedCacheMetaVersion = CURRENT_META_VERSION;
    lowLevelReset(cacheMeta);
  }
};

const lowLevelSetOptions = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
  options: LimitedCacheOptions,
): LimitedCacheOptionsReadonly => {
  upgradeCacheMeta(cacheMeta);
  return normalizeOptions(objectAssign(cacheMeta.options, options));
};

const lowLevelInit = <ItemType = DefaultItemType>(
  optionsOrCacheMeta?: LimitedCacheOptions | LimitedCacheMeta<ItemType>,
): LimitedCacheMeta<ItemType> => {
  if (isCacheMeta(optionsOrCacheMeta as LimitedCacheMeta<ItemType>)) {
    const existingCacheMeta = optionsOrCacheMeta as LimitedCacheMeta<ItemType>;
    upgradeCacheMeta(existingCacheMeta);
    return existingCacheMeta;
  }
  // Else: it's options
  const fullOptions = normalizeOptions({ ...defaultOptions, ...optionsOrCacheMeta });

  // The cacheMeta is created once, and persists per instance
  const newCacheMeta = lowLevelReset({
    limitedCacheMetaVersion: CURRENT_META_VERSION,
    options: fullOptions,
  } as LimitedCacheMeta<ItemType>);
  return newCacheMeta;
};

/* Internal cache manipulation */

const _cacheKeyHasExpired = (
  cacheMeta: LimitedCacheMeta,
  cacheKey: string,
  now: number,
): boolean => {
  const {
    options: { maxCacheTime },
    keyTime: { [cacheKey]: cacheKeyTimestamp },
  } = cacheMeta;
  return !cacheKeyTimestamp || (!!maxCacheTime && now - cacheKeyTimestamp > maxCacheTime);
};

const lowLevelDoMaintenance = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
): LimitedCacheMeta<ItemType> => {
  upgradeCacheMeta(cacheMeta);
  const { cache, keyList, keyTime } = cacheMeta;
  const now = dateNow();

  // Rebuild cache from keyList only, checking timestamps to auto-remove expired
  const [newCache, newKeyList, newTimestamps] = keyList.reduce(
    (acc, cacheKey) => {
      const [accCache, accRecentKeys, accTimestamps] = acc;
      if (!_cacheKeyHasExpired(cacheMeta, cacheKey, now)) {
        accCache[cacheKey] = cache[cacheKey];
        accRecentKeys.push(cacheKey);
        accTimestamps[cacheKey] = keyTime[cacheKey];
      }
      return acc;
    },
    [
      {} as typeof cacheMeta['cache'],
      [] as typeof cacheMeta['keyList'],
      objectCreate(null) as typeof cacheMeta['keyTime'],
    ],
  );

  return objectAssign(cacheMeta, {
    cache: newCache,
    keyList: newKeyList,
    keyTime: newTimestamps,
    opsLeft: cacheMeta.options.opLimit,
  });
};

const _dropExpiredItemsAtIndex = (
  cacheMeta: LimitedCacheMeta,
  startIndex: number,
  now: number,
): void => {
  const { cache, keyList, keyTime } = cacheMeta;

  // Check item and remove it if it's expired, along with any neighbors who have also expired
  let numItemsRemoved = 0;
  let cacheKeyToCheck = keyList[startIndex];
  const keyListLength = keyList.length;
  while (cacheKeyToCheck && _cacheKeyHasExpired(cacheMeta, cacheKeyToCheck, now)) {
    cache[cacheKeyToCheck] = undefined;
    keyTime[cacheKeyToCheck] = undefined;
    numItemsRemoved += 1;

    const nextIndex = startIndex + numItemsRemoved;
    if (nextIndex <= keyListLength) {
      cacheKeyToCheck = keyList[nextIndex];
    }
  }
  if (numItemsRemoved) {
    keyList.splice(startIndex, numItemsRemoved);
  }
};

const _purgeItemsToMakeRoom = (cacheMeta: LimitedCacheMeta, now: number): void => {
  const {
    options: { maxCacheTime, scanLimit, warnIfItemPurgedBeforeTime },
    cache,
    keyList,
    keyTime,
  } = cacheMeta;

  // These track the oldest thing we've found
  let oldestItemIndex = 0;
  let oldestItemKey = keyList[0];
  let oldestItemTimestamp = keyTime[oldestItemKey];

  // Search scanLimit and force-remove the oldest one
  let indexToCheck = 0;
  const keyListLength = keyList.length;
  while (indexToCheck < scanLimit && indexToCheck < keyListLength) {
    const cacheKeyForIndex = keyList[indexToCheck];
    const timestampForIndex = keyTime[cacheKeyForIndex];
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
    keyList.splice(oldestItemIndex, 1);
    keyTime[oldestItemKey] = undefined;
  }
};

/* Accessors */

const lowLevelRemove = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
  cacheKey: string,
): LimitedCacheMeta<ItemType> => {
  upgradeCacheMeta(cacheMeta);
  if (cacheMeta.keyTime[cacheKey]) {
    if (cacheMeta.cache[cacheKey] !== undefined) {
      cacheMeta.cache = {
        ...cacheMeta.cache,
        [cacheKey]: undefined,
      };
    }
    cacheMeta.keyTime[cacheKey] = undefined;
  }
  return cacheMeta;
};

const lowLevelReset = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
): LimitedCacheMeta<ItemType> => {
  upgradeCacheMeta(cacheMeta);
  return objectAssign(cacheMeta, {
    cache: {},
    keyList: [],
    keyTime: objectCreate(null),
    opsLeft: cacheMeta.options.opLimit,
  });
};

const lowLevelHas = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
  cacheKey: string,
): boolean => {
  upgradeCacheMeta(cacheMeta);
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
  upgradeCacheMeta(cacheMeta);
  if (lowLevelHas(cacheMeta, cacheKey)) {
    return cacheMeta.cache[cacheKey];
  }
  return;
};

const lowLevelGetAll = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
): Record<string, ItemType> => {
  upgradeCacheMeta(cacheMeta);
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
  upgradeCacheMeta(cacheMeta);

  const now = dateNow();
  if (cacheMeta.cache[cacheKey] !== item) {
    // The cache itself is immutable (but the rest of cacheMeta is not)
    cacheMeta.cache = {
      ...cacheMeta.cache,
      [cacheKey]: item,
    };
  }

  // If this was new, and we're at the cache limit, push something else out
  const { options, keyList, keyTime } = cacheMeta;
  if (!keyTime[cacheKey]) {
    const { maxCacheSize } = options;

    keyList.push(cacheKey);
    keyTime[cacheKey] = now;
    _dropExpiredItemsAtIndex(cacheMeta, 0, now);

    cacheMeta.opsLeft--;
    if (cacheMeta.opsLeft <= 0) {
      // Time for an oil change
      lowLevelDoMaintenance(cacheMeta);
    }
    if (maxCacheSize && cacheMeta.keyList.length > maxCacheSize) {
      // We're still over the limit: purge at least one item
      _purgeItemsToMakeRoom(cacheMeta, now);
    }
  } else {
    // It's not new. Update its timestamp to keep it around longer
    keyTime[cacheKey] = now;
  }

  return cacheMeta;
};

export {
  isCacheMeta,
  upgradeCacheMeta,
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
