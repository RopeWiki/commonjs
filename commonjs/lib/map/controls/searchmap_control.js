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
}

var isLoading = false; //sometimes the element creation happens after the loading is finished, so make sure it's still loading before displaying it

function displaySearchMapLoader() {
    isLoading = true;
    if (!searchMapLoader) {
        searchMapLoader = document.createElement("div");
        searchMapLoader.id = "loader";
        searchMapLoader.className = "loader";
        searchMapLoader.style.display = "none";
        
        var mapDiv = document.getElementById('mapbox').getElementsByTagName('div')[0];
        mapDiv.appendChild(searchMapLoader);

        //wait for the parent to change to the mapbox, otherwise it initially displays for a split second in the middle of the page
        waitForElement(searchMapLoader.id).then(function () { searchMapLoader.style.display = isLoading ? "block" : "none"; });
        return;
    }

    searchMapLoader.style.display = "block";
}

function waitForElement(elementId) {
    return new Promise(function (resolve) {

        var observer = new MutationObserver(function(mutationsList) {
            for (var i = 0; i < mutationsList.length; i++) {
                var mutation = mutationsList[i];

                if (!!mutation.previousSibling && mutation.previousSibling.id === elementId) {
                    observer.disconnect();
                    resolve();
                    return;
                }
            }
        });

        observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
    });
}

function hideSearchMapLoader() {
    isLoading = false;
    if (!searchMapLoader) return;

    searchMapLoader.style.display = "none";
}

var searchmapn = -1;
var searchmaprectangle;
var searchMapLoader;

function searchmapClicked() {

    var searchButton = document.getElementById('searchinfo');

    if (searchmapn < 0) {

        //events that the shapes send: https://developers.google.com/maps/documentation/javascript/shapes#editable_events

        //set bounds, if map is zoomed in, make the rectangle show within the displayed area so user doesn't have to zoom out to adjust it
        var mapBounds = map.getBounds();
        var mapLatTop = mapBounds.getNorthEast().lat();
        var mapLatBtm = mapBounds.getSouthWest().lat();
        var mapLngLft = mapBounds.getSouthWest().lng();
        var mapLngRgt = mapBounds.getNorthEast().lng();
        var mapHeight = mapLatTop - mapLatBtm;
        var mapWidth = mapLngRgt - mapLngLft;
        var markersLatTop = boundslist.getNorthEast().lat();
        var markersLatBtm = boundslist.getSouthWest().lat();
        var markersLngLft = boundslist.getSouthWest().lng();
        var markersLngRgt = boundslist.getNorthEast().lng();
        var padding = 0.05;
        var searchRectLatTop = (markersLatTop < mapLatTop && markersLatTop > mapLatBtm) ? markersLatTop : mapLatTop - mapHeight * padding;
        var searchRectLatBtm = (markersLatBtm > mapLatBtm && markersLatBtm < mapLatTop) ? markersLatBtm : mapLatBtm + mapHeight * padding;
        var searchRectLatLft = (markersLngLft > mapLngLft && markersLngLft < mapLngRgt) ? markersLngLft : mapLngLft + mapWidth * padding;
        var searchRectLatRgt = (markersLngRgt < mapLngRgt && markersLngRgt > mapLngLft) ? markersLngRgt : mapLngRgt - mapWidth * padding;

        var searchRectBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(searchRectLatBtm, searchRectLatLft),
            new google.maps.LatLng(searchRectLatTop, searchRectLatRgt));

        //create and display rectangle
        searchmaprectangle = new google.maps.Rectangle({
            bounds: searchRectBounds,
            editable: true
        });
        searchmaprectangle.setMap(map);

        searchmaprectangle.addListener("click", function () {
            searchmaprectangle.setMap(null);
            searchButton.innerHTML = "Search Map";
            searchmapn = -1;
        });

        searchmaprectangle.addListener("bounds_changed", function () {
            searchmaprectangleBoundschanged();
        });

        searchButton.innerHTML = 'Cancel<br><p style="font-size:10px;line-height:0px;position: absolute;bottom: 0;left: 22px;">or click inside rect</p>';

        searchmapn = 0;
    } else {
        searchmaprectangle.setMap(null);
        searchButton.innerHTML = "Search Map";
        searchmapn = -1;
    }
}

function searchmaprectangleBoundschanged() {
    var bounds = searchmaprectangle.bounds;
    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();
    var query =
        '[[Category:Canyons]]' +
        '[[Has latitude::>' + sw.lat().toFixed(3) + ']]' +
        '[[Has longitude::>' + sw.lng().toFixed(3) + ']]' +
        '[[Has latitude::<' + ne.lat().toFixed(3) + ']]' +
        '[[Has longitude::<' + ne.lng().toFixed(3) + ']]';

    kmllisturl = query;

    isLoading = true;
    displaySearchMapLoader();

    loadMoreLocations(0);
}

