var casper = require('casper').create({
  verbose: true,
  logLevel: "debug",
  loadImages: false,
  loadPlugins: false
});

var url = casper.cli.get(0) || 'http://localhost:3000/';

casper.on('load.failed', function(req) {
  casper.die('Failed to load! ' + JSON.stringify(req, undefined, 4), 1);
});

casper.on('error', function(msg, trace) {
  casper.log(msg, 'error');
  trace.forEach(function(item) {
    casper.log('  ', item.file, ':', item.line);
  })
});

casper.start(url);

casper.then(function() {
  this.evaluate(function setNickname() {
    $('#nick').val('bot_' + Math.round(Math.random() * (1<<24)).toString(16));
    $('#set-nickname .btn').click();
  });

  this.wait(1000 * 60 * 5);
  this.evaluate(function getChats() {
    $.getJSON('http://search.twitter.com/search.json?q=snoop&rpp=200&page=' + Math.ceil(Math.random() * 10) + '&callback=?', function(data) {
      window.chats = [];
      data.results.forEach(function(tweet) {
        window.chats.push(tweet.text);
      });
    });
  }, null, 10000);

  (function nextChat() {
    casper.evaluate(function typeChat() {
      if (window.chats) {
        $('#message').val(window.chats[Math.round(Math.random() * (window.chats.length - 1))]);
        $('#send-message .btn').click();
      }
    });
    setTimeout(nextChat, Math.random() * 1000 * 60 * 1);
  })();
});


casper.run(function onExit() {
  this.echo('Exiting.');
  this.exit();
});
