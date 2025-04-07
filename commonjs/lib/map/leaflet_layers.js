function addLeafletBaseMaps(map) {
    
    var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 15, // beyond this zoom level, tiles are interpolated
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    
    var Thunderforest_Outdoors = L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}{r}.png?apikey={apikey}', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: getThunderForestAPIKey(),
        maxZoom: 22
    });

    // Default basemap
    Thunderforest_Outdoors.addTo(map);

    // Add layer control to switch between tile layers
    L.control.layers({
        'Thunderforest Outdoors': Thunderforest_Outdoors,
        'OpenTopoMap': OpenTopoMap
    }).addTo(map);
}

