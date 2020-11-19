
var mapid = '#mapbox';
var iconsize = 16;
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
    //alert("pre");
    //alert(icon);
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

    /*
    var m0 = new GeoXml.Label(point,name,""this.map,scale,-1, "white");
    var m1 = new GeoXml.Label(point,name,"",this.map,scale,1, "white");
    var m2 = new GeoXml.Label(point,name,"",this.map,scale,0, "black");
    */
    return m;
}

function validateIconUrl(href) {

    // patch default marker icons for CalTopo
    if (
        href == "http://caltopo.com/resource/imagery/icons/circle/FF0000.png" ||
        href == "http://caltopo.com/resource/imagery/icons/circle/000000.png" ||
        href == "http://caltopo.com/static/images/icons/c:ring,FF0000.png" ||
        href == "http://caltopo.com/static/images/icons/c:ring,000000.png"
    )
        href = 'http://maps.google.com/mapfiles/kml/shapes/open-diamond.png';

    // replace known bad icon urls:
    if (href == "http://caltopo.com/resource/imagery/icon.png?cfg=nps-parking" ||
        href == "http://caltopo.com/static/images/icons/nps-parking.png"
    )
        href = 'http://maps.google.com/mapfiles/kml/shapes/parking_lot.png';

    if (href == "http://caltopo.com/static/images/icons/camera.png")
        href = 'http://maps.google.com/mapfiles/kml/pal4/icon46.png';
    
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
    return Math.round(value * 10) / 10 + "mi";
}

function getTolerance(map) {
    var psize = 16;
    // get map stats
    var scale = Math.pow(2, map.getZoom());
    var proj = map.getProjection();
    var bounds = map.getBounds();
    if (!proj || !bounds) {
        //console.log("null proj");
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
    /*    
    new google.maps.Marker({
    	      map:map,
            position: center,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 16,
                color: "#aaffaa",
            strokeColor:"#aaffff",
            strokeOpacity:0.5,
            strokeWeight:8
            },
            draggable: false,
            clickable: false,
            optimized: false,
            zIndex: 100
            });

    new google.maps.Marker({
    	      map:map,
            position: pos,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 16,
                color: "#aaffaa",
            strokeColor:"#aaffaa",
            strokeOpacity:0.5,
            strokeWeight:8
            },
            draggable: false,
            clickable: false,
            optimized: false,
            zIndex: 100
            });
    */
    map.tolerance = Math.min(Math.abs(pos.lat() - center.lat()), Math.abs(pos.lng() - center.lng()));
    //console.log("tol="+map.tolerance);
};
