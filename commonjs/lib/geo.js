// geo constants
var km2mi = 0.621371;
var m2ft = 3.28084;

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

// google.maps.ElevationService
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
