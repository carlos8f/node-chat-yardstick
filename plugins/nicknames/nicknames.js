/**
 * Attaches engine.oil to an http server.
 */
module.exports = function(options, imports, register) {
  var io = imports.io;
  var nicknames = {};

  io.on('connection', function(socket) {
    socket.oil.on('nickname', function(nick) {
      if (nicknameTaken(socket.id, nick)) {
        socket.oil.send('nickname', true);
      }
      else {
        socket.oil.send('nickname', false);
        nicknames[socket.id] = nick;
        socket.oil.broadcast('announcement', nick + ' connected');
        sendNicks();
      }
    });

    socket.on('close', function () {
      if (!nicknames[socket.id]) return;

      socket.oil.broadcast('announcement', nicknames[socket.id] + ' disconnected');
      delete nicknames[socket.id];
      sendNicks();
    });
  });

  function nicknameTaken(id, nick) {
    if (!nick || nick === '' || nicknames[id]) {
      return true;
    }
    var taken = false;
    Object.keys(nicknames).forEach(function(socketId) {
      if (nicknames[socketId] === nick) {
        taken = true;
      }
    });
    return taken;
  }

  function sendNicks() {
    var nicks = [];
    Object.keys(nicknames).forEach(function(id) {
      nicks.push(nicknames[id]);
    });
    nicks.sort();
    io.oil.send('nicknames', nicks);
  }

  register(null, {
    nicknames: nicknames
  });
};
