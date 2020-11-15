function toggleLegend(force) {
    var legend = document.getElementById("legend");
    var label = document.getElementById("legendlabel");
    var mapsidebar = document.getElementById("mapsidebar");

    if (showLegend == null || force) {
        if (legend && mapsidebar) {
            legend.style.display = "block";
            legend.innerHTML = legend.innerHTML + mapsidebar.innerHTML;
            mapsidebar.innerHTML = "";
        }
        if (label && showLegend == null)
            showLegend = label.innerHTML;
    } else {
        if (legend) legend.style.display = "none";
        //if (label) label.innerHTML = showLegend;
        showLegend = null;
    }

    var chk = document.getElementById("legendchk");
    if (chk) chk.checked = showLegend != null;
    //console.log("legend:"+(legend!=null)+" label:"+(label!=null)+" chk:"+(chk!=null));
    //google.map.event.trigger(map,'resize');
}

var downloadedRoutes = [];
function toggleRoutes(kmlfile, kmlgroup) {

    if (downloadedRoutes.includes(kmlgroup)) {
        if (showRoutes == null) //toggle routes on
            toggleRoutes(null, null);

        return;
    }

    var kmlroutes = document.getElementById('kmlroutes');
    if (!kmlroutes)
        return;

    // the 'Show kml' checkbox is hidden initially until a route is first downloaded
    var lbl = document.getElementById("showKmlButton");
    if (lbl.style.display !== "block") {
        lbl.style.display = "block";
        var chk = document.getElementById("routeschk");
        chk.checked = true;
    }

    // if loading a new route and 'Show track data' is unchecked, check it and show overlay
    var chk = document.getElementById("routeschk");
    if (kmlfile && !chk.checked) {
        chk.checked = true;
        showRoutes = 'on';
        gxml.overlayman.Show();
    }

    var group = "KML";
    var url = kmlroutes.innerHTML.split('&amp;').join('&');
    if (!gxml || kmlfile) {
        function geoxmlinitr() {
            // Here you can use anything you defined in the loaded script
            //alert("script loaded");
            if (!gxml)
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
                        directions: true,
                        dohilite: true,
                        //allfoldersopen:true,
                        hilite: { color: "#aaffff", opacity: 0.8, width: 10, textcolor: "#000000" } //, c0c0ff
                    });
            var file = kmlfile ? kmlfile : url;
            var group = kmlgroup ? kmlgroup : group;
            gxml.load(file, group, group);
            showRoutes = 'on';
            loadedRoutes = 'on';
            downloadedRoutes.push(group);
        }

        if ((typeof staticscripts) == 'undefined')
            $.getScript((typeof geoxmljs) != 'undefined'
                ? geoxmljs
                : geturl(SITE_BASE_URL + "/index.php?title=MediaWiki:Geoxml.js&action=raw&ctype=text/javascript"),
                geoxmlinitr);
        else
            setTimeout(geoxmlinitr, 100);
        if (kmlfile) return;
    } else {
        if (showRoutes == null) {
            showRoutes = 'on';
            if (loadedRoutes == null) {
                gxml.load(url, group, group);
                loadedRoutes = 'on';
            } else {
                gxml.overlayman.Show();
            }
        } else {
            showRoutes = null;
            gxml.overlayman.Hide();
        }
    }
    document.getElementById("routeschk").checked = showRoutes != null;
    google.maps.event.trigger(map, 'resize');
}
