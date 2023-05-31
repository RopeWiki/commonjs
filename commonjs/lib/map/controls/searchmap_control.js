//google maps custom control to allow user to draw on map and select search area

function initSearchMapControl() {
    
    var searchMapControl = document.createElement("div");
    searchMapControl.id = "searchmap";
    searchMapControl.className = "map-control dropdown selection searchmap";

    var searchMapText = document.createElement("span");
    searchMapText.id = "searchinfo";
    searchMapText.innerHTML = "Search Map";

    searchMapControl.appendChild(searchMapText);

    searchMapControl.addEventListener("click",
        function() {
            searchMapButtonClicked();
        });

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(searchMapControl);
}

var isLoading = false; //sometimes the element creation happens after the loading is finished, so make sure it's still loading before displaying it
var searchMapLoaderIsCreated = false;

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
        waitForElement(searchMapLoader.id).then(function() {
            searchMapLoaderIsCreated = true;
            searchMapLoader.style.display = isLoading ? "block" : "none";
        });
        return;
    }

    searchMapLoader.style.display = searchMapLoaderIsCreated ? "block" : "none";
}

function waitForElement(elementId) {
    return new Promise(function (resolve) {

        var observer = new MutationObserver(function(mutationsList) {
            for (var i = 0; i < mutationsList.length; i++) {
                var mutation = mutationsList[i];

                if (!!mutation.previousSibling && mutation.previousSibling.id === elementId ||
                    mutation.addedNodes.length > 0 && mutation.addedNodes[0].id === elementId) {
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
var searchWasRun = false;
var searchMapRectangle;
var searchMapLoader;
var regionQuery; //used to store regionQuery if search map is opened but then cancelled before running search
var searchMapBoundsChangedCallback = searchMapCallbackRegionSearch; //default callback function, override if desired
var clearLocationsUpdateTableCallback = updateTable; //default callback function, override if desired


function searchMapButtonClicked() {
    
    if (searchmapn < 0) {

        //events that the shapes send: https://developers.google.com/maps/documentation/javascript/shapes#editable_events

        if (!regionQuery) regionQuery = locationsQuery;

        var searchRectBounds = getBoundsForSearchRectangle();

        createAndDisplaySearchRectangle(searchRectBounds);

        if (searchRectBounds !== map.getBounds())
            //setSearchMapRectangleBounds(true);
            setSearchMapRectangleBounds(false);
        
        setLoadingInfoText();

    } else {
        closeSearchMapRectangle();
    }
}

function createAndDisplaySearchRectangle(bounds) {

    searchmapn = 0;

    var editable = true;
    if (!!document.getElementById('waterflow-table')) {
        return; //don't draw search rectangle at all -- drawing is handled within waterflow
        editable = false;
    }

    searchMapRectangle = new google.maps.Rectangle({
        bounds: bounds,
        editable: editable
    });
    searchMapRectangle.setMap(map);

    searchMapRectangle.addListener("click", function () {
        clearLocationsOutside(searchMapRectangle.bounds);
    });

    searchMapRectangle.addListener("bounds_changed", function () {
        searchMapRectangleBoundsChanged();
    });

    function setCancelText() {
        var searchButton = document.getElementById('searchinfo');
        searchButton.innerHTML = 'Cancel<br><p style="font-size:10px;position:relative;line-height:0px;margin:0px;">click inside rect to crop</p>';
        searchButton.classList.add("cancel");
    }

    var searchButton = document.getElementById('searchinfo');
    if (searchButton !== null)
        setCancelText();
    else {
        waitForElement('searchmap').then(setCancelText);
    }
}

function closeSearchMapRectangle() {
    searchMapRectangle.setMap(null);
    searchMapRectangle = undefined;

    var searchButton = document.getElementById('searchinfo');
    searchButton.innerHTML = "Search Map";
    searchButton.classList.remove("cancel");

    searchmapn = -1;
    if (!searchWasRun) {
        if (locationsTotalWithinArea === undefined) {
            locationsTotalWithinArea = markers.length;
        }

        if (!!regionQuery) {
            locationsTotalWithinArea = undefined;
            locationsQuery = regionQuery; //set back to the original query if search wasn't run
            loadMoreLocations(true);
            return;
        }
    }

    setLoadingInfoText();
}

function searchMapRectangleBoundsChanged() {
    searchWasRun = true;

    setSearchMapRectangleBounds(false);
}

function setSearchMapRectangleBounds(checkCountOnly) {

    var bounds = searchMapRectangle.bounds;
    
    searchMapBoundsChangedCallback(checkCountOnly, bounds);
}

function searchMapCallbackRegionSearch(checkCountOnly, bounds) {

    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();

    var query =
        '[[Category:Canyons]]' +
        '[[Has latitude::>' + sw.lat().toFixed(3) + ']]' +
        '[[Has longitude::>' + sw.lng().toFixed(3) + ']]' +
        '[[Has latitude::<' + ne.lat().toFixed(3) + ']]' +
        '[[Has longitude::<' + ne.lng().toFixed(3) + ']]';

    locationsQuery = query;
    locationsTotalWithinArea = undefined; //let loadMoreLocations retrieve the total
    loadOffset = 0;

    loadMoreLocations(checkCountOnly);
}

function getBoundsForSearchRectangle() {

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

    var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(searchRectLatBtm, searchRectLatLft),
        new google.maps.LatLng(searchRectLatTop, searchRectLatRgt));

    return bounds;
}

function clearLocationsOutside(bounds) {
    if (!searchMapRectangle.editable) return;

    searchWasRun = true;

    var newMarkers = [];
    var newBounds = new google.maps.LatLngBounds();

    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        if (bounds.contains(marker.position)) {
            newMarkers.push(marker);
            newBounds.extend(marker.position);
        } else {
            clearMarker(marker);
        }
    }

    markers = newMarkers;
    boundslist = newBounds;
    
    setLoadingInfoText();

    clearLocationsUpdateTableCallback();
}