//google maps custom control to allow user to draw on map and select search area

function initSearchMapControl() {
    var controlsDiv = document.createElement('DIV');

    controlsDiv.innerHTML =
        '<div id="searchmap"><span id="searchinfo"></span><button type="search" value="" onclick="searchmap()">Search Map</button></div>';

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlsDiv);
    searchmaprectangle = new google.maps.Rectangle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.5,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.05,
        bounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(0, 0),
            new google.maps.LatLng(0, 0)),
        draggable: false,
        clickable: false,
        optimized: false
    });

    map.addListener('click',
        function (e) {
            if (searchmapn >= 0) {
                var marker = new google.maps.Marker({ position: e.latLng, map: map, optimized: false });
                searchmappt.push(e.latLng);
                ++searchmapn;
                var bounds = new google.maps.LatLngBounds();
                bounds.extend(searchmappt[0]);
                bounds.extend(searchmappt[searchmappt.length >= 2 ? 1 : 0]);
                searchmaprectangle.setBounds(bounds);
                searchmaprectangle.setMap(map);
                if (searchmapn >= 2)
                    searchmaprun();
            }
        });
    map.addListener('mousemove',
        function (e) {
            if (searchmapn > 0 && searchmapn < 2) {
                var bounds = new google.maps.LatLngBounds();
                bounds.extend(searchmappt[0]);
                bounds.extend(e.latLng);
                searchmaprectangle.setBounds(bounds);
                searchmaprectangle.setMap(map);
            }
        });
}

function searchmap() {
    var element = document.getElementById('searchinfo');
    if (searchmapn < 0) {
        map.setOptions({ draggableCursor: 'crosshair' });
        if (element) element.innerHTML = '<span class="rwwarningbox"><b>CLICK ON MAP TO DEFINE SEARCH AREA</b></span>';
        searchmapn = 0;
    } else {
        map.setOptions({ draggableCursor: 'pointer' });
        if (element) element.innerHTML = '';
        searchmapn = -1;
    }
}

function searchmaprun() {
    map.setOptions({ draggableCursor: '' });
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
        var v = "Coord:" + sw.lat().toFixed(3) + "," + sw.lng().toFixed(3) + "," + ne.lat().toFixed(3) + "," + ne.lng().toFixed(3);
        if (zoom >= 0) v += ',' + zoom;
        document.getElementById('locnameval').value = v;
    }
    filtersearch();
}

function mapsearch() {
    mapsearchbounds(map.getBounds(), map.getZoom());
}
