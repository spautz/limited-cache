'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./limited-cache.index.cjs.production.min.js');
} else {
  module.exports = require('./limited-cache.index.cjs.development.js');
}
