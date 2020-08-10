#!/usr/bin/env node
/* eslint-env node */

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
} else if (process.env.NODE_ENV !== 'production') {
  console.warn(`Running check-build in "${process.env.NODE_ENV}" instead of "production"`);
}

const {
  LimitedCache,
  LimitedCacheObject,
  limitedCacheUtil,
  defaultOptions,
  isCacheMeta,
  upgradeCacheMeta,
  lowLevelDoMaintenance,
  lowLevelGetOne,
  lowLevelGetAll,
  lowLevelHas,
  lowLevelInit,
  lowLevelRemove,
  lowLevelReset,
  lowLevelSet,
  lowLevelSetOptions,
  CURRENT_META_VERSION,
  ...unrecognizedExports
} = require('../');

const exportsToCheck = {
  LimitedCache,
  LimitedCacheObject,
  limitedCacheUtil,
  defaultOptions,
  isCacheMeta,
  upgradeCacheMeta,
  lowLevelDoMaintenance,
  lowLevelGetOne,
  lowLevelGetAll,
  lowLevelHas,
  lowLevelInit,
  lowLevelRemove,
  lowLevelReset,
  lowLevelSet,
  lowLevelSetOptions,
  CURRENT_META_VERSION,
};
Object.keys(exportsToCheck).forEach((exportName) => {
  if (!exportsToCheck[exportName]) {
    console.info('Exports: ', {
      LimitedCache,
      LimitedCacheObject,
      limitedCacheUtil,
      defaultOptions,
      CURRENT_META_VERSION,
      lowLevelFunctions: {
        lowLevelDoMaintenance,
        lowLevelGetOne,
        lowLevelGetAll,
        lowLevelHas,
        lowLevelInit,
        lowLevelRemove,
        lowLevelReset,
        lowLevelSet,
        lowLevelSetOptions,
      },
      ...unrecognizedExports,
    });
    throw new Error(`Missing export: ${exportName}`);
  }
});

const unrecognizedExportNames = Object.keys(unrecognizedExports);
if (unrecognizedExportNames.length) {
  throw new Error(
    `Unrecognized export${
      unrecognizedExports.length === 1 ? '' : 's'
    } found: ${unrecognizedExportNames.join(', ')}`,
  );
}

console.log('All expected exports found');
