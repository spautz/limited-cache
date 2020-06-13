// This makes it easy to ensure that ItemType gets passed to any nested generics:
// If the default value is `unknown` then errors will appear, but we can still use
// `any` to make things easier for consumers.
export type DefaultItemType = any;

export interface LimitedCacheOptionsFull {
  /** Items will be removed to keep the cache within the maxCacheSize limit */
  maxCacheSize: number;
  /** Items will be removed and never returned if they were set more than maxCacheTime milliseconds ago */
  maxCacheTime: number;
  /** (dev only) A warning will be emitted if an item rotates out of the cache before this many milliseconds have passed, to indicate the size is too small */
  warnIfItemPurgedBeforeTime: number;
  /** (private) Internal cleanup of old keys will be performed after this many operations */
  autoMaintenanceCount: number;
  /** (private) Internal optimization to adjust how much searching will be done to find expired items */
  numItemsToExamineForPurge: number;
}

export type LimitedCacheOptions = Partial<LimitedCacheOptionsFull> | null;
export type LimitedCacheOptionsReadonly = Readonly<LimitedCacheOptionsFull>;

export interface LimitedCacheInstance<ItemType = DefaultItemType> {
  /** Return the requested item, if it has not expired. */
  get: (cacheKey: string) => ItemType | undefined;
  /** Return all non-expired items. */
  getAll: () => Record<string, ItemType>;
  /** Indicate whether or not the requested item is present and has not expired */
  has: (cacheKey: string) => boolean;
  /** Add the item to the cache, or update its timestamp if it already exists */
  set: (cacheKey: string, item: ItemType) => ItemType;
  /** Remove the requested item from the cache, if necessary */
  remove: (cacheKey: string) => true;
  /** Remove all items and all timestamps from the cache */
  reset: () => LimitedCacheMeta<ItemType>;
  /** Return a serializable representation of the cache internals, suitable for long-term storage */
  getCacheMeta: () => LimitedCacheMeta<ItemType>;
  /** Return the cache's current values for all options */
  getOptions: () => LimitedCacheOptionsFull;
  /** Update one or more of the cache's options */
  setOptions: (newOptions: LimitedCacheOptions) => LimitedCacheOptionsReadonly;
  /** Reduces cache size by cleaning up old keys and expired items */
  doMaintenance: () => LimitedCacheMeta<ItemType>;
}

export interface LimitedCacheObjectInstance<ItemType = DefaultItemType> {
  [key: string]: ItemType;
}

/**
 *  A serializable representation of the cache internals, suitable for long-term storage
 */
export interface LimitedCacheMeta<ItemType = DefaultItemType> {
  limitedCacheMetaVersion: number;
  options: LimitedCacheOptionsReadonly;
  cache: Record<string, ItemType | undefined>;
  recentCacheKeys: Array<string>;
  cacheKeyTimestamps: { [propName: string]: number | undefined };
  autoMaintenanceCount: number;
}
