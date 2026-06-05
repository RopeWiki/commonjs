function addLeafletBaseMaps(map) {

    var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 15, // beyond this zoom level, tiles are interpolated
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var Thunderforest_Outdoors_Cached = L.tileLayer('https://tf.coops.workers.dev/outdoors/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 22
    });

    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    var MapBuilder = L.tileLayer('https://caltopo.com/tile/mb_topo/{z}/{x}/{y}.png', {
        attribution: '&copy; CalTopo MapBuilder'
    });

    // Default basemap
    Thunderforest_Outdoors_Cached.addTo(map);

    // Add layer control to switch between tile layers
    L.control.layers({
        // 'Thunderforest Outdoors': Thunderforest_Outdoors,
        'Thunderforest Outdoors': Thunderforest_Outdoors_Cached,
        'OpenTopoMap': OpenTopoMap,
        'Esri WorldImagery': Esri_WorldImagery,
        'CalTopo MapBuilder': MapBuilder
    }).addTo(map);

    add_risk_map(map);
}

function add_risk_map(map) {
    usfsLayer = L.vectorGrid.protobuf("https://tiles.ropewiki.com/data/usfs/{z}/{x}/{y}.pbf", {
        vectorTileLayerStyles: {
            USFSlandsavailableforsale061625: {
                fillColor: '#e06666',
                color: '#cc0000',
                weight: 1,
                fillOpacity: 0.3,
                fill: true
            }
        },
        interactive: true
    });
    usfsLayer.addTo(map);

    blmLayer = L.vectorGrid.protobuf("https://tiles.ropewiki.com/data/blm/{z}/{x}/{y}.pbf", {
        vectorTileLayerStyles: {
            BLMlandsavailableforsale061625: {
                fillColor: '#f6b26b',
                color: '#e69138',
                weight: 1,
                fillOpacity: 0.3,
                fill: true
            }
        },
        interactive: true
    });
    blmLayer.addTo(map);

    roadlessLayer = L.vectorGrid.protobuf("https://tiles.ropewiki.com/data/roadless/{z}/{x}/{y}.pbf", {
        vectorTileLayerStyles: {
            roadless: {
                fillColor: '#6aa84f',
                color: '#38761d',
                weight: 1,
                fillOpacity: 0.3,
                fill: true
            }
        },
        interactive: true
    });
    roadlessLayer.addTo(map);

    var toggleControl = L.control({ position: 'bottomleft' });

    toggleControl.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.style.backgroundColor = 'white';
        div.style.padding = '5px';
        div.style.cursor = 'pointer';
        div.title = 'Toggle Layer';

        // Individually toggleable layers. Each remembers its own state in a
        // cookie ("publiclands_<key>"); click the name to show/hide that layer.
        var layers = [
            { key: 'usfs', name: 'USFS', color: '#e06666', layer: usfsLayer },
            { key: 'blm', name: 'BLM', color: '#e69138', layer: blmLayer },
            { key: 'roadless', name: 'Roadless', color: '#6aa84f', layer: roadlessLayer }
        ];

        // Master on/off for the whole box (existing "publiclands" cookie)
        var isChecked = publiclands !== "off";

        var swatches = layers.map(function (l) {
            return '<span class="landLayerName" data-key="' + l.key + '" ' +
                'style="cursor: pointer; user-select: none; white-space: nowrap; margin-right: 6px;">' +
                '<i style="background: ' + l.color + '; width: 12px; height: 12px; display: inline-block;"></i> ' +
                l.name + '</span>';
        }).join('');

        div.innerHTML =
            '<label style="font-size: 13px; user-select: none; background-color: white;">' +
            '<input type="checkbox" id="landLayerToggle" ' + (isChecked ? 'checked' : '') + '> ' +
            'US Public lands are at risk!</label><br>' +
            '<span style="font-size: 13px;">' + swatches +
            '- <a target="_blank" style="display: inline; background-color:white; text-decoration: underline;" href="https://www.outdooralliance.org/blog/2025/6/16/33millionacres-publicland-selloffs-map">More info</a>' +
            '</span><br><span style="font-size: smaller;">' +
            '<a target="_new" style="line-height:0px; display: inline; text-decoration: underline;" href="https://www.dropbox.com/scl/fo/smwyjbbwr9ie5qg3dtuzd/AP10gfeav1spzd-mPAL-k1E?dl=0&e=2&rlkey=q055x4j4kxf29giajlmw11m93">' +
            'Source data</a> via Outdoor Alliance & TWA<span>';

        // Prevent map dragging when clicking
        L.DomEvent.disableClickPropagation(div);

        var checkbox = div.querySelector('#landLayerToggle');

        // Reconcile every layer's visibility + label appearance with the cookies.
        // A layer shows only when the master box is on AND its own cookie isn't "off".
        function applyLayers() {
            var masterOn = getCookie("publiclands") !== "off";
            layers.forEach(function (l) {
                var on = masterOn && getCookie("publiclands_" + l.key) !== "off";
                var span = div.querySelector('.landLayerName[data-key="' + l.key + '"]');
                if (on) {
                    if (!map.hasLayer(l.layer)) map.addLayer(l.layer);
                    span.style.opacity = '1';
                    span.style.textDecoration = 'none';
                } else {
                    if (map.hasLayer(l.layer)) map.removeLayer(l.layer);
                    span.style.opacity = '0.4';
                    span.style.textDecoration = 'line-through';
                }
            });
        }

        // Master checkbox: show/hide the whole box at once
        checkbox.onclick = function () {
            setCookie("publiclands", checkbox.checked ? "on" : "off");
            applyLayers();
        };

        // Each layer name toggles just that layer
        layers.forEach(function (l) {
            var span = div.querySelector('.landLayerName[data-key="' + l.key + '"]');
            L.DomEvent.on(span, 'click', function (e) {
                L.DomEvent.stop(e);
                // Clicking a name implies the box should be on
                if (getCookie("publiclands") === "off") {
                    setCookie("publiclands", "on");
                    checkbox.checked = true;
                }
                var currentlyOn = getCookie("publiclands_" + l.key) !== "off";
                setCookie("publiclands_" + l.key, currentlyOn ? "off" : "on");
                applyLayers();
            });
        });

        // Apply initial state from cookies
        applyLayers();

        return div;
    };
    is_us = document.querySelectorAll('a[title="United States"]').length > 0;
    if (is_us) {
        console.log('Adding public land warning');
        toggleControl.addTo(map);
    }


}