var geoelevationService;
function getgeoelevation(LatLng, element, label, endlabel) {
    if (!geoelevationService)
        geoelevationService = new google.maps.ElevationService();
    if (geoelevationService && LatLng) {
        var latlngs = [];
        latlngs.push(LatLng);
        geoelevationService.getElevationForLocations({'locations': latlngs}, function (results) {
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
