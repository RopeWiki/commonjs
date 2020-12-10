//gdropdown

function initMapTypeControl() {

    var mapTypeIds = GetMapTypeIds();

    var ddEntries = [];

    for (var i = 0; i < mapTypeIds.length; i++) {
        switch (mapTypeIds[i]) {
            case google.maps.MapTypeId.TERRAIN:
                addLayerTerrain(ddEntries);
                break;
            case google.maps.MapTypeId.ROADMAP:
                addLayerStreetmap(ddEntries);
                break;
            case google.maps.MapTypeId.HYBRID:
                addLayerHybrid(ddEntries);
                break;
            case "topousa":
                addLayerTopoUsa(ddEntries);
                break;
            case "topoworld":
                addLayerTopoWorld(ddEntries);
                break;
            case "estopo":
                addLayerTopoSpain(ddEntries);
                break;
        }
    }

    //create the check box items
    var chkOptWeather = {
        gmap: map,
        title: "Show weather radar",
        id: "mapSelectWeather",
        label: "Weather",
        action: function () {
            var showing = document.getElementById("mapSelectWeather").checked;
            displayWeatherLayer(showing);
        }
    }
    var ddChkWeather = new ddCheckBox(chkOptWeather);

    var sep = new separator();

    ddEntries.push(sep, ddChkWeather);

    var ddDivOptions = {
        items: ddEntries,
        id: "mapCustomTypeControl"
    }

    var dropDownDiv = new dropDownItemsList(ddDivOptions);

    var dropDownOptions = {
        gmap: map,
        name: 'Map Type',
        id: 'ddControl',
        title: 'Map Type Selector',
        position: google.maps.ControlPosition.TOP_RIGHT,
        dropDown: dropDownDiv
    }

    dropDownControl(dropDownOptions);

    setDefaultMapLayer();
}

function addLayerTerrain(ddEntries) {
    var options = {
        gmap: map,
        type: google.maps.MapTypeId.TERRAIN,
        text: 'Terrain',
        info: "Show street map with terrain"
    }
    ddEntries.push(new ddItem(options));
}

function addLayerStreetmap(ddEntries) {
    var options = {
        gmap: map,
        type: google.maps.MapTypeId.ROADMAP,
        text: 'Streets',
        info: "Show street map"
    }
    ddEntries.push(new ddItem(options));

    //here is the tile server url for manual streetmap:
    // return "https://mt.google.com/vt/lyrs=m&hl=en&x=" + slippyClip(p.x, z) + "&y=" + slippyClip(p.y, z) + "&z=" + z;
}

function addLayerHybrid(ddEntries) {
    var options = {
        gmap: map,
        type: google.maps.MapTypeId.HYBRID,
        text: 'Satellite',
        info: "Show satellite view"
    }
    ddEntries.push(new ddItem(options));

    //  here is the tile server url for manual hybrid:
    // return "https://mt.google.com/vt/lyrs=y&hl=en&x=" + slippyClip(p.x, z) + "&y=" + slippyClip(p.y, z) + "&z=" + z;
}

function addLayerTopoUsa(ddEntries) {
    var options = {
        gmap: map,
        type: 'topousa',
        text: 'TopoUSA',
        info: "Show USA specific topo"
    }
    ddEntries.push(new ddItem(options));
}

function addLayerTopoWorld(ddEntries) {
    var options = {
        gmap: map,
        type: 'topoworld',
        text: 'TopoWorld',
        info: "Show Worldwide topo"
    }
    ddEntries.push(new ddItem(options));
}

function addLayerTopoSpain(ddEntries) {
    var options = {
        gmap: map,
        type: 'estopo',
        text: 'TopoSpain',
        info: "Mostrar mapa específico de España"
    }
    ddEntries.push(new ddItem(options));
}


/************
 Classes to set up the drop-down control
 ************/

function ddItem(options) {
    var control = document.createElement('DIV');
    control.className = "map-type-control item";
    control.title = options.info;
    control.id = "mapSelect" + options.type;

    // Set CSS for the control interior.
    var controlText = document.createElement("DIV");
    controlText.innerHTML = options.text;
    control.appendChild(controlText);

    google.maps.event.addDomListener(control,
        'click',
        function() {
            map.setMapTypeId(options.type);
            setMapTypeSelection(options.type);
            setCookie(DEFAULT_MAP_LAYER_COOKIE, options.type);
        });
    return control;
}

function ddCheckBox(options) {
    var container = document.createElement('DIV');
    container.className = "map-type-control checkbox";
    container.title = options.title;

    var span = document.createElement('SPAN');
    span.role = "checkbox";

    var chk = document.createElement("INPUT");
    chk.setAttribute("type", "checkbox");
    chk.id = options.id;
    
    var controlText = document.createElement("LABEL");
    controlText.setAttribute("for", chk.id);
    controlText.innerHTML = options.label;
    
    container.appendChild(chk);
    container.appendChild(controlText);

    google.maps.event.addDomListener(chk,
        'change',
        function() {
            options.action();
        });

    return container;
}

function separator() {
    var sep = document.createElement('hr');
    sep.className = "map-type-control separator";
    return sep;
}

function dropDownItemsList(options) {
    var container = document.createElement('DIV');
    container.className = "map-type-control items-list";
    container.id = options.id;

    for (var i = 0; i < options.items.length; i++) {
        container.appendChild(options.items[i]);
    }

    return container;
}

var ddTimeoutHide;

function dropDownControl(options) {
    var container = document.createElement('DIV');
    container.id = 'map-type-control-custom';
    container.className = 'map-type-control';
    container.style.cssText = "z-index:1000;"; //we want this to overlay the 'legend' if it present

    var control = document.createElement('DIV');
    control.className = 'map-type-control selection';
    control.id = options.name;
    
    var controlText = document.createElement("SPAN");
    controlText.className = 'map-type-control selection-text';
    controlText.id = "currentMapType";
    controlText.innerHTML = options.dropDown.firstChild.firstChild.innerHTML;
    control.appendChild(controlText);

    var arrow = document.createElement('IMG');
    arrow.src = "http://maps.gstatic.com/mapfiles/arrow-down.png";
    arrow.className = 'map-type-control arrow';
    control.appendChild(arrow);

    container.appendChild(control);
    container.appendChild(options.dropDown);

    
    options.gmap.controls[options.position].push(container);

    google.maps.event.addDomListener(control,
        'click',
        function() {
            if (document.getElementById(options.dropDown.id).style.display === "" ||
                document.getElementById(options.dropDown.id).style.display === "none") {
                document.getElementById(options.dropDown.id).style.display = "block";
            }
            else
                hideMapTypeOptions(options);
        });

    google.maps.event.addDomListener(container,
        'mouseleave',
        function () {
            ddTimeoutHide = setTimeout(function () {
                hideMapTypeOptions(options);
            }, 1000);

        });

    google.maps.event.addDomListener(container,
        'mouseenter',
        function () { clearTimeout(ddTimeoutHide); }
    );

    document.addEventListener('click',
        function(event) {
            var targetElement = event.target || event.srcElement;
            if (targetElement.id !== 'currentMapType' &&
                targetElement.id !== 'Map Type' &&
                targetElement.parentElement && targetElement.parentElement.id !== 'mapCustomTypeControl' &&
                targetElement.parentElement.parentElement && targetElement.parentElement.parentElement.id !== 'mapCustomTypeControl') {
                var dd = document.getElementById(options.dropDown.id);
                if (dd && dd.style.display === 'block')
                    hideMapTypeOptions(options);
            }
        });
}

function setMapTypeSelection(selected) {
    var item, i;

    var fullList = document.getElementById("mapCustomTypeControl").childNodes;

    if (!selected) {
        var label = document.getElementsByClassName("map-type-control selection-text")[0].innerHTML;
        for (i = 0; i < fullList.length; i++) {
            item = fullList[i];
            if (item.firstChild && item.firstChild.innerHTML === label) {
                selected = item.id;
                break;
            }
        }
    }

    var element = document.getElementById("mapSelect" + selected);
    document.getElementById("currentMapType").innerHTML = element.firstChild.innerHTML;
    for (i = 0; i < fullList.length; i++) {
        item = fullList[i];
        if (item.className === "map-type-control item selected") {
            item.classList.remove("selected");
        }
    }

    element.classList.add("selected");
}

function hideMapTypeOptions(options) {
    document.getElementById(options.dropDown.id).style.display = 'none';
}

var DEFAULT_MAP_LAYER_COOKIE = 'defaultMapType';

function setDefaultMapLayer() {
    var defaultLayer = getCookie(DEFAULT_MAP_LAYER_COOKIE);

    if (map.mapTypes.get(defaultLayer) != null ||
        defaultLayer === google.maps.MapTypeId.TERRAIN ||
        defaultLayer === google.maps.MapTypeId.ROADMAP ||
        defaultLayer === google.maps.MapTypeId.HYBRID ||
        defaultLayer === google.maps.MapTypeId.SATELLITE) {
        map.setMapTypeId(defaultLayer);
    }

    mapTypeObserver.observe(document.getElementById('mapbox'), { attributes: true, childList: true, subtree: true });
}

var mapTypeChangeCallback = function (mutationsList, observer) {
    for (var i = 0; i < mutationsList.length; i++) {
        var mutation = mutationsList[i];

        if (mutation.type === 'childList') {
            for (var j = 0; j < mutation.addedNodes.length; j++) {
                var item = mutation.addedNodes[j];
                if (item.id === "map-type-control-custom") {
                    observer.disconnect();
                    setMapTypeSelection(map.getMapTypeId());
                }
            }
        }
    }
};

//waits to set the default map type until after the map element is initialized on the page
var mapTypeObserver = new MutationObserver(mapTypeChangeCallback);
