// Needed to display tiles properly
mw.loader.load('/leaflet/1.9.4/leaflet.css', 'text/css');

function initializeLeafletMap() {
    // This ensures the external leaflet code is loaded before going futher.
    // In future versions of mediawiki this will change to mw.loader.getScript()
    $.when($.getScript('/leaflet/1.9.4/leaflet.js'))
        .then(
            function () { buildLeafletMap() }, // Success
            function (e) { mw.log.error(e) }   // Failure
        );
}


function buildLeafletMap() {
    // Ensure the "mapbox" div exists
    const mapDiv = document.getElementById('mapbox');
    if (!mapDiv) {
        console.error('Div with id "mapbox" not found.');
        return;
    }

    // Create the map instance
    window.map = L.map('mapbox', {
        // maxZoom: 15
    }).setView([0, 0], 14);

    var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 15, // beyond this zoom level, tiles are interpolated
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    OpenTopoMap.addTo(map);

    // Add layer control to switch between tile layers
    L.control.layers({
        'OpenTopoMap': OpenTopoMap
    }).addTo(map);


    // Setup an empty legend
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        legendDiv = L.DomUtil.create('div', 'info legend');
        legendDiv.id = 'legend';
        return legendDiv;
    };
    legend.addTo(map);


    addKMLData(map);


}



function addKMLData(map) {
    /* Extract the metadata stored in hidden page elements, and add them to the map */

    var pageName = mw.config.get("wgPageName");

    // Canyon Marker
    var kmlmarker = document.getElementById("kmlmarker");
    if (kmlmarker != null) {
        coords = kmlmarker.innerText.split(",");
        if (coords != null && coords.length > 1) {
            map.setView(coords);
            addMarker(coords, map, pageName.replace(/_/g, " "), 'https://maps.google.com/mapfiles/kml/paddle/grn-stars.png', [40, 40]);
        }
    }

    // Shuttle Marker
    var kmlmarkershuttle = document.getElementById("kmlmarkershuttle");
    if (kmlmarkershuttle != null) {
        coords = kmlmarkershuttle.innerText.split(",");
        if (coords != null && coords.length > 1) {
            addMarker(coords, map, "Shuttle", '/leaflet/images/S.png', [40, 40]);
        }
    }

    // Parking Marker
    var kmlmarkerparking = document.getElementById("kmlmarkerparking");
    if (kmlmarkerparking != null) {
        coords = kmlmarkerparking.innerText.split(",");
        if (coords != null && coords.length > 1) {
            addMarker(coords, map, "Parking", '/leaflet/images/P.png', [40, 40]);
        }
    }

    // // KML Track
    var kmlfile = document.getElementById("kmlfilep");
    if (kmlfile != null) {
        var kmlurl = kmlfile.innerHTML;
        if (kmlurl != null && kmlurl.length > 0) {
            /* omnivore is the preferred library, but does not
               support importing the styles from the KML file,
               so we use leaflet-kml instead. */

            setupLeafletKML();

            $.get(kmlurl, function (kmltext) {
                const parser = new DOMParser();
                parser.parseFromString(kmltext, 'text/xml');
                const track = new L.KML(kmltext, 'text/xml');


                // This messy logic iterates through the layer finding any sub-layers
                // which have a name & color option set, and adds them to the legend.
                track.on('add', function () {
                    function printLayerNames(layers) {
                        Object.keys(layers).forEach(function (key) {
                            var layer = layers[key];
                            if (layer.options && layer.options.name && layer.options.color) {

                                document.getElementById("legend").innerHTML += '<i style="background: ' + layer.options.color + '; width: 12px; height: 12px; display: inline-block;"></i> ' + layer.options.name + '<br>';
                            }
                            if (layer._layers) {
                                printLayerNames(layer._layers); // Recursively handle nested layers
                            }
                        });
                    }
                });

                map.addLayer(track);
                map.fitBounds(track.getBounds());


            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            });
        }
    }
}


function addMarker(coords, map, text, iconUrl, iconSize) {
    if (coords != null && coords.length > 1) {
        const customIcon = L.icon({
            iconUrl: iconUrl,
            iconSize: iconSize, // Size of the icon
            iconAnchor: [20, 35], // Anchor point of the icon
            popupAnchor: [0, -40] // Position of the popup relative to the icon
        });

        L.marker(coords, { icon: customIcon })
            .addTo(map)
            .bindPopup(text);
    }
}
