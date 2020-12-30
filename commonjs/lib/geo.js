// geo constants
var km2mi = 0.621371;
var m2ft = 3.28084;

// google.maps.ElevationService
var geoElevationService;

/**
 * Compute the distance between two (lat,lng) points
 *
 * @param {Object with lat and lng properties, each in degrees} p1 First point
 * @param {Object with lat and lng properties, each in degrees} p2 Second point
 *
 * @return {float} Miles between the specified points
 */
function distance(p1, p2) {
    var e = Math, ra = e.PI / 180;
    var b = p1.lat * ra, c = p2.lat * ra, d = b - c;
    var g = p1.lng * ra - p2.lng * ra;
    var f = 2 * e.asin(e.sqrt(e.pow(e.sin(d / 2), 2) + e.cos(b) * e.cos(c) * e.pow(e.sin(g / 2), 2)));
    return f * 6378.137 * km2mi;
}

// See uconv below
function ftStr(feet, space) {
    if (typeof feet == "undefined" || feet === null) return ""; //empty

    feet = feet.toString().trim();
    if (!feet) return ""; //whitespace

    feet = feet.replace(",", "");

    var wasMetric = feet.includes("m");

    feet = parseFloat(feet);

    if (isNaN(feet)) return "";

    if (metric && !wasMetric) //convert to metric
        feet /= m2ft;

    if (!metric && wasMetric) //convert to imperial
        feet *= m2ft;

    if (!metric) //round to nearest 5 feet
        feet = Math.round(feet / 5) * 5;
    
    return Number(feet.toPrecision(2)) + (space ? "&nbsp;" : "") + (metric ? "m" : "ft");
}

// See uconv below
function miStr(miles, space) {
    if (typeof miles == "undefined" || miles === null) return ""; //empty 

    miles = miles.toString().trim();
    if (!miles) return ""; //whitespace

    if (miles.includes("ft") || (miles.includes("m") && !miles.includes("mi") && !miles.includes("km"))) return ftStr(miles, space); //already converted to ft or m

    miles = miles.replace(",", "");

    var wasMetric = miles.includes("km");

    miles = parseFloat(miles);

    if (isNaN(miles)) return "";

    if (metric && !wasMetric) //convert to metric
        miles /= km2mi;

    if (!metric && wasMetric) //convert to imperial
        miles *= km2mi;

    if (miles < 0.2) // very short distance, display feet or m instead
        return ftStr(metric ? miles * 1000 + "m" : miles * 5280 + "ft", space);

    var decimalPos = (miles >= 1) ? 2 : (miles > 0) ? 1 : 0;

    return Number(miles.toPrecision(decimalPos)) + (space ? "&nbsp;" : "") + (metric ? "km" : "mi");
}

// See uconv below
function miExStr(milesEx) { //locate the mi string within and convert it, leaving surrounding text as-is
    if (typeof milesEx == "undefined" || milesEx === null) return ""; //empty 

    milesEx = milesEx.toString().trim();
    if (!milesEx) return ""; //whitespace

    var converted = "";
    var cursor = 0;

    const regex = /([\d.]+)\s*(min|mi|km)/g; //finds floating point or numbers
    
    var matches;
    while ((matches = regex.exec(milesEx)) !== null) {
        if (matches === undefined) break;

        var match = matches[0];
        var units = matches[2];
        if (units === "min") continue;
        var convertedMatch = miStr(match);

        converted += milesEx.substr(cursor, matches.index) + convertedMatch;

        cursor = regex.lastIndex;
    }
    converted += milesEx.substr(cursor);

    return converted;
}

// called by uconv below
function rap(raps, space) {
    if (!raps || !raps.trim()) return ""; //empty or whitespace

    if (isNaN(raps)) return raps; //already formatted
    
    return raps + (space ? "&nbsp;" : "") + "r"; //it's a number, add the 'r' at the end
}

/**
 * Convert a value to a human-readable string with units according to locale based on `metric` global variable
 *
 * @see  ft, mi functions above
 *
 * @param {string}                               str String representation of a distance, possibly followed by up-down
 *                                                   arrow (unicode 2195) and then a height in feet, sometimes with a
 *                                                   non-breaking space (e.g., "2.7", "1.5&nbsp;\u21951000")
 * @param {function(float value, bool hasSpace)} cnv Conversion function accepting (float value, bool hasSpace) and
 *                                                   returning a string representation of the appropriately-rounded
 *                                                   value followed by units
 *
 * @return {string} Human-readable string with units according to locale (e.g., "2.7mi",
 *                  "1.5&nbsp;mi \u21951000&nbsp;ft")
 */
function uconv(str, cnv) {
    if (str == null || str == "")
        return "";

    var sep = "\u2195";
    var vstr = str.split(sep);

    vstr[0] = cnv(vstr[0], str.indexOf('&nbsp;') > 0);

    if (vstr.length > 1)
        vstr[1] = ftStr(vstr[1], str.indexOf('&nbsp;') > 0);

    return vstr.join(" " + sep);
}

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

function getGeoElevation(latLng, element, holdingText) {
    if (!geoElevationService)
        geoElevationService = new google.maps.ElevationService();

    if (geoElevationService && latLng) {
        geoElevationService.getElevationForLocations(
            {
                'locations': [latLng]
            },
            function(results) {
                if (results[0]) {
                    var elev = results[0].elevation * m2ft;
                    var res = document.getElementById(element);
                    if (res) res.innerHTML = res.innerHTML.replace(holdingText, ftStr(elev));
                }
            });
    }
}
