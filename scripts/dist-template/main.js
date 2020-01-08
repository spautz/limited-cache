'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./limited-cache.main.cjs.production.min.js');
} else {
  module.exports = require('./limited-cache.main.cjs.development.js');
}
