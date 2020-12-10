function smallstyle() {
    WebViewStyle();
    $("#p-logo a").attr("href", "#");

    /* DISABLED! USING CSS
    // set meta viewport (not used)
    // $('head').append('<meta name="viewport" content="width=device-width; initial-scale=1.0;">');
     // set style based on screen size
     var width = $(window).width();
     if (screen)
        if (screen.width<width)
         width = screen.width;
     var e = document.getElementById('p-navigation-label');
     if (e) e.innerHTML = width;
     if (width<970)
      {
      // small screen
       var sheet = document.createElement('style')
       sheet.id = 'smallstyle';
       sheet.innerHTML = " .floatright { float: none !important; } .tablecanyon { width: 100% !important; float: none !important; } .tableregion { width: 100% !important; float: none !important; } .bigdisplay { display: none !important; }";
       document.body.appendChild(sheet);
      }
     else
      {
       // large screen
      var sheetToBeRemoved = document.getElementById('smallstyle');
      if (sheetToBeRemoved)
        {
        var sheetParent = sheetToBeRemoved.parentNode;
        sheetParent.removeChild(sheetToBeRemoved);
        }
      }
    */
}

function acaconv(str, more) {
    var end = str.indexOf(')');
    if (end < 0)
        return str;
    var start = str.indexOf('*') + 1;
    while (start < end && !(str.charAt(start) >= '1' && str.charAt(start) <= '4'))
        ++start;
    if (start >= 3 && str.substr(start - 3, 3) == '<i>')
        start -= 3;
    var rating = str.substr(start, end - start).split('(');
    if (rating.length < 2)
        return str;
    var val = rating[french ? 1 : 0].trim();
    if (more)
        val += ' (' + rating[french ? 0 : 1].trim() + ')';
    return str.substr(0, start) + val + str.substr(end + 1);
}

/* Google Maps integration with external Topo map sources */
function getTextFromHyperlink(linkText) {
    var start = linkText.search('href=');
    var str = linkText.slice(start).split('"')[1];
    //document.getElementById("firstHeading").innerHTML = str;
    return str;
    //return linkText.match(/<a [^>]+>([^<]+)<\/a>/)[1];
}

// Custom Map functions
function slippyClip(xy, z) {
    return xy % (1 << z);
}

function TYZ(y, z) {
    return (1 << z) - y - 1;
}

function latLngBox(px, py, pz, tsize) {
    function Clip(n, minValue, maxValue) {
        return Math.min(Math.max(n, minValue), maxValue);
    }

    function zxy2LL(size, pixelZ, pixelX, pixelY) {
        var mapSize = size * (1 << pixelZ);
        var tx = (Clip(size * pixelX, 0, mapSize - 1) / mapSize) - 0.5;
        var ty = 0.5 - (Clip(size * pixelY, 0, mapSize - 1) / mapSize);
        var p = {lat: 90 - 360 * Math.atan(Math.exp(-ty * 2 * Math.PI)) / Math.PI, lng: 360 * tx};
        return p;
    }

    var p1 = zxy2LL(tsize, pz, px, py);
    var p2 = zxy2LL(tsize, pz, px + 1, py + 1);
    var b = {lat1: p1.lat, lat2: p2.lat, lng1: p1.lng, lng2: p2.lng};
    return b;
}

function WmsBox(b, epsg, invert) {
    function Wms(epsg, lat, lng) {
        var p = { x: lat, y: lng };
        if (epsg) {
            p.x = lng * 20037508.34 / 180;
            var sy = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
            p.y = sy * 20037508.34 / 180;
        }
        return p;
    }

    var p1 = Wms(epsg, b.lat1, b.lng1);
    var p2 = Wms(epsg, b.lat2, b.lng2);
    var wb = [ p1.x < p2.x ? p1.x : p2.x, p1.y < p2.y ? p1.y : p2.y, p1.x < p2.x ? p2.x : p1.x, p1.y < p2.y ? p2.y : p1.y ];

    if (invert)
        return wb[1] + "," + wb[0] + "," + wb[3] + "," + wb[2];
    else
        return wb[0] + "," + wb[1] + "," + wb[2] + "," + wb[3];
}

function noextraction(name) {
    return name.indexOf("roadtripryan.com") >= 0;
}
