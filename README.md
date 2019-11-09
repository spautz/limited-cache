# limited-cache

A minimal JS cache: like using an object, except it won't grow forever

## Motivation

A plain Javascript object is often good enough for simple caching.

The only problem is that the cache can grow forever. This library is like a plain object with a size limit.

## Example

```javascript
const recentResults = new LimitedCache({
  maxCacheSize: 100,
});
recentResults.set('abc', resultsForABC);

recentResults.get('abc');
```

Use `LimitedCacheProxy` for a nicer developer experience:
```javascript
const recentResults = new LimitedCacheProxy();
recentResults['abc'] = resultsForABC;
```

A React hook is available:
```javascript
const [cache, setCache] = useLimitedCache();
```

Low-level pure functions, if you persist redux:
```javascript
const initialState = {
  childIdsByParentId: {},
  limitedCacheData: limitedCacheUtil.init(),
};

// limitedCacheData is a plain, JSON-compatible object
limitedCacheData = limitedCacheUtil.set(limitedCacheData, 'abc', resultsForABC);

return {
  ...state,
  childIdsByParentId: limitedCacheData.cache,
  limitedCacheData,
}
```

## API

The default import is available for basic usage, or you can import the specific pieces you want.
The react hook is a separate package.

```javascript
import LimitedCache from 'limited-cache';

import { LimitedCache, LimitedCacheProxy, limitedCacheUtil } from 'limited-cache';

import useLimitedCache from 'limited-cache/hook';
```

### Options

#### `maxCacheSize` (number, default: 500)
Number of key/value pairs to keep in the cache. Items will be removed to stay within the limit.

#### `maxCacheTime` (milliseconds, default: none)
Time after which an item is removed. Use a falsy value to disable.

#### `initialValues` (object, default: {})
A plain object whose keys and values will 

#### `warnIfItemPurgedBeforeTime` (milliseconds, default: 5000 for development, none for production)
If an item rotates out of the cache before this time passes, emits a warning telling you increase the cache size.
Use a falsy value to disable.

#### `autoCleanupAfter` (number, default: 2*maxCacheSize)
Some under-the-hood performance optimizations result in null values and empty keys left in the cache. They are
auto-purged after this number of operations.


### Low-level pure functions

These functions are grouped together as `limitedCacheUtil`. All interfaces are built on top of these.

* `init(options)`
* `init(limitedCacheData, options)` - you can update options anytime
* `set(limitedCacheData, cacheKey, value)`
* `get(limitedCacheData, cacheKey)`
* `get(limitedCacheData)` - returns the entire cache object
* `cleanup(limitedCacheData)` - runs autoCleanup

## FAQ

**Immutable?**

Yep

**API for bulk operations?**

Nope 

**Is this a least-recently-used cache?**

No: For performance it only tracks by `set`
