/* eslint-env node */

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
  'reset',
  'doMaintenance',
  'setOptions',
  // React
  'current',
  'useRef',
  // Others
  '__esModule',
];

const propertyNameMap = {
  // Each cacheMeta key needs to be mangled to the same token for continuity
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

module.exports.propertyNamesToPreserve = propertyNamesToPreserve;
module.exports.propertyNameMap = propertyNameMap;
