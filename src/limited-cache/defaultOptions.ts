export interface LimitedCacheOptions {
  maxCacheSize: number;
  maxCacheTime: number;
  warnIfItemPurgedBeforeTime: number;
  autoMaintenanceMultiplier: number;
  numItemsToExamineForPurge: number;
}

export type LimitedCacheOptionsPartial = Partial<LimitedCacheOptions>;
export type LimitedCacheOptionsReadonly = Readonly<LimitedCacheOptions>;

const defaultOptions: LimitedCacheOptionsReadonly = {
  // Public
  maxCacheSize: 500,
  maxCacheTime: 0,
  // Development-only
  warnIfItemPurgedBeforeTime: 5000,
  autoMaintenanceMultiplier: 2,
  // Development-only and private/secret
  numItemsToExamineForPurge: 10,
};

export default defaultOptions;
