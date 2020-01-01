export interface LimitedCacheOptions {
  maxCacheSize: number;
  maxCacheTime: number;
  warnIfItemPurgedBeforeTime: number;
  autoMaintenanceMultiplier: number;
  numItemsToExamineForPurge: number;
}

export type LimitedCacheOptionsPartial = Partial<LimitedCacheOptions>;
export type LimitedCacheOptionsReadonly = Readonly<LimitedCacheOptions>;

export const defaultOptions: LimitedCacheOptionsReadonly = {
  maxCacheSize: 500,
  maxCacheTime: 0,
  warnIfItemPurgedBeforeTime: process.env['NODE_ENV'] === 'development' ? 5000 : 0,
  autoMaintenanceMultiplier: 2,
  numItemsToExamineForPurge: 10,
};
