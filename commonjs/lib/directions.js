
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
    var coordtxt = lat.toFixed(4) + "," + lng.toFixed(4);
    ret += 'Coords: <a href="https://map.google.com/map?q=loc:' + coordtxt + '" target="_blank">' + coordtxt + '</a>';
    if (!!extra) ret += extra;
    ret += '</div>';
    return ret;
}
