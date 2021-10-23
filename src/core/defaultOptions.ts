import { LimitedCacheOptionsReadonly } from '../types';

const CURRENT_META_VERSION = 2;
const MAXIMUM_CACHE_TIME = 365 * 86400 * 1000;

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

export { CURRENT_META_VERSION, MAXIMUM_CACHE_TIME, defaultOptions };
