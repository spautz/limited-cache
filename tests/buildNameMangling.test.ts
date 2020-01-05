/* eslint-env jest */
import { limitedCacheUtil } from '../src/main';

import { propertyNamesToPreserve, propertyNameMap } from '../scripts/buildNameMangling';

const allRegisteredPropertyNames = [...propertyNamesToPreserve, ...Object.keys(propertyNameMap)];

/*
 * This makes sure that the build system -- via scripts/buildNameMangling.js -- is up-to-date with the code.
 */

describe('build config for name mangling', () => {
  describe('has all limitedCacheMeta keys registered', () => {
    const myCacheMeta = limitedCacheUtil.init();
    Object.keys(myCacheMeta).forEach((metaName) => {
      it(metaName, () => {
        expect(allRegisteredPropertyNames).toContain(metaName);
      });
    });
  });

  describe('has all option keys registered', () => {
    const myCacheMeta = limitedCacheUtil.init();
    Object.keys(myCacheMeta.options).forEach((optionName) => {
      it(optionName, () => {
        expect(allRegisteredPropertyNames).toContain(optionName);
      });
    });
  });

  describe('has all limitedCacheUtil keys registered', () => {
    Object.keys(limitedCacheUtil).forEach((optionName) => {
      it(optionName, () => {
        expect(allRegisteredPropertyNames).toContain(optionName);
      });
    });
  });
});
