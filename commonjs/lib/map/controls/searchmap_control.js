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
            searchmapClicked();
        });

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(searchMapControl);

    searchMapLoader = document.createElement("div");
    searchMapLoader.className = "loader";
    searchMapLoader.style.display = "none";

    var mapDiv = document.getElementById('mapbox').getElementsByTagName('div')[0];
    mapDiv.appendChild(searchMapLoader);
}

var searchmapn = -1;
var searchmaprectangle;
var searchMapLoader;

function searchmapClicked() {

    var element = document.getElementById('searchinfo');

    if (searchmapn < 0) {

        //events that the shapes send: https://developers.google.com/maps/documentation/javascript/shapes#editable_events

        searchmaprectangle = new google.maps.Rectangle({
            bounds: boundslist,
            editable: true
        });
        searchmaprectangle.setMap(map);
        searchmaprectangle.addListener("click", function () {
            searchmaprectangle.setMap(null);
            element.innerHTML = "Search Map";
            searchmapn = -1;
        });
        searchmaprectangle.addListener("bounds_changed", function () {
            searchmaprectangleBoundschanged();
        });

        element.innerHTML = 'Cancel<br><p style="font-size:10px;line-height:0px;position: absolute;bottom: 0;left: 22px;">or click inside rect</p>';

        searchmapn = 0;
    } else {
        searchmaprectangle.setMap(null);
        element.innerHTML = "Search Map";
        searchmapn = -1;
    }
}

function searchmaprectangleBoundschanged() {
    var bounds = searchmaprectangle.bounds;
    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();
    var url = SITE_BASE_URL + '/api.php?action=ask&format=json&query=[[Category:Canyons]]' +
        '[[Has latitude::>' + sw.lat().toFixed(3) + ']]' +
        '[[Has longitude::>' + sw.lng().toFixed(3) + ']]' +
        '[[Has latitude::<' + ne.lat().toFixed(3) + ']]' +
        '[[Has longitude::<' + ne.lng().toFixed(3) + ']]' +

        getLocationParameters();

    searchMapLoader.style.display = "block";

    $.getJSON(geturl(url),
        function (data) {
            getkmllist(data);
            searchMapLoader.style.display = "none";
        });
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

