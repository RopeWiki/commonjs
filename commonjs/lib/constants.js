
// communication protocol
var PROTOCOL;
const HTTP = "http://", HTTPS = "https://";

// primary hostname of the site.
var SITE_HOSTNAME;

// Base URL of the site (from which all resources are descended).
var SITE_BASE_URL;

// Other names of the site that may be used.
var SITE_ALTERNATE_NAMES;

// Hostname of server hosting the RWServer server (see https://github.com/RopeWiki/RWServer).
var LUCA_HOSTNAME;

// Base Url of the RWServer server.
var LUCA_BASE_URL;

// Google Maps API key
var GOOGLE_MAPS_APIKEY;

// Open Weather API key for inline weather widget
const OPENWEATHER_APIKEY = "1d5f0c74f9119e20765fed256ecfadc5";

function setConstants() { //set these automatically based on the browser url

    var local = getLocalUrl();

    switch (local.baseurl) {
    // prod
    case 'ropewiki.com':
    case 'www.ropewiki.com':
    default:
        SITE_HOSTNAME = local.baseurl;
        LUCA_HOSTNAME = "ropewiki.com/luca";
        GOOGLE_MAPS_APIKEY = "AIzaSyCzx6LOfuFbI0ZpdoEKKvf77EO8-YXP_Cw";
        break;
    // dev
    case 'localhost:8080':
    case '192.168.1.40:8080':
        SITE_HOSTNAME = local.baseurl;
        LUCA_HOSTNAME = "luca.ropewiki.com";
        GOOGLE_MAPS_APIKEY = "AIzaSyCRtJb1twFPUpCKG_yHwvNgkwQTmf7NqaI";
        break;
    //proddev
    case 'dev.ropewiki.com':
    case 'dev.rope.wiki': 
        SITE_HOSTNAME = local.baseurl;
        LUCA_HOSTNAME = "dev.ropewiki.com/luca";
        GOOGLE_MAPS_APIKEY = "AIzaSyCzx6LOfuFbI0ZpdoEKKvf77EO8-YXP_Cw";
        break;
    // coops
    case 'ropewiki.attack-kitten.com':
    case 'ropewiki.ak':
        SITE_HOSTNAME = local.baseurl;
        LUCA_HOSTNAME = "ropewiki.com/luca";
        GOOGLE_MAPS_APIKEY = "AIzaSyC3yTnJxJqOSIWoQ3D__6BLPIjZ55DPZtw";
        break;
    }

    switch (local.protocol) {
    case 'http':
        PROTOCOL = HTTP;
        break;
    case 'https':
        PROTOCOL = HTTPS;
        break;
    }

    SITE_BASE_URL = PROTOCOL + SITE_HOSTNAME;

    SITE_ALTERNATE_NAMES = [
        PROTOCOL + "www.ropewiki.com"
    ];

    LUCA_BASE_URL = PROTOCOL + LUCA_HOSTNAME;
}

setConstants();
