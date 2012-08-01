var http = require('http')
  , socketio = require('socket.io')
  , argv = require('optimist')
    .alias('p', 'port')
    .default('port', 3000)
    .argv
  , buffet = require('buffet')(require('path').resolve(__dirname, './public'))
  ;

var server = http.createServer(function(req, res) {
  buffet(req, res, buffet.notFound.bind(null, req, res));
}).listen(argv.port, function() {
  console.log('test server running on port ' + argv.port);
});

var io = socketio.listen(server, {
  transports: ['xhr-polling']
});

io.configure(function() {
  io.set('log level', 2); // info
  io.set('polling duration', 45);
  io.set('close timeout', 55);
});
io.configure('production', function() {
  io.set('log level', 0); // error
});

var nicknames = {};

io.sockets.on('connection', function (socket) {
  socket.on('user message', function (msg) {
    socket.broadcast.emit('user message', socket.nickname, msg);
  });

  socket.on('nickname', function (nick, fn) {
    if (!nick || nick === '' || nicknames[nick]) {
      fn(true);
    } else {
      fn(false);
      nicknames[nick] = socket.nickname = nick;
      socket.broadcast.emit('announcement', nick + ' connected');
      var names = Object.keys(nicknames);
      names.sort();
      io.sockets.emit('nicknames', names);
    }
  });

  socket.on('disconnect', function () {
    if (!socket.nickname) return;

    delete nicknames[socket.nickname];
    socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
    socket.broadcast.emit('nicknames', nicknames);
  });
});
