function initializemap() {

    if ($("#kmllistquery").length === 0) 
        loadStaticMap();
    else
        loadInteractiveMap();
}

function loadStaticMap() {
    var mapbox = document.getElementById("mapbox");
    if (!mapbox) return;

    var url = "https://maps.googleapis.com/maps/api/staticmap";
    var wmap = $("#mapbox").width();
    var hmap = $("#mapbox").height();
    var lat = 0;
    var lon = 0;
    var zoom = 13;
    var scale = 1;
    var maptype = "terrain";
    var markers = "";

    while (wmap > 640 || hmap > 640) {
        wmap = Math.round(wmap / 2);
        hmap = Math.round(hmap / 2);
        scale = scale * 2;
    }

    var kmlmarker = document.getElementById("kmlmarker");
    if (kmlmarker != null) {
        var coords = kmlmarker.innerHTML.split(",");
        if (coords != null && coords.length > 1) {
            lat = coords[0];
            lon = coords[1];
        }

        markers = "&markers=size:tiny|" + lat + "," + lon;
    }

    mapbox.style.backgroundImage = "url('" + url + "?center=" + lat + "," + lon + "&zoom=" + zoom + "&scale=" + scale + "&size=" + wmap + "x" + hmap + markers + "&maptype=" + maptype + "&key=" + GOOGLE_MAPS_APIKEY + "')";
    mapbox.style.backgroundRepeat = 'no-repeat';
    mapbox.style.backgroundPosition = 'center';
    mapbox.style.backgroundSize = 'cover';

    mapbox.addEventListener('click', loadInteractiveMap, false);

    // add button 
    var button = document.createElement('BUTTON');
    button.innerHTML = "Click to load interactive map";
    button.style.color = 'white';
    button.style.background = '#1a73e8';
    button.style.fontSize = "large";

    mapbox.appendChild(button);
}

var alreadyLoadedInteractiveMap = false;

function loadInteractiveMap() {
    if (alreadyLoadedInteractiveMap) return;
    alreadyLoadedInteractiveMap = true;

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
        mapTypeControl: false, //using custom control in 'control_maptype.js'
        zoomControl: !iOS(),
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },

        streetViewControl: !iOS(),
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },

        fullscreenControl: false //we implement our own because the default doesn't display on iOS devices
    };

    map = new google.maps.Map(mapbox, mapOptions);

    SetupMapLayers();
    
    // Tiles loaded
    loadingtiles = true;
    console.log("loadingtiles true");
    google.maps.event.addListener(map,
        'tilesloaded',
        function(evt) {
            setTimeout(function() {
                    loadingtiles = false;
                    console.log("loadingtiles false");
                },
                5000);
        });

    google.maps.event.addListener(map,
        'bounds_changed',
        function(evt) {
            loadingtiles2 = true;
            console.log('loadingtiles2 true');
        });

    google.maps.event.addListener(map,
        'idle',
        function(evt) {
            setTimeout(function() {
                    loadingtiles2 = false;
                    console.log("loadingtiles2 false");
                },
                5000);
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
            var pageName = mw.config.get("wgPageName");
            setmarker(pageName, coords[0], coords[1], 0);
            map.setZoom(13);
            var latlng = new google.maps.LatLng(coords[0], coords[1]);
            map.panTo(latlng);
        }
    }

    // set rectangle (if any) from "kmlrect"
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
            boundslist = maprectangle.getBounds();
            map.fitBounds(boundslist);
            map.panToBounds(boundslist);
            if (coords.length > 4) {
                setTimeout(function() {
                        map.setZoom(parseInt(coords[4]));
                    },
                    1000);
            }
        }
    }

    // set circle (if any) from "kmlcircle"
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
            
            if (kmlrect == null) {
                var mapcircle = new google.maps.Circle(circleopt);
                boundslist = mapcircle.getBounds();
            }

            map.fitBounds(boundslist);
            map.panToBounds(boundslist);
        }
    }
    
    kmlsummary = document.getElementById("kmlsummary");

    // set list (if any) from "kmllist"
    var kmllist = document.getElementById("kmllist");
    if (kmllist != null) {
        var kmlicons = document.getElementById("kmlicons");
        if (kmlicons != null)
            KML_ICON_LIST = kmlicons.innerHTML.split(',');
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

            var obj = { id: urldecode(line[0]), location: { lat: lat, lng: lng } };
            if (line.length > 3) {
                obj.q = Number(line[3]);
                if (line.length > 6)
                    obj.icon = KML_ICON_LIST[Number(line[6]) * 6 + obj.q];
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
            objlist.push(obj);
        }
        loadlist(objlist, true);
    }

    // set query (if any) from "kmlquery"
    var kmllistquery = document.getElementById("kmllistquery");
    if (kmllistquery != null) {
        kmlmap = "kmllistquery";
        kmllist = kmllistquery;
        kmllisturl = SITE_BASE_URL + '/api.php?action=ask&format=json&query=' + kmllistquery.innerHTML + '|%3FHas_coordinates|%3FHas_star_rating|%3FHas_summary|%3FHas_banner_image_file|%3FHas_location_class|%3FHas_KML_file|%3FRequires_permits|limit=100';
        tablelisturl = window.location.href.toString();
        tablelisturl = tablelisturl.split('#')[0];
        tablelisturl += (tablelisturl.indexOf('?') < 0 ? '?' : '&') + 'nomapchk=on';

        // load dynamic query
        var loctotaldiv = document.getElementById("loctotal");
        if (loctotaldiv) {
            var loctotal = loctotaldiv.innerHTML;
            if (loctotal > 0);
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
            var isize2 = 26 / 2; // icon size
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

            var nwll = new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng());

            var nw = proj.fromLatLngToPoint(nwll);
            
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

                var ll = { lat: parseFloat(pos.lat()), lng: parseFloat(pos.lng()) };
                if (!isNaN(ll.lat) && !isNaN(ll.lng)) // error checking
                    m.setPosition(ll);
                else
                    console.log("error " + m.name + ":" + m.p + " -> " + ll.lat + "," + ll.lng);
            }

            setTimeout(function() {
                    loadingquery2 = false;
                    console.log("loadingquery2 false");
                },
                5000);
        }

        google.maps.event.addListener(map, "zoom_changed", spiderfy);
    }

    // null map
    if (kmlmap == null) {
        var myLatlng = new google.maps.LatLng(0, 0);
        var infowindowm = new google.maps.InfoWindow({ content: "UNKNOWN LOCATION" });
        var marker =
            new google.maps.Marker({ position: myLatlng, map: map, infowindow: infowindowm, optimized: false });
        marker.infowindow.open(map, marker);
        google.maps.event.addListener(marker,
            'click',
            function() {
                this.infowindow.open(map, this);
            });
        map.panTo(myLatlng);
        map.setZoom(2);
        map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
    }

    // set title (if any) from "kmltitle"
    // note: I (Michelle) believe kmltitle is set by the {{{title}}} parameter, and refers to [[Category:Books]]. I don't see how the code is used however.
    // ropewiki.com/Category:Books
    var kmltitle = document.getElementById("kmltitle");
    if (kmltitle != null) {
        var titleControlsDiv = document.createElement('DIV');
        titleControlsDiv.style.margin = "4px 4px 4px 4px";
        //titleControlsDiv.style.fontSize = "big";
        titleControlsDiv.innerHTML =
            '<img src="https://chart.apis.google.com/chart?chst=d_text_outline&chld=000000|32|h|FFFFFF|b|' +
            urlencode(kmltitle.innerHTML) +
            '"/>';
        //"<h2>"+kmltitle.innerHTML+"</h2>";
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(titleControlsDiv);
    }

    // add additional controls (i.e. fullscreen, Show track data, Search Map, TrkLabels (for Books) )
    {
        var spstart = '<div class="gmnoprint maptopcontrols">', spend = '</div>';
        //var controls = '<div style="position:absolute;left:0;right:0;width:99%;height:99%;border-color:red;border-width:50px;border-style: solid;background-color:transparent"></div>';

        var controls;

        if (kmllist) {

            controls += spstart + initShowTracksControl() + spend;

            // map search
            if (document.getElementById('locsearch')) {
                initSearchMapControl();
            }
        }
        else {
            if (kmltitle)
                controls += spstart + '<label><input class="gmnoprint" id="labelschk" type="checkbox" onclick="toggleLabels()" ' + (labels ? 'checked' : '') + '>TrkLabels&nbsp;</label>' + spend;
        }

        if (controls) {
            var mapTopControlsDiv = document.createElement('DIV');
            mapTopControlsDiv.style.cssText = "z-index:9999;";
            mapTopControlsDiv.innerHTML = controls;
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapTopControlsDiv);
        }
    }

    // set kml (if any) from "kmlfile"
    var kmlfilep = document.getElementById("kmlfilep");
    if (kmlfilep != null) {
        loadingkml = true;
        console.log('loadingkml true');

        var file = kmlfilep.innerHTML;
        var filelink = "";
        if (file != null && file.length > 0) {
            kmlmap = "kmlfilep";
            var mapsidebar = "mapsidebar";

            var bskmlfile = document.getElementById("bskmlfile");
            if (bskmlfile != null) {

                file = file.split("&amp;").join("&");

                var selection = bskmlfile.innerHTML.toString().split("&amp;").join("&").split(',');

                if (urldecode(file).indexOf(urldecode(selection[0])) < 0)
                    selection.unshift(file);

                initTrackSourceControl(selection);

                lastlinks.push(filelink = selection[0]);
            }

            var sidebar = document.createElement('div');
            sidebar.setAttribute('id', mapsidebar);
            sidebar.className = "notranslate";
            document.body.appendChild(sidebar);

            initLegendControl();
            
            function geoxmlinitp() {
                // Here you can use anything you defined in the loaded script
                gxml = new GeoXml(
                    "gxml",
                    map,
                    "",
                    {
                        sidebarid: mapsidebar,
                        sortbyname: true,
                        simplelegend: true,
                        suppressallfolders: true,
                        showArrows: true,
                        showLabels: true,
                        showRouteLabels: labels && kmltitle,
                        showElevation: labels && kmltitle,
                        directions: true,
                        dohilite: true,
                        allfoldersopen: true,
                        hilite: { color: "#aaffff", opacity: 0.8, width: 10, textcolor: "#000000" } //, c0c0ff
                    });

                // avoid race conditions between map and geoxml
                google.maps.event.addListener(gxml,
                    "loaded",
                    function() {
                        setTimeout(function() {
                                loadingkml = false;
                                console.log("loadingkml false");
                            },
                            5000);

                        if (document.getElementById("hidelegend") == null || showLegend) {
                            var interval = setInterval(function() {
                                    if (document.getElementById("legend") != null) {
                                        toggleLegend(true);
                                        var wlegend = $("#legendbar").width();
                                        var hlegend = $("#legendbar").height();
                                        var wmap = $("#mapbox").width();
                                        var hmap = $("#mapbox").height();
                                        if (wlegend * hlegend > wmap * hmap / 4)
                                            toggleLegend(false);
                                        clearInterval(interval);
                                    }
                                },
                                500);
                        }

                    });
                gxml.load(file, filelink);
            }

            if ((typeof staticscripts) == 'undefined')
                $.getScript((typeof geoxmljs) != 'undefined'
                    ? geoxmljs
                    : geturl(SITE_BASE_URL + "/index.php?title=MediaWiki:Geoxml.js&action=raw&ctype=text/javascript"),
                    geoxmlinitp);
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
                //map.panTo(new google.map.LatLng(0, 0));
                gxml = new GeoXml("gxml",
                    map,
                    "",
                    {
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
                        hilite: { color: "#aaffff", opacity: 0.8, width: 10, textcolor: "#000000" } //, c0c0ff
                    });
                gxml.load(file, file);
            }

            if ((typeof staticscripts) == 'undefined')
                $.getScript((typeof geoxmljs) != 'undefined'
                    ? geoxmljs
                    : geturl(SITE_BASE_URL + "/index.php?title=MediaWiki:Geoxml.js&action=raw&ctype=text/javascript"),
                    geoxmlinitw);
            else
                setTimeout(geoxmlinitw, 100);
        }
    }

    setTimeout(function() {
            loadingmap = false;
            console.log("loadingmap false");
        },
        5000);

    $('#mapbox').mouseover(function(event) {
        handlekeys = true;
    });
    
    $('#mapbox').mousedown(function(event) {
        // prevent text selection on doubleclick
        event.preventDefault();
    });

    // keyboard shortcut handler
    $(document).keydown(function(event) { //'#mapbox'
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
                return false;
            default:
                //alert("key:"+event.which);
                break;
            }
        }
    });

    // in case window gets resized
    $(window).resize(function() {

        centermap();

        smallstyle();

        if (isFullscreen(null) && !iOS()) { //this is set to the inverse until after window is drawn, so use inverse logic
            map.set('gestureHandling', 'cooperative');
        }
    });

    initMapLayerControl();
    initFullscreenControl();
}

function waterflowinit() {
    waterflow(); //this is in waterflow.js, which needs to be loaded first
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
        script.src = "https://maps.googleapis.com/maps/api/js?v=3&key=" + GOOGLE_MAPS_APIKEY + "&callback=initializemap";
        document.body.appendChild(script);
    } else {
        initializemap();
    }

    // recent pictures
    pictureinit();

    // waterflow
    var table = document.getElementById('waterflow-table');
    if (!table) return;
    if ((typeof staticscripts) == 'undefined')
        $.getScript((typeof waterflowjs) != 'undefined' ? waterflowjs : geturl(SITE_BASE_URL + "/index.php?title=MediaWiki:Waterflow.js&action=raw&ctype=text/javascript"), waterflowinit);
    else
        setTimeout(waterflowinit, 100);
}

function loadmapScript() {

    smallstyle();

    loadSkin();

    loadEditor();

    loadFacebook();

    loadMapInterface();

    loadUserInterface(document);
    loadFormInterface();
    loadTranslation();
    var transtimer = setInterval(function () { loadTranslation(); }, 2000);
    // translate script
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);
}

function smallstyle() {
    WebViewStyle();
    $("#p-logo a").attr("href", "#");

    /* DISABLED! USING CSS
    // set meta viewport (not used)
    // $('head').append('<meta name="viewport" content="width=device-width; initial-scale=1.0;">');
     // set style based on screen size
     var width = $(window).width();
     if (screen)
        if (screen.width<width)
         width = screen.width;
     var e = document.getElementById('p-navigation-label');
     if (e) e.innerHTML = width;
     if (width<970)
      {
      // small screen
       var sheet = document.createElement('style')
       sheet.id = 'smallstyle';
       sheet.innerHTML = " .floatright { float: none !important; } .tablecanyon { width: 100% !important; float: none !important; } .tableregion { width: 100% !important; float: none !important; } .bigdisplay { display: none !important; }";
       document.body.appendChild(sheet);
      }
     else
      {
       // large screen
      var sheetToBeRemoved = document.getElementById('smallstyle');
      if (sheetToBeRemoved)
        {
        var sheetParent = sheetToBeRemoved.parentNode;
        sheetParent.removeChild(sheetToBeRemoved);
        }
      }
    */
}
