#!/usr/bin/env node
/* eslint-env node */

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
} else if (process.env.NODE_ENV !== 'production') {
  console.warn(
    `Running check-build in "${process.env.NODE_ENV}" instead of "production": is this intentional?`,
  );
}

const {
  LimitedCache,
  LimitedCacheObject,
  limitedCacheUtil,
  defaultOptions,
  ...unrecognizedMainExports
} = require('../dist/main');

const mainExportsToCheck = { LimitedCache, LimitedCacheObject, limitedCacheUtil, defaultOptions };
console.log('mainExportsToCheck = ', mainExportsToCheck);
Object.keys(mainExportsToCheck).forEach((exportName) => {
  if (!mainExportsToCheck[exportName]) {
    throw new Error(`Missing export from main: ${exportName}`);
  }
});

const unrecognizedMainExportNames = Object.keys(unrecognizedMainExports);
if (unrecognizedMainExportNames.length) {
  throw new Error(
    `Unrecognized export${
      unrecognizedMainExports.length === 1 ? '' : 's'
    } found: ${unrecognizedMainExportNames.join(', ')}`,
  );
}

const {
  useLimitedCache,
  useLimitedCacheObject,
  ...unrecognizedHookExports
} = require('../dist/hooks');

const hookExportsToCheck = { useLimitedCache, useLimitedCacheObject };
Object.keys(hookExportsToCheck).forEach((exportName) => {
  if (!hookExportsToCheck[exportName]) {
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
