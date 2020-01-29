# limited-cache

A minimal JS cache. Like using an object to store keys and values, except it won't grow forever

[![npm version](https://img.shields.io/npm/v/limited-cache.svg)](https://www.npmjs.com/package/limited-cache)
[![build status](https://img.shields.io/travis/spautz/limited-cache.svg)](https://travis-ci.com/spautz/limited-cache)
[![test coverage](https://img.shields.io/coveralls/github/spautz/limited-cache.svg)](https://coveralls.io/github/spautz/limited-cache)
[![gzip size](https://img.shields.io/bundlephobia/minzip/limited-cache)](https://bundlephobia.com/result?p=limited-cache)

## Motivation

A plain Javascript object is often good enough for simple key-value caching.

The problem is that a simple object cache can grow forever. This library adds a size limit, plus `maxCacheTime` and
smarter removal of old items.

## Example

The plain API provides a standard cache interface:

```javascript
const recentResults = LimitedCache({
  maxCacheSize: 100,
});
recentResults.set('abc', thingToSave);
recentResults.get('abc');
recentResults.reset();
```

Use `LimitedCacheObject` for a nicer developer experience, using Proxies:

```javascript
const recentResults = LimitedCacheObject();
recentResults['abc'] = thingToSave;
```

React hooks are available for both:

```javascript
const cache = useLimitedCache();
```

```javascript
const cache = useLimitedCacheObject();
```

Low-level functions using plain objects, if you need to stay serializable:

```javascript
const reduxState = {
  childIdsByParentId: {},
  cacheMeta: limitedCacheUtil.init(),
};

// cacheMeta is a plain, serializable object for the cache's internal state
cacheMeta = limitedCacheUtil.set(cacheMeta, 'abc', thingToSave);

return {
  ...reduxState,
  childIdsByParentId: limitedCacheUtil.get(cacheMeta),
  cacheMeta,
};
```

## Import

The default import is available for basic usage, or you can import the specific pieces you want.

```javascript
import { LimitedCache, LimitedCacheObject, limitedCacheUtil } from 'limited-cache';
```

The react hook constructors are a separate package.

```javascript
import { useLimitedCache, useLimitedCacheObject } from 'limited-cache/hooks';
```

## Options

#### `maxCacheSize` (number, default: 500)

Number of key/value pairs to keep in the cache. Items will be removed to stay within the limit.

#### `maxCacheTime` (milliseconds, default: none)

Time after which an item is removed. Use a falsy value to disable.

#### `warnIfItemPurgedBeforeTime` (milliseconds, default: 5000, development only)

If an item rotates out of the cache before this time passes, emits a warning telling you increase the cache size.
Use a falsy value to disable.

#### `autoMaintenanceMultiplier` (number, default: 2, development only)

Some under-the-hood performance optimizations result in `undefined` values left in the cache, temporarily.
They are auto-purged after `autoMaintenanceMultiplier * maxCacheSize` operations.

## Low-level functions

These functions are grouped together as `limitedCacheUtil`. The other interfaces are built on top of these.

- `init(options)`
- `get(cacheMeta)` - returns the entire cache
- `get(cacheMeta, cacheKey)`
- `has(cacheMeta, cacheKey)`
- `set(cacheMeta, cacheKey, value)`
- `remove(cacheMeta, cacheKey)`
- `reset(cacheMeta)`
- `setOptions(cacheMeta, options)` - you can update options anytime

## FAQ

**Immutable?**

The cache itself is, but the low-level cacheMeta is persistent.

**API for bulk operations?**

Only `reset`. The other actions aren't as optimizable, so they're omitted to keep this small.

**Is this a least-recently-used cache?**

No: For performance it only tracks by `set` time.

**When are old items removed?**

When new items are added, or if you try to `get` an item that has expired.
