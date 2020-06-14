# Limited-Cache

A minimal JS cache. Like using an object to store keys and values, except it won't grow forever

[![npm version](https://img.shields.io/npm/v/limited-cache.svg)](https://www.npmjs.com/package/limited-cache)
[![build status](https://img.shields.io/travis/com/spautz/limited-cache.svg)](https://travis-ci.com/spautz/limited-cache)
[![test coverage](https://img.shields.io/coveralls/github/spautz/limited-cache.svg)](https://coveralls.io/github/spautz/limited-cache)
[![gzip size](https://img.shields.io/bundlephobia/minzip/limited-cache)](https://bundlephobia.com/result?p=limited-cache)

## Motivation

A plain Javascript object is often good enough for simple key-value caching.

The problem is that a plain object cache can grow forever. This library adds a size limit, plus `maxCacheTime` and
smarter removal of old items.

## Example

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

React hooks are available for both:

```javascript
const cache = useLimitedCache();
const cache2 = useLimitedCache({ maxCacheTime: 60000 }, [depsCanGoHere]);
```

```javascript
const cache = useLimitedCacheObject();
const cache2 = useLimitedCacheObject({ maxCacheTime: 60000 }, [depsCanGoHere]);
```

Low-level functions using plain objects, if you need to stay serializable or want to store offline:

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

Typescript generics, if you want to define types for items in the cache:

```typescript
const stringCache = LimitedCache<string>();
const myClassCache = useLimitedCache<SomeClass>();
const offlineCacheMeta = lowLevelInit<SomeObjectShape>();
```

## Install and Import

`npm install limited-cache` or `yarn add limited-cache`

The default import is available for basic usage, or you can import the specific pieces you want.

```javascript
import { LimitedCache, LimitedCacheObject, limitedCacheUtil } from 'limited-cache';
```

The react hook constructors are a separate package.

```javascript
import { useLimitedCache, useLimitedCacheObject } from 'limited-cache/hooks';
```

## Options

#### `maxCacheSize` (number, default: 100)

Number of key/value pairs to keep in the cache. Items will be removed to stay within the limit.

#### `maxCacheTime` (milliseconds, default: 0)

Time after which an item is removed. Use a falsy value to disable.

#### `warnIfItemPurgedBeforeTime` (milliseconds, default: 5000, development only)

If an item rotates out of the cache before this time passes, emits a warning telling you increase the cache size.
Use a falsy value to disable.

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

You can also import these functions individually, if you want to optimize tree-shaking and minification:

```javascript
import { lowLevelInit, lowLevelGet, lowLevelSet } from 'limited-cache';
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
