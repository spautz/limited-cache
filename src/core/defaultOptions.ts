import { LimitedCacheOptionsReadonly } from '../types';

const defaultOptions: LimitedCacheOptionsReadonly = {
  // Public
  maxCacheSize: 100,
  maxCacheTime: 0,
  // Development-only
  warnIfItemPurgedBeforeTime: 5000,
  // Development-only and private/secret
  autoMaintenanceCount: 500,
  numItemsToExamineForPurge: 20,
};

export default defaultOptions;
