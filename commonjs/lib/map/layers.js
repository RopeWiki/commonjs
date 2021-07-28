
//import { map } from "../global_variables";

function SetupMapLayers() {

    // credits
    var creditDiv = document.createElement('DIV');
    creditDiv.style.cssText = "font-size:x-small;";
    map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(creditDiv);
    
    // setup map layers
    var credits = [];

    var mapLayerIds = GetMapLayerIds();

    for (var i = 0; i < mapLayerIds.length; i++) {
        switch (mapLayerIds[i]) {
            case google.maps.MapTypeId.TERRAIN:
                credits[google.maps.MapTypeId.TERRAIN] = " ";
                break;

            case google.maps.MapTypeId.ROADMAP:
                credits[google.maps.MapTypeId.ROADMAP] = " ";
                break;

            case google.maps.MapTypeId.HYBRID:
                credits[google.maps.MapTypeId.HYBRID] = " ";
                break;

            case "topousa1":
                map.mapTypes.set("topousa1", //usgs scanned
                    new google.maps.ImageMapType({
                        getTileUrl: function (p, z) {

                            //return PROTOCOL + "s3-us-west-1.amazonaws.com/caltopo/topo/" + //caltopo (retired)
                            //    z + "/" + slippyClip(p.x, z) + "/" + slippyClip(p.y, z) + ".png";

                            return PROTOCOL + "services.arcgisonline.com/arcgis/rest/services/USA_Topo_Maps/MapServer/tile/" +
                                z + "/" + slippyClip(p.y, z) + "/" + slippyClip(p.x, z);
                        },
                        maxZoom: 15,
                        minZoom: 2,
                        name: "TopoUSA1",
                        opacity: 1,
                        tileSize: new google.maps.Size(256, 256)
                    }));
                credits["topo"] = "<a href='" + PROTOCOL + "caltopo.com' target='_blank'>Topo map by CalTopo</a>";
                    break;

            case "topousa2":
                map.mapTypes.set("topousa2", //usgs vector
                    new google.maps.ImageMapType({
                        getTileUrl: function(p, z) {
                            return PROTOCOL + "basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/" +
                                z + "/" + slippyClip(p.y, z) + "/" + slippyClip(p.x, z);
                        },
                        maxZoom: 16,
                        minZoom: 2,
                        name: "TopoUSA2",
                        opacity: 1,
                        tileSize: new google.maps.Size(256, 256)
                    }));
                credits["topo"] = "<a href='" + PROTOCOL + "caltopo.com' target='_blank'>Topo map by CalTopo</a>";
                break;

            case "topoworld":
                map.mapTypes.set("topoworld",
                    new google.maps.ImageMapType({
                        getTileUrl: function(p, z) {
                            return PROTOCOL + "tile.thunderforest.com/outdoors/" +
                                z + "/" + slippyClip(p.x, z) + "/" + slippyClip(p.y, z) + ".png?apikey=bdbb04f2d5df40cbb86e9e6e1acff6f7";
                        },
                        maxZoom: 18,
                        minZoom: 2,
                        name: "TopoWorld",
                        opacity: 1,
                        tileSize: new google.maps.Size(256, 256)
                    }));
                credits["topoworld"] = "<a href='" + PROTOCOL + "thunderforest.com' target='_blank'>Topo map by Thunderforest</a>";
                break;

            case "estopo":
                map.mapTypes.set("estopo",
                    new google.maps.ImageMapType({
                        getTileUrl: function(p, z) {
                            return PROTOCOL + "www.ign.es/wmts/mapa-raster?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=MTN&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX=" +
                                z + "&TILEROW=" + slippyClip(p.y, z) + "&TILECOL=" + slippyClip(p.x, z) + "&FORMAT=image%2Fjpeg";
                        },
                        maxZoom: 18,
                        minZoom: 6,
                        name: "TopoSpain",
                        opacity: 1,
                        tileSize: new google.maps.Size(256, 256)
                    }));
                credits["estopo"] = "<a href='" + PROTOCOL + "sigpac.mapa.es/fega/visor/' target='_blank'>Topo map by IGN</a>";
                break;
        }
    }

    //keeping this code if we get access to CalTopo shaded relief layer back

    //// relief is used in conjuction with TopoUSA to provide relief shading
    //var relief = new google.maps.ImageMapType({
    //    getTileUrl: function (p, z) {
    //        return PROTOCOL + "s3-us-west-1.amazonaws.com/ctrelief/relief/" +
    //            z +
    //            "/" +
    //            slippyClip(p.x, z) +
    //            "/" +
    //            slippyClip(p.y, z) +
    //            ".png";
    //    },
    //    name: "relief",
    //    opacity: 0.25,
    //    tileSize: new google.maps.Size(256, 256)
    //});

    //// Map Change
    //google.maps.event.addListener(map,
    //    "maptypeid_changed",
    //    function () {
    //        if (map.getMapTypeId() == "topousa") {
    //            relief.setOpacity(0.60);
    //            map.overlayMapTypes.insertAt(0, relief);
    //        } else {
    //            if (map.overlayMapTypes.length > 0 && map.overlayMapTypes.getAt(0).name === 'relief')
    //                map.overlayMapTypes.removeAt(0);
    //        }

    //        var credit = credits[map.getMapTypeId()];
    //        if (!!credit && !!creditDiv)
    //            creditDiv.innerHTML = credit;
    //    });
}

// set map type layers to include in the dropdown
function GetMapLayerIds() {
    var mapLayerIds = [google.maps.MapTypeId.TERRAIN];

    if (isUSAorCanada()) {
        mapLayerIds.push("topousa1");
        mapLayerIds.push("topousa2");
    }

    if (isSpain())
        mapLayerIds.push("estopo");

    mapLayerIds.push("topoworld", google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID);

    return mapLayerIds;
}

function isUSAorCanada() {
    var embeddedMapType;
    var kmlType = document.getElementById("kmltype");
    if (kmlType != null) {
        var mapSet = kmlType.innerHTML.split('@');
        embeddedMapType = mapSet[0];
    }

    // @ts-ignore
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

function slippyClip(xy, z) {
    return xy % (1 << z);
}
