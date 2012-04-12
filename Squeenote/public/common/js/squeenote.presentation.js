if(typeof(squeenote)=="undefined") squeenote = {};

/* 
  squeenote.Presentation
  
  Controls the slide flow and also maintains a stateful connection to the squeenote server.
  
  Events can be bound to the provided jq_presentation object via window.presentation.jq_presentation.bind("...", function(event, args) {...});
  
  Events:
  
  $(document) events
  ==================
  
  presentationLoaded.squeenote(presentation)
  ------------------------------------------
  Dispatched on the document element when the presentation is instantiated. 
  Used by themes and the core squeenote UI to begin customising the markup.
  
  window.presentation.jq_presentation events
  ==========================================
  
  presentationClientSlideChanged.squeenote(presentation)
  ------------------------------------------------------
  Dispatched on the wrapping list element when the client's slide changes, either
  through manual keypresses from a client user or from syncing to the presenter's slide.
  
  presentationPresenterSlideChanged.squeenote(presentation)
  ---------------------------------------------------------
  Dispatched on the wrapping list element when the remote presenter changes slides.
  The presentation object may optionally respond by changing the client slide if
  presenter following is currently enabled by the client user.
  
  authenticatedAsPresenter.squeenote
  --------------------------------
  Dispatched on the wrapping list element when the presenter password is entered correctly
  and confirmed by the squeenote server.
  
  unAuthenticatedAsPresenter.squeenote
  -----------------------------------
  Dispatched on the wrapping list element when the presenter signs off.
  
  failedAuthenticationAsPresenter.squeenote
  -------------------------------------
  Dispatched on the wrapping list element when the presenter password is entered incorrectly.
  
  startedFollowingPresenter.squeenote
  -----------------------------------
  Called when the user enables presenter following through the UI. Will cause the presentation to
  respond to presentationPresenterSlideChanged events by changing the client slide in kind.
  
  stoppedFollowingPresenter.squeenote
  -----------------------------------
  Called when the user disables presenter following either by toggling the switch provided in the
  Squeenote UI, or by switching slides manually. Will cause a message to be displayed in the UI
  indicating that the client user is off-presentation and providing an option to resync to the 
  presenter at any time.
  
  presenterOnline.squeenote
  -------------------------
  Called when the remote presenter comes online.
  
  presenterOffline.squeenote
  --------------------------
  Called when the remote presenter goes offline or terminates the presentation.
  
  list item events ($(window.presentation.jq_slide_selector).bind(....))
  ======================================================================
  
  slideStateChanged.squeenote(list_item, state)
  ---------------------------------------------
  Called when an individual slide's state changes due to a slide index change. 
  States are "done", "current" and "pending".
*/
squeenote.Presentation = function() {
  this.init();
}
squeenote.Presentation.prototype = {
  
  client_slide_index: 0,        // The slide index currently being viewed by the client. Zero-based.
  presenter_slide_index: null,  // The slide index currently being shown by the presenter. Zero-based.
  slide_count: 0,               // The total number of slides in the presentation
  verbose: false,                // Set console.log output
  prev_slide_keycode: 37,       // The left arrow key.
  next_slide_keycode: 39,       // The right arrow key.
  
  presenter_follow_enabled: null, // When true, the client will sync slides with the presenter. Following the presenter is considered 
                                  // mutually exclusive to being authenticated as the presenter. Authenticating as a presenter will cancel
                                  // presenter following.
  presenter_online: false,        // Remains false until the first time we receive a presenterSlideChanged event.
  authenticated_as_presenter: false, // When true, generates control messages and attempts to keep other clients in sync.
  presenter_password: null,         // Kept in sync with the in-document password through the presenterPasswordChanged.squeenote event
  
  socket: null,                 // The socket.io client instance
  
  jq_presentation: null,       // A jQuery object containing the root presentation node.
  
  jq_presentation_selector: "body > ol", // The selector used to identify the root presentation holder.
  jq_slide_selector: "body > ol > li", // The selector used to identify and select elements that are slides.
  
  init: function() {
    this.log("init...");
    var _instance = this; // Scoped reference for use in evented functions here.

    // Set static references
    this.jq_presentation = $(this.jq_presentation_selector);
    this.slide_count = $(this.jq_slide_selector).length;
    
    // Perform socket.io setup
    io.setPath('/common/js/socket.io/');
    this.socket = new io.Socket(window.location.host.split(":")[0], {
      transports: ['websocket', 'server-events', 'htmlfile', 'xhr-multipart', 'xhr-polling']
    });
    this.socket.connect();
    
    // Bind socket events
    this.socket.addEvent('message', function(data) {
      _instance.wsServerMessageReceived(data);
    });
    this.socket.addEvent('disconnect', function() {
      _instance.socket.connect(); // force reconnect
    });
    
    // Bind external events
    this.jq_presentation.bind("presenterPasswordChanged.squeenote", function(event, presenter_password) {
      event.preventDefault();
      _instance.log("Presenter password changed, will attempt to reauthenticate: "+presenter_password);
      _instance.presenter_password = (presenter_password && presenter_password.replace(/\s/g, "").length > 0)? presenter_password : null;
      _instance.wsSyncStateToServer();
    })
    this.jq_presentation.bind("presentationClientSlideChanged.squeenote", function(event, presentation) {
      _instance.log("Client slide index changed, will attempt to sync to server.");
      _instance.wsSyncStateToServer();
    });
    
    // Trigger the ready event for any theme javascript to pick up on.
    $(document).trigger("presentationLoaded.squeenote", this);
    // Default to following the presenter.
    
    
    // Check for a #slide-I anchor and default to zero otherwise.
    var loc = window.location.href.toString();
    var bootSlide = 0;

    this.startFollowingPresenter();
    
    if(loc.indexOf("#slide-") > -1) {
      this.showSlide(parseInt(loc.split("#slide-")[1]));
    } else {
      this.showSlide(0);
    }
  },
  
  prevSlide: function(index) {
    if(this.client_slide_index <= 0) return this.showSlide(this.slide_count-1, true);
    this.showSlide(this.client_slide_index-1, true);
  },
  
  nextSlide: function(index) {
    if(this.client_slide_index >= this.slide_count-1) return this.showSlide(0, true);
    this.showSlide(this.client_slide_index+1, true);
  },
  
  // Shows the slide with the specified index.
  // If client_event is specified and evaluates to true, the change will be considered to be a local one
  // that moves the user off-timeline and disables presenter following.
  showSlide: function(index, client_event) {
    this.log("Showing slide with index: "+index);
    this.client_slide_index = index;
    if(client_event) this.stopFollowingPresenter();
    this.jq_presentation.trigger("presentationClientSlideChanged.squeenote", this);
    var i = 0;
    
    // Append the slide index to the location
    if(index) {
      var loc = window.location.href.toString();
      var url = loc.split("#")[0];
      var anchor = loc.split("#")[1];
      window.location = url+"#slide-"+index;    
    }
    
    // Do the slide iteration
    $(this.jq_slide_selector).each(function() {
      li = $(this);
      li_state = li.attr("data-slide-state");
      if(i < index) {
        if(li_state != "done") {
          li.attr("data-slide-state", "done");
          li.trigger("slideStateChanged.squeenote", [li, "done"]);
        }
      } else if(i > index) {        
        if(li_state != "pending") {
          li.attr("data-slide-state", "pending"); 
          li.trigger("slideStateChanged.squeenote", [li, "pending"]);
        }        
      }
      if(index == i) {
        if(li_state != "current") {
          li.attr("data-slide-state", "current");
          li.trigger("slideStateChanged.squeenote", [li, "current"]);
        }        
      }
      i++;
    });
  },
  
  // Called when receiving a websocket message from the server.
  // All messages from the squeenote server are full state marshals.
  wsServerMessageReceived: function(data) {
    // Broadcast authentication state
    if(data.authentication_attempted) {
      if(data.authenticated_as_presenter) {
        if(!this.authenticated_as_presenter) {
          this.log("Success - Signed on as presenter.");
          this.jq_presentation.trigger("authenticatedAsPresenter.squeenote");
        }
        this.authenticated_as_presenter = true;
      } else {
        this.log("Failure - Not authenticated as presenter.");
        this.jq_presentation.trigger("failedAuthenticationAsPresenter.squeenote");   
      }
    } else if(this.authenticated_as_presenter) {
      this.log("Success - signed off as presenter");
      this.jq_presentation.trigger("unAuthenticatedAsPresenter.squeenote");
      this.authenticated_as_presenter = false;
    }
    
    // Detect presenter online/offline
    if(data.presenter_slide_index != null) {
      if(!this.presenter_online && data.presenter_slide_index != null) {
        this.presenter_online = true;
        this.jq_presentation.trigger("presenterOnline.squeenote");        
      } else if(data.presenter_slide_index == null) {
        this.jq_presentation.trigger("presenterOffline.squeenote");
      }
    }
    // Detect presenter slide changes
    if(data.presenter_slide_index != this.presenter_slide_index) {
      this.log("Presenter slide changed to "+this.presenter_slide_index);
      this.presenter_slide_index = data.presenter_slide_index;
      // Broadcast presenter slide changed event, if changed
      this.jq_presentation.trigger("presentationPresenterSlideChanged.squeenote", this);
      // Follow the presenter, if following is enabled
      if(this.presenter_follow_enabled) this.showSlide(this.presenter_slide_index);
    }
  },
  
  // Syncs the current presentation state to the server along with any additional data
  // supplied as a hash. By default, syncs:
  // presenter_password,
  // client_slide_index,
  wsSyncStateToServer: function(data) {
    this.socket.connect();
    if(!data) data = {};
    data = $(data).extend({
      client_slide_index: this.client_slide_index,
      presenter_password: this.presenter_password
    });
    this.socket.send(data);
  },
  
  // Starts syncing to the remote presenter's view
  startFollowingPresenter: function() {
    if(!this.presenter_follow_enabled) {
      this.log("Presenter follow enabled");
      this.presenter_follow_enabled = true;
      this.showSlide(this.presenter_slide_index); // Resync with the presenter
      this.jq_presentation.trigger("startedFollowingPresenter.squeenote");
    }
  },
  
  stopFollowingPresenter: function() {
    if(this.presenter_follow_enabled) {
      this.log("Presenter follow disabled");
      this.presenter_follow_enabled = false;
      // Dispatch event if we're actually making a change
      this.jq_presentation.trigger("stoppedFollowingPresenter.squeenote");
    }
  },
  
  log: function(message) {
    if(this.verbose) console.log("squeenote.Presentation: "+message);
  }
  
};