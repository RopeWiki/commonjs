function toggleLegend(force) {
    var idchk = "legendchk";
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
    var chk = document.getElementById(idchk);
    if (chk) chk.checked = showLegend != null;
    //console.log("legend:"+(legend!=null)+" label:"+(label!=null)+" chk:"+(chk!=null));
    //google.map.event.trigger(map,'resize');
}

function toggleRoutes(kmlfile, kmlgroup) {
    idchk = "routeschk";

    var kmlroutes = document.getElementById('kmlroutes');
    if (!kmlroutes)
        return;

    var group = "KML";
    var url = kmlroutes.innerHTML.split('&amp;').join('&');
    if (!gxml || kmlfile) {
        function geoxmlinitr() {
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
                directions: true,
                dohilite: true,
                //allfoldersopen:true,
                hilite: {color: "#aaffff", opacity: 0.8, width: 10, textcolor: "#000000"} //, c0c0ff
            });
            var file = kmlfile ? kmlfile : url;
            var group = kmlgroup ? kmlgroup : group;
            gxml.load(file, group, group);
        }

        if ((typeof staticscripts) == 'undefined')
            $.getScript((typeof geoxmljs) != 'undefined' ? geoxmljs : geturl(SITE_BASE_URL + "/index.php?title=MediaWiki:Geoxml.js&action=raw&ctype=text/javascript"), geoxmlinitr);
        else
            setTimeout(geoxmlinitr, 100);
        if (kmlfile) return;
        showRoutes = 'on';
        loadedRoutes = 'on';
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
    document.getElementById(idchk).checked = showRoutes != null;
    google.maps.event.trigger(map, 'resize');
}

/*
  var markerCluster;
  function toggleCluster() {
	idchk="clusterchk";
	if  (markerCluster==null)
	  {
	  markerCluster = new MarkerClusterer(map, markers);

	  for (var i = 0; i < markers.length; i++)
	  if (markers[i].highlight)
		markers[i].highlight.setOptions({ map:null, visible: false});
		//markers[i].setMap(null);
	  }
	else
	  {
	  markerCluster.clearMarkers();
	  //markerCluster.refresh();
	  delete markerCluster;
	  markerCluster = null;
	  for (var i = 0; i < markers.length; i++) {
		markers[i].setOptions({ map:map, visible: true});
		if (markers[i].highlight)
		   markers[i].highlight.setOptions({ map:map, visible: true});
	  }
		//markers[i].setMap(map);
	  }
	document.getElementById(idchk).checked = markerCluster!=null;
	google.map.event.trigger(map,'resize');
   }
*/
