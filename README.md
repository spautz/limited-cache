# Limited-Cache

A minimal JS cache. Like using an object to store keys and values, except it won't grow forever

[![npm version](https://img.shields.io/npm/v/limited-cache.svg)](https://www.npmjs.com/package/limited-cache)
[![build status](https://img.shields.io/travis/com/spautz/limited-cache.svg)](https://travis-ci.com/spautz/limited-cache)
[![dependencies status](https://img.shields.io/badge/dependencies-none-green.svg)](https://david-dm.org/spautz/limited-cache)
[![gzip size](http://img.badgesize.io/https://unpkg.com/limited-cache@latest/dist/limited-cache.cjs.production.min.js?compression=gzip)](https://bundlephobia.com/result?p=limited-cache)
[![test coverage](https://img.shields.io/coveralls/github/spautz/limited-cache.svg)](https://coveralls.io/github/spautz/limited-cache)

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

Typescript generics, if you want to define a type for items in the cache:

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

These functions are grouped together as `limitedCacheUtil`. The other interfaces are built on top of these.

- `init(options)`
- `get(cacheMeta, cacheKey)`
- `getAll(cacheMeta)` - returns the entire cache, excluding expired items
- `has(cacheMeta, cacheKey)`
- `set(cacheMeta, cacheKey, value)`
- `remove(cacheMeta, cacheKey)`
- `reset(cacheMeta)`
- `setOptions(cacheMeta, options)` - you can update options anytime

You can also import these functions individually, if you want to optimize tree-shaking and minification:

```javascript
import { lowLevelInit, lowLevelGetOne, lowLevelGetAll, lowLevelSet } from 'limited-cache';
```

## FAQ

**Immutable?**

The cache itself is, but the low-level cacheMeta is persistent/mutated.

**API for bulk operations?**

Only `reset` and `getAll`. The other actions aren't as optimizable, so they're omitted to keep this small.

**When are old items removed?**

When new items are added, or if you try to `get` an item that has expired.

**Is this a least-recently-used cache?**

No: For performance it only tracks by `set` time.

If you want items to expire based on when they were last accessed (instead of when they were set), you can `set`
the value that already exists: only the timestamp will be updated, so performance won't suffer.
