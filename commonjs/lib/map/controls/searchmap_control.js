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