# limited-cache

A minimal JS cache: like using an object, except it won't grow forever

## Motivation

A plain Javascript object is often good enough for simple key-value caching.

The problem is that a simple object cache can grow forever. This library is like a plain object with a size limit,
plus `maxCacheTime` and smarter removal of old items.

## Example

The plain API provides a standard cache interface:

```javascript
const recentResults = LimitedCache({
  maxCacheSize: 100,
});
recentResults.set('abc', resultsForABC);
recentResults.get('abc');
```

Use `LimitedCacheProxy` for a nicer developer experience:

```javascript
const recentResults = LimitedCacheProxy();
recentResults['abc'] = resultsForABC;
```

React hooks are available for both:

```javascript
const useRecentResults = LimitedCacheHook();
const [getCache, setCache] = useRecentResults();
```

```javascript
const useRecentResults = LimitedCacheProxyHook();
const cache = useRecentResults();
```

Low-level functions using plain objects, if you need serialization:

```javascript
const initialState = {
  childIdsByParentId: {},
  cacheMeta: limitedCacheUtil.init(),
};

// cacheMeta is a plain, JSON-compatible object
cacheMeta = limitedCacheUtil.set(cacheMeta, 'abc', resultsForABC);

return {
  ...state,
  childIdsByParentId: limitedCacheUtil.get(cacheMeta),
  cacheMeta,
};
```

## Import

The default import is available for basic usage, or you can import the specific pieces you want.

```javascript
import { LimitedCache, LimitedCacheProxy, limitedCacheUtil } from 'limited-cache';
```

The react hook constructors are a separate package.

```javascript
import { LimitedCacheHook, LimitedCacheProxyHook } from 'hooks/index';
```

## Options

#### `maxCacheSize` (number, default: 500)

Number of key/value pairs to keep in the cache. Items will be removed to stay within the limit.

#### `maxCacheTime` (milliseconds, default: none)

Time after which an item is removed. Use a falsy value to disable.

#### `initialValues` (object, default: {})

A plain object whose keys and values will

#### `warnIfItemPurgedBeforeTime` (milliseconds, default: 5000 for development, none for production)

If an item rotates out of the cache before this time passes, emits a warning telling you increase the cache size.
Use a falsy value to disable.

#### `autoMaintenanceMultiplier` (number, default: 2)

Some under-the-hood performance optimizations result in `undefined` values left in the cache, temporarily.
They are auto-purged after `autoMaintenanceMultiplier * maxCacheSize` operations.

## Low-level functions

These functions are grouped together as `limitedCacheUtil`. All interfaces are built on top of these.

- `init(options)`
- `get(cacheMeta)` - returns the entire cache object
- `get(cacheMeta, cacheKey)`
- `has(cacheMeta, cacheKey)`
- `set(cacheMeta, cacheKey, value)`
- `remove(cacheMeta, cacheKey)`
- `performMaintenance(cacheMeta)` - runs autoMaintenance
- `setOptions(cacheMeta, options)` - you can update options anytime

## FAQ

**Immutable?**

The cache itself is, but cacheMeta is persistent.

**API for bulk operations?**

Nope.

**Is this a least-recently-used cache?**

No: For performance it only tracks by `set`.

**When are old items removed?**

When new items are added, or if you try to `get` an item that has expired.

If you retrieve the entire cache object as-is then it may contain expired items. If you don't want that,
run `performMaintenance` first.
