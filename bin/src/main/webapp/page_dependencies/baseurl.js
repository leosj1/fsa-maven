
//var app_url = "http://localhost:8015/FSA/";
var app_url = "http://144.167.35.55/";

  
var baseurl =  app_url;

  String.prototype.replaceAll = function(search, replacement) {
      var target = this;
      return target.split(search).join(replacement);
  };