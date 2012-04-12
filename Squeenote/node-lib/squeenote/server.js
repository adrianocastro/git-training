// JS OO
require.paths.unshift(__dirname + '/vendor/js-oo/lib');
require('oo');
// Socket.io
require.paths.unshift(__dirname + '/vendor/socket.io');
var io = require('socket.io');
// Core libs
var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    sys = require('sys'),
    querystring = require('querystring');
    
Server = this.Server = Class({
  
  init: function(presentation_path, presenter_password) {
    this.presenter_slide_history = []; // Contains all previously-selected slide indexes, excluding the currently-selected index.
    this.presenter_slide_index = null;
    this.presentation_path = presentation_path;
    this.presenter_password = presenter_password;
    this.httpListener = null;
    this.wsListener = null;
  },
  
  // Starts the server on the given port.
  listen: function(port) {
    // Create the regular HTTP-flavour server
    var _server = this;
    this.httpListener = http.createServer(function(req, res) {
      _server.routeRequest(req, res);
    })
    this.httpListener.listen(port);
    // Create the superduper websocket rocket
    this.wsListener = io.listen(this.httpListener);
    this.wsListener.addListener("clientConnect", function(client) {
      _server.wsClientConnected(client);
    });
    this.wsListener.addListener("clientMessage", function(message, client) {
      _server.wsClientMessageReceived(message, client);
    });
    this.wsListener.addListener("clientDisconnect", function(client) {
      _server.wsClientDisconnected(client);
    })    
    // Tell the presenter to say SQUEEEEE!
    sys.puts('Get your SQUEEEEE on at http://127.0.0.1:'+port+'/ - Press ctrl+c to stop the server.');
  },
  
  // ------------------------------------------------------------------------------------------
  // HTTP Responders
  // ------------------------------------------------------------------------------------------
  
  // Acts as the main request router for inbound requests.
  routeRequest: function(req, res) {
    var request_info = url.parse(req.url);
    sys.puts("Routing request for : "+request_info.href);
    if(request_info.pathname == "/") return this.presentationResponse(req, res);
    else if(request_info.pathname.indexOf("/public" > -1)) return this.staticFileResponse(req, res);
    else return this.notFoundResponse(req, res);
  },
  
  // Responds to the given request with the contents of the presentation file selected at server start.
  presentationResponse: function(req, res) {
    sys.puts("Serving presentation markup");
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile(this.presentation_path, function(error, data) {
      res.write(data);
      res.end();
    });
  },
  
  // Returns the contents of a static file if the file exists within the public directory.
  // Responds with a 404 Not Found if the file does not exist.
  // Responds with a 403 Forbidden if the requested path contains ".." or any other jiggery-pokery.
  staticFileResponse: function(req, res) {
    var request_info = url.parse(req.url);
    sys.puts("Serving static file: "+request_info.href);
    if(request_info.href.indexOf("/public") != 0) return this.denyResponse(req, res, "Static file requested outside of public directory");
    if(request_info.href.indexOf("..") > -1) return this.denyResponse(req, res, "Illegal static file path");
    fs.readFile("."+request_info.href, function(error, data) {
      if(error) return this.notFoundResponse(req, res);
      res.writeHead(200, {});
      res.write(data);
      res.end();
    });
  },
  
  // Denies an inbound response with a 403 Forbidden status.
  denyResponse: function(req, res, message) {
    sys.puts("Denying inbound request.");
    res.writeHead(403, {});
    res.end();
  },
  
  notFoundResponse: function(req, res) {
    var request_info = url.parse(req.url);
    sys.puts("404 Not Found: "+request_info.href);
    res.writeHead(404, {});
    res.end();
  },
  
  
  // ------------------------------------------------------------------------------------------
  // Websocket / Socket.io responders
  // ------------------------------------------------------------------------------------------
  
  // Called when a socket.io client connects to the service
  wsClientConnected: function(client) {
    sys.puts("wsClientConnected");
    this.wsClientMessageReceived({}, client);
  },
  
  // Called when a socket.io client sends a message to the service.
  // Acts as a router action for websocket messages.
  wsClientMessageReceived: function(message, client) {
    sys.puts("wsClientMessageReceived: "+sys.inspect(message));
    // Process the message and build the response message
    client_response = {};
    broadcast_response = {};
    presenter_authenticated = (message.presenter_password == this.presenter_password);

    // Sync local state for authenticated messages
    if(message.presenter_password != null) {
      client_response.authentication_attempted = true;
    }
    if(message.client_slide_index != null) {
      if(presenter_authenticated) this.setPresenterSlide(message.client_slide_index);
    }
    
    // Authenticated?
    client_response.authenticated_as_presenter = presenter_authenticated;
    // Remote slide state
    client_response.presenter_slide_index = broadcast_response.presenter_slide_index = this.presenter_slide_index;
    client_response.presenter_slide_history = broadcast_response.presenter_slide_history = this.presenter_slide_history;

    // Send response to individual client
    client.send(client_response);
    // Resync to all other clients using the broadcast response.
    // Note: some_client.broadcast will broadcast to all clients *except* some_client.
    if(presenter_authenticated) client.broadcast(broadcast_response);
  },
  
  // Called when a socket.io client disconnects from the service
  wsClientDisconnected: function(client) {
    sys.puts("wsClientDisconnected");
  },
  
  // ------------------------------------------------------------------------------------------
  // Utilities
  // ------------------------------------------------------------------------------------------
  
  // Sets the current presenter slide index and stores the previous value in the history stack.
  setPresenterSlide: function(index) {
    sys.puts("setPresenterSlide: "+index);
    this.presenter_slide_history.push(this.presenter_slide_index);
    this.presenter_slide_index = index;
    return this.presenter_slide_index;
  }
  
  
});
