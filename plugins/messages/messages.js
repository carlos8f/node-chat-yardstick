/**
 * Attaches engine.oil to an http server.
 */
module.exports = function(options, imports, register) {
  var io = imports.io,
      nicknames = imports.nicknames;

  io.on('connection', function(socket) {
    socket.oil.on('user message', function(msg) {
      socket.oil.broadcast('user message', nicknames[socket.id], msg);
    });
  });

  register(null);
};
