import {
    defaultOptions,
    lowLevelInit,
    lowLevelSet,
    lowLevelGet,
    lowLevelMaintenance,
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
    set: lowLevelSet,
    get: lowLevelGet,
    maintenance: lowLevelMaintenance,
};
