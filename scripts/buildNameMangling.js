/* eslint-env node */

const terserReserved = [
  'LimitedCache',
  'LimitedCacheObject',
  'limitedCacheUtil',
  'defaultOptions',
  'useLimitedCache',
  'useLimitedCacheObject',
];

const stableKeysForLimitedCacheMeta = {
  limitedCacheMetaVersion: 'mv',
  options: 'mo',
  cache: 'mc',
  recentCacheKeys: 'mr',
  cacheKeyTimestamps: 'mt',
  autoMaintenanceCount: 'mc',
};

// This is the format Terser users
const terserNameCache = {
  vars: {
    props: {},
  },
  props: {
    props: Object.keys(stableKeysForLimitedCacheMeta).reduce((acc, propName) => {
      // Terser puts a '$' in front of each key
      acc[`$${propName}`] = stableKeysForLimitedCacheMeta[propName];
      return acc;
    }, {}),
  },
};

module.exports.terserReserved = terserReserved;
module.exports.terserNameCache = terserNameCache;
module.exports.stableKeysForLimitedCacheMeta = stableKeysForLimitedCacheMeta;
