function initializemap() {
    var lasthighlight;
    tooltip = function () {
        var id = 'tooltip';
        var top = 3;
        var left = 3;
        var maxw = 300;
        var speed = 10;
        var timer = 20;
        var endalpha = 95;
        var alpha = 0;
        var tt, t, c, b, h;
        var ie = document.all ? true : false;
        return {
            show: function (v, w, highlight) {
                if (!v || v == "")
                    return;
                if (highlight && lasthighlight)
                    if (highlight.highlight && lasthighlight.highlight)
                        if (highlight.priority > lasthighlight.priority) {
                            // do not override if less priority
                            //console.log("show hide cur "+highlight.title2+highlight.description);
                            highlight.highlight.setMap(null);
                            highlight.highlight = null;
                            return;
                        }
                if (lasthighlight && highlight != lasthighlight && lasthighlight.highlight) {
                    //console.log("hide last "+lasthighlight.title2+lasthighlight.description);
                    lasthighlight.highlight.setMap(null);
                    lasthighlight.highlight = null;
                }
                //console.log("show cur "+highlight.title2+highlight.description);
                lasthighlight = highlight;
                if (tt == null) {
                    //alert("tnull");
                    tt = document.createElement('div');
                    tt.style.backgroundColor = "white";
                    tt.style.padding = "3px";
                    tt.style.position = "absolute";
                    tt.style.zIndex = 60000;
                    tt.style.fontFamily = "Arial,sans-serif";
                    tt.style.fontSize = "10px";
                    tt.setAttribute('id', id);
                    tt.className = "notranslate";
                    t = document.createElement('div');
                    t.setAttribute('id', id + 'top');
                    c = document.createElement('div');
                    c.setAttribute('id', id + 'cont');
                    b = document.createElement('div');
                    b.setAttribute('id', id + 'bot');
                    tt.appendChild(t);
                    tt.appendChild(c);
                    tt.appendChild(b);
                    document.body.appendChild(tt);
                    tt.style.opacity = 0;
                    tt.style.filter = 'alpha(opacity=0)';
                    document.onmousemove = this.pos;
                }
                tt.style.display = 'block';
                if (c) c.innerHTML = v;
                tt.style.width = w ? w + 'px' : 'auto';
                if (!w && ie) {
                    t.style.display = 'none';
                    b.style.display = 'none';
                    tt.style.width = tt.offsetWidth;
                    t.style.display = 'block';
                    b.style.display = 'block';
                }
                if (tt.offsetWidth > maxw) {
                    tt.style.width = maxw + 'px';
                }
                h = parseInt(tt.offsetHeight) + top;
                clearInterval(tt.timer);
                tt.timer = setInterval(function () {
                    tooltip.fade(1);
                }, timer);
            },
            pos: function (e) {
                var u = ie ? event.clientY + document.documentElement.scrollTop : e.pageY;
                var l = ie ? event.clientX + document.documentElement.scrollLeft : e.pageX;
                tt.style.top = (u - h) + 'px';
                tt.style.left = (l + left) + 'px';
            },
            fade: function (d) {
                var a = alpha;
                if ((a != endalpha && d == 1) || (a != 0 && d == -1)) {
                    var i = speed;
                    if (endalpha - a < speed && d == 1) {
                        i = endalpha - a;
                    } else if (alpha < speed && d == -1) {
                        i = a;
                    }
                    alpha = a + (i * d);
                    tt.style.opacity = alpha * 0.01;
                    tt.style.filter = 'alpha(opacity=' + alpha + ')';
                } else {
                    clearInterval(tt.timer);
                    if (d == -1) {
                        tt.style.display = 'none';
                    }
                }
                //console.log(tt.style.opacity);
            },
            hide: function (highlight) {
                if (highlight)
                    if (highlight != lasthighlight) {
                        //console.log("hide not cur "+highlight.title2+highlight.description);
                        return;
                    }
                //console.log("hide cur "+(highlight ? (highlight.title2+highlight.description) : "NULL"));
                if (typeof tt != "undefined") {
                    if (tt.timer) {
                        clearInterval(tt.timer);
                    }
                    tt.timer = setInterval(function () {
                        tooltip.fade(-1);
                    }, timer);
                }
            }
        };
    }();

    var mapbox = document.getElementById("mapbox");
    if (!mapbox) return;


    /* Map Setup */
    var mapOptions = {
        /*
        draggable: $(document).width() > 480 ? true : false;,
        panControl: true,
        scrollwheel: false,
        */

        zoom: 13,
        scaleControl: true,
        keyboardShortcuts: false,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControl: true,
        mapTypeControlOptions: {
            mapTypeIds: ['topo', 'wtopo', 'wtopoesri', 'ocm', google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.HYBRID, 'wsatesri', 'mxtopo', 'estopo', 'frtopo', 'chtopo', 'nztopo'],
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_RIGHT,
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER,
        },

        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER,
        },
    };


// cover
    var coverDiv = document.createElement('DIV');
    coverDiv.id = "mapcover";
    coverDiv.className = "gmnoprint";
    coverDiv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;background-color:transparent;border-color:yellow;border-style: inset;border-width:2px';
    $(coverDiv).on('click', function (e) {
        //$("#mapbox").trigger(e);
        toggleFullScreen(true);
    });

    // credits
    var creditDiv = document.createElement('DIV');
    creditDiv.style.cssText = "font-size:x-small;";

    var credits = [];
    map = new google.maps.Map(mapbox, mapOptions);
    map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(creditDiv);

    // custom map
    credits[google.maps.MapTypeId.TERRAIN] = " ";
    credits[google.maps.MapTypeId.HYBRID] = " ";
    var relief = new google.maps.ImageMapType({
        getTileUrl: function (p, z) {
            return "http://s3-us-west-1.amazonaws.com/ctrelief/relief/" + z + "/" + CLIP(p.x, z) + "/" + CLIP(p.y, z) + ".png"
        }, maxZoom: 16, name: "Topo", opacity: 0.25, tileSize: new google.maps.Size(256, 256)
    });
    map.mapTypes.set("topo", new google.maps.ImageMapType({
        getTileUrl: function (p, z) {
            return "http://s3-us-west-1.amazonaws.com/caltopo/topo/" + z + "/" + CLIP(p.x, z) + "/" + CLIP(p.y, z) + ".png"
        }, maxZoom: 16, name: "TopoUSA", opacity: 1, tileSize: new google.maps.Size(256, 256)
    }));
    credits["topo"] = "<a href='https://caltopo.com' target='_blank'>Topo map by CalTopo</a>";
    map.mapTypes.set("ocm", new google.maps.ImageMapType({
        getTileUrl: function (p, z) {
            return "http://tile.opencyclemap.org/cycle/" + z + "/" + CLIP(p.x, z) + "/" + CLIP(p.y, z) + ".png"
        }, maxZoom: 18, name: "OpenCycle", opacity: 1, tileSize: new google.maps.Size(256, 256)
    }));
    credits["ocm"] = "<a href='http://thunderforest.com' target='_blank'>Topo map by Thunderforest</a>";
//  map.mapTypes.set("wtopo", new google.map.ImageMapType({getTileUrl: function(p,z) { return "http://a.tile.opentopomap.org/" + z + "/" + CLIP(p.x,z) + "/" + CLIP(p.y,z) + ".png" }, maxZoom: 18, name: "TopoWorld", opacity: 1, tileSize: new google.map.Size(256,256)}) );
//  credits["wtopo"] = "<a href='http://oprntopomap.org' target='_blank'>Topo map by OpenTopoMap</a>";
    map.mapTypes.set("wtopo", new google.maps.ImageMapType({
        getTileUrl: function (p, z) {
            return "http://tile.thunderforest.com/outdoors/" + z + "/" + CLIP(p.x, z) + "/" + CLIP(p.y, z) + ".png?apikey=bdbb04f2d5df40cbb86e9e6e1acff6f7"
        }, maxZoom: 18, name: "TopoWorld", opacity: 1, tileSize: new google.maps.Size(256, 256)
    }));
    credits["wtopo"] = "<a href='http://thunderforest.com' target='_blank'>Topo map by Thunderforest</a>";
    map.mapTypes.set("wtopoesri", new google.maps.ImageMapType({
        getTileUrl: function (p, z) {
            return "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/" + z + "/" + CLIP(p.y, z) + "/" + CLIP(p.x, z) + ".png"
        }, maxZoom: 18, name: "TopoESRI", opacity: 1, tileSize: new google.maps.Size(256, 256)
    }));
    credits["wtopoesri"] = "<a href='http://arcgisonline.com' target='_blank'>Topo map by ESRI</a>";
    map.mapTypes.set("wsatesri", new google.maps.ImageMapType({
        getTileUrl: function (p, z) {
            return "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/" + z + "/" + CLIP(p.y, z) + "/" + CLIP(p.x, z) + ".png"
        }, maxZoom: 18, name: "SatESRI", opacity: 1, tileSize: new google.maps.Size(256, 256)
    }));
    credits["wsatesri"] = "<a href='http://arcgisonline.com' target='_blank'>Sat map by ESRI</a>";
    map.mapTypes.set("estopo", new google.maps.ImageMapType({
        getTileUrl: function (p, z) {
            return "http://www.ign.es/wmts/mapa-raster?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=MTN&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX=" + z + "&TILEROW=" + CLIP(p.y, z) + "&TILECOL=" + CLIP(p.x, z) + "&FORMAT=image%2Fjpeg"
        }, maxZoom: 17, name: "TopoSpain", opacity: 1, tileSize: new google.maps.Size(256, 256)
    }));
    credits["estopo"] = "<a href='http://sigpac.mapa.es/fega/visor/' target='_blank'>Topo map by IGN</a>";
    map.mapTypes.set("frtopo", new google.maps.ImageMapType({
        getTileUrl: function (p, z) {
            return "http://RopeWiki:b%40VM709c6Jix@wxs.ign.fr/8m34uuspdybhi9t89lpoeyfl/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX=" + z + "&TILEROW=" + CLIP(p.y, z) + "&TILECOL=" + CLIP(p.x, z)
        }, maxZoom: 16, name: "TopoFrance", opacity: 1, tileSize: new google.maps.Size(256, 256)
    }));
    credits["frtopo"] = "<a href='http://www.geoportail.gouv.fr' target='_blank'>Topo map by Geoportail</a>";
    map.mapTypes.set("mxtopo", new google.maps.ImageMapType({
        getTileUrl: function (p, z) {
            return "http://gaiamapas1.inegi.org.mx/mdmCache/service/wms?LAYERS=MapaBaseTopograficov61_consombreado&FORMAT=image/jpeg&MINZOOMLEVEL=5&ZOOMOFFSET=5&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&SRS=EPSG:900913&BBOX=" + WmsBox(Box(CLIP(p.x, z), CLIP(p.y, z), z, 256), true, false) + "&WIDTH=256&HEIGHT=256"
        }, maxZoom: 16, name: "TopoMexico", opacity: 1, tileSize: new google.maps.Size(256, 256)
    }));
    credits["mxtopo"] = "<a href='http://gaia.inegi.org.mx/mdm6/' target='_blank'>Topo map by INEGI</a>";
    map.mapTypes.set("nztopo", new google.maps.ImageMapType({
        getTileUrl: function (p, z) {
            return z < 13 ? "http://tiles-2.topomap.co.nz/tiles-topo250/" + z + "-" + CLIP(p.x, z) + "-" + TYZ(CLIP(p.y, z), z) + ".png" : "http://tiles-2.topomap.co.nz/tiles-topo50/" + z + "-" + CLIP(p.x, z) + "-" + TYZ(CLIP(p.y, z), z) + ".png"
        }, maxZoom: 15, name: "TopoNewZealand", opacity: 1, tileSize: new google.maps.Size(256, 256)
    }));
    credits["nztopo"] = "<a href='http://www.topomap.co.nz/' target='_blank'>Topo map by Topomap.co.nz</a>";
    map.mapTypes.set("chtopo", new google.maps.ImageMapType({
        getTileUrl: function (p, z) {
            return "http://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/" + z + "/" + p.x + "/" + p.y + ".jpeg"
        }, maxZoom: 18, name: "TopoSwiss", opacity: 1, tileSize: new google.maps.Size(256, 256)
    }));
    credits["chtopo"] = "<a href='http://map.geo.admin.ch' target='_blank'>Topo map by Swisstopo</a>";

    // Map Change
    google.maps.event.addListener(map, "maptypeid_changed", function () {
        map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();
        if (map.getMapTypeId() == "topo")
            map.overlayMapTypes.setAt(0, relief);
        else
            map.overlayMapTypes.clear();
        var credit = credits[map.getMapTypeId()];
        if (!!credit && !!creditDiv)
            creditDiv.innerHTML = credit;
    })

    // Map out
    google.maps.event.addListener(map, 'mouseout', function () {
        mapcover();
    });

    // set map type from "kmltype"
    var maptype = document.getElementById("kmltype");
    if (maptype != null) {
        var mapset = maptype.innerHTML.split('@');
        if (mapset.length > 1)
            map.mapTypes[mapset[0]].maxZoom = parseInt(mapset[1]);
        map.setMapTypeId(mapset[0]);
    }


    // Tiles loaded
    loadingtiles = true;
    console.log("loadingtiles true");
    google.maps.event.addListener(map, 'tilesloaded', function (evt) {
        setTimeout(function () {
            loadingtiles = false;
            console.log("loadingtiles false");
        }, 5000);
    });
    google.maps.event.addListener(map, 'bounds_changed', function (evt) {
        loadingtiles2 = true;
        console.log('loadingtiles2 true');
    });
    google.maps.event.addListener(map, 'idle', function (evt) {
        setTimeout(function () {
            loadingtiles2 = false;
            console.log("loadingtiles2 false");
        }, 5000);
    });

    boundslist = new google.maps.LatLngBounds();

    var kmlmap;


    // set marker (if any) from "kmlmarker"
    var kmlmarker = document.getElementById("kmlmarker");
    if (kmlmarker != null) {
        console.log('kmlmarker');
        var coords = kmlmarker.innerHTML.split(",");
        if (coords != null && coords.length > 1) {
            kmlmap = "kmlmarker";
            setmarker(coords[0], coords[1], 0);
            map.setZoom(13);
            var latlng = new google.maps.LatLng(coords[0], coords[1]);
            map.panTo(latlng);

            var elevationdiv = document.getElementById('elevationdiv');
            if (elevationdiv)
                getgeoelevation(latlng, "elevationdiv", ' ~');

            //console.log('zoompanTo '+coords[0]+","+coords[1]+" obj="+new google.map.LatLng(coords[0], coords[1]));
            //map.panToBounds(bounds);
        }
    }


    var kmlrect = document.getElementById("kmlrect");
    if (kmlrect != null) {
        var coords = kmlrect.innerHTML.split(',');
        if (coords != null && coords.length > 1) {
            kmlmap = "kmlrect";

            var maprectangle = new google.maps.Rectangle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.5,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.05,
                map: map,
                bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(coords[0], coords[1]),
                    new google.maps.LatLng(coords[2], coords[3])),
                draggable: false,
                clickable: false,
                optimized: false
            });
            boundslist = maprectangle.getBounds()
            map.fitBounds(boundslist);
            map.panToBounds(boundslist);
            if (coords.length > 4) {
                setTimeout(function () {
                    map.setZoom(parseInt(coords[4]));
                }, 1000);
            }
        }
    }

    var kmlcircle = document.getElementById("kmlcircle");
    if (kmlcircle != null) {
        var coords = kmlcircle.innerHTML.split(',');
        if (coords != null && coords.length > 1) {
            kmlmap = "kmlcircle";
            var circleopt = {
                strokeColor: '#FF0000',
                strokeOpacity: 0.5,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.05,
                map: map,
                center: new google.maps.LatLng(coords[0], coords[1]),
                radius: Number(coords[2]),
                draggable: false,
                clickable: false,
                optimized: false
            };
            // Add the circle for this city to the map.
            setmarker(coords[0], coords[1], 90000);

            if (kmlrect == null) {
                var mapcircle = new google.maps.Circle(circleopt);
                boundslist = mapcircle.getBounds()
            }

            map.fitBounds(boundslist);
            map.panToBounds(boundslist);
        }
    }


    kmlsummary = document.getElementById("kmlsummary");
    var kmllist = document.getElementById("kmllist");
    if (kmllist != null) {
        var kmlicons = document.getElementById("kmlicons");
        if (kmlicons != null)
            kmliconlist = kmlicons.innerHTML.split(',');
        kmlmap = "kmllist";
        var list = kmllist.innerHTML.split('&amp;').join('').split(';');
        var objlist = [];
        for (var i = 0; i < list.length; ++i) {
            if (list[i] == null) continue;
            if (list[i].length <= 0) continue;

            var line = list[i].split(',');
            if (line == null) continue;

            var lat = parseFloat(line[1]);
            var lng = parseFloat(line[2]);
            if (isNaN(lat) || isNaN(lng)) // error checking
                continue;

            var obj = {id: urldecode(line[0]), location: {lat: lat, lng: lng}};
            if (line.length > 3) {
                obj.q = Number(line[3]);
                if (line.length > 6)
                    obj.icon = kmliconlist[Number(line[6]) * 6 + obj.q];
            }
            // numeric icons
            if (kmlsummary)
                if (obj.id[0] == '#') {
                    //var colors = [ "666666", "7b6434", "b2882c", "f6b114", "f78931", "f74c24" ];
                    var num = obj.id.slice(1).split(' ')[0];
                    obj.icon = 'https://sites.google.com/site/rwicons/bg' + obj.q + '_' + num + '.png';
                    //iconm = 'https://chart.apis.google.com/chart?chst=d_text_outline&chld='+colors[Number(line[3])]+'|12|h|000000|b|'+parseInt(num);
                }
            if (line.length > 4)
                obj.description = urldecode(line[4]);
            if (line.length > 5)
                obj.thumbnail = line[5];
            objlist.push(obj)
        }
        loadlist(objlist, true);
    }

    var kmllistquery = document.getElementById("kmllistquery");
    if (kmllistquery != null) {
        kmlmap = "kmllistquery";
        kmllist = kmllistquery;
        kmllisturl = SITE_BASE_URL + '/api.php?action=ask&format=json&query=' + kmllistquery.innerHTML + '|%3FHas_coordinates|%3FHas_star_rating|%3FHas_summary|%3FHas_banner_image_file|%3FHas_location_class|%3FHas_KML_file|limit=100';
        tablelisturl = window.location.href.toString();
        tablelisturl = tablelisturl.split('#')[0];
        //tablelisturl = SITE_BASE_URL + '/California';
        tablelisturl += (tablelisturl.indexOf('?') < 0 ? '?' : '&') + 'nomapchk=on';

        // load dynamic query
        var loctotaldiv = document.getElementById("loctotal");
        if (loctotaldiv) {
            var loctotal = loctotaldiv.innerHTML;
            if (loctotal > 0) ;
            morekmllist(0, loctotal);
        }
    }


    // set kml (if any) from "kmlfile"
    var layer;
    var kmlfile = document.getElementById("kmlfile");
    if (kmlfile != null && !layer) {
        var file = kmlfile.innerHTML;
        if (file != null && file.length > 0) {
            kmlmap = "kmlfile";
            layer = new google.maps.KmlLayer(file);
            layer.setMap(map);
        }
    }


    // spiderfy summary to avoid overlapping icons
    if (kmlsummary != null) {

        function spiderfy(srepeat) {
            loadingquery2 = true;
            console.log("loadingquery2 true");

            var step = 1; // pixel step
            var isize2 = 26 / 2;  // icon size
            var osize = 16; // no overlapping size
            if (srepeat == null)
                srepeat = 100; // repeat


            // get map stats
            var scale = Math.pow(2, map.getZoom());
            var proj = map.getProjection();
            var bounds = map.getBounds();
            if (!proj || !bounds) {
                console.log("null proj");
                return;
            }
            //console.log("bounds NE "+bounds.getNorthEast()+" SW "+bounds.getSouthWest());
            //console.log("bounds NE.lat "+bounds.getNorthEast().lat()+" SW,lng "+bounds.getSouthWest().lng());
            var nwll = new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng());
            //console.log("nwll "+nwll);
            var nw = proj.fromLatLngToPoint(nwll);

            //console.log("nw "+nw);

            function fromLatLngToPixel(position) {
                var point = proj.fromLatLngToPoint(position);
                return new google.maps.Point(
                    Math.floor((point.x - nw.x) * scale),
                    Math.floor((point.y - nw.y) * scale));
            }

            function fromPixelToLatLng(pixel) {
                var point = new google.maps.Point();
                point.x = pixel.x / scale + nw.x;
                point.y = pixel.y / scale + nw.y;
                return proj.fromPointToLatLng(point);
            }


            // compute pixel locations
            for (var i = 0; i < markers.length; i++) {
                var m = markers[i];
                m.p = fromLatLngToPixel(m.oposition);
                m.p.y += isize2; // move center
                //console.log(m.name+":"+m.p+" <- "+m.oposition);
            }

            // reposition icons to avoid overlap
            // use incremental global approach
            var overlap = true;
            for (var r = 0; r < srepeat && overlap; ++r) {
                overlap = false;
                for (var i = 0; i < markers.length; i++)
                    for (var j = i + 1; j < markers.length; j++)
                        if (i != j) {
                            // if overlap, move
                            var dx = markers[i].p.x - markers[j].p.x;
                            var dy = markers[i].p.y - markers[j].p.y;
                            var adx = (dx < 0 ? -dx : dx);
                            var ady = (dy < 0 ? -dy : dy);
                            if (adx < osize && ady < osize) {
                                //if (markers[i].name.substr(0,3)=='#08' || markers[j].name.substr(0,3)=='#08') //debug
                                //    console.log("["+i+"] "+markers[i].name+" x ["+j+"] "+markers[j].name+" dx:"+dx+" dy:"+dy);
                                if (adx < osize)
                                    if (dx > 0) {
                                        markers[i].p.x += step;
                                        markers[j].p.x -= step;
                                        overlap = true;
                                    } else {
                                        markers[i].p.x -= step;
                                        markers[j].p.x += step;
                                        overlap = true;
                                    }
                                if (ady < osize)
                                    if (dy > 0) {
                                        markers[i].p.y += step;
                                        markers[j].p.y -= step;
                                        overlap = true;
                                    } else {
                                        markers[i].p.y -= step;
                                        markers[j].p.y += step;
                                        overlap = true;
                                    }
                            }
                        }
            }
            console.log("repetitions:" + r + " overlap:" + overlap + " os:" + osize + " st:" + step);

            // compute marker locations
            for (var i = 0; i < markers.length; i++) {
                var m = markers[i];
                m.p.y -= isize2; // move center
                var pos = fromPixelToLatLng(m.p);
                //console.log(""+m.name+":"+m.p+" -> "+pos.lat()+","+pos.lng());
                var ll = {lat: parseFloat(pos.lat()), lng: parseFloat(pos.lng())};
                if (!isNaN(ll.lat) && !isNaN(ll.lng)) // error checking
                    m.setPosition(ll);
                else
                    console.log("error " + m.name + ":" + m.p + " -> " + ll.lat + "," + ll.lng);
            }
            setTimeout(function () {
                loadingquery2 = false;
                console.log("loadingquery2 false");
            }, 5000);
        }

        google.maps.event.addListener(map, "zoom_changed", spiderfy);
        //google.map.event.addListener(map, "projection_changed", spiderfy);
        /* //Debug
        var customrepeat = 0;
        $(document).keydown(function(event) { //'#mapbox'
              switch(event.which) {
                case 88: // X
                    if (customrepeat<50)
                       ++customrepeat;
                    spiderfy(customrepeat);
                    break;
                case 90: // Z
                    if (customrepeat>0)
                       --customrepeat;
                    spiderfy(customrepeat);
                    break;
              }
        });
        */
    }


    // null map
    if (kmlmap == null) {
        var myLatlng = new google.maps.LatLng(0, 0);
        var infowindowm = new google.maps.InfoWindow({content: "UNKNOWN LOCATION"});
        var marker = new google.maps.Marker({position: myLatlng, map: map, infowindow: infowindowm, optimized: false});
        marker.infowindow.open(map, marker);
        google.maps.event.addListener(marker, 'click', function () {
            this.infowindow.open(map, this);
        });
        map.panTo(myLatlng);
        map.setZoom(2);
        map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
    }

    // set kml (if any) from "kmlfile"
    var kmltitle = document.getElementById("kmltitle");
    if (kmltitle != null) {
        var controlsDiv = document.createElement('DIV');
        controlsDiv.style.margin = "4px 4px 4px 4px";
        //controlsDiv.style.fontSize = "big";
        controlsDiv.innerHTML = '<img src="https://chart.apis.google.com/chart?chst=d_text_outline&chld=000000|32|h|FFFFFF|b|' + urlencode(kmltitle.innerHTML) + '"/>';
        //"<h2>"+kmltitle.innerHTML+"</h2>";
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(controlsDiv);
    }


    // add special controls
    {
        var spstart = '<div class="gmnoprint maptopcontrols">', spend = '</div>';
        //var controls = '<div style="position:absolute;left:0;right:0;width:99%;height:99%;border-color:red;border-width:50px;border-style: solid;background-color:transparent"></div>';
        //var controls = spstart+'<label><input class="gmnoprint" id="fullscreenchk" type="checkbox" onclick="toggleFullScreen()">Full Screen&nbsp;</label>'+spend;
        var controls = spstart + '<img class="gmnoprint" id="fullscreenchk" onclick="toggleFullScreen()" title="Full Screen" src="' + SITE_BASE_URL + '/images/b/b9/FullscreenIcon.png">' + spend;
        if (kmllist) {
            /*
            // Cluster Engine
            // http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/docs/reference.html
            $.getScript("http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/src/markerclusterer.js", function(){
              //alert("Script loaded and executed.");
            });
           //controls += spstart+'<label><input class="gmnoprint" id="clusterchk" type="checkbox" onclick="toggleCluster()">Cluster&nbsp;</label>'+spend;
            */

            controls += spstart + '<label><input class="gmnoprint" id="routeschk" type="checkbox" onclick="toggleRoutes()">Show&nbsp;KML&nbsp;</label>' + spend;

            // map search
            if (document.getElementById('locsearch')) {
                var controlsDiv2 = document.createElement('DIV');
                controlsDiv2.innerHTML = '<div id="searchmap"><span id="searchinfo"></span><button type="search" value="" onclick="searchmap()">Search Map</button></div>';
                map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlsDiv2);
                searchmaprectangle = new google.maps.Rectangle({
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.5,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.05,
                    bounds: new google.maps.LatLngBounds(
                        new google.maps.LatLng(0, 0),
                        new google.maps.LatLng(0, 0)),
                    draggable: false,
                    clickable: false,
                    optimized: false
                });


                map.addListener('click', function (e) {
                    if (searchmapn >= 0) {
                        var marker = new google.maps.Marker({position: e.latLng, map: map, optimized: false});
                        searchmappt.push(e.latLng);
                        ++searchmapn;
                        var bounds = new google.maps.LatLngBounds();
                        bounds.extend(searchmappt[0]);
                        bounds.extend(searchmappt[searchmappt.length >= 2 ? 1 : 0]);
                        searchmaprectangle.setBounds(bounds);
                        searchmaprectangle.setMap(map);
                        if (searchmapn >= 2)
                            searchmaprun();
                    }
                });
                map.addListener('mousemove', function (e) {
                    if (searchmapn > 0 && searchmapn < 2) {
                        var bounds = new google.maps.LatLngBounds();
                        bounds.extend(searchmappt[0]);
                        bounds.extend(e.latLng);
                        searchmaprectangle.setBounds(bounds);
                        searchmaprectangle.setMap(map);
                    }

                });
            }

        } else {
            if (kmltitle)
                controls += spstart + '<label><input class="gmnoprint" id="labelschk" type="checkbox" onclick="toggleLabels()" ' + (labels ? 'checked' : '') + '>TrkLabels&nbsp;</label>' + spend;
        }
        //controls += spstart+'<label><input class="gmnoprint" id="metricchk" type="checkbox" onclick="toggleMetric()" '+(metric ? 'checked' : '')+'>Metric&nbsp;</label>'+spend;
        var controlsDiv = document.createElement('DIV');
        controlsDiv.style.cssText = "z-index:9999;";
        controlsDiv.innerHTML = controls;
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlsDiv);
    }
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(coverDiv);

    // set kml (if any) from "kmlfile"
    var kmlfilep = document.getElementById("kmlfilep");
    if (kmlfilep != null) {
        loadingkml = true;
        console.log('loadingkml true');

        var file = kmlfilep.innerHTML;
        var filelink = "";
        if (file != null && file.length > 0) {
            kmlmap = "kmlfilep";
            var mapbox = "#mapbox";
            var mapsidebar = "mapsidebar";

            var bskmlfile = document.getElementById("bskmlfile");
            if (bskmlfile != null) {
                var sourceDiv = document.createElement('DIV');
                var text = '<div class = "dropDownOptionsDiv" id="myddOptsDiv">'
                file = file.split("&amp;").join("&");
                var selection = bskmlfile.innerHTML.toString().split("&amp;").join("&").split(',');
                if (urldecode(file).indexOf(urldecode(selection[0])) < 0)
                    selection.unshift(file);
                var domains = [];
                for (var i = 0; i < selection.length; ++i) {
                    var style = "";
                    var link = selection[i];
                    if (noextraction(link))
                        style = "color:red;";
                    var counter = 0;
                    var domain = getdomain(link);
                    domains.push(domain);
                    for (var d = 0; d < domains.length; ++d)
                        if (domains[d] == domain)
                            ++counter;
                    if (counter > 1)
                        domain += "#" + counter;
                    text += '<div class="dropDownItemDiv" onClick="loadSource(\'' + link + '\',\'' + domain + '\')" style="' + style + '">' + domain + '</div>';
                }
                var big = document.getElementsByTagName('BIG');
                if (big && big.length > 0 && selection.length > 1) {
                    var link = urlencode(big[0].innerHTML);
                    text += '<div class="dropDownItemDiv" onClick="loadSource(\'' + link + '\',\'ALL COMBINED\')" style="font-weight:bold">ALL COMBINED</div>';
                }
                text += '</div>';
                var name = getdomain(selection[0]);
                text += '<div class="dropDownControl" onclick="(document.getElementById(\'myddOptsDiv\').style.display == \'block\') ? document.getElementById(\'myddOptsDiv\').style.display = \'none\' : document.getElementById(\'myddOptsDiv\').style.display = \'block\';"><span id="myddOptsText">' + name + '</span><img class="dropDownArrow" src="http://map.gstatic.com/mapfiles/arrow-down.png"/></div>';
                lastlinks.push(filelink = selection[0]);

                sourceDiv.className = "dropDownControlDiv";
                sourceDiv.style.zIndex = 1000;
                sourceDiv.innerHTML = text;
                map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(sourceDiv);
                //document.body.appendChild(sourceDiv);

                if (selection.length < 2)
                    sourceDiv.style.display = "none";
            }

            var sidebar = document.createElement('div');
            sidebar.setAttribute('id', mapsidebar);
            sidebar.className = "notranslate";
            document.body.appendChild(sidebar);


            var controlsDiv = document.createElement('DIV');
            controlsDiv.innerHTML = '<div id="legendbar"><label><input class="gmnoprint" id="legendchk" type="checkbox" onclick="toggleLegend()"><span id="legendlabel">Legend</span></label><br><div id="legend" class="notranslate"></div></div><div id="loadlinks"></div>';


            map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlsDiv);
            controlsDiv.style.maxHeight = "90%";
            controlsDiv.style.overflow = "auto";
            controlsDiv.style.zIndex = 999;
            controlsDiv.style.marginRight = "5px";


            function geoxmlinitp() {
                // Here you can use anything you defined in the loaded script
                //alert("script loaded");
                //map.panTo(new google.map.LatLng(0, 0));
                gxml = new GeoXml("gxml", map, "", {
                    sidebarid: mapsidebar,
                    sortbyname: true,
                    //publishdirectory:"http://www.dyasdesigns.com/tntmap/",
                    //iwwidth:280,
                    //iwmethod:"mouseover",
                    //nolegend:false,
                    simplelegend: true,
                    suppressallfolders: true,
                    //sidebarsnippet:true,
                    showArrows: true,
                    showLabels: true,
                    showRouteLabels: labels && kmltitle,
                    showElevation: labels && kmltitle,
                    directions: true,
                    dohilite: true,
                    allfoldersopen: true,
                    hilite: {color: "#aaffff", opacity: 0.8, width: 10, textcolor: "#000000"} //, c0c0ff
                });
                // avoid race conditions between map and geoxml
                google.maps.event.addListener(gxml, "loaded", function () {
                    //console.log("event:kml loaded");
                    setTimeout(function () {
                        loadingkml = false;
                        console.log("loadingkml false");
                    }, 5000);

                    if (document.getElementById("hidelegend") == null || showLegend) {
                        var interval = setInterval(function () {
                            if (document.getElementById("legend") != null) {
                                toggleLegend(true);
                                var wlegend = $("#legendbar").width();
                                var hlegend = $("#legendbar").height();
                                var wmap = $("#mapbox").width();
                                var hmap = $("#mapbox").height();
                                if (wlegend * hlegend > wmap * hmap / 4)
                                    toggleLegend(false);
                                clearInterval(interval);
                                //console.log("legend is here!");
                            }
                        }, 500);
                    }

                });
                gxml.load(file, filelink);
            }

            if ((typeof staticscripts) == 'undefined')
                $.getScript((typeof geoxmljs) != 'undefined' ? geoxmljs : geturl(SITE_BASE_URL + "/index.php?title=MediaWiki:Geoxml.js&action=raw&ctype=text/javascript"), geoxmlinitp);
            else
                setTimeout(geoxmlinitp, 100);
        }
    }


    // set kml (if any) from "kmlfile"
    var kmlfilew = document.getElementById("kmlfilew");
    if (kmlfilew != null) {
        var file = kmlfilew.innerHTML;
        if (file != null && file.length > 0) {
            kmlmap = "kmlfilew";
            var mapbox = "#mapbox";


            function geoxmlinitw() {
                // Here you can use anything you defined in the loaded script
                //alert("script loaded");
                //map.panTo(new google.map.LatLng(0, 0));
                gxml = new GeoXml("gxml", map, "", {
                    //sidebarid:mapsidebar,
                    //publishdirectory:"http://www.dyasdesigns.com/tntmap/",
                    //iwwidth:280,
                    //iwmethod:"mouseover",
                    //nolegend:false,
                    nozoom: true,
                    simplelegend: true,
                    suppressallfolders: true,
                    //sidebarsnippet:true,
                    showArrows: false,
                    showLabels: false,
                    patchIcons: true,
                    showRouteLabels: false,
                    directions: false,
                    dohilite: false,
                    //allfoldersopen:true,
                    hilite: {color: "#aaffff", opacity: 0.8, width: 10, textcolor: "#000000"} //, c0c0ff
                });
                gxml.load(file, file);
            }

            if ((typeof staticscripts) == 'undefined')
                $.getScript((typeof geoxmljs) != 'undefined' ? geoxmljs : geturl(SITE_BASE_URL + "/index.php?title=MediaWiki:Geoxml.js&action=raw&ctype=text/javascript"), geoxmlinitw);
            else
                setTimeout(geoxmlinitw, 100);
        }
    }

    setTimeout(function () {
        loadingmap = false;
        console.log("loadingmap false");
    }, 5000);

    $('#mapbox').mouseover(function (event) {
        handlekeys = true;
    });

    $('#mapbox').mouseout(function (event) {
        handlekeys = false;
        mapcover();
    });

    $('#mapbox').mousedown(function (event) {
        // prevent text selection on doubleclick
        event.preventDefault();
    });

    // keyboard shortcut handler
    $(document).keydown(function (event) { //'#mapbox'
        if (handlekeys) {
            var z = 1;
            var o = 128; // half a tile's width
            switch (event.which) {
                case 37: // leftArrow
                    map.panBy(-o, 0);
                    return false;
                case 38: // upArrow
                    map.panBy(0, -o);
                    return false;
                case 39: // rightArrow
                    map.panBy(o, 0);
                    return false;
                case 40: // downArrow
                    map.panBy(0, o);
                    return false;
                case 109: // numpad -
                case 189: // -
                    map.setZoom(z = map.getZoom() - 1);
                    return false;
                case 107: // numpad +
                case 187: // =
                    map.setZoom(z = map.getZoom() + 1);
                    return false;
                case 27: // Esc
                case 8: // Backspace
                    if (toggleFS != null)
                        backFullScreen();
                    return false;
                default:
                    //alert("key:"+event.which);
                    break;
            }
        }
    });


    // in case window gets resized
    $(window).resize(function () {
        if (toggleFS != null)
            toggleFullScreen(true);
        else
            centermap();
        smallstyle();
        mapcover();
    });

}

function waterflowinit()
{
    waterflow();
}

function loadMapInterface() {
    var elem = document.getElementById("mapbox");
    if (elem == null) {
        loadingmap = false;
        $('.locateicon').hide();
        console.log("loadingmap none");
        return;
    }


    if ((typeof staticscripts) == 'undefined') {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://www.google.com/jsapi";
        document.body.appendChild(script);

        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyDdkcexZV-p5Nj8RwgLYTcegm5jorJpbyw&callback=initializemap";
        document.body.appendChild(script);
        //initializemap();
    } else
        initializemap();

    // recent pictures
    pictureinit()

    // waterflow
    var table = document.getElementById('waterflow-table');
    if (!table) return;
    if ((typeof staticscripts) == 'undefined')
        $.getScript((typeof waterflowjs) != 'undefined' ? waterflowjs : geturl(SITE_BASE_URL + "/index.php?title=MediaWiki:Waterflow.js&action=raw&ctype=text/javascript"), waterflowinit);
    else
        setTimeout(waterflowinit, 100);
}

function loadmapScript() {
    //console.log("0");
    smallstyle();
    //console.log("1");
    loadSkin();
    //console.log("2");
    loadEditor();
    //console.log("3");
    loadFacebook();
    //console.log("4");
    loadMapInterface();
    //console.log("5");
    loadUserInterface(document);
    loadFormInterface();
    loadTranslation();
    var transtimer = setInterval(function () {
        loadTranslation();
    }, 2000);
    // tranlsate script
    //$.getScript("//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);
}

function loadSource(link, domain) {
    var optdiv = document.getElementById("myddOptsDiv");
    var opttext = document.getElementById("myddOptsText");
    if (!opttext || !optdiv)
        return;
    optdiv.style.display = "none";
    opttext.innerHTML = domain;

    gxml.overlayman.Hide();

    // set up new KML
    var isropewiki = link.indexOf(SITE_HOSTNAME) >= 0;
    var kmlfile = link;
    if (!isropewiki)
        kmlfile = LUCA_BASE_URL + '/rwr?gpx=off&filename=tmp&kmlnfx&kmlx=' + kmlfile;

    var kmlfilep = document.getElementById("kmlfilep");
    if (kmlfilep)
        kmlfilep.innerHTML = kmlfile;

    if (lastlinks.indexOf(link) >= 0) {
        // display pre-loaded kml
        gxml.overlayman.Show(link);
    } else {
        gxml.load(kmlfile, link);
        lastlinks.push(link);
    }

    // display warning or hide it for ropewiki
    var noex = noextraction(link);
    var dlist = ["rw", "ex", "noex"]
    var dshow = [isropewiki, !isropewiki && !noex, !isropewiki && noex];
    for (var i = 0; i < dlist.length; ++i) {
        var elem = document.getElementsByClassName('display' + dlist[i]);
        for (var e = 0; e < elem.length; ++e)
            elem[e].style.display = dshow[i] ? "block" : "none";
    }

    // change links
    var dlist2 = ["ex", "noex"]
    for (var i = 0; i < dlist2.length; ++i) {
        var elem = document.getElementsByClassName('display' + dlist2[i]);
        for (var e = 0; e < elem.length; e++) {
            var links = elem[e].getElementsByTagName('A');
            for (var l = 0; l < links.length; ++l) {
                var clink = links[l].href;
                if (clink.indexOf("caltopo.com") > 0) {
                    var prefix = "kmlx%253D";
                    var postfix = "ext%253D.kml";
                    var start = clink.indexOf(prefix);
                    var end = clink.indexOf(postfix, start + 1);
                    links[l].href = clink.substr(0, start + prefix.length) + urlencode(link + '&') + clink.substr(end);
                } else if (clink.indexOf(LUCA_HOSTNAME) > 0) {
                    var prefix = "kmlx%3D";
                    var postfix = "ext%3D.kml";
                    var start = clink.indexOf(prefix);
                    var end = clink.indexOf(postfix, start + 1);
                    links[l].href = clink.substr(0, start + prefix.length) + link + '&' + clink.substr(end);
                } else if (clink.indexOf("/Map?pagename=") < 0) {
                    links[l].href = link;
                    links[l].innerHTML = domain;
                }

            }
        }
    }
}
