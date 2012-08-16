// Module dependencies.
var engine = require('oil');

/**
 * Attaches engine.oil to an http server.
 */
module.exports = function(options, imports, register) {
  var server = imports.http;
  register(null, {
    io: engine.attach(server)
  });
};
