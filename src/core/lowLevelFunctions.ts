import { objectAssign, objectCreate, dateNow, hasOwnProperty } from './builtIns';
import defaultOptions, { CURRENT_META_VERSION } from './defaultOptions';
import {
  LimitedCacheOptions,
  LimitedCacheOptionsReadonly,
  LimitedCacheMeta,
  LimitedCacheOptionsFull,
  DefaultItemType,
} from '../types';

/* Initialization and options */

const positiveNumberOrZero = (value: number): number => Math.max(value, 0) || 0;

const normalizeOptions = (cacheMetaOptions: LimitedCacheOptionsFull): LimitedCacheOptionsFull => {
  objectAssign(cacheMetaOptions, {
    maxCacheSize: positiveNumberOrZero(cacheMetaOptions.maxCacheSize),
    maxCacheTime: positiveNumberOrZero(cacheMetaOptions.maxCacheTime),
    opLimit: positiveNumberOrZero(cacheMetaOptions.opLimit),
  });

  // @TODO: Restore warnIfItemPurgedBeforeTime:
  // if (process.env.NODE_ENV !== 'production') {
  //   cacheMetaOptions.warnIfItemPurgedBeforeTime = positiveNumberOrZero(
  //     cacheMetaOptions.warnIfItemPurgedBeforeTime,
  //   );
  // }
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
    keyExps: { [cacheKey]: expireTime },
  } = cacheMeta;
  return !expireTime || expireTime < now;
};

const lowLevelDoMaintenance = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
): LimitedCacheMeta<ItemType> => {
  upgradeCacheMeta(cacheMeta);
  const { cache, keyList, keyExps } = cacheMeta;
  const now = dateNow();

  // Rebuild cache from keyList only, checking timestamps to auto-remove expired
  const [newCache, newKeyList, newExpireTimes] = keyList.reduce(
    (acc, cacheKey) => {
      const [accCache, accRecentKeys, accExpireTimes] = acc;
      if (!_cacheKeyHasExpired(cacheMeta, cacheKey, now)) {
        accCache[cacheKey] = cache[cacheKey];
        accRecentKeys.push(cacheKey);
        accExpireTimes[cacheKey] = keyExps[cacheKey];
      }
      return acc;
    },
    [
      {} as typeof cacheMeta['cache'],
      [] as typeof cacheMeta['keyList'],
      objectCreate(null) as typeof cacheMeta['keyExps'],
    ],
  );

  return objectAssign(cacheMeta, {
    cache: newCache,
    keyList: newKeyList,
    keyExps: newExpireTimes,
    opsLeft: cacheMeta.options.opLimit,
  });
};

const _removeFromIndex = (cacheMeta: LimitedCacheMeta, startIndex: number, now: number): void => {
  const { cache, keyList, keyExps } = cacheMeta;

  // Always remove the item requested, and also remove any neighbors who have expired
  let nextIndex = startIndex;
  let nextCacheKey = keyList[startIndex];
  const keyListLength = keyList.length;
  do {
    // Remove the 'next' item
    cache[nextCacheKey] = undefined;
    keyExps[nextCacheKey] = 0;

    // Now advance and decide whether to keep going
    nextIndex++;
    nextCacheKey = keyList[nextIndex];
  } while (nextIndex < keyListLength && _cacheKeyHasExpired(cacheMeta, nextCacheKey, now));

  // Remove the index for everything from the startIndex until we stopped
  keyList.splice(startIndex, nextIndex - startIndex);
};

const _removeItemsToMakeRoom = (cacheMeta: LimitedCacheMeta, now: number): void => {
  const {
    options: { scanLimit },
    keyList,
    keyExps,
  } = cacheMeta;

  // These track the oldest thing we've found
  // By default we'll remove the item at the head of the queue, unless we find something better
  let oldestItemIndex = 0;
  let oldestItemKey = keyList[0];
  let oldestItemExpireTime = keyExps[oldestItemKey];

  // Search scanLimit and force-remove the oldest one
  let indexToCheck = 0;
  const maxToCheck = Math.min(keyList.length, scanLimit);
  while (indexToCheck < maxToCheck) {
    const cacheKeyForIndex = keyList[indexToCheck];
    const expireTimeForIndex = keyExps[cacheKeyForIndex];

    // We only consider it if it's eligible for expiration: otherwise it can't be a better option
    // than the default head-of-queue
    if (expireTimeForIndex) {
      if (_cacheKeyHasExpired(cacheMeta, cacheKeyForIndex, now)) {
        // We found an expired item! This wins automatically
        oldestItemIndex = indexToCheck;
        break;
      }
      if (!oldestItemExpireTime || expireTimeForIndex < oldestItemExpireTime) {
        // We have a new leader
        oldestItemIndex = indexToCheck;
        oldestItemKey = cacheKeyForIndex;
        oldestItemExpireTime = expireTimeForIndex;
      }
    }
    indexToCheck += 1;
  }

  // Remove the oldest item we found, plus any expired neighbors
  _removeFromIndex(cacheMeta, oldestItemIndex, now);

  // @TODO: Restore warnIfItemPurgedBeforeTime:
  // // Remove the oldest item -- but warn if it's more recent than we'd like
  // if (
  //   process.env.NODE_ENV !== 'production' &&
  //   warnIfItemPurgedBeforeTime &&
  //   oldestItemExpireTime &&
  //   now - oldestItemExpireTime < warnIfItemPurgedBeforeTime
  // ) {
  //   console.warn(
  //     'Purged an item from cache while it was still fresh: you may want to increase maxCacheSize',
  //     {
  //       currentTime: now,
  //       key: oldestItemKey,
  //       item: cache[oldestItemKey],
  //       itemTime: oldestItemExpireTime,
  //     },
  //   );
  // }
  // cache[oldestItemKey] = undefined;
  // keyList.splice(oldestItemIndex, 1);
  // keyExps[oldestItemKey] = undefined;
};

/* Accessors */

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

  const {
    options: { maxCacheSize, maxCacheTime },
    keyList,
    keyExps,
  } = cacheMeta;

  const now = dateNow();
  const isNew = !keyExps[cacheKey];

  if (cacheMeta.cache[cacheKey] !== item) {
    // The cache itself is immutable (but the rest of cacheMeta is not)
    cacheMeta.cache = {
      ...cacheMeta.cache,
      [cacheKey]: item,
    };
  }
  // We've now set or updated it. Regardless of whether it's new, bump its expiration time
  keyExps[cacheKey] = maxCacheTime ? now + maxCacheTime : Number.MAX_SAFE_INTEGER;

  if (isNew) {
    // It's a new key: grow the cache, then shrink it if we can
    keyList.push(cacheKey);

    cacheMeta.opsLeft--;
    if (cacheMeta.opsLeft <= 0) {
      // Time for an oil change
      lowLevelDoMaintenance(cacheMeta);
    }

    if (maxCacheSize && cacheMeta.keyList.length > maxCacheSize) {
      // We're still over the limit: drop at least one item
      _removeItemsToMakeRoom(cacheMeta, now);
    }
  }

  if (_cacheKeyHasExpired(cacheMeta, keyList[0], now)) {
    // While we're here, if we need to expire the head of the queue then drop it
    _removeFromIndex(cacheMeta, 0, now);
  }

  return cacheMeta;
};

const lowLevelRemove = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
  cacheKey: string,
): LimitedCacheMeta<ItemType> => {
  upgradeCacheMeta(cacheMeta);
  if (cacheMeta.keyExps[cacheKey]) {
    if (cacheMeta.cache[cacheKey] !== undefined) {
      cacheMeta.cache = {
        ...cacheMeta.cache,
        [cacheKey]: undefined,
      };
    }
    cacheMeta.keyExps[cacheKey] = 0;
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
    keyExps: objectCreate(null),
    opsLeft: cacheMeta.options.opLimit,
  });
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
