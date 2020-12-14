var sites = [];

// units of measure
var metric = null;
var french = null;
var urlcheckbox = null;
var weather = null;
var watershed = null;

var starrate = null;
var labels = null;
var slideshowchk = null;

var sortby = "";

// google.maps.ElevationService
var geoElevationService;

var skinuser = "";

var gtrans = null;
var gtrans2 = "x";
var glist, genlist;

var lastfrom = "", lastto ="";

// ===== Map global variables =====

// google.maps.Map that shows geographic information on applicable pages.
var map;

// GeoXML content to be displayed on the map (from MediaWiki:Geoxml.js).
// TODO: verify this description
var gxml;

var zindex = 0;
var markers = [];
var handlekeys = false;

var lastinfowindow = null;

// bounds
var nlist = 10000;
var qmaps = [];

var kmllistn = 0;
var kmllisturl, tablelisturl;
var kmlsummary;

var morestep = 100;
var moremapc = 0, morelistc = 0;

// keep bounds for autozoom and center
var boundslist;

// map still loading callback
var loadingmap = true, loadingtiles = false, loadingtiles2 = false, loadingkml = false, loadingquery = false, loadingquery2 = false;
function isloadingmap() {
    return loadingmap || loadingtiles || loadingtiles2 || loadingkml || loadingquery || loadingquery2;
}

var piciconlist = [];
var picloadingmsg = "<img height=12 src='" + SITE_BASE_URL + "/extensions/SemanticForms/skins/loading.gif'/> Loading... ";
var piclist, picloading, picloadingerr, picloadingn;

// Variables for searchmap function
var searchmapn = -1;
var searchmappt = [];

// Variables for searchmaprun function
var searchmaprectangle;

// Variables for toggleRoutes function
var showRoutes, loadedRoutes;

// Variables for toggleFullScreen function
var toggleFS;

// Variables for loadSource function
var lastlinks = [];

// Variables for addbutton function
var oldid = '@';


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
    if (slideshowchk == "undefined")// && $(window).width()<1200)
        slideshowchk = "on";
    slideshowchk = slideshowchk != "";
}
