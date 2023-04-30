import { objectAssign, objectCreate, dateNow, hasOwnProperty } from './builtIns';
import { CURRENT_META_VERSION, MAXIMUM_CACHE_TIME, defaultOptions } from './defaultOptions';
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

const _getExpireTime = (cacheMeta: LimitedCacheMeta, cacheKey: string): number => {
  const {
    options: { maxCacheTime },
    keyInfo: { [cacheKey]: keyInfo },
  } = cacheMeta;
  if (!keyInfo) {
    // A missing record is always treated as expired
    return 0;
  }
  // If we have an exact expireTime then honor it. Otherwise it'll depend on the current maxCacheTime.
  const [setTime, expireTime] = keyInfo;
  return expireTime || setTime + (maxCacheTime || MAXIMUM_CACHE_TIME);
};

const _cacheKeyHasExpired = (
  cacheMeta: LimitedCacheMeta,
  cacheKey: string,
  now: number,
): boolean => {
  return _getExpireTime(cacheMeta, cacheKey) < now;
};

const lowLevelDoMaintenance = <ItemType = DefaultItemType>(
  cacheMeta: LimitedCacheMeta<ItemType>,
): LimitedCacheMeta<ItemType> => {
  upgradeCacheMeta(cacheMeta);
  const { cache, keyList, keyInfo } = cacheMeta;
  const now = dateNow();

  // Rebuild cache from keyList only, checking timestamps to auto-remove expired
  const [newCache, newKeyList, newKeyInfo] = keyList.reduce(
    (acc, cacheKey) => {
      const [accCache, accKeyList, accKeyInfo] = acc;
      if (!_cacheKeyHasExpired(cacheMeta, cacheKey, now)) {
        accCache[cacheKey] = cache[cacheKey];
        accKeyList.push(cacheKey);
        accKeyInfo[cacheKey] = keyInfo[cacheKey];
      }
      return acc;
    },
    [
      {} as (typeof cacheMeta)['cache'],
      [] as (typeof cacheMeta)['keyList'],
      objectCreate(null) as (typeof cacheMeta)['keyInfo'],
    ],
  );

  return objectAssign(cacheMeta, {
    cache: newCache,
    keyList: newKeyList,
    keyInfo: newKeyInfo,
    opsLeft: cacheMeta.options.opLimit,
  });
};

const _removeFromIndex = (cacheMeta: LimitedCacheMeta, startIndex: number, now: number): void => {
  const { cache, keyList, keyInfo } = cacheMeta;

  // Always remove the item requested, and also remove any neighbors who have expired
  let nextIndex = startIndex;
  let nextCacheKey = keyList[startIndex];
  const keyListLength = keyList.length;
  do {
    // Remove the 'next' item

    cache[nextCacheKey] = keyInfo[nextCacheKey] = undefined;

    // Now advance and decide whether to keep going
    nextIndex++;
    nextCacheKey = keyList[nextIndex];
  } while (nextIndex < keyListLength && _cacheKeyHasExpired(cacheMeta, nextCacheKey, now));

  // Remove the index for everything from the startIndex until we stopped
  keyList.splice(startIndex, nextIndex - startIndex);
};

const _removeItemsToMakeRoom = (cacheMeta: LimitedCacheMeta, now: number): void => {
  const {
    options: { scanLimit, warnIfItemPurgedBeforeTime },
    cache,
    keyList,
    keyInfo,
  } = cacheMeta;

  // These track the soonest-to-expire thing we've found. It may not actually be "oldest".
  // By default we'll remove the item at the head of the queue, unless we find something better.
  let oldestItemIndex = 0;
  let oldestExpireTime = _getExpireTime(cacheMeta, keyList[0]);

  if (oldestExpireTime > now) {
    // The head of the list hasn't yet expired: scan for a better candidate to remove
    let indexToCheck = 0;
    const maxIndexToCheck = Math.min(keyList.length, scanLimit);
    while (indexToCheck < maxIndexToCheck) {
      const cacheKeyForIndex = keyList[indexToCheck];
      const expireTimeForIndex = _getExpireTime(cacheMeta, cacheKeyForIndex);

      // We only consider it if it's eligible for expiration: otherwise it can't be a better option
      // than the default head-of-queue
      if (expireTimeForIndex < now) {
        // We found an expired item! This wins automatically
        oldestItemIndex = indexToCheck;
        oldestExpireTime = 0;
        break;
      }
      if (expireTimeForIndex < oldestExpireTime) {
        // We have a new leader
        oldestItemIndex = indexToCheck;
        oldestExpireTime = expireTimeForIndex;
      }
      indexToCheck += 1;
    }
  }

  // Warn if the 'oldest' item is more recent than we'd like: this means it cycled into and out of
  // cache too quickly for the cache to be useful.
  if (
    process.env.NODE_ENV !== 'production' &&
    warnIfItemPurgedBeforeTime &&
    oldestExpireTime > now
  ) {
    const oldestItemKey = keyList[oldestItemIndex];
    const [oldestItemSetTime, oldestItemExpireTime] = keyInfo[oldestItemKey] as [number, number];

    if (now - oldestItemSetTime < warnIfItemPurgedBeforeTime) {
      console.warn(
        'Purged an item from cache while it was still fresh: you may want to increase maxCacheSize',
        {
          currentTime: now,
          key: oldestItemKey,
          item: cache[oldestItemKey],
          setTime: oldestItemSetTime,
          expireTime: oldestItemExpireTime,
          timeInCache: now - oldestItemSetTime,
        },
      );
    }
  }

  // Remove the oldest item we found, plus any expired neighbors
  _removeFromIndex(cacheMeta, oldestItemIndex, now);
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
    options: { maxCacheSize },
    keyList,
    keyInfo,
  } = cacheMeta;

  const now = dateNow();
  const isNew = !keyInfo[cacheKey];

  if (cacheMeta.cache[cacheKey] !== item) {
    // The cache itself is immutable (but the rest of cacheMeta is not)
    cacheMeta.cache = {
      ...cacheMeta.cache,
      [cacheKey]: item,
    };
  }
  // We've now set or updated it. Regardless of whether it's new, bump its set time
  // @TODO: expireTime override
  keyInfo[cacheKey] = [now, 0];

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
  const { cache, keyInfo } = cacheMeta;

  if (keyInfo[cacheKey]) {
    if (cache[cacheKey] !== undefined) {
      cacheMeta.cache = {
        ...cache,
        [cacheKey]: undefined,
      };
    }
    keyInfo[cacheKey] = undefined;
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
    keyInfo: objectCreate(null),
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
