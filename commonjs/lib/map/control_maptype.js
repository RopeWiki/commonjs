//gdropdown


function addCustomMapTypeDropdown() {

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

    var dropDownDiv = new dropDownOptionsDiv(ddDivOptions);

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
    ddEntries.push(new ddOption(options));
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
    ddEntries.push(new ddOption(options));
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
    ddEntries.push(new ddOption(options));
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
    ddEntries.push(new ddOption(options));
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
    ddEntries.push(new ddOption(options));
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
    ddEntries.push(new ddOption(options));
}


/************
 Classes to set up the drop-down control
 ************/

function ddOption(options) {
    var control = document.createElement('DIV');
    control.className = "dropDownItemDiv";
    control.title = options.title;
    control.id = options.id;

    // Set CSS for the control interior.
    var controlText = document.createElement("div");
    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "18px";
    controlText.style.lineHeight = "38px";
    controlText.style.paddingLeft = "10px";
    controlText.style.paddingRight = "10px";
    controlText.innerHTML = options.name;
    control.appendChild(controlText);

    google.maps.event.addDomListener(control, 'click', options.action);
    return control;
}

function ddCheckBox(options) {
    var container = document.createElement('DIV');
    container.className = "checkboxContainer";
    container.title = options.title;

    var span = document.createElement('SPAN');
    span.role = "checkbox";
    span.className = "checkboxSpan";

    var chk = document.createElement("INPUT");
    chk.id = options.id;
    chk.setAttribute("type", "checkbox");

    var controlText = document.createElement("Label");
    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "18px";
    controlText.style.lineHeight = "38px";
    controlText.style.paddingLeft = "2px";
    controlText.style.paddingRight = "5px";
    controlText.innerHTML = options.label;
    controlText.setAttribute("for", chk.id);

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
    sep.style.marginTop = "0px";
    sep.style.marginBottom = "0px";
    return sep;
}

function dropDownOptionsDiv(options) {
    var container = document.createElement('DIV');
    container.className = "dropDownOptionsDiv";
    container.id = options.id;

    for (i = 0; i < options.items.length; i++) {
        container.appendChild(options.items[i]);
    }

    return container;
}

var ddTimeoutHide;

function dropDownControl(options) {
    var container = document.createElement('DIV');
    container.className = 'container';
    container.setAttribute("style", "width:140px");

    var control = document.createElement('DIV');
    control.classList.add("dropDownControl");
    control.id = options.name;

    control.style.border = "2px solid #fff";
    control.style.borderRadius = "3px";
    control.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    control.style.cursor = "pointer";
    control.style.marginTop = "10px";
    control.style.marginRight = "10px";
    control.style.textAlign = "center";

    var controlText = document.createElement("span");
    controlText.id = "currentMapType";
    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "18px";
    controlText.style.fontWeight = "bold";
    controlText.style.lineHeight = "38px";
    controlText.style.paddingLeft = "5px";
    controlText.style.paddingRight = "5px";
    controlText.style.width = "200px;"
    controlText.innerHTML = options.dropDown.firstChild.firstChild.innerHTML;
    control.appendChild(controlText);

    var arrow = document.createElement('IMG');
    arrow.src = "http://maps.gstatic.com/mapfiles/arrow-down.png";
    arrow.className = 'dropDownArrow';
    arrow.style.marginBottom = "4px";
    arrow.style.marginRight = "4px";
    arrow.style.marginTop = "17px";
    arrow.align = "right";
    control.appendChild(arrow);

    container.appendChild(control);
    container.appendChild(options.dropDown);
    options.dropDown.setAttribute("style", "width:130px");
    options.dropDown.style.display = 'none';

    options.gmap.controls[options.position].push(container);

    google.maps.event.addDomListener(control,
        'click',
        function () {
            if (document.getElementById(options.dropDown.id).style.display === 'none')
                document.getElementById(options.dropDown.id).style.display = 'block';
            else
                document.getElementById(options.dropDown.id).style.display = 'none';
        });

    google.maps.event.addDomListener(container,
        'mouseleave',
        function () {
            ddTimeoutHide = setTimeout(function () {
                document.getElementById(options.dropDown.id).style.display = 'none';
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
                targetElement.parentElement.id !== 'mapCustomTypeControl' &&
                targetElement.parentElement.parentElement.id !== 'mapCustomTypeControl') {
                if (document.getElementById(options.dropDown.id).style.display === 'block')
                    document.getElementById(options.dropDown.id).style.display = 'none';
            }
        });
}

function setMapTypeSelection(selected) {
    var element = document.getElementById(selected).firstChild;
    document.getElementById("currentMapType").innerHTML = element.innerHTML;
    var fullList = document.getElementById("mapCustomTypeControl").childNodes;
    for (var i = 0; i < fullList.length; i++) {
        var item = fullList[i];
        if (item.className === "dropDownItemDiv") {
            item.firstChild.style.fontWeight = "normal";
        }
    }

    element.style.fontWeight = "bold";
}
