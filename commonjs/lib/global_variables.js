var sites = [];

// cookies
var metric = null;
var french = null;
var urlcheckbox = null;
var weather = null;
var watershed = null;

var starrate = null;
var labels = null;
var slideshowchk = null;

function initializeGlobalVariables() {
    metric = getCookie("metric");
    french = getCookie("french");
    urlcheckbox = getCookie("urlcheckbox");
    weather = getCookie("weather");
    watershed = getCookie("watershed");

    starrate = getCookie("starrate");
    if (window.location.href.toString().indexOf('starratechk=') >= 0)
        starrate = true;
    labels = getCookie("labels");
    slideshowchk = getCookie("slideshowchk", "undefined");
    if (slideshowchk === "undefined")// && $(window).width()<1200)
        slideshowchk = "on";
    slideshowchk = slideshowchk !== "";
}

// ===== other global variables:

var skinuser = "";

var gtrans = null;
var gtrans2 = "x";
var glist, genlist;

var lastfrom = "", lastto = "";

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


// ===== Map global variables =====

// the google.maps.Map mapbox
var map;

// GeoXML content to be displayed on the map (from MediaWiki:Geoxml.js)
var gxml;

var markers = [];
var handlekeys = false;

// bounds
var nlist = 10000;

var locationsQuery;
var kmlsummary;

// keep bounds for autozoom and center
var boundslist;

var piciconlist = [];
var picloadingmsg = "<img height=12 src='" + SITE_BASE_URL + "/extensions/SemanticForms/skins/loading.gif'/> Loading... ";
var piclist, picloading, picloadingerr, picloadingn;

// Variables for toggleRoutes function
var showRoutes, loadedRoutes;

// Variables for toggleFullScreen function
var toggleFS;

// Variables for loadSource function
var lastlinks = [];
