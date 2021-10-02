//google maps custom control to show or hide tracks shown on region pages

function initShowTracksControl() {

    var table = document.getElementById('waterflow-table');
    if (!!table) {
        //document.getElementById("showKmlCheckbox").style.display = "block"; //for showing streams, for watershed info
    }

    return '<label id="showKmlCheckbox" class="controls show-kml-checkbox"><input class="gmnoprint" id="routeschk" type="checkbox" onclick="toggleRoutes()">Show&nbsp;track&nbsp;data</label>';
}

var downloadedRoutes = [];
function toggleRoutes(kmlfile, kmlgroup) {

    if (downloadedRoutes.includes(kmlgroup)) {
        if (showRoutes == null) //toggle routes on
            toggleRoutes(null, null);

        return;
    }

    //kml routes is a query on region pages to download all routes for that region.
    //It needs the ShowKMLCheckbox to initially be displayed. I think we'll leave it disabled and just allow manually picking routes to show, otherwise it's quite a mess
    var kmlroutes = document.getElementById('kmlroutes');
    if (!kmlroutes)
        return;

    // the 'Show kml' checkbox is hidden initially until a route is first downloaded
    var lbl = document.getElementById("showKmlCheckbox");
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
    var url = kmlroutes.firstChild.href;
    if (!gxml || kmlfile) {
        function geoxmlinitr() {
            // Here you can use anything you defined in the loaded script
            //alert("script loaded");
            if (!gxml)
                gxml = new GeoXml("gxml",
                    map,
                    "",
                    {
                        nozoom: true,
                        simplelegend: true,
                        suppressallfolders: true,
                        showArrows: false,
                        showLabels: false,
                        patchIcons: true,
                        showRouteLabels: false,
                        directions: true,
                        dohilite: true,
                        hilite: { color: "#aaffff", opacity: 0.8, width: 10, textcolor: "#000000" } //, c0c0ff
                    });
            var file = kmlfile ? kmlfile : url;
            var group = kmlgroup ? kmlgroup : group;
            gxml.load(file, group, group);
            showRoutes = 'on';
            loadedRoutes = 'on';
            downloadedRoutes.push(group);
        }

        if ((typeof GeoXml) == 'undefined')
            $.getScript(geturl(SITE_BASE_URL + "/index.php?title=MediaWiki:Geoxml.js&action=raw&ctype=text/javascript"), geoxmlinitr);
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
