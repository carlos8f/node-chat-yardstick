// socket.io specific code
var socket = io.connect();

socket.on('connect', function () {
  $('#chat').addClass('connected');
});

socket.on('announcement', function (msg) {
  $('#lines').append($('<p>').append($('<em>').text(msg)));
});

socket.on('nicknames', function (nicknames) {
  $('#nicknames').empty().append($('<h3>Online</h3><br>'));
  for (var i in nicknames) {
    $('#nicknames').append($('<b>').text(nicknames[i]), '<br>');
  }
});

socket.on('user message', message);
socket.on('reconnect', function () {
  $('#lines').remove();
  message('System', 'Reconnected to the server');
});

socket.on('reconnecting', function () {
  message('System', 'Attempting to re-connect to the server');
});

socket.on('error', function (e) {
  message('System', e ? e : 'A unknown error occurred');
});

function message (from, msg) {
  $('#lines').append($('<p>').append($('<b>').text(from), msg));
}

// dom manipulation
$(function () {
  $('#nickname').on('hidden', function() {
    $('#set-nickname fieldset').removeClass('error');
    $('#nickname-err').addClass('hide');
    $('#nick').val('');
  });
  $('#set-nickname').submit(function(e) {
    var nick = $('#nick').val();
    socket.emit('nickname', nick, function(set) {
      if (!set) {
        $('#login').css('display', 'none');
        $('#send-message').removeClass('hide');
        $('#messages').removeClass('hide');
        clear();
        $('#nick-display').text(nick);
        return $('#chat').addClass('nickname-set');
      }
      $('#set-nickname fieldset').addClass('error');
      $('#nickname-err').removeClass('hide');
    });
    return false;
  });

  $('#send-message').submit(function () {
    message('me', $('#message').val());
    socket.emit('user message', $('#message').val());
    clear();
    $('#lines').get(0).scrollTop = 10000000;
    return false;
  });

  function clear () {
    $('#nickname').modal('hide');
    $('#message').val('').focus();
  };
});
