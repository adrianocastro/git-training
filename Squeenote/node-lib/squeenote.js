var sys = require('sys');
var Server = require("./squeenote/server").Server;

// Start the Squeenote server
this.listen = function(presentation_path, presenter_password, port) {
  s = new Server(presentation_path, presenter_password);
  s.listen(port);
}