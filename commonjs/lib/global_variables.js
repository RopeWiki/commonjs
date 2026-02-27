
//import { SITE_BASE_URL } from "./constants";
//import { getCookie } from "./cookies";

// cookies
var metric = null;
var french = null;
var labels = null;
var slideshowchk = null;
var starrate = null;
var watershed = null;
var weather = null;
var publiclands = null;

function initializeGlobalVariables() {
    metric = getCookie("metric");
    french = getCookie("french");
    labels = getCookie("labels");

    slideshowchk = getCookie("slideshowchk", "undefined");
    if (slideshowchk === "undefined")// && $(window).width()<1200)
        slideshowchk = "on";
    slideshowchk = slideshowchk !== "";

    starrate = getCookie("starrate");
    if (window.location.href.toString().indexOf('starratechk=') >= 0)
        starrate = true;

    urlcheckbox = getCookie("urlcheckbox");
    watershed = getCookie("watershed");
    weather = getCookie("weather");
    publiclands = getCookie("publiclands");

    currentUser = mw.config.get("wgUserName");
    pageName = mw.config.get("wgPageName");
}

// ===== other global variables:

var skinuser = "";
var gtrans = null;
var gtrans2 = "x";
var glist, genlist;

var lastfrom = "", lastto = "";

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// geo constants
const km2mi = 0.621371;
const m2ft = 3.28084;
const mi2tokm2 = 0.386;

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

// Variables for toggleRoutes function
var showRoutes, loadedRoutes;

// Variables for toggleFullScreen function
var toggleFS;

// Variables for loadSource function
var lastlinks = [];

//condition descriptions
const condQuality = {
    "cs0": "The conditions are not from a descent of the canyon",
    "cs1": "Regretted doing the trip",
    "cs2": "The canyon was worth doing",
    "cs3": "The canyon was good",
    "cs4": "The canyon trip was great",
    "cs5": "The canyon trip was outstanding"
};

const condWaterflow = {
    "cwa0": null,
    "cwa1": "Completely dry or all pools avoidable",
    "cwa2": "No current or just a trickle, may require shallow wading",
    "cwa2p": "No current or just a trickle, may require swimming",
    "cwa3": "Light current, more than just a trickle but still weak",
    "cwa4": "Moderate current, challenging but easy water hazards",
    "cwa4p": "A bit high, quite challenging but not too dangerous",
    "cwa5": "High water, only for experienced swift water canyoneers",
    "cwa6": "Dangerously high water, only for expert swift water canyoneers",
    "cwa7": "Extremely dangerous high water, may be unsafe even for experts"
}

const condWetsuit = {
    "ct0": "No thermal insulation needed",
    "ct1": "Rain jacket (1mm-2mm)",
    "ct2": "Thin wetsuit (3mm-4mm)",
    "ct3": "Full wetsuit (5mm-6mm)",
    "ct4": "Thick wetsuit (7mm-10mm)",
    "ct5": "Drysuit or equivalent extreme thermal protection"
}

const condDangers = {
    "cd0": null,
    "cd1": null,
    "cd2": null,
    "cd3": "Requires special precautions and/or problem solving",
    "cd4": "Requires special technical skills and/or gear",
    "cd5": "May be too dangerous or impossible even for experts"
}
