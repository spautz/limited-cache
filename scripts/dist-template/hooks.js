'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./limited-cache.hooks.cjs.production.min.js');
} else {
  module.exports = require('./limited-cache.hooks.cjs.development.js');
}
