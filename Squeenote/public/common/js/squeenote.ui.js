if(typeof(squeenote)=="undefined") squeenote = {};

squeenote.UI = function(presentation) {
  this.init(presentation);
}
squeenote.UI.prototype = {
  
  "presentation": null,
  "dispatcher": null,
  "presenter_controls_toggle_keycode": 187, // Equals key
  "prev_slide_keycode": 37, // Left key
  "next_slide_keycode": 39, // Right key
  "authenticated_as_presenter": false,
  "ui_wrapper": null,
  "listen_for_presenter_hotkey": true,
  "presenter_controls_shown": false,
  
  "init": function(presentation) {
    this.presentation = presentation;
    this.dispatcher = presentation.jq_presentation;
    
    // Create main UI wrapper
    $("body").prepend("<section id=\"squeenote_controls\"><section>");
    this.ui_wrapper = $("#squeenote_controls");
    
    // Create slide counter
    this.drawSlideCounter(this.ui_wrapper);    
    // Draw Client controls
    this.drawClientControls(this.ui_wrapper);
    // Draw Presenter controls
    this.drawPresenterControls(this.ui_wrapper);
    
    // Bind presentation status events
    this.bindPresentationStatusEvents(this.dispatcher);    
    // Bind presenter status events
    this.bindPresenterStatusEvents(this.dispatcher);    
    // Bind client status events
    this.bindClientStatusEvents(this.dispatcher);
    
    // Bind client control actions
    this.bindClientControlActions(this.dispatcher);
    // Bind presenter control actions
    this.bindPresenterControlActions(this.dispatcher);
    
    // Perform device-specific modifications
    this.bindDeviceEvents();
  },
  
  "drawSlideCounter": function(into_selector) {
    var _instance = this;
    target = $(into_selector);
    target.prepend(
      "<section class=\"slide_counter\">\
          <a class=\"prev_slide\">&larr;</a>\
          <span class=\"current_slide_number\">X</span>\
          of <span class=\"slide_count\">Y</span>\
          <a class=\"next_slide\">&rarr;</a>\
       </section>"
    );
     
    $("#squeenote_controls a.prev_slide").bind("click tap", function(event) {
      event.preventDefault(); _instance.presentation.prevSlide();
    });
    $("#squeenote_controls a.next_slide").bind("click tap", function(event) {
      event.preventDefault(); _instance.presentation.nextSlide();
    });
  },
  
  "drawClientControls": function(into_selector) {
    var _instance = this;
    target = $(into_selector);
    target.prepend(
      "<section class=\"client_controls\">\
          <a class=\"follow_presenter_enabled disable_presenter_follow\">\
            <span class=\"presenter_online\" style=\"display: none;\">Unfollow presenter</span>\
            <span class=\"presenter_offline\">Presenter is offline.</span>\
          </a>\
          <span class=\"follow_presenter_disabled\">\
            <a class=\"presenter_online enable_presenter_follow\" style=\"display: none;\">Rejoin presenter at slide <span class=\"presenter_slide_number\">X</span></a>\
            <span class=\"presenter_offline\">Presenter is offline.</span>\
          </span>\
       </section>"
    );
    $(".enable_presenter_follow").click(function(event) {
      event.preventDefault();
      _instance.presentation.startFollowingPresenter();
    });
    $(".disable_presenter_follow").click(function(event) {
      event.preventDefault();
      _instance.presentation.stopFollowingPresenter();
    });
  },
  
  "drawPresenterControls": function(into_selector) {
    var _instance = this;
    target = $(into_selector);
    target.prepend(
      "<section class=\"presenter_controls\">\
          <form id=\"presenter_authentication_form\" class=\"presenter_controls_disabled\" action=\"/authenticate\">\
            <label for=\"presenter_password\">Presenter password</label>\
            <input id=\"presenter_password\" type=\"password\" value=\"\" />\
          </form>\
          <section class=\"presenter_controls_enabled\">\
            Presenter mode <a class=\"disable_presenter_mode\">Sign off</a>\
          </section>\
       </section>"
    );
    $("#presenter_authentication_form").bind("submit", function(event) {
      event.preventDefault();
      $("#presenter_password").focusout();
      _instance.dispatcher.trigger("presenterPasswordChanged.squeenote", $("#presenter_password").val());
    })
    $("#presenter_password").focusin(function(event) {
      _instance.listen_for_presenter_hotkey = false;
    });
    $("#presenter_password").focusout(function(event) {
      _instance.listen_for_presenter_hotkey = true;
    })
    $(".disable_presenter_mode").click(function(event) {
      this.togglePresenterAndClientControls();
      $("#presenter_password").val("");
      $("#presenter_authentication_form").submit();
    });
  },
  
  "bindPresentationStatusEvents": function(dispatcher) {
    
  },
  
  "bindClientStatusEvents": function(dispatcher) {
    var _instance = this;
    dispatcher.bind("stoppedFollowingPresenter.squeenote", function() {
      $(".follow_presenter_enabled").hide();
      $(".follow_presenter_disabled").show();
    });
    dispatcher.bind("startedFollowingPresenter.squeenote", function() {
      $(".follow_presenter_enabled").show();
      $(".follow_presenter_disabled").hide();
    });
    dispatcher.bind("authenticatedAsPresenter.squeenote", function(event) {
      event.preventDefault();
      if(!_instance.authenticated_as_presenter) {
        $(".presenter_controls").addClass("enabled");
      }
      _instance.authenticated_as_presenter = true;
    })
    dispatcher.bind("failedAuthenticationAsPresenter.squeenote", function(event) {
      event.preventDefault();
      $("#presenter_password").val("");
      $(".presenter_controls").effect("shake", {times: 3, distance: 10}, 100);
      $(".presenter_controls").effect("highlight", {color: "#D70005"}, 2000);
    });
    dispatcher.bind("unAuthenticatedAsPresenter.squeenote", function(event) {
      event.preventDefault();
      if(_instance.authenticated_as_presenter) $(".presenter_controls").removeClass("enabled");
      _instance.authenticated_as_presenter = false;
    });
    dispatcher.bind("presentationClientSlideChanged.squeenote", function(event, presentation) {
      $(".current_slide_number").html(presentation.client_slide_index+1);
      $(".slide_count").html(presentation.slide_count);
    });
  },
  
  "bindPresenterStatusEvents": function(dispatcher) {
    dispatcher.bind("presenterOnline.squeenote", function() {
      $(".presenter_online").show();
      $(".presenter_offline").hide();
    });
    dispatcher.bind("presenterOffline.squeenote", function() {
      $(".presenter_online").hide();
      $(".presenter_offline").show();
    });
    dispatcher.bind("presentationPresenterSlideChanged.squeenote", function(event, presentation) {
      $(".presenter_slide_number").html(presentation.presenter_slide_index+1);
    });
  },
  
  "bindClientControlActions": function(dispatcher) {
    var _instance = this;
    $(document).bind(this.keyPressEventName(), function(event) {
       if(event.keyCode == _instance.prev_slide_keycode) {
         event.preventDefault();
         _instance.presentation.prevSlide();
       }
       if(event.keyCode == _instance.next_slide_keycode) {
         event.preventDefault();
         _instance.presentation.nextSlide();
       }
    });    
  },
  
  "bindPresenterControlActions": function(dispatcher) {
    var _instance = this;
    // Bind keyboard event
    $(document).bind(this.keyPressEventName(), function(event) {
      if(_instance.listen_for_presenter_hotkey && event.keyCode == _instance.presenter_controls_toggle_keycode) {
        _instance.togglePresenterAndClientControls(event);
      }    
    });
  },
  
  "bindDeviceEvents": function() {
    var _instance = this;
    if(squeenote.Device.iPad()) {
      // Prevent the viewport from moving on mobile devices
      $("body").bind("touchmove", function(event) {
        event.preventDefault();
      })
    }
  },
  
  "togglePresenterAndClientControls": function() {
    intro = (this.presenter_controls_shown)? $(".client_controls") : $(".presenter_controls");
    outro = (this.presenter_controls_shown)? $(".presenter_controls") : $(".client_controls");
    intro.animate({opacity: 1, left: 0}, 250);
    outro.animate({opacity: 0, left: -500}, 250);
    this.presenter_controls_shown = !this.presenter_controls_shown;
  },
  
  "keyPressEventName": function() {
    return (navigator.userAgent.toLowerCase().indexOf("firefox") < 0)? "keyup" : "keypress";
  }
  
}
