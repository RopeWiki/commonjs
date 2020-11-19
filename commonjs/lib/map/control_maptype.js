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
}

function addLayerTerrain(ddEntries) {
    var options = {
        gmap: map,
        name: 'Terrain',
        title: "Show street map with terrain",
        id: "mapSelectTerrain",
        action: function () {
            map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
            setMapTypeSelection("mapSelectTerrain");
        }
    }
    ddEntries.push(new ddItem(options));
}

function addLayerStreetmap(ddEntries) {
    var options = {
        gmap: map,
        name: 'Streets',
        title: "Show street map",
        id: "mapSelectStreets",
        action: function () {
            map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
            setMapTypeSelection("mapSelectStreets");
        }
    }
    ddEntries.push(new ddItem(options));
}

function addLayerHybrid(ddEntries) {
    var options = {
        gmap: map,
        name: 'Satellite',
        title: "Show satellite view",
        id: "mapSelectHyrid",
        action: function () {
            map.setMapTypeId(google.maps.MapTypeId.HYBRID);
            setMapTypeSelection("mapSelectHyrid");
        }
    }
    ddEntries.push(new ddItem(options));
}

function addLayerTopoUsa(ddEntries) {
    var options = {
        gmap: map,
        name: 'TopoUSA',
        title: "Show USA specific topo",
        id: "mapSelectTopoUsa",
        action: function () {
            map.setMapTypeId('topousa');
            setMapTypeSelection("mapSelectTopoUsa");
        }
    }
    ddEntries.push(new ddItem(options));
}

function addLayerTopoWorld(ddEntries) {
    var options = {
        gmap: map,
        name: 'TopoWorld',
        title: "Show Worldwide topo",
        id: "mapSelectTopoWorld",
        action: function () {
            map.setMapTypeId('topoworld');
            setMapTypeSelection("mapSelectTopoWorld");
        }
    }
    ddEntries.push(new ddItem(options));
}

function addLayerTopoSpain(ddEntries) {
    var options = {
        gmap: map,
        name: 'TopoSpain',
        title: "Mostrar mapa específico de España",
        id: "mapSelectTopoUsa",
        action: function () {
            map.setMapTypeId('estopo');
            setMapTypeSelection("mapSelectTopoSpain");
        }
    }
    ddEntries.push(new ddItem(options));
}


/************
 Classes to set up the drop-down control
 ************/

function ddItem(options) {
    var control = document.createElement('DIV');
    control.className = "map-type-control item";
    control.title = options.title;
    control.id = options.id;

    // Set CSS for the control interior.
    var controlText = document.createElement("DIV");
    controlText.innerHTML = options.name;
    control.appendChild(controlText);

    google.maps.event.addDomListener(control, 'click', options.action);
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

    for (i = 0; i < options.items.length; i++) {
        container.appendChild(options.items[i]);
    }

    return container;
}

var ddTimeoutHide;

function dropDownControl(options) {
    var container = document.createElement('DIV');
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
                document.getElementById(options.dropDown.id).style.display === "none")
                document.getElementById(options.dropDown.id).style.display = "block";
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
    var element = document.getElementById(selected);
    document.getElementById("currentMapType").innerHTML = element.firstChild.innerHTML;
    var fullList = document.getElementById("mapCustomTypeControl").childNodes;
    for (var i = 0; i < fullList.length; i++) {
        var item = fullList[i];
        if (item.className === "map-type-control item selected") {
            item.classList.remove("selected");
        }
    }

    element.classList.add("selected");
}

function hideMapTypeOptions(options) {
    document.getElementById(options.dropDown.id).style.display = 'none';
}
