import {
    defaultOptions,
    lowLevelInit,
    lowLevelGet,
    lowLevelHas,
    lowLevelSet,
    lowLevelRemove,
    lowLevelPerformMaintenance,
    lowLevelSetOptions,
} from './limitedCacheUtil'
import LimitedCache from './LimitedCache';
import LimitedCacheProxy from './LimitedCacheProxy';

export default LimitedCache;

export {
    LimitedCache,
    LimitedCacheProxy,
};

export const limitedCacheUtil = {
    defaultOptions,
    init: lowLevelInit,
    get: lowLevelGet,
    has: lowLevelHas,
    set: lowLevelSet,
    remove: lowLevelRemove,
    performMaintenance: lowLevelPerformMaintenance,
    setOptions: lowLevelSetOptions,
};
