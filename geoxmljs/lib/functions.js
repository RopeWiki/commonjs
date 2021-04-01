
var mapid = '#mapbox';
var iconsize = 16;
var globalIconScaleFactor = 1.5; //global override to make waypoint icons a bit bigger
var checkbox = false;
var zI = 0;
var coordst = "<" + "coordinates" + ">";
var coorded = "</" + "coordinates" + ">";
var webproxy = LUCA_BASE_URL + "\/rwr?url=";
var maxpathlen = 255; // max path len allowed for elevation
var mi2ft = 5280;

// Constructor
function KMLObj(title2, desc, op, fid) {
    this.title2 = title2;
    this.description = escape(desc);
    this.marks = [];
    this.folders = [];
    this.groundOverlays = [];
    this.open = op;
    this.folderid = fid;
}
if (typeof console === "undefined" || typeof console.log === "undefined") {
    console = {};
    console.log = function () { };
}
function Lance$(mid) { return document.getElementById(mid); }
var topwin = self;
var G = google.maps;

function ILabel(pos, txt, map, scale, color) {
    var fs = Math.round(10 * scale);
    if (fs < 7) fs = 7;
    if (fs > 12) fs = 12;
    var image = {};

    var z = zI;
    var style = "b";
    if (color == "") {
        z = zI + 9999;
        style = "b";
        image.origin = new google.maps.Point(0, 0),
            image.anchor = new google.maps.Point(-iconsize / 2, fs / 2)
        color = "000000";
    }
    fgcolor = color;
    bkcolor = "FFFFFF";
    image.url = "http://chart.apis.google.com/chart?chst=d_text_outline&chld=" + fgcolor + "|" + String(fs) + "|h|" + bkcolor + "|" + style + "|" + urlencode(txt);

    var m = new google.maps.Marker({ title2: "", map: map, position: pos, clickable: false, icon: image, zIndex: z, optimized: false });

    return m;
}

function validateIconUrl(href) {

    // patch default marker icons for CalTopo
    if (href.includes("caltopo.com") || href.includes("sartopo.com")) {

        if (href.includes("circle/FF0000.png") ||
            href.includes("circle/000000.png") ||
            href.includes("c:ring,FF0000.png") ||
            href.includes("c:ring,000000.png") ||
            href.includes("cfg=point")
        )
            href = 'http://maps.google.com/mapfiles/kml/shapes/open-diamond.png';

        // replace known bad icon urls:

        //google maps icons list: 
        //http://kml4earth.appspot.com/icons.html
        //http://miftyisbored.com/a-complete-list-of-standard-google-maps-marker-icons/

        if (href.includes("nps-parking"))
            href = 'http://maps.google.com/mapfiles/kml/shapes/parking_lot.png';

        if (href.includes("nps-info"))
            href = 'http://maps.google.com/mapfiles/kml/shapes/info.png';

        if (href.includes("camera.png") ||
            href.includes("nps-camera"))
            href = 'http://maps.google.com/mapfiles/kml/pal4/icon46.png';

        if (href.includes("tent.png"))
            href = 'http://maps.google.com/mapfiles/kml/shapes/campground.png';

        if (href.includes("crossbones.png"))
            href = 'http://maps.google.com/mapfiles/kml/shapes/caution.png';

        if (href.includes("waterfall.png"))
            href = 'http://maps.google.com/mapfiles/ms/icons/waterfalls.png';

        if (href.includes("drinkingwater.png"))
            href = 'http://maps.google.com/mapfiles/ms/icons/drinking_water.png';

        if (href.includes("nps-caving.png"))
            href = '/images/1/13/CavingIcon.png';
    }

    // add others as needed

    return href;
}

function listchildren(current, depth) {
    if (!current) return;
    if (current.nodeName == 'when')
        return;
    var spc = "";
    for (var i = 0; i < depth; ++i)
        spc += ' ';
    console.log(spc + current.nodeName);
    var children = current.childNodes;
    for (var i = 0; i < children.length; ++i)
        listchildren(children[i], depth + 1);
}

function DistanceLength(p1, p2) {
    var ra = Math.PI / 180;
    var lat1 = p1.lat();
    var lng1 = p1.lng();
    var lat2 = p2.lat();
    var lng2 = p2.lng();
    var b = lat1 * ra, c = lat2 * ra, d = b - c;
    var g = lng1 * ra - lng2 * ra;
    var f = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(d / 2), 2) + Math.cos(b) * Math.cos(c) * Math.pow(Math.sin(g / 2), 2)));
    return f * 6378.137 * km2mi;
}

function Length(pl) {
    var a = pl.getPath(), len = a.getLength(), dist = 0;
    for (var i = 0; i < len - 1; i++)
        dist += DistanceLength(a.getAt(i), a.getAt(i + 1));
    return dist;
}


function evalTimeout(str, time) {
    //setTimeout(str, time);
    eval(str);
}


function ftxmi(value) {
    return Math.round(value);
}

function xdeg(value) {
    return Math.round(value);
}

function ft(value) {
    return Math.round(value) + "ft";
}

function mi(value) {
    return value.toFixed(1) + "mi";
}

function getTolerance(map) {
    var psize = 16;
    // get map stats
    var scale = Math.pow(2, map.getZoom());
    var proj = map.getProjection();
    var bounds = map.getBounds();
    if (!proj || !bounds) {
        return 1e-5;
    }
    var nwll = new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng());
    var nw = proj.fromLatLngToPoint(nwll);

    function fromLatLngToPixel(position) {
        var point = proj.fromLatLngToPoint(position);
        return new google.maps.Point(
            Math.floor((point.x - nw.x) * scale),
            Math.floor((point.y - nw.y) * scale));
    }

    function fromPixelToLatLng(pixel) {
        var point = new google.maps.Point();
        point.x = pixel.x / scale + nw.x;
        point.y = pixel.y / scale + nw.y;
        return proj.fromPointToLatLng(point);
    }

    // compute pixel locations
    var center = new google.maps.LatLng((bounds.getNorthEast().lat() + bounds.getSouthWest().lat()) / 2, (bounds.getNorthEast().lng() + bounds.getSouthWest().lng()) / 2);
    var c = fromLatLngToPixel(center);
    var p = { x: c.x + psize, y: c.y + psize };
    var pos = fromPixelToLatLng(p);

    map.tolerance = Math.min(Math.abs(pos.lat() - center.lat()), Math.abs(pos.lng() - center.lng()));
};

//sometimes the waypoint descriptions have info that we already include, such as coords & elevation
function removeRedundantInfo(text) {
    text = text.replace(/(?:location)(?:.*)(?:<br>)/i, "");
    text = text.replace(/(?:elevation)(?:.*)(?:<br>)/i, "");
    text = text.replace(/(?:time created)(?:.*)(?:<br>)/i, ""); //we don't care about showing time created

    return text;
}

