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
  lowLevelDoMaintenance,
  lowLevelGetOne,
  lowLevelGetAll,
  lowLevelHas,
  lowLevelInit,
  lowLevelRemove,
  lowLevelReset,
  lowLevelSet,
  lowLevelSetOptions,
  ...unrecognizedIndexExports
} = require('../');

const indexExportsToCheck = {
  LimitedCache,
  LimitedCacheObject,
  limitedCacheUtil,
  defaultOptions,
  lowLevelDoMaintenance,
  lowLevelGetOne,
  lowLevelGetAll,
  lowLevelHas,
  lowLevelInit,
  lowLevelRemove,
  lowLevelReset,
  lowLevelSet,
  lowLevelSetOptions,
};
Object.keys(indexExportsToCheck).forEach((exportName) => {
  if (!indexExportsToCheck[exportName]) {
    console.info('Exports from index: ', {
      LimitedCache,
      LimitedCacheObject,
      limitedCacheUtil,
      defaultOptions,
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
      ...unrecognizedIndexExports,
    });
    throw new Error(`Missing export from index: ${exportName}`);
  }
});

const unrecognizedIndexExportNames = Object.keys(unrecognizedIndexExports);
if (unrecognizedIndexExportNames.length) {
  throw new Error(
    `Unrecognized export${
      unrecognizedIndexExports.length === 1 ? '' : 's'
    } found: ${unrecognizedIndexExportNames.join(', ')}`,
  );
}

const { useLimitedCache, useLimitedCacheObject, ...unrecognizedHookExports } = require('../hooks');

const hookExportsToCheck = { useLimitedCache, useLimitedCacheObject };
Object.keys(hookExportsToCheck).forEach((exportName) => {
  if (!hookExportsToCheck[exportName]) {
    console.info('Exports from hooks: ', {
      useLimitedCache,
      useLimitedCacheObject,
      ...unrecognizedHookExports,
    });
    throw new Error(`Missing export from hooks: ${exportName}`);
  }
});

const unrecognizedHookExportNames = Object.keys(unrecognizedHookExports);
if (unrecognizedHookExportNames.length) {
  throw new Error(
    `Unrecognized export{unrecognizedHookExports.length===1?'':'s'} found: ${unrecognizedHookExportNames.join(
      ', ',
    )}`,
  );
}

console.log('All expected exports found');