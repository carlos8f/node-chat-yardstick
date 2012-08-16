// Module dependencies.
var Middler = require('middler');

/**
 * Provides a middleware handler.
 */
module.exports = function(options, imports, register) {
  var server = imports.http;
  register(null, {
    middler: new Middler(server)
  });
};
