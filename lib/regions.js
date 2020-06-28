function suggestregion() {
    var coordinates = document.getElementsByName("Canyon[Coordinates]");
    if (coordinates.length > 0 && coordinates[0].value)
        return suggestregioncoords(coordinates[0].value);

    var geocode = document.getElementsByName("Canyon[Geolocation]");
    if (geocode.length > 0 && geocode[0].value)
        return suggestregiongeocode(geocode[0].value);
}

function suggestregiongeocode(geocode) {
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + geocode;
    $.getJSON(geturl(url), function (data) {
        //alert( "Load was performed." );
        //console.log("load performed");
        if (data && data.results) {
            for (var i = 0; i < data.results.length; ++i)
                if (data.results[i].geometry && data.results[i].geometry.location && data.results[i].geometry.location.lat && data.results[i].geometry.location.lng) {
                    suggestregioncoords(data.results[i].geometry.location.lat + "," + data.results[i].geometry.location.lng);
                    return;
                }
        }
    });
}

function suggestregioncoords(coords) {
    // ropewiki
    coords = coords.split(' ').join('');
    var url = SITE_BASE_URL + '/api.php?action=ask&format=json&query=[[Category:Canyons]][[Has coordinates::' + coords + ' (50000)]]' + '|%3FHas_coordinates|%3FLocated_in_region|limit=1000';
    $.getJSON(geturl(url), function (data) {
        //alert( "Load was performed." );
        //console.log("load performed");
        var list = getrwlist(data);
        var ll = coords.split(',');
        var pt = {lat: parseFloat(ll[0]), lng: parseFloat(ll[1])};
        for (var i = 0; i < list.length; ++i)
            list[i].dist = distance(pt, list[i].location);
        list.sort(function (a, b) {
            return a.dist - b.dist
        });

        var rlist = [];
        for (var i = 1; i < list.length && rlist.length < 3; ++i)
            if (rlist.indexOf(list[i].region) < 0)
                rlist.push(list[i].region);
        var res = document.getElementById("suggestednearby");
        if (res) res.innerHTML = 'Nearby:' + rlist.join(', ');
        var region = document.getElementsByName("Canyon[Region]");
        if (region && region.length > 0 && rlist.length > 0)
            region[0].value = rlist[0];
    });

    // geocode
    //getgeocode(pt.lat, pt.lng, "suggestedgeocode");
}
