# Limited-Cache

A minimal JS cache. Like using an object to store keys and values, except it won't grow forever

[![npm version](https://img.shields.io/npm/v/limited-cache.svg)](https://www.npmjs.com/package/limited-cache)
[![build status](https://github.com/spautz/limited-cache/workflows/CI/badge.svg)](https://github.com/spautz/limited-cache/actions)
[![test coverage](https://img.shields.io/coveralls/github/spautz/limited-cache/main.svg)](https://coveralls.io/github/spautz/limited-cache?branch=main)
[![dependencies status](https://img.shields.io/librariesio/release/npm/limited-cache.svg)](https://libraries.io/github/spautz/limited-cache)
[![gzip size](https://img.shields.io/bundlephobia/minzip/limited-cache.svg)](https://bundlephobia.com/package/limited-cache@latest)

## Motivation

A plain Javascript object is often good enough for simple key-value caching.

The problem is that a plain object cache can grow forever -- especially if you persist it in local storage. This library
adds a size limit, plus `maxCacheTime` and smarter removal of old items.

## Usage

The plain API provides a standard cache interface:

```javascript
const recentResults = LimitedCache({
  maxCacheSize: 100,
});
recentResults.set('abc', thingToSave);
recentResults.get('abc');
recentResults.has('abc');
recentResults.getAll();
recentResults.reset();
```

Use `LimitedCacheObject` for a nicer developer experience, using Proxy:

```javascript
const recentResults = LimitedCacheObject();
recentResults['abc'] = thingToSave;
```

Low-level functions using plain objects, if you need to stay serializable or want to store offline:

```javascript
const reduxState = {
  childIdsByParentId: {},
  cacheMeta: limitedCacheUtil.init(),
};

// cacheMeta is a plain, serializable object that contains the cache's internal state
cacheMeta = limitedCacheUtil.set(cacheMeta, 'abc', thingToSave);

return {
  ...reduxState,
  childIdsByParentId: limitedCacheUtil.getAll(cacheMeta),
  cacheMeta,
};
```

Typescript generics, to define a type for items in the cache:

```typescript
const stringCache = LimitedCache<string>();
const myClassCache = LimitedCacheObject<SomeClass>();
const offlineCacheMeta = lowLevelInit<SomeObjectShape>();
```

**Note: The React hooks were removed in v1.0**
[The code for `useLimitedCache` and `useLimitedCacheObject` is here](https://github.com/spautz/limited-cache/blob/v0.5.1/src/hooks.ts)
if you want to implement them yourself. For most cases, a `useMemo(() => LimitedCache(), []))` should be enough.

## Install and Import

`npm install limited-cache` or `yarn add limited-cache`

```javascript
import { LimitedCache, LimitedCacheObject, limitedCacheUtil } from 'limited-cache';
```

## Options

#### `maxCacheSize` (number, default: 100)

Number of key/value pairs to keep in the cache. A falsy value will make it limitless.

#### `maxCacheTime` (milliseconds, default: 1 day, max: 1 year)

Time after which an item is removed. A falsy value will make it the 1-year maximum.

#### `warnIfItemPurgedBeforeTime` (milliseconds, default: 5000, development only)

If an item rotates out of the cache before this time passes, emits a warning to suggest you increase the cache size.
Use a falsy value to disable.

## Low-level functions

Under the hood, everything is tracked inside a single, serializable object (`cacheMeta`) which can be persisted to
storage or kept in Redux or any other state.

You can retrieve this object from a LimitedCache or LimitedCacheObject, or create it directly via `lowLevelInit`:

```javascript
myLimitedCache.getCacheMeta();
getCacheMetaFromObject(myLimitedCacheObject);
```

Do not manipulate cacheMeta directly: a set of low-level functions is available for that. Every action available
on the higher-level LimitedCache and LimitedCacheObject is available as a low-level function.

- `lowLevelInit(options)`
- `lowLevelGetOne(cacheMeta, cacheKey)`
- `lowLevelGetAll(cacheMeta)` - returns the entire cache, excluding expired items
- `lowLevelHas(cacheMeta, cacheKey)`
- `lowLevelSet(cacheMeta, cacheKey, value)`
- `lowLevelRemove(cacheMeta, cacheKey)`
- `lowLevelReset(cacheMeta)`
- `lowLevelSetOptions(cacheMeta, options)` - you can update options anytime

These functions are also grouped together as [limitedCacheUtil](https://github.com/spautz/limited-cache/blob/main/src/core/limitedCacheUtil.ts#L13-L23) --
but minimization and tree-shaking will be slightly better if you import each individually.

## FAQ

**Immutable?**

The cache itself is, but the low-level cacheMeta is persistent/mutated.

**API for bulk operations?**

Only `reset` and `getAll`. The other actions aren't as optimizable, so they're omitted to keep this small.

**When are old items removed?**

When new items are added, or if you try to `get` an item that has expired.

**Is this a least-recently-used cache?**

Not by default: For performance it only tracks by `set` time.

You can turn it into a least-recently-used cache by calling `set` each time you `get` an item, though: items will then
expire based on when they were last accessed. This case has been optimized so performance won't suffer.
