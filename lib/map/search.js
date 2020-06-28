function searchmap() {
    map.setOptions({draggableCursor: 'crosshair'});
    var element = document.getElementById('searchinfo');
    if (element) element.innerHTML = '<span class="rwwarningbox"><b>CLICK ON MAP TO DEFINE SEARCH AREA</b></span>';
    searchmapn = 0;
}

function searchmaprun() {
    map.setOptions({draggableCursor: ''});
    searchmapn = -1;
    searchmappt = [];
    var element = document.getElementById('searchinfo');
    if (element) element.innerHTML = '<span class="rwwarningbox"><b>SEARCHING...</b></span>';
    mapsearchbounds(searchmaprectangle.bounds, -1);
}

function mapsearchbounds(bounds, zoom) {
    var locsearchchk = document.getElementById('locsearchchk');
    if (map != null && locsearchchk != null) {
        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        locsearchchk.checked = true;
        var v = "Coord:" + Math.round(sw.lat() * 1e3) / 1e3 + "," + Math.round(sw.lng() * 1e3) / 1e3 + "," + Math.round(ne.lat() * 1e3) / 1e3 + "," + Math.round(ne.lng() * 1e3) / 1e3;
        if (zoom >= 0) v += ',' + zoom;
        document.getElementById('locnameval').value = v;
    }
    filtersearch();
}

function mapsearch() {
    mapsearchbounds(map.getBounds(), map.getZoom());
}
