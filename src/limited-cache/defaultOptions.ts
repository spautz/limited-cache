interface LimitedCacheOptions {
  maxCacheSize: number;
  maxCacheTime: number;
  warnIfItemPurgedBeforeTime: number;
  autoMaintenanceMultiplier: number;
  numItemsToExamineForPurge: number;
}

type LimitedCacheOptionsPartial = Partial<LimitedCacheOptions> | null;
type LimitedCacheOptionsReadonly = Readonly<LimitedCacheOptions>;

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
// types
export { LimitedCacheOptions, LimitedCacheOptionsPartial, LimitedCacheOptionsReadonly };
