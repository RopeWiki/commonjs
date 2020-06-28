var map;
var gxml;
var zindex = 0;
var markers = [];
var handlekeys = false;

var lastinfowindow = null;

// icons
var kmliconlist = [
    SITE_BASE_URL + "/images/7/75/Starn00.png",
    SITE_BASE_URL + "/images/8/87/Starn10.png",
    SITE_BASE_URL + "/images/1/15/Starn20.png",
    SITE_BASE_URL + "/images/d/d3/Starn30.png",
    SITE_BASE_URL + "/images/a/a0/Starn40.png",
    SITE_BASE_URL + "/images/c/cc/Starn50.png",
    SITE_BASE_URL + "/images/b/b6/Starn01.png",
    SITE_BASE_URL + "/images/1/12/Starn11.png",
    SITE_BASE_URL + "/images/b/b7/Starn21.png",
    SITE_BASE_URL + "/images/2/2e/Starn31.png",
    SITE_BASE_URL + "/images/1/1d/Starn41.png",
    SITE_BASE_URL + "/images/f/fe/Starn51.png",
    SITE_BASE_URL + "/images/3/3a/Starn02.png",
    SITE_BASE_URL + "/images/a/a4/Starn12.png",
    SITE_BASE_URL + "/images/1/13/Starn22.png",
    SITE_BASE_URL + "/images/3/32/Starn32.png",
    SITE_BASE_URL + "/images/7/77/Starn42.png",
    SITE_BASE_URL + "/images/1/11/Starn52.png",
    SITE_BASE_URL + "/images/b/bd/Starn03.png",
    SITE_BASE_URL + "/images/0/09/Starn13.png",
    SITE_BASE_URL + "/images/9/98/Starn23.png",
    SITE_BASE_URL + "/images/0/07/Starn33.png",
    SITE_BASE_URL + "/images/f/fb/Starn43.png",
    SITE_BASE_URL + "/images/d/dc/Starn53.png",
    SITE_BASE_URL + "/images/2/25/Starn04.png",
    SITE_BASE_URL + "/images/7/73/Starn14.png",
    SITE_BASE_URL + "/images/e/ea/Starn24.png",
    SITE_BASE_URL + "/images/6/6a/Starn34.png",
    SITE_BASE_URL + "/images/3/31/Starn44.png",
    SITE_BASE_URL + "/images/2/27/Starn54.png",
    SITE_BASE_URL + "/images/2/29/Starn05.png",
    SITE_BASE_URL + "/images/d/d9/Starn15.png",
    SITE_BASE_URL + "/images/e/e0/Starn25.png",
    SITE_BASE_URL + "/images/0/09/Starn35.png",
    SITE_BASE_URL + "/images/8/81/Starn45.png",
    SITE_BASE_URL + "/images/3/37/Starn55.png"
];

// bounds
var nlist = 10000;
var qmaps = [];

var kmllistn = 0;
var kmllisturl, tablelisturl;
var kmlsummary;

// Variables for morekmllist function
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

// Variables for toggleLegend function
var showLegend;

// Variables for toggleRoutes function
var showRoutes, loadedRoutes;

// Variables for toggleFullScreen function
var toggleFS;

// Variables for loadSource function
var lastlinks = [];
