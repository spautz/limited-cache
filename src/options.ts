export interface LimitedCacheOptions {
  maxCacheSize: number;
  maxCacheTime: number;
  initialValues: object | null;
  warnIfItemPurgedBeforeTime: number;
  autoMaintenanceMultiplier: number;
  numItemsToExamineForPurge: number;
}

export type LimitedCacheOptionsPartial = Partial<LimitedCacheOptions>;
export type LimitedCacheOptionsReadonly = Readonly<LimitedCacheOptions>;

export const defaultOptions: LimitedCacheOptionsReadonly = {
  maxCacheSize: 500,
  maxCacheTime: 0,
  initialValues: null,
  warnIfItemPurgedBeforeTime: process.env['NODE_ENV'] === 'development' ? 5000 : 0,
  autoMaintenanceMultiplier: 2,
  numItemsToExamineForPurge: 10,
};
