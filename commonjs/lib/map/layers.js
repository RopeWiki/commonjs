
function SetupMapLayers() {

    // credits
    var creditDiv = document.createElement('DIV');
    creditDiv.style.cssText = "font-size:x-small;";
    map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(creditDiv);
    
    // setup map layers
    var credits = [];

    var mapTypeIds = GetMapTypeIds();

    for (var i = 0; i < mapTypeIds.length; i++) {
        switch (mapTypeIds[i]) {
        case google.maps.MapTypeId.TERRAIN:
            credits[google.maps.MapTypeId.TERRAIN] = " ";
            break;

        case google.maps.MapTypeId.ROADMAP:
            credits[google.maps.MapTypeId.ROADMAP] = " ";
            break;

        case google.maps.MapTypeId.HYBRID:
            credits[google.maps.MapTypeId.HYBRID] = " ";
            break;

        case "topousa":
            map.mapTypes.set("topousa",
                new google.maps.ImageMapType({
                    getTileUrl: function(p, z) {
                        return "http://s3-us-west-1.amazonaws.com/caltopo/topo/" +
                            z + "/" + slippyClip(p.x, z) + "/" + slippyClip(p.y, z) + ".png";
                    },
                    maxZoom: 16,
                    minZoom: 5,
                    name: "TopoUSA",
                    opacity: 1,
                    tileSize: new google.maps.Size(256, 256)
                }));
            credits["topo"] = "<a href='https://caltopo.com' target='_blank'>Topo map by CalTopo</a>";
            break;

        case "topoworld":
            map.mapTypes.set("topoworld",
                new google.maps.ImageMapType({
                    getTileUrl: function(p, z) {
                        return "http://tile.thunderforest.com/outdoors/" +
                            z + "/" + slippyClip(p.x, z) + "/" + slippyClip(p.y, z) + ".png?apikey=bdbb04f2d5df40cbb86e9e6e1acff6f7";
                    },
                    maxZoom: 18,
                    minZoom: 3,
                    name: "TopoWorld",
                    opacity: 1,
                    tileSize: new google.maps.Size(256, 256)
                }));
            credits["topoworld"] = "<a href='http://thunderforest.com' target='_blank'>Topo map by Thunderforest</a>";
            break;

        case "estopo":
            map.mapTypes.set("estopo",
                new google.maps.ImageMapType({
                    getTileUrl: function(p, z) {
                        return "http://www.ign.es/wmts/mapa-raster?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=MTN&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX=" +
                            z + "&TILEROW=" + slippyClip(p.y, z) + "&TILECOL=" + slippyClip(p.x, z) + "&FORMAT=image%2Fjpeg";
                    },
                    maxZoom: 18,
                    minZoom: 6,
                    name: "TopoSpain",
                    opacity: 1,
                    tileSize: new google.maps.Size(256, 256)
                }));
            credits["estopo"] = "<a href='http://sigpac.mapa.es/fega/visor/' target='_blank'>Topo map by IGN</a>";
            break;
        }
    }

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
        name: "relief",
        opacity: 0.25,
        tileSize: new google.maps.Size(256, 256)
    });

    // Map Change
    google.maps.event.addListener(map,
        "maptypeid_changed",
        function () {
            if (map.getMapTypeId() == "topousa") {
                relief.setOpacity(0.60);
                map.overlayMapTypes.insertAt(0, relief);
            } else {
                if (map.overlayMapTypes.length > 0 && map.overlayMapTypes.getAt(0).name === 'relief')
                    map.overlayMapTypes.removeAt(0);
            }

            var credit = credits[map.getMapTypeId()];
            if (!!credit && !!creditDiv)
                creditDiv.innerHTML = credit;
        });
}

// set map type layers to include in the dropdown
function GetMapTypeIds() {
    var mapTypeIds = [google.maps.MapTypeId.TERRAIN];

    if (isUSAorCanada())
        mapTypeIds.push("topousa");

    if (isSpain())
        mapTypeIds.push("estopo");

    mapTypeIds.push("topoworld", google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID);

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