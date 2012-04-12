var sys = require('sys'),
    path = require('path'),
    squeenote = require('./node-lib/squeenote');

// Perform boot setup with defaults
var presentation_path = "index.html"; // This is the HTML file from which Squeenote will be presenting.
var presenter_password = "crc"; // This is the default password allowing the presenter controls to be used.
var port = 8080; // The port at which the Squeenote server will listen for requests.

// Parse commandline arguments
for(var i=0; i<process.argv.length; i++) {
  // is this a flag, and is the next item a valid argument?
  flag = process.argv[i]; arg = process.argv[i+1];
  if(flag.indexOf("-") == 0 && arg && arg.indexOf("-") != 0) {
    switch(process.argv[i]) {
      case "-p":
        presenter_password = arg;
        break;
      case "-f":
        presentation_path = arg;
        break;
      case "-P":
        port = parseInt(arg);
        break;
    }
  }
}

squeenote.listen(presentation_path, presenter_password, port);
return;