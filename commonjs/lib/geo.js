// geo constants
var km2mi = 0.621371;
var m2ft = 3.28084;

/**
 * Compute the distance between two (lat,lng) points.
 *
 * @param {Object with lat and lng properties, each in degrees} p1 First point.
 * @param {Object with lat and lng properties, each in degrees} p2 Second point.
 *
 * @return {float} Miles between the specified points.
 */
function distance(p1, p2) {
    var e = Math, ra = e.PI / 180;
    var b = p1.lat * ra, c = p2.lat * ra, d = b - c;
    var g = p1.lng * ra - p2.lng * ra;
    var f = 2 * e.asin(e.sqrt(e.pow(e.sin(d / 2), 2) + e.cos(b) * e.cos(c) * e.pow(e.sin(g / 2), 2)));
    return f * 6378.137 * km2mi;
}

// See uconv below.
function ft(feet, space) {
    if (isNaN(feet))
        return "";
    if (metric)
        return Math.round(feet / m2ft).toLocaleString() + (space ? "&nbsp;" : "") + "m";
    else
        return Math.round(feet).toLocaleString() + (space ? "&nbsp;" : "") + "ft";
}

// See uconv below.
function mi(miles, space) {
    if (isNaN(miles))
        return "";
    if (metric)
        return (Math.round(miles / km2mi * 10) / 10).toLocaleString() + (space ? "&nbsp;" : "") + "km";
    else
        return (Math.round(miles * 10) / 10).toLocaleString() + (space ? "&nbsp;" : "") + "mi";
}

/**
 * Convert a value to a human-readable string with units according to locale based on `metric` global variable.
 *
 * @see  ft, mi functions above
 *
 * @param {string}                               str String representation of a distance, possibly followed by up-down
 *                                                   arrow (unicode 2195) and then a height in feet, sometimes with a
 *                                                   non-breaking space (e.g., "2.7", "1.5&nbsp;\u21951000").
 * @param {function(float value, bool hasSpace)} cnv Conversion function accepting (float value, bool hasSpace) and
 *                                                   returning a string representation of the appropriately-rounded
 *                                                   value followed by units.
 *
 * @return {string} Human-readable string with units according to locale (e.g., "2.7mi",
 *                  "1.5&nbsp;mi \u21951000&nbsp;ft").
 */
function uconv(str, cnv) {
    if (str == null || str == "")
        return "";

    var sep = "\u2195";
    var vstr = str.split(sep);
    if (vstr.length > 0) // TODO: This if statement should always be true; remove.
        vstr[0] = cnv(parseFloat(vstr[0]), str.indexOf('&nbsp;') > 0);
    if (vstr.length > 1)
        vstr[1] = ft(parseFloat(vstr[1]), str.indexOf('&nbsp;') > 0);
    return vstr.join(" " + sep);
}

function getGeoCode(lat, lng, element) {
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat.toString().trim() + "," + lng.toString().trim();
    $.getJSON(geturl(url), function (data) {
        //alert( "Load was performed." );
        //console.log("load performed");
        if (data && data.results) {
            var list = [];
            for (var r = 0; r < data.results.length; ++r)
                for (var c = 0; c < data.results[r].address_components.length; ++c) {
                    var comp = data.results[r].address_components[c];
                    if (comp.types.indexOf("political") >= 0)
                        if (list.indexOf(comp.long_name) < 0)
                            list.push(comp.long_name);
                }

            var res = document.getElementById(element);
            if (res) res.innerHTML = 'Geocode:' + list.join(', ');
        }
    });
}

function getGeoElevation(LatLng, element, label, endlabel) {
    if (!geoElevationService)
        geoElevationService = new google.maps.ElevationService();
    if (geoElevationService && LatLng) {
        var latlngs = [];
        latlngs.push(LatLng);
        geoElevationService.getElevationForLocations({'locations': latlngs}, function (results) {
            if (results[0]) {
                if (!label) label = "";
                if (!endlabel) endlabel = "";
                var elev = results[0].elevation * m2ft;
                var res = document.getElementById(element);
                if (res) res.innerHTML = label + '<span class="notranslate">' + ft(elev) + '</span>' + endlabel;
            }
        });
    }
}
