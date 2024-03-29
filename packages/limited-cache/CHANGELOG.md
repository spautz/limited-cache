# Changelog

## 2.2.0

### Minor Changes

- Update devDependencies and build system. No functional changes expected from this ([#68](https://github.com/spautz/limited-cache/issues/68)) ([05da16b](https://github.com/spautz/limited-cache/commit/05da16b9b97eb413b186334141b255ee4a03b687))
- Add support for bundler moduleResolution ([#68](https://github.com/spautz/limited-cache/issues/68)) ([05da16b](https://github.com/spautz/limited-cache/commit/05da16b9b97eb413b186334141b255ee4a03b687))

## 2.1.1

### Patch Changes

- Add .js extensions to imports, to satisfy nodenext moduleResolution ([#60](https://github.com/spautz/limited-cache/issues/60)) ([2f2f679](https://github.com/spautz/limited-cache/commit/2f2f67995be0ef737e2ef191dd5180b735054fe0))

## [2.1.0](https://github.com/spautz/limited-cache/compare/v2.0.0...v2.1.0) (2023-04-30)

### Minor Changes

- Update and modernize package build ([#56](https://github.com/spautz/limited-cache/issues/56)) ([5f210a6](https://github.com/spautz/limited-cache/commit/5f210a6a5f77cdffe73f004ea4574f4e791e5029))
- Add NPM provenance via Github actions ([#56](https://github.com/spautz/limited-cache/issues/56)) ([5f210a6](https://github.com/spautz/limited-cache/commit/5f210a6a5f77cdffe73f004ea4574f4e791e5029))
- Confirm support for Node 20 ([#56](https://github.com/spautz/limited-cache/issues/56)) ([5f210a6](https://github.com/spautz/limited-cache/commit/5f210a6a5f77cdffe73f004ea4574f4e791e5029))

## [2.0.0](https://github.com/spautz/limited-cache/compare/v1.1.1...v2.0.0) (2021-10-23)

- Add `getCacheMetaFromObject` for accessing the cacheMeta of a `LimitedCacheObject`: see docs
- Internal package updates
- Confirm support for Node 17

### BREAKING CHANGES

- Drop support for Node 10

### [1.1.1](https://github.com/spautz/limited-cache/compare/v1.1.0...v1.1.1) (2021-06-21)

- Minor updates to build system and scripts

## [1.1.0](https://github.com/spautz/limited-cache/compare/v1.0.1...v1.1.0) (2021-05-24)

- Publish multiple typesVersions for different versions of typescript

### [1.0.1](https://github.com/spautz/limited-cache/compare/v1.0.0...v1.0.1) (2020-10-25)

- Minor updates to build system and devDependencies

## [1.0.0](https://github.com/spautz/limited-cache/compare/v0.5.1...v1.0.0) (2020-08-10)

Version 1.0 redesigns the internal cacheMeta structure. This should scale better, and make it possible to build future
features and additional options.

There is now a new build system. As part of this, the React hooks and the `react` entry point have been removed.
[The code for `useLimitedCache` and `useLimitedCacheObject` is here](https://github.com/spautz/limited-cache/blob/v0.5.1/src/hooks.ts)
if you want to reimplement them yourself. For most cases, a `useMemo(() => LimitedCache(), []))` should be enough.

Other than the React hooks, there are no breaking changes to the public API or options. If you've used any undocumented
internal features, however, then they may not work the same in v1.0.

A limited-cache instance from v0.x isn't compatible with v1.x, so if you persist cacheMeta in storage then it will be
reset to an empty state on next load.

### BREAKING CHANGES

- Migrate to TSDX and drop React hooks ([#27](https://github.com/spautz/limited-cache/issues/27)) ([b1d46f2](https://github.com/spautz/limited-cache/commit/b1d46f265ee12b8d8d48cbe577d8454cc3999089))
- Refactor timestamp tracking ([#29](https://github.com/spautz/limited-cache/issues/29)) ([1c18b24](https://github.com/spautz/limited-cache/commit/1c18b2478fc2713d604393d58adff3703bfee563))
- Update cacheMeta shape, increment storage version ([#28](https://github.com/spautz/limited-cache/issues/28)) ([429a2bc](https://github.com/spautz/limited-cache/commit/429a2bc9131401530810e62ad9479ed5a16f96ca))
- Refactor timestamp tracking to support future options ([#30](https://github.com/spautz/limited-cache/issues/30)) ([264d715](https://github.com/spautz/limited-cache/commit/264d71539d07bc106f8d81d7f20d9d1583a7f2ae))

### [0.5.1](https://github.com/spautz/limited-cache/compare/v0.5.0...v0.5.1) (2020-08-01)

> Update devDependencies for security, update configs for dev tools

- No changes expected in limited-cache itself

## [0.5.0](https://github.com/spautz/limited-cache/compare/v0.4.1...v0.5.0) (2020-06-14)

### Features

- Typescript: Add generic typings for all cache types ([#22](https://github.com/spautz/limited-cache/issues/22)) ([55cf158](https://github.com/spautz/limited-cache/commit/55cf15894696069b9c57baf1e63873f1b6cdd878))

### BREAKING CHANGES

- Use `getAll` to get the entire cache: `get` without a cacheKey is no longer supported ([#22](https://github.com/spautz/limited-cache/issues/22)) ([55cf158](https://github.com/spautz/limited-cache/commit/55cf15894696069b9c57baf1e63873f1b6cdd878))

## [0.4.1](https://github.com/spautz/limited-cache/compare/v0.4.0...v0.4.1) (2020-06-13)

- Update devDependencies for security, update configs for dev tools
- No changes expected in limited-cache itself

## [0.4.0](https://github.com/spautz/limited-cache/compare/v0.3.0...v0.4.0) (2020-03-14)

- Update devDependencies, the build system, and the package distribution
- No changes expected in limited-cache itself

## [0.3.0](https://github.com/spautz/limited-cache/compare/v0.2.1...v0.3.0) (2020-02-19)

### BREAKING CHANGES

- Adjust default options and allow negative option values ([#14](https://github.com/spautz/limited-cache/issues/14)) ([8154ab4](https://github.com/spautz/limited-cache/commit/8154ab41cd7bd7a59e910dae16456376a6fb14aa))

### [0.2.1](https://github.com/spautz/limited-cache/compare/v0.2.0...v0.2.1) (2020-02-13)

### Bug Fixes

- Fix paths to typings ([#13](https://github.com/spautz/limited-cache/issues/13)) ([a03ee13](https://github.com/spautz/limited-cache/commit/a03ee133301c0208fda5a6ed3b2040cf5b043016))

## [0.2.0](https://github.com/spautz/limited-cache/compare/v0.1.1...v0.2.0) (2020-02-05)

### Features

- Export and treeshaking for individual low-level functions ([#9](https://github.com/spautz/limited-cache/issues/9)) ([f2df0dc](https://github.com/spautz/limited-cache/commit/f2df0dcde7b3cfbc5d089898483bee71fd8a304f))
- Expand typescript annotations [(#10](https://github.com/spautz/limited-cache/issues/10)) ([ff729f7](https://github.com/spautz/limited-cache/commit/ff729f7163e2a5a22943fd72546e76886118b870))
- Add changelog tooling [(#11](https://github.com/spautz/limited-cache/issues/11)) ([03e8ecc](https://github.com/spautz/limited-cache/commit/03e8ecc369d726526eb5c0b7ca8b258b7cc1deb7))

### Bug Fixes

- Properly annotate optional react peerDependency ([#8](https://github.com/spautz/limited-cache/issues/8)) ([a7f043e](https://github.com/spautz/limited-cache/commit/a7f043ef7266b5e136fc14559d195408c125cb14))
