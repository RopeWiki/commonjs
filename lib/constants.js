// Hostname of server hosting the RWServer server (see https://github.com/RopeWiki/RWServer).
var LUCA_HOSTNAME = "luca.ropewiki.com";

// Base URl of the RWServer server.
var LUCA_BASE_URL = "http://" + LUCA_HOSTNAME;

// Primary hostname of the site.
var SITE_HOSTNAME = "ropewiki.com";

// Base URL of the site (from which all resources are descended).
var SITE_BASE_URL = "http://" + SITE_HOSTNAME;

// Other names of the site that may be used.
var SITE_ALTERNATE_NAMES = [
    "http://www.ropewiki.com"
];

// Google Maps API key
var GOOGLE_MAPS_APIKEY = "AIzaSyDdkcexZV-p5Nj8RwgLYTcegm5jorJpbyw";

// enable debug mode
var DEBUG = window.location.href.toString().indexOf('debug=')>=0; // || url.indexOf('http')<0;
