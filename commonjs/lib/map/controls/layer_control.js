//google maps custom control to select the map base layer

//import { google } from './constants.js';
//import { getCookie, setCookie } from './cookies.js';
//import { GetMapLayerIds } from './layers.js';
//import { displayWeatherLayer } from './layers_weather.js';

const mapLayerControlBasename = "map-layer";
var mapLayerDropdownHideTimer = true; //this holds the function, but give it some initial value so it's not undefined

function initMapLayerControl() {

    //add the general list items
    var mapLayerIds = GetMapLayerIds();

    var entries = [];

    for (var i = 0; i < mapLayerIds.length; i++) {
        switch (mapLayerIds[i]) {
            case google.maps.MapTypeId.TERRAIN:
                addLayerTerrain(entries);
                break;
            case google.maps.MapTypeId.ROADMAP:
                addLayerStreetmap(entries);
                break;
            case google.maps.MapTypeId.HYBRID:
                addLayerHybrid(entries);
                break;
            case "topousa":
                addLayerTopoUsa(entries);
                break;
            case "topoworld":
                addLayerTopoWorld(entries);
                break;
            case "estopo":
                addLayerTopoSpain(entries);
                break;
        }
    }

    //add the check box item(s)
    var weatherCheckboxOptions = {
        basename: mapLayerControlBasename,
        id: "mapSelectWeather",
        text: "Weather",
        tooltip: "Show animated weather radar",
        action: function () {
            var showing = document.getElementById("mapSelectWeather").checked;
            displayWeatherLayer(showing);
        }
    }
    var weatherCheckbox = new dropdownCheckbox(weatherCheckboxOptions);

    var sep = new dropdownSeparator(mapLayerControlBasename);

    entries.push(sep, weatherCheckbox);

    //assemble the full control
    var dropdownOptions = {
        basename: mapLayerControlBasename,
        gmap: map,
        items: entries,
        position: google.maps.ControlPosition.TOP_RIGHT,
        zIndex: 1000, //we want this to overlay the 'legend' if it present
        dropdownHideTimer: mapLayerDropdownHideTimer
    }
    createDropdownControl(dropdownOptions);

    //wrap up tasks
    setDefaultMapLayer();
}

function addLayerTerrain(entries) {
    var options = {
        basename: mapLayerControlBasename,
        type: google.maps.MapTypeId.TERRAIN,
        text: "Terrain",
        tooltip: "Show street map with terrain"
    }

    entries.push(new mapLayerDropdownItem(options));
}

function addLayerStreetmap(entries) {
    var options = {
        basename: mapLayerControlBasename,
        type: google.maps.MapTypeId.ROADMAP,
        text: "Streets",
        tooltip: "Show street map"
    }
    entries.push(new mapLayerDropdownItem(options));

    //here is the tile server url for manual streetmap:
    // return "https://mt.google.com/vt/lyrs=m&hl=en&x=" + slippyClip(p.x, z) + "&y=" + slippyClip(p.y, z) + "&z=" + z;
}

function addLayerHybrid(entries) {
    var options = {
        basename: mapLayerControlBasename,
        type: google.maps.MapTypeId.HYBRID,
        text: "Satellite",
        tooltip: "Show satellite view"
    }
    entries.push(new mapLayerDropdownItem(options));

    //  here is the tile server url for manual hybrid:
    // return "https://mt.google.com/vt/lyrs=y&hl=en&x=" + slippyClip(p.x, z) + "&y=" + slippyClip(p.y, z) + "&z=" + z;
}

function addLayerTopoUsa(entries) {
    var options = {
        basename: mapLayerControlBasename,
        type: "topousa",
        text: "TopoUSA",
        tooltip: "Show USA specific topo"
    }
    entries.push(new mapLayerDropdownItem(options));
}

function addLayerTopoWorld(entries) {
    var options = {
        basename: mapLayerControlBasename,
        type: "topoworld",
        text: "TopoWorld",
        tooltip: "Show Worldwide topo"
    }
    entries.push(new mapLayerDropdownItem(options));
}

function addLayerTopoSpain(entries) {
    var options = {
        basename: mapLayerControlBasename,
        type: "estopo",
        text: "TopoSpain",
        tooltip: "Mostrar mapa específico de España"
    }
    entries.push(new mapLayerDropdownItem(options));
}

function mapLayerDropdownItem(options) {

    options.action = function () {
        map.setMapTypeId(options.type);
        setDropdownSelection(mapLayerControlBasename, options.type);
        setCookie(DEFAULT_MAP_LAYER_COOKIE, options.type);
    };
    
    return new dropdownItem(options);
}

//code to set the default map layer
const DEFAULT_MAP_LAYER_COOKIE = "defaultMapType";

function setDefaultMapLayer() {
    var defaultLayer = getCookie(DEFAULT_MAP_LAYER_COOKIE);

    if (map.mapTypes.get(defaultLayer) != null ||
        defaultLayer === google.maps.MapTypeId.TERRAIN ||
        defaultLayer === google.maps.MapTypeId.ROADMAP ||
        defaultLayer === google.maps.MapTypeId.HYBRID ||
        defaultLayer === google.maps.MapTypeId.SATELLITE) {
        map.setMapTypeId(defaultLayer);
    }

    mapTypeObserver.observe(document.getElementById("mapbox"), { attributes: true, childList: true, subtree: true });
}

const mapTypeChangeCallback = function (mutationsList, observer) {
    for (var i = 0; i < mutationsList.length; i++) {
        var mutation = mutationsList[i];

        if (mutation.type === "childList") {
            for (var j = 0; j < mutation.addedNodes.length; j++) {
                var item = mutation.addedNodes[j];
                if (item.id === mapLayerControlBasename + "-control") {
                    observer.disconnect();
                    setDropdownSelection(mapLayerControlBasename, options.type);
                }
            }
        }
    }
};

//waits to set the default map type until after the map element is initialized on the page
const mapTypeObserver = new MutationObserver(mapTypeChangeCallback);
