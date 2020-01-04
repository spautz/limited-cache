/* eslint-env jest */
import { terserReserved, stableKeysForLimitedCacheMeta } from '../scripts/buildNameMangling';
import { limitedCacheUtil } from '../src/main';
import * as allMainExports from '../src/main';
import * as allHooksExports from '../src/hooks';

const allExports = { ...allMainExports, ...allHooksExports };

/*
 * This makes sure that the build system -- specifically scripts/name-cache.js -- is up-to-date with the code.
 * It's included in the test suite because that's much easier than trying to do ts work inside the rollup config
 * at build time.
 */

describe('build config for name mangling', () => {
  let myCacheMetaKeys: Array<string>;
  beforeEach(() => {
    myCacheMetaKeys = Object.keys(limitedCacheUtil.init());
  });

  it('has all public exports registered', () => {
    expect(terserReserved).toEqual(Object.keys(allExports));
  });

  it('has all limitedCacheMeta keys registered', () => {
    expect(Object.keys(stableKeysForLimitedCacheMeta)).toEqual(myCacheMetaKeys);
  });
});
