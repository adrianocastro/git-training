$(document).ready(function() {
  
  module("Instantiation");
  
  test("returns an instance with the default instance variables");
  test("correctly sets the slide count");
  test("creates the slide counter controls");
  test("creates the presenter controls");
  test("creates the participant controls");
  test("emits a presentation loaded event");
  
  module("Slide navigation");
  
  test("When at the first slide, prevSlide changes the slide index to the last slide");
  test("When at the second slide, prevSlide decrements the slide index");
  test("When at the last slide, nextSlide changes the slide index to zero");
  test("When at the penultimate slide, nextSlide increments the slide index");
  
  module("Slide eventing");
  
  test("When changing slide, broadcasts a slideChanged event");
  test("When changing slide, broadcasts stateChanged events with 'done' on all prior slides");
  test("When changing slide, broadcasts stateChanged events with 'current' on the current");
  test("When changing slide, broadcasts stateChanged events with 'pending' on all upcoming slides");
  
  module("Presenter controls");
  
  test("When altering the contents of the presenter password field, attempt to authenticate with the squeenote server");
  test("Once successfully authenticated, set presenterMode to true");
  test("Once successfully authenticated, remove the password field and replace with a link to disable presenter mode");
  test("When disabling presenter mode, set presenterMode to false");
  test("When presenter mode is enabled, include the presenter password with all websocket events sent to the server");
  
  test("Pressing P toggles the presenter controls");
  test("When the password is entered, transmits presenterSlideChanged events")
  test("When a presenterSlideChanged event is caught, broadcasts the new slide to the server");
  test("When the password is not entered, does not transmit presenterSlideChanged events");
  test("When the password is incorrect, displays an alert");
  
});