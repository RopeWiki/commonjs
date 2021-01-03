
//google.maps.ElevationService
var elevationService;

function getElevation(latLng, element, holdingText) {
    var res = document.getElementById(element);
    if (!!res && !res.innerHTML.includes(holdingText)) { //already loaded or doesn't match holding text
        //need to convert to metric here -- setMetricFields() won't catch this if the window was closed
        var texts = res.getElementsByClassName('uft');
        for (var i = 0; i < texts.length; i++)
            texts[i].innerHTML = uconv(texts[i].innerHTML, ftStr);

        return;
    }

    if (!elevationService)
        elevationService = new google.maps.ElevationService();

    if (elevationService && latLng) {
        elevationService.getElevationForLocations(
            {
                'locations': [latLng]
            },
            function (results) {
                if (results[0]) {
                    var elev = results[0].elevation * m2ft;
                    var res = document.getElementById(element);
                    if (res) res.innerHTML = res.innerHTML.replace(holdingText, "<span class='uft'>" + ftStr(elev) + "</span>");
                }
            });
    }
}

//compute the distance between two (lat,lng) points
function distance(p1, p2) {
    var e = Math, ra = e.PI / 180;
    var b = p1.lat * ra, c = p2.lat * ra, d = b - c;
    var g = p1.lng * ra - p2.lng * ra;
    var f = 2 * e.asin(e.sqrt(e.pow(e.sin(d / 2), 2) + e.cos(b) * e.cos(c) * e.pow(e.sin(g / 2), 2)));
    return f * 6378.137 * km2mi; //miles between the specified points
}

//not used
function getGeoCode(lat, lng, element) {
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat.toString().trim() + "," + lng.toString().trim() + "&key=" + GOOGLE_MAPS_APIKEY;
    $.getJSON(geturl(url), function (data) {
        if (data && data.results && data.status === "OK") {
            var list = [];
            for (var r = 0; r < data.results.length; ++r)
                for (var c = 0; c < data.results[r].address_components.length; ++c) {
                    var comp = data.results[r].address_components[c];
                    if (comp.types.indexOf("political") >= 0)
                        if (list.indexOf(comp.long_name) < 0)
                            list.push(comp.long_name);
                }

            if (list.length > 0) {
                var res = document.getElementById(element);
                if (res) res.innerHTML = 'Geocode: ' + list.join(', ');
            }
        }
    });
}

//cool code to create a bounding box from a point, but isn't used anywhere:
function latLngBox(px, py, pz, tsize) {
    function Clip(n, minValue, maxValue) {
        return Math.min(Math.max(n, minValue), maxValue);
    }

    function zxy2LL(size, pixelZ, pixelX, pixelY) {
        var mapSize = size * (1 << pixelZ);
        var tx = (Clip(size * pixelX, 0, mapSize - 1) / mapSize) - 0.5;
        var ty = 0.5 - (Clip(size * pixelY, 0, mapSize - 1) / mapSize);
        var p = { lat: 90 - 360 * Math.atan(Math.exp(-ty * 2 * Math.PI)) / Math.PI, lng: 360 * tx };
        return p;
    }

    var p1 = zxy2LL(tsize, pz, px, py);
    var p2 = zxy2LL(tsize, pz, px + 1, py + 1);
    var b = { lat1: p1.lat, lat2: p2.lat, lng1: p1.lng, lng2: p2.lng };
    return b;
}

//also isn't used anywhere:
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
    var wb = [p1.x < p2.x ? p1.x : p2.x, p1.y < p2.y ? p1.y : p2.y, p1.x < p2.x ? p2.x : p1.x, p1.y < p2.y ? p2.y : p1.y];

    if (invert)
        return wb[1] + "," + wb[0] + "," + wb[3] + "," + wb[2];
    else
        return wb[0] + "," + wb[1] + "," + wb[2] + "," + wb[3];
}
