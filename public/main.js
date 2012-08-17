function Client(options) {
  options || (options = {});
  this.reconnectTimeout = this.activeReconnectTimeout = options.reconnectTimeout || 1000;
  this.reconnectBackoff = options.reconnectBackoff || 1.7;
  this.reconnectAttempts = 0;
  this.port = options.port;
  this.connected = false;
  this.connect();
}
Client.prototype.connect = function() {
  this.socket = new eio.Socket({host: document.domain, port: document.location.port, transports: ['polling'], upgrade: false});
  var self = this;
  this.socket.on('open', function() {
    self.connected = true;
    this.reconnectAttempts = 0;
    message('System', 'Connected to the server');
    self.activeReconnectTimeout = self.reconnectTimeout;
  });
  this.socket.on('close', function(reason, desc) {
    if (self.connected) {
      message('System', 'Disconnected from the server');
    }
    self.connected = false;
    if (reason !== 'forced close') {
      /*
      self.activeReconnectTimeout *= self.reconnectBackoff;
      setTimeout(function() {
        self.onReconnecting();
        self.connect();
      }, self.activeReconnectTimeout);
     */
    }
  });
  this.socket.on('error', function(err) {
    if (self.connected) {
      message('System', err.message ? err.message : 'A unknown error occurred');
    }
  });
  this.socket.on('message', function(msg) {
    var unpacked = JSON.parse(msg), func;
    switch (unpacked.name) {
      case 'announcement': func = self.onAnnouncement; break;
      case 'nicknames': func = self.onNicknames; break;
      case 'nickname': func = self.onNickname; break;
      case 'user message': func = self.onUserMessage; break;
      default: return;
    }
    func.apply(self, unpacked.data);
  });
};
Client.prototype.onAnnouncement = function(msg) {
  $('#lines').append($('<p>').append($('<em>').text(msg)));
};
Client.prototype.onNicknames = function(nicknames) {
  $('#nicknames').empty().append($('<h3>Online</h3><br>'));
  for (var i in nicknames) {
    $('#nicknames').append($('<b>').text(nicknames[i]), '<br>');
  }
};
Client.prototype.onUserMessage = message;
Client.prototype.onReconnecting = function() {
  if (this.reconnectAttempts === 0) {
    message('System', 'Attempting to re-connect to the server');
  }
  this.reconnectAttempts++;
};
Client.prototype.emit = function(name, data) {
  this.socket.send(JSON.stringify({name: name, data: Array.prototype.slice.call(arguments, 1)}));
};
Client.prototype.onNickname = function(set) {
  if (!set) {
    $('#set-nickname').css('display', 'none');
    $('#send-message').removeClass('hide');
    $('#messages').removeClass('hide');
    clear();
    $('#nick-display').text(nick);
    return;
  }
  $('#set-nickname fieldset').addClass('error');
  $('#nickname-err').removeClass('hide');
};

var client = new Client();

function message(from, msg) {
  $('#lines').append($('<p>').append($('<b>').text(from), msg));
  $('#lines').get(0).scrollTop = 10000000;
}
function clear() {
  $('#message').val('').focus();
}

$(function() {
  $('#nickname').on('hidden', function() {
    $('#set-nickname fieldset').removeClass('error');
    $('#nickname-err').addClass('hide');
    $('#nick').val('');
  });
  $('#set-nickname').submit(function(e) {
    var nick = $('#nick').val();
    client.emit('nickname', nick);
    return false;
  });

  $('#send-message').submit(function() {
    message('me', $('#message').val());
    client.emit('user message', $('#message').val());
    clear();
    return false;
  });
});
