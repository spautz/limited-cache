import {
    defaultOptions,
    lowLevelInit,
    lowLevelSet,
    lowLevelGet,
    lowLevelMaintenance,
} from './limitedCacheUtil'

const proxyHandler = {
    get: lowLevelGet,
    set: lowLevelSet,
};

function LimitedCacheProxy(options) {
    const cacheMeta = lowLevelInit(null, options);

    return new Proxy(cacheMeta, proxyHandler);
}

export default LimitedCacheProxy;
