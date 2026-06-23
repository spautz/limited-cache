import type { LimitedCacheOptionsReadonly } from '../types.js';

const CURRENT_META_VERSION = 2 as const;
// Default = 1 year
const MAXIMUM_CACHE_TIME: number = 365 * 86400 * 1000;

const defaultOptions: LimitedCacheOptionsReadonly = {
  // Public
  maxCacheSize: 100,
  maxCacheTime: 86400 * 1000,
  // Development-only
  warnIfItemPurgedBeforeTime: 5000,
  // Private
  opLimit: 200,
  scanLimit: 50,
};

export { CURRENT_META_VERSION, defaultOptions, MAXIMUM_CACHE_TIME };
