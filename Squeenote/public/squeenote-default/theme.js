$(document).bind("presentationLoaded.squeenote", function(event, presentation) {
  
  // Take the presentation wrapper as the main event dispatcher
  var presentation = presentation;
  var dispatcher = presentation.jq_presentation;
 
  // ---------------------------
  // Customise everything and anything below to set up your theme!
  // ---------------------------
  
  // Include mobile styles
  //var mobile_css = false;
  //if(squeenote.Device.iPad()) {
  //  mobile_css = "ipad";
  //} else if(squeenote.Device.iOSDevice()) {
  //  mobile_css = "iphone";
  //}
  //if(mobile_css) $("head").append('<link rel="stylesheet" href="/public/squeenote-default/theme.ext.'+mobile_css+'.css">');
  
  
  // Reverse the stacking order of the absolutely-positioned slides
  z_counter = presentation.slide_count;
  // Set z-indexes
  $(presentation.jq_slide_selector).each(function() {
    li = $(this);
    li.css("z-index", z_counter);
    z_counter--;
  });
  
  // Listen for the slide state changed event and add/remove classes from the slides
  // This event is only called when the state on an individual slide *changes*, so you don't have to worry
  // about it running on every slide switch.
  $(presentation.jq_slide_selector).bind("slideStateChanged.squeenote", function(event, li, state) {
    li = $(li);
    switch(state) {
      case "done":
        li.addClass("done");
        li.removeClass("current");
        li.removeClass("pending");
        break;
      case "current":
        li.addClass("current");
        li.removeClass("done");
        li.removeClass("pending");
        break;
      case "pending":
        li.addClass("pending");
        li.removeClass("done");
        li.removeClass("current");
        break;
    }
  });
  
});