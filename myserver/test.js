var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var createCORSRequest = function(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // Most browsers.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // IE8 & IE9
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
};

var url = 'https://lakcenteret.djangobooster.com/accounts/token/';
var method = 'POST';
var xhr = createCORSRequest(method, url);

xhr.onload = function() {
 console.log('Success');
  // Success code goes here.
};

xhr.onerror = function() {
  console.log('Error');
  // Error code goes here.
};

// xhr.setRequestHeader('Authorization', 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2LCJ1c2VybmFtZSI6IjM1MTQxMTIyIiwiZXhwIjoxNTE4NjA0OTY2LCJlbWFpbCI6InNhQGVtYWlsLmNvbSJ9.k_B1h6veGKbi8YRC-upiMasArcTfGkHQfRJDkfjGWI8');
// xhr.setRequestHeader('content-type', 'application/json');
xhr.send();

