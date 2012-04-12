if(typeof(squeenote)=="undefined") squeenote = {};

squeenote.Device = function() {
  this.init();
}
squeenote.Device.prototype = {
  
  "uagent": "",
  
  "init": function() {
    this.uagent = navigator.userAgent.toLowerCase();
    this.addDeviceClassesToSelector("body")
  },
  
  "addDeviceClassesToSelector": function(selector) {
    var _instance = this;
    $.each(squeenote.Device.prototype, function(key, value) {
      if(key != "init" && key != "addDeviceClassesToSelector" && typeof(value)=="function") {
        res = value.apply(_instance);
        // console.log(key+":"+res); // uncomment for debug
        if(res) $(selector).addClass(key);
      }
    });
  },
  
  "touchDevice": function() {
    return (this.iOSDevice() || this.androidDevice());
  },
  
  "iOSDevice": function() {
    return (this.iPhone() || this.iPad() || this.iPod());
  },
  
  "iPhone": function() {
    return (this.uagent.indexOf("iphone") > -1);
  },
  
  "iPad": function() {
    return (this.uagent.indexOf("ipad") > -1);
  },
  
  "iPod": function() {
    return (this.uagent.indexOf("ipod") > -1);
  },
  
  "androidDevice": function() {
    return (this.uagent.indexOf("android") > -1);
  }
  
}

