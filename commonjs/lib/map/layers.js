var radarStep = 0;
var radarInterval;
var radarTimes = ['900913-m50m', '900913-m45m', '900913-m40m', '900913-m35m', '900913-m30m', '900913-m25m', '900913-m20m', '900913-m15m', '900913-m10m', '900913-m05m', '900913'];

function SetupMapLayers() {

    // credits
    var creditDiv = document.createElement('DIV');
    creditDiv.style.cssText = "font-size:x-small;";
    map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(creditDiv);

    // setup map layers
    var credits = [];
    credits[google.maps.MapTypeId.TERRAIN] = " ";

    //google streets is manually defined and doesn't use the google.maps.MapTypeId.DEFAULT value
    //because when that one is included, 'terrain' becomes a checkbox, which is ugly
    map.mapTypes.set("streets",
        new google.maps.ImageMapType({
            getTileUrl: function (p, z) {
                return "https://mt.google.com/vt/lyrs=m&hl=en&x=" +
                    slippyClip(p.x, z) +
                    "&y=" +
                    slippyClip(p.y, z) +
                    "&z=" +
                    z;
            },
            maxZoom: 17,
            minZoom: 3,
            name: "Streets",
            opacity: 1,
            tileSize: new google.maps.Size(256, 256)
        }));
    credits["streets"] = " ";

    map.mapTypes.set("satellite2", //name this as '2' because this is actually the hybrid layer, 'satellite' is the google satellite layer
        new google.maps.ImageMapType({
            getTileUrl: function (p, z) {
                return "https://mt.google.com/vt/lyrs=y&hl=en&x=" +
                    slippyClip(p.x, z) +
                    "&y=" +
                    slippyClip(p.y, z) +
                    "&z=" +
                    z;
            },
            maxZoom: 20,
            minZoom: 3,
            name: "Satellite",
            opacity: 1,
            tileSize: new google.maps.Size(256, 256)
        }));
    credits["streets"] = " ";

    map.mapTypes.set("topousa",
        new google.maps.ImageMapType({
            getTileUrl: function (p, z) {
                return "http://s3-us-west-1.amazonaws.com/caltopo/topo/" +
                    z +
                    "/" +
                    slippyClip(p.x, z) +
                    "/" +
                    slippyClip(p.y, z) +
                    ".png";
            },
            maxZoom: 16,
            minZoom: 5,
            name: "TopoUSA",
            opacity: 1,
            tileSize: new google.maps.Size(256, 256)
        }));
    credits["topo"] = "<a href='https://caltopo.com' target='_blank'>Topo map by CalTopo</a>";

    map.mapTypes.set("wtopo",
        new google.maps.ImageMapType({
            getTileUrl: function (p, z) {
                return "http://tile.thunderforest.com/outdoors/" +
                    z +
                    "/" +
                    slippyClip(p.x, z) +
                    "/" +
                    slippyClip(p.y, z) +
                    ".png?apikey=bdbb04f2d5df40cbb86e9e6e1acff6f7";
            },
            maxZoom: 18,
            minZoom: 3,
            name: "TopoWorld",
            opacity: 1,
            tileSize: new google.maps.Size(256, 256)
        }));
    credits["wtopo"] = "<a href='http://thunderforest.com' target='_blank'>Topo map by Thunderforest</a>";

    map.mapTypes.set("estopo",
        new google.maps.ImageMapType({
            getTileUrl: function (p, z) {
                return "http://www.ign.es/wmts/mapa-raster?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=MTN&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX=" +
                    z +
                    "&TILEROW=" +
                    slippyClip(p.y, z) +
                    "&TILECOL=" +
                    slippyClip(p.x, z) +
                    "&FORMAT=image%2Fjpeg";
            },
            maxZoom: 17,
            minZoom: 6,
            name: "TopoSpain",
            opacity: 1,
            tileSize: new google.maps.Size(256, 256)
        }));
    credits["estopo"] = "<a href='http://sigpac.mapa.es/fega/visor/' target='_blank'>Topo map by IGN</a>";

    // relief is used in conjuction with TopoUSA to provide relief shading
    var relief = new google.maps.ImageMapType({
        getTileUrl: function (p, z) {
            return "http://s3-us-west-1.amazonaws.com/ctrelief/relief/" +
                z +
                "/" +
                slippyClip(p.x, z) +
                "/" +
                slippyClip(p.y, z) +
                ".png";
        },
        maxZoom: 16,
        name: "Topo",
        opacity: 0.25,
        tileSize: new google.maps.Size(256, 256)
    });

    // Map Change
    google.maps.event.addListener(map,
        "maptypeid_changed",
        function () {
            if (map.getMapTypeId() == "topousa")
                map.overlayMapTypes.setAt(0, relief);
            else
                map.overlayMapTypes.clear();

            var credit = credits[map.getMapTypeId()];
            if (!!credit && !!creditDiv)
                creditDiv.innerHTML = credit;
        });
}

function addWeatherControl(controlDiv) {
    // Set CSS for the control border.
    const controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    //controlUI.style.marginBottom = "22px";
    controlUI.style.marginTop = "9px";
    controlUI.style.marginRight = "10px";
    controlUI.style.textAlign = "center";
    controlUI.title = "Click to display weather";

    // Set CSS for the control interior.
    const controlText = document.createElement("div");
    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "16px";
    controlText.style.lineHeight = "38px";
    controlText.style.paddingLeft = "5px";
    controlText.style.paddingRight = "5px";
    controlText.innerHTML = "Weather";
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener("click", function () {
        showRadarLayer();
    });

    controlDiv.appendChild(controlUI);
}

// turn on/off weather radar
var showing;
function showRadarLayer() {

    if (!showing) {
        radarStep = 0;
        $(this).val('Turn off Weather Radar');
        radarInterval = setInterval(startAnimation, 500);
        showing = 'true';

        zoomOut();        
    } else {
        $(this).val('Turn on Weather Radar');
        clearInterval(radarInterval);
        map.overlayMapTypes.clear();
        showing = null;
    }
}

// animate the Weather Radar
function startAnimation() {
    var layer = radarStep;
    if (layer <= 10) {

        tileNEX = new google.maps.ImageMapType({
            getTileUrl: function (tile, zoom) {
                return "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-" +
                    radarTimes[layer]
                    //"q2-p24h-900913"
                    + "/" + zoom + "/" + tile.x + "/" + tile.y + ".png";
            },
            tileSize: new google.maps.Size(256, 256),
            opacity: 0.60,
            name: 'NEXRAD',
            isPng: true
        });
        map.overlayMapTypes.setAt("0", tileNEX);
    }

    radarStep++;
    if (radarStep > 17) { //pause at the current time for a few steps
        radarStep = 0;
    }
}

function zoomOut() {
    if (map.getZoom() > 8) {
        map.setZoom(map.getZoom() - 1);
        var millisecondsToWait = 200;
        setTimeout(zoomOut, millisecondsToWait);
    };
}

// set map type layers to include in the dropdown
function GetMapTypeIds() {    
    var mapTypeIds = [google.maps.MapTypeId.TERRAIN];

    if (isUSAorCanada())
        mapTypeIds.push("topousa");

    if (isSpain())
        mapTypeIds.push("estopo");

    mapTypeIds.push("wtopo", "streets", 'satellite2');

    return mapTypeIds;
}

function isUSAorCanada() {
    var embeddedMapType;
    var kmlType = document.getElementById("kmltype");
    if (kmlType != null) {
        var mapSet = kmlType.innerHTML.split('@');
        embeddedMapType = mapSet[0];
    }

    var pageName = mw.config.get("wgPageName");
    var parentRegionEnable = ($("[title='United States']").length > 0 || $("[title='Canada']").length > 0) && pageName !== 'North_America';

    return (embeddedMapType === "topo"
        || pageName === "United_States" || pageName === "Canada" || pageName === "Pacific_Northwest" //region pages
        || parentRegionEnable); //sub-region under US or Canada        
}

function isSpain() {
    var embeddedMapType;
    var kmlType = document.getElementById("kmltype");
    if (kmlType != null) {
        var mapSet = kmlType.innerHTML.split('@');
        embeddedMapType = mapSet[0];
    }

    return (embeddedMapType === "estopo");
}