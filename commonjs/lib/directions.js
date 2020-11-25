
function displaydirectionsto(loc) {
    lastto = loc.join();
    window.open('https://maps.google.com/?output=classic&saddr=' + lastfrom + '&daddr=' + lastto, '_blank');
}

function displaydirectionsfrom(loc) {
    lastfrom = loc.join();
    if (lastto == "")
        alert('Click on a \'Directions To\' link to get the full route');
    else
        window.open('https://maps.google.com/?output=classic&saddr=' + lastfrom + '&daddr=' + lastto, '_blank');
}

function displaycoordenates(loc) {
    window.prompt("Copy to clipboard with Ctrl+C, Cmd-C, Click&Hold or other methods.", loc.join());
}

function displaydirections(lat, lng, extra) {
    var ret = '<div><i>';
    ret += '<a href="javascript:displaydirectionsto([' + lat + ',' + lng + ']);">Directions To</a>';
    if (!!extra) ret += extra;
    ret += '</i></div>';
    return ret;
}

function displaylocation(lat, lng, extra) {
    var ret = '<div class="textselect">';
    var lat = parseFloat(lat);
    var lng = parseFloat(lng);
    var mapWaypoint = lat.toFixed(4) + "," + lng.toFixed(4);

    //add a shift to center the map in the new window, otherwise it doesn't account for the pop-up on the left.
    // 0.0176deg is a good amount to center, and doesn't seem to vary based on latitude
    var centerLng = lng - 0.0176;
    var mapCenter = lat.toFixed(4) + "," + centerLng.toFixed(4);

    var zoom = '14z';

    ret += 'Loc: <a href="https://www.google.com/maps/place/' + mapWaypoint + '/@' + mapCenter + ',' + zoom + '/data=!4m5!3m4!1s0x0:0x0!8m2!3d' + lat.toFixed(4) + '!4d' + lng.toFixed(4) + '!5m1!1e4" target="_blank">' + mapWaypoint + '</a>';

    if (!!extra) ret += extra;
    ret += '</div>';
    return ret;
}
