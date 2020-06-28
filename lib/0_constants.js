var RWServerUrl = "http://luca.ropewiki.com"

// Primary hostname of the site
var SITE_HOSTNAME = "ropewiki.com";

// Base URL of the site (from which all resources are descended)
var SITE_BASE_URL = "http://" + SITE_HOSTNAME;

// Other names of the site that may be used
var SITE_ALTERNATE_NAMES = [
    "http://www.ropewiki.com"
];

// enable debug mode
var url = window.location.href.toString();
var debug = url.indexOf('debug=')>=0; // || url.indexOf('http')<0;

var locdist = 'locdist=';
