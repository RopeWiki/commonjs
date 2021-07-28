//env: 1-prod, 2-dev, 3-proddev
const env = 1;

// communication protocol
var PROTOCOL;

// primary hostname of the site.
var SITE_HOSTNAME;

// Google Maps API key
var GOOGLE_MAPS_APIKEY;

switch (env) {
case 1:
        PROTOCOL = "http://";
        SITE_HOSTNAME = "ropewiki.com";
        //GOOGLE_MAPS_APIKEY = "AIzaSyDdkcexZV-p5Nj8RwgLYTcegm5jorJpbyw"; //ben's
        GOOGLE_MAPS_APIKEY = "AIzaSyCzx6LOfuFbI0ZpdoEKKvf77EO8-YXP_Cw"; //public (mine)
        break;
case 2:
        PROTOCOL = "http://";
        SITE_HOSTNAME = "192.168.1.40:8080";
        GOOGLE_MAPS_APIKEY = "";
        break;
case 3:
        PROTOCOL = "https://";
        SITE_HOSTNAME = "dev.ropewiki.com";
        GOOGLE_MAPS_APIKEY = "AIzaSyCzx6LOfuFbI0ZpdoEKKvf77EO8-YXP_Cw"; //public (mine)
        break;
}

// Base URL of the site (from which all resources are descended).
const SITE_BASE_URL = PROTOCOL + SITE_HOSTNAME;

// Other names of the site that may be used.
const SITE_ALTERNATE_NAMES = [
    PROTOCOL + "www.ropewiki.com"
];

// Hostname of server hosting the RWServer server (see https://github.com/RopeWiki/RWServer).
const LUCA_HOSTNAME = "luca.ropewiki.com";

// Base Url of the RWServer server.
const LUCA_BASE_URL = PROTOCOL + LUCA_HOSTNAME;

const OPENWEATHER_APIKEY = "1d5f0c74f9119e20765fed256ecfadc5";
