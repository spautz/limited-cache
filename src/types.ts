// This makes it easy to ensure that ItemType gets passed to any nested generics:
// Using `unknown` helps catch errors during development but is a pain for consumers.
// Using `any` is nicer for consumers, but errors could slip through during development.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DefaultItemType = any;

export interface LimitedCacheOptionsFull {
  /** Items will be removed to keep the cache within the maxCacheSize limit */
  maxCacheSize: number;
  /** Items will be removed and never returned if they were set more than maxCacheTime milliseconds ago */
  maxCacheTime: number;
  /** (dev only) A warning will be emitted if an item rotates out of the cache before this many milliseconds have passed, to indicate the size is too small */
  warnIfItemPurgedBeforeTime: number;
  /** (private) Internal cleanup of old keys will be performed after this many operations */
  opLimit: number;
  /** (private and dev only) Internal optimization to adjust how much searching will be done to find expired items, to avoid being O(n) */
  numItemsToExamineForPurge: number;
}

export type LimitedCacheOptions = Partial<LimitedCacheOptionsFull> | null;
export type LimitedCacheOptionsReadonly = Readonly<LimitedCacheOptionsFull>;

export interface LimitedCacheInstance<ItemType = DefaultItemType> {
  /** Return the requested item, if it has not expired */
  get: (cacheKey: string) => ItemType | undefined;
  /** Return all non-expired items */
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
  /** Schema version: old versions will be upgraded if possible, or a warning will be emitted if not */
  limitedCacheMetaVersion: number;
  /** Options to control cache size, time, and behavior */
  options: LimitedCacheOptionsReadonly;
  /** The values in the cache, stored by key. Will include old keys not yet garbage collected */
  cache: Record<string, ItemType | undefined>;
  /** List of keys that have been set, in chronological order. Used to find cache items most likely to be expired */
  recentCacheKeys: Array<string>;
  /** The timestamps for keys that have been set. Used to identify whether they have actually expired */
  cacheKeyTimestamps: { [propName: string]: number | undefined };
  /** Number of operations remaining until internal cleanup of old keys is performed. Based on options.opLimit */
  opsLeft: number;
}
