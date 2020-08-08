import { LimitedCacheOptionsReadonly } from '../types';

const defaultOptions: LimitedCacheOptionsReadonly = {
  // Public
  maxCacheSize: 100,
  maxCacheTime: 0,
  // Development-only
  warnIfItemPurgedBeforeTime: 5000,
  // Private
  autoMaintenanceCount: 500,
  numItemsToExamineForPurge: 20,
};

export default defaultOptions;
