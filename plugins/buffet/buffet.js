// Module dependencies.
var buffet = require('buffet'),
    path = require('path');

/**
 * Adds buffet to the http middleware stack.
 */
module.exports = function(options, imports, register) {
  if (!options.path) {
    return register(new Error('A path MUST be specified in the buffet plugin options.'));
  }

  imports.middler.add(buffet(options.path, options));

  register(null);
};
