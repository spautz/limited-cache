import {
    defaultOptions,
    lowLevelInit,
    lowLevelSet,
    lowLevelGet,
    lowLevelCleanup,
} from './limitedCacheUtil'


export const limitedCacheUtil = {
    defaultOptions,
    init: lowLevelInit,
    set: lowLevelSet,
    get: lowLevelGet,
    cleanup: lowLevelCleanup,
};
