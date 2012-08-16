var path = require('path');

module.exports = [
  { packagePath: "./plugins/http", port: 8080 },
  { packagePath: "./plugins/middler" },
  { packagePath: "./plugins/buffet", path: path.join(__dirname, "./public") },
  { packagePath: "./plugins/engine.oil" },
  { packagePath: "./plugins/nicknames" },
  { packagePath: "./plugins/messages" }
];
