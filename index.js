var http = require('http')
  , engine = require('engine.io')
  , argv = require('optimist')
    .alias('p', 'port')
    .default('port', 3000)
    .argv
  , fs = require('fs')
  , path = require('path')
  , pub = path.resolve(__dirname, './public')
  , EventEmitter = require('events').EventEmitter
  , middler = require('middler')
  ;

fs.writeFileSync(path.join(pub, 'engine.io.js'), fs.readFileSync(path.resolve(__dirname, './node_modules/engine.io-client/dist/engine.io.js')));
var buffet = require('buffet')(pub);

var server = http.createServer();
middler(server, buffet);
middler(server, buffet.notFound);
var io = engine.attach(server, {transports: ['polling'], allowUpgrades: false});

server.listen(argv.port, function() {
  console.log('test server running on port ' + argv.port);
});

io.emitAll = function(name) {
  var args = Array.prototype.slice.call(arguments);
  Object.keys(io.clients).forEach(function(id) {
    io.clients[id].sendData.apply(io.clients[id], args);
  });
};
var nicknames = {};

io.on('connection', function(socket) {
  socket.sendData = function(name) {
    data = Array.prototype.slice.call(arguments, 1);
    socket.send(JSON.stringify({name: name, data: data}));
  };
  socket.broadcast = function(name) {
    var args = Array.prototype.slice.call(arguments);
    Object.keys(io.clients).forEach(function(id) {
      if (id === socket.id) return;
      io.clients[id].sendData.apply(io.clients[id], args);
    });
  };
  socket.on('message', function(msg) {
    var unpacked = JSON.parse(msg);
    if (unpacked.name) {
      socket.emit.apply(socket, [unpacked.name].concat(unpacked.data));
    }
  });
  socket.on('user message', function(msg) {
    socket.broadcast('user message', socket.nickname, msg);
  });

  socket.on('nickname', function(nick) {
    if (!nick || nick === '' || nicknames[nick]) {
      socket.sendData('nickname', true);
    }
    else {
      socket.sendData('nickname', false);
      nicknames[nick] = socket.nickname = nick;
      socket.broadcast('announcement', nick + ' connected');
      var names = Object.keys(nicknames);
      names.sort();
      io.emitAll('nicknames', names);
    }
  });

  socket.on('close', function () {
    if (!socket.nickname) return;

    delete nicknames[socket.nickname];
    socket.broadcast('announcement', socket.nickname + ' disconnected');
    io.emitAll('nicknames', nicknames);
  });

  socket.on('error', function(err) {
    console.error(err);
  });
});
