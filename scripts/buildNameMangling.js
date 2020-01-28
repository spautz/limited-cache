/* eslint-env node */

const exportNamesToPreserve = [
  'LimitedCache',
  'LimitedCacheObject',
  'defaultOptions',
  'limitedCacheUtil',
];

const propertyNamesToPreserve = [
  // public options
  'maxCacheSize',
  'maxCacheTime',
  // methods on limitedCacheUtil
  'init',
  'get',
  'has',
  'set',
  'remove',
  'doMaintenance',
  'setOptions',
  // React
  'current',
  'useRef',
  // Others
  '__esModule',
];

const propertyNameMap = {
  // Keys of the cacheMeta need to always be mangled to the same token
  limitedCacheMetaVersion: 'mv',
  options: 'mo',
  cache: 'mc',
  recentCacheKeys: 'mr',
  cacheKeyTimestamps: 'mt',
  autoMaintenanceCount: 'mn',
  // Private options still need to be stable, but the names don't matter much
  warnIfItemPurgedBeforeTime: 'ow',
  autoMaintenanceMultiplier: 'oa',
  numItemsToExamineForPurge: 'on',
};

module.exports.exportNamesToPreserve = exportNamesToPreserve;
module.exports.propertyNamesToPreserve = propertyNamesToPreserve;
module.exports.propertyNameMap = propertyNameMap;
