/* eslint-env node */
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('../dist/limited-cache.hooks.cjs.production.min.js');
} else {
  module.exports = require('../dist/limited-cache.hooks.cjs.development.js');
}
