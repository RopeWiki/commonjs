function addLeafletBaseMaps(map) {
    
    var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 15, // beyond this zoom level, tiles are interpolated
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    
    var Thunderforest_Outdoors = L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}{r}.png?apikey={apikey}', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: 'b9e0eb4fa0d1400186ab640335c113b6',
        maxZoom: 22
    });

    var Thunderforest_Outdoors_Cached = L.tileLayer('https://tf.coops.workers.dev/outdoors/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 22
    });

    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    // Default basemap
    // Thunderforest_Outdoors.addTo(map);
    Thunderforest_Outdoors_Cached.addTo(map);

    // Add layer control to switch between tile layers
    L.control.layers({
        // 'Thunderforest Outdoors': Thunderforest_Outdoors,
        'Thunderforest Outdoors': Thunderforest_Outdoors_Cached,
        'OpenTopoMap': OpenTopoMap,
        'Esri WorldImagery': Esri_WorldImagery
    }).addTo(map);
}


function addStaticTile(map) {

    const zoom = map.getZoom();
    const center = map.getCenter();
    const width = 2560;  // 2560 is the largest supported
    const height = 2560;

    const centerPoint = map.project(center, zoom);
    const topLeft = L.point(centerPoint.x - width / 2, centerPoint.y - height / 2);
    const bottomRight = L.point(centerPoint.x + width / 2, centerPoint.y + height / 2);
    const bounds = L.latLngBounds(
        map.unproject(topLeft, zoom),
        map.unproject(bottomRight, zoom)
    );

    var staticUrl = 'https://tf.coops.workers.dev/static/outdoors/' +
    center.lng.toFixed(5) + ',' +
    center.lat.toFixed(5) + ',' +
    zoom + '/' +
    width + 'x' + height + '.jpg70';

    window.staticOverlay = L.imageOverlay(staticUrl, bounds).addTo(map);
    disableControls(map);
}


function enabledControls(map) {
    map.zoomControl.addTo(map);
    map.fullscreenControl.addTo(map);
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    map.tapHold.enable();            // only if tap is defined (mobile)
    map.touchZoom.enable();
}

function disableControls(map) {
    map.zoomControl.remove();
    map.fullscreenControl.remove();
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.tapHold.disable();            // only if tap is defined (mobile)
    map.touchZoom.disable();
}