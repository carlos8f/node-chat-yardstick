var path = require('path'),
    architect = require('architect'),
    configPath = path.join(__dirname, 'config.js'),
    config = architect.loadConfig(configPath);

architect.createApp(config, function(err, app) {
  if (err) return console.log(err);
  app.services.http.listen();
});
