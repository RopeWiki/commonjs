
//cool code to create a bounding box from a point, but isn't used anywhere:
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
    var wb = [ p1.x < p2.x ? p1.x : p2.x, p1.y < p2.y ? p1.y : p2.y, p1.x < p2.x ? p2.x : p1.x, p1.y < p2.y ? p2.y : p1.y ];

    if (invert)
        return wb[1] + "," + wb[0] + "," + wb[3] + "," + wb[2];
    else
        return wb[0] + "," + wb[1] + "," + wb[2] + "," + wb[3];
}
