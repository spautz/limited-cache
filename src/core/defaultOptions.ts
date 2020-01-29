import { LimitedCacheOptionsReadonly } from '../types';

const defaultOptions: LimitedCacheOptionsReadonly = {
  // Public
  maxCacheSize: 500,
  maxCacheTime: 0,
  // Development-only
  warnIfItemPurgedBeforeTime: 5000,
  autoMaintenanceMultiplier: 2,
  // Development-only and private/secret
  numItemsToExamineForPurge: 20,
};

export default defaultOptions;
