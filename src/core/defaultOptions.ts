import { LimitedCacheOptionsReadonly } from '../types';

const defaultOptions: LimitedCacheOptionsReadonly = {
  // Public
  maxCacheSize: 100,
  maxCacheTime: 0,
  // Development-only
  warnIfItemPurgedBeforeTime: 5000,
  // Private
  opLimit: 200,
  scanLimit: 20,
};

export default defaultOptions;
