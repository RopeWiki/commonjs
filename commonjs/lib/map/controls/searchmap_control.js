//google maps custom control to allow user to draw on map and select search area

function initSearchMapControl() {

    var searchMapControl = document.createElement("div");
    searchMapControl.id = "searchmap";
    searchMapControl.className = "map-control dropdown selection searchmap";

    var searchMapText = document.createElement("span");
    searchMapText.id = "searchinfo";
    searchMapText.innerHTML = "Search Map";

    searchMapControl.appendChild(searchMapText);

    google.maps.event.addDomListener(searchMapControl,
        "click",
        function() {
            searchmapBegin();
        });

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(searchMapControl);
}

var searchmapn = -1;
var searchmaprectangle;

function searchmapBegin() {

    var element = document.getElementById('searchinfo');

    if (searchmapn < 0) {

        //events that the shapes send: https://developers.google.com/maps/documentation/javascript/shapes#editable_events

        searchmaprectangle = new google.maps.Rectangle({
            bounds: boundslist,
            editable: true
        });
        searchmaprectangle.setMap(map);
        searchmaprectangle.addListener("click", searchmapRun);

        element.innerHTML = 'Cancel<br><p style="font-size:10px;line-height:0px">Click the rect to search</p>';

        searchmapn = 0;
    } else {
        searchmaprectangle.setMap(null);
        element.innerHTML = "Search Map";
        searchmapn = -1;
    }
}

function searchmapRun() {
    searchmapn = -1;
    var element = document.getElementById('searchinfo');
    if (element) element.innerHTML = 'Searching...';

    var bounds = searchmaprectangle.bounds;

    var locsearchchk = document.getElementById('locsearchchk');
    if (map != null && locsearchchk != null) {
        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        locsearchchk.checked = true;
        var v = "Coord:" + sw.lat().toFixed(3) + "," + sw.lng().toFixed(3) + "," + ne.lat().toFixed(3) + "," + ne.lng().toFixed(3);
        document.getElementById('locnameval').value = v;
    }
    filtersearch();
}

