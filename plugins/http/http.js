// Module dependencies.
var http = require('http'),
    optimist = require('optimist');

/**
 * Provides the http server.
 */
module.exports = function setup(options, imports, register) {
  var server = http.createServer();

  // Merge argv into options.
  var argv = optimist
      .alias('p', 'port')
      .default('port', options.port || 3000)
      .argv;
  options.port = argv.port;

  // Provide a default callback.
  options.callback = options.callback || function() {
    console.log('Started http server at http://' + (options.hostname ? options.hostname : 'localhost') + ':' + options.port);
  };

  // Override listen with a pre-configured version.
  server._listen = server.listen;
  server.listen = function() {
    if (options.port && options.hostname) {
      server._listen(options.port, options.hostname, options.callback);
    }
    else {
      server._listen(options.port, options.callback);
    }
  };

  // Register plugin exports.
  register(null, {
    http: server
  });
};
