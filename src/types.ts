export interface LimitedCacheOptionsFull {
  maxCacheSize: number;
  maxCacheTime: number;
  warnIfItemPurgedBeforeTime: number;
  autoMaintenanceMultiplier: number;
  numItemsToExamineForPurge: number;
}

export type LimitedCacheOptions = Partial<LimitedCacheOptionsFull> | null;
export type LimitedCacheOptionsReadonly = Readonly<LimitedCacheOptionsFull>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface LimitedCacheInstance<ItemType = any> {
  get: (cacheKey?: string) => ItemType;
  has: (cacheKey: string) => boolean;
  set: (cacheKey: string, item: ItemType) => ItemType;
  remove: (cacheKey: string) => true;
  reset: () => LimitedCacheMeta;
  getCacheMeta: () => LimitedCacheMeta;
  getOptions: () => LimitedCacheOptionsFull;
  setOptions: (newOptions: LimitedCacheOptions) => LimitedCacheOptionsReadonly;
  doMaintenance: () => LimitedCacheMeta;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface LimitedCacheObjectInterface<ItemType = any> {
  [key: string]: ItemType;
}

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
