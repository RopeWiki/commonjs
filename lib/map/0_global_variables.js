var map;
var gxml;
var zindex = 0;
var markers = [];
var handlekeys = false;

var lastinfowindow = null;

// icons
var kmliconlist = [ "http://ropewiki.com/images/7/75/Starn00.png","http://ropewiki.com/images/8/87/Starn10.png","http://ropewiki.com/images/1/15/Starn20.png","http://ropewiki.com/images/d/d3/Starn30.png","http://ropewiki.com/images/a/a0/Starn40.png","http://ropewiki.com/images/c/cc/Starn50.png","http://ropewiki.com/images/b/b6/Starn01.png","http://ropewiki.com/images/1/12/Starn11.png","http://ropewiki.com/images/b/b7/Starn21.png","http://ropewiki.com/images/2/2e/Starn31.png","http://ropewiki.com/images/1/1d/Starn41.png","http://ropewiki.com/images/f/fe/Starn51.png","http://ropewiki.com/images/3/3a/Starn02.png","http://ropewiki.com/images/a/a4/Starn12.png","http://ropewiki.com/images/1/13/Starn22.png","http://ropewiki.com/images/3/32/Starn32.png","http://ropewiki.com/images/7/77/Starn42.png","http://ropewiki.com/images/1/11/Starn52.png","http://ropewiki.com/images/b/bd/Starn03.png","http://ropewiki.com/images/0/09/Starn13.png","http://ropewiki.com/images/9/98/Starn23.png","http://ropewiki.com/images/0/07/Starn33.png","http://ropewiki.com/images/f/fb/Starn43.png","http://ropewiki.com/images/d/dc/Starn53.png","http://ropewiki.com/images/2/25/Starn04.png","http://ropewiki.com/images/7/73/Starn14.png","http://ropewiki.com/images/e/ea/Starn24.png","http://ropewiki.com/images/6/6a/Starn34.png","http://ropewiki.com/images/3/31/Starn44.png","http://ropewiki.com/images/2/27/Starn54.png","http://ropewiki.com/images/2/29/Starn05.png","http://ropewiki.com/images/d/d9/Starn15.png","http://ropewiki.com/images/e/e0/Starn25.png","http://ropewiki.com/images/0/09/Starn35.png","http://ropewiki.com/images/8/81/Starn45.png","http://ropewiki.com/images/3/37/Starn55.png" ];

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
var picloadingmsg = "<img height=12 src='http://ropewiki.com/extensions/SemanticForms/skins/loading.gif'/> Loading... ";
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
