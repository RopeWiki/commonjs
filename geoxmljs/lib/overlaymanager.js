
OverlayManager = function (map, paren, opts) {
    this.myvar = paren.myvar;
    this.paren = paren;
    this.map = map;
    this.markers = [];
    this.labels = [];
    this.byid = [];
    this.byname = [];
    this.groups = [];
    this.timeout = null;
    this.folders = [];
    this.folderBounds = [];
    this.folderhtml = [];
    this.folderhtmlast = [];
    this.subfolders = [];
    this.currentZoomLevel = map.getZoom();
    this.isParsed = false;
    this.overlayview = new OverlayManagerView(map);

    this.defaultMaxVisibleMarkers = 400;
    this.defaultGridSize = 12;
    this.defaultMinMarkersPerCluster = 5;
    this.defaultMaxLinesPerInfoBox = 15;
    this.defaultClusterZoom = 'dblclick';
    this.defaultClusterInfoWindow = 'click';
    this.defaultClusterMarkerZoom = 16;
    this.defaultIcon = new google.maps.MarkerImage('http://maps.google.com/mapfiles/kml/paddle/blu-circle.png',
        new google.maps.Size(iconsize, iconsize), //size
        new google.maps.Point(0, 0), //origin
        new google.maps.Point(iconsize / 2, iconsize / 2), //anchor
        new google.maps.Size(iconsize, iconsize) //scaledSize 
    );

    this.maxVisibleMarkers = opts.maxVisibleMarkers || this.defaultMaxVisibleMarkers;
    this.gridSize = opts.gridSize || this.defaultGridSize;
    this.minMarkersPerCluster = opts.minMarkersPerCluster || this.defaultMinMarkersPerCluster;
    this.maxLinesPerInfoBox = opts.maxLinesPerInfoBox || this.defaultMaxLinesPerInfoBox;
    this.ClusterZoom = opts.ClusterZoom || this.defaultClusterZoom;
    this.ClusterInfoWindow = opts.ClusterInfoWindow || this.defaultClusterInfoWindow;
    this.ClusterMarkerZoom = opts.ClusterMarkerZoom || this.defaultClusterMarkerZoom;
    this.ClusterIconUrl = opts.ClusterIconUrl || 'http://www.dyasdesigns.com/tntmap/images/m';
    this.lang = { txtzoomin: "", txtclustercount1: "...and", txtclustercount2: "more" };
    if (typeof opts.lang != "undefined") {
        this.lang.txtzoomin = opts.lang.txtzoomin;
        this.lang.txtclustercount1 = opts.lang.txtclustercount1;
        this.lang.txtclustercount2 = opts.lang.txtclustercount2;
    }

    this.icon = opts.Icon || this.defaultIcon;
    this.optcluster = {};
    this.optcluster.overlayman = this;
    this.optcluster.minimumClusterSize = this.minMarkersPerCluster;
    this.optcluster.gridSize = this.gridSize;
    this.optcluster.ClusterZoom = this.ClusterZoom;
    this.optcluster.ClusterInfoWindow = this.ClusterInfoWindow;
    this.optcluster.imagePath = this.ClusterIconUrl;
    //this.cluster = new MarkerClusterer(this.map, {}, this.optcluster,this.paren);

    google.maps.event.addListener(this.paren, 'adjusted', OverlayManager.MakeCaller(OverlayManager.Display, this));
    google.maps.event.addListener(map, 'idle', OverlayManager.MakeCaller(OverlayManager.Display, this));
    //google.maps.event.addListener( map, 'zoomend', OverlayManager.MakeCaller( OverlayManager.Display, this ) );
    // google.maps.event.addListener( map, 'moveend', OverlayManager.MakeCaller( OverlayManager.Display, this ) );
    google.maps.event.addListener(map, 'infowindowclose', OverlayManager.MakeCaller(OverlayManager.PopDown, this));
    this.icon.pane = this.paren.markerpane;
};

OverlayManager.Display = function (overlaymanager) {
    var i, j, k, marker, group, l;
    clearTimeout(overlaymanager.timeout);
    if (overlaymanager.paren.allRemoved) {
        return;
    }

    var update_side = false;
    var count = 0;
    var clon, bits;
    var vis;
    var content;
    if (overlaymanager.paren.basesidebar) {
        for (k = 0; k < overlaymanager.folderhtml.length; k++) {
            var curlen = overlaymanager.folderhtml[k].length;
            var con = overlaymanager.folderhtmlast[k];
            if (con < curlen) {
                var destid = overlaymanager.paren.myvar + "_folder" + k;
                var dest = Lance$(destid);
                if (dest) {
                    if (overlaymanager.paren.opts.sortbyname) {
                        content = dest.innerHTML;
                        clon = overlaymanager.folderhtml[k].sort();
                        for (l = 0; l < curlen; l++) {
                            bits = clon[l].split("$$$", 8);
                            content += overlaymanager.paren.sidebarfn(bits[0], bits[1], bits[2], bits[3], bits[4], bits[5], bits[6], bits[7]);
                        }
                    }
                    else {
                        content = dest.innerHTML;
                        clon = overlaymanager.folderhtml[k];
                        for (l = con; l < curlen; l++) {
                            bits = clon[l].split("$$$", 8);
                            content += overlaymanager.paren.sidebarfn(bits[0], bits[1], bits[2], bits[3], bits[4], bits[5], bits[6], bits[7]);
                        }
                    }

                    overlaymanager.folderhtmlast[k] = curlen;
                    dest.innerHTML = content;
                    if (overlaymanager.paren.forcefoldersopen) {
                        dest.style.display = "block";
                    }
                    update_side = true;
                    count = curlen;
                }
                else {
                    //  alert("target folder not found "+destid);
                }
            }
        }
    }

    // Is this the last file to be processed?

    if (update_side && count > 0) {
        if (overlaymanager.paren.progress <= 0) {
            overlaymanager.paren.setFolders();
            google.maps.event.trigger(overlaymanager.paren, "parsed");

            if (!overlaymanager.paren.opts.sidebarid) {
                overlaymanager.paren.mb.showMess("Finished Parsing", 1000);
            }
            var mifinish = new Date();
            var sec = ((mifinish - overlaymanager.miStart) / 1000 + " seconds");
            google.maps.event.trigger(overlaymanager.paren, "loaded");
            //overlaymanager.paren.mb.showMess("Loaded "+count+" GeoXML elements in "+sec,1000);
            overlaymanager.paren.ParseURL();
            if (!overlaymanager.paren.opts.nozoom) {
                overlaymanager.paren.map.fitBounds(overlaymanager.paren.bounds);
            }
        }
    }

    if (update_side && typeof resizeKML != "undefined") {
        resizeKML();
    }

    var bounds;
    var sw;
    var ne;
    var dx;
    var dy;
    var newzoom = false;
    var newZoomLevel = overlaymanager.map.getZoom();
    if (newZoomLevel != overlaymanager.currentZoomLevel) {
        newzoom = true;
        // When the zoom level changes, we have to remove all the groups.
        for (i = 0; i < overlaymanager.groups.length; ++i) {
            if (overlaymanager.groups[i] != null) {
                overlaymanager.ClearGroup(overlaymanager.groups[i]);
                overlaymanager.groups[i] = null;
            }
        }
        overlaymanager.groups.length = 0;
        overlaymanager.currentZoomLevel = newZoomLevel;
    }

    // Get the current bounds of the visible area.
    // bounds = overlaymanager.map.getBounds();
    if (overlaymanager.map.getBounds()) {
        // Expand the bounds a little, so things look smoother when scrolling
        // by small amounts.
        bounds = overlaymanager.getMapBounds(overlaymanager);
        //alert(bounds);
        sw = bounds.getSouthWest();
        ne = bounds.getNorthEast();
        dx = ne.lng() - sw.lng();
        dy = ne.lat() - sw.lat();
        //    if ( dx < 300 && dy < 150 ){
        //      dx *= 0.05;
        //      dy *= 0.05;
        //      bounds = new google.maps.LatLngBounds(
        //      new google.maps.LatLng( sw.lat() - dy, sw.lng() - dx ),
        //      new google.maps.LatLng( ne.lat() + dy, ne.lng() + dx ) );
        //      }
    }
    if (!!!bounds && overlaymanager.map) {
        //alert("finding bounds");
        bounds = overlaymanager.getMapBounds(overlaymanager);
        if (!!!bounds) return;
    }
    // Partition the markers into visible and non-visible lists.
    var visibleMarkers = [];
    var nonvisibleMarkers = [];
    var viscount = 0;

    for (i = 0; i < overlaymanager.markers.length; ++i) {
        marker = overlaymanager.markers[i];
        vis = false;
        //alert(marker);
        if (marker !== null) {
            var mid = overlaymanager.paren.myvar + "sb" + i;
            if (typeof marker.getBounds == "undefined") {
                var pos = marker.getPosition();
                if (bounds.contains(pos)) {
                    vis = true;
                    viscount++;
                }
            }
            else {
                var b = marker.getBounds();
                if (bounds.intersects(b)) {
                    vis = true;
                }
            }
            if (Lance$(mid)) {
                if (vis) { Lance$(mid).className = "inView"; }
                else { Lance$(mid).className = "outView"; }
            }
            //alert(vis);
            if (vis && (marker.hidden == false)) {
                visibleMarkers.push(i);
            }
            else { nonvisibleMarkers.push(i); }

        }
    }

    if (newzoom) {
        /*
          if (viscount > overlaymanager.maxVisibleMarkers)
            overlaymanager.cluster.setMinimumClusterSize(overlaymanager.minMarkersPerCluster);  
          else
            overlaymanager.cluster.setMinimumClusterSize(overlaymanager.maxVisibleMarkers);  
            
          overlaymanager.cluster.repaint();  
          */
    }

    OverlayManager.RePop(overlaymanager);
};

OverlayManager.PopUp = function (overlaymanager, cClusterIcon) {
    /*  
    for (x =0; x<overlaymanager.cluster.clusters_.length; x++) {
      if (cClusterIcon==overlaymanager.cluster.clusters_[x].clusterIcon_)
        break;
    }
      
    var html = '<table style="font-size:10px" width="300">';
    var n = 0;
    for ( var i = 0; i < cClusterIcon.cluster_.markers_.length; ++i ) {
      var marker = cClusterIcon.cluster_.markers_[i];
      if ( marker!= null ) {
        ++n;
        html += '<tr><td><a href="javascript:OverlayManager.ZoomIntoMarker('+overlaymanager.myvar+'.overlayman.cluster.clusters_['+x+'].markers_['+i+'])">';
        if (marker.smallImage != null ) {
          html += '<img src="' + marker.smallImage + '">';
        } else {
          html += '<img src="' + marker.icon.url + '" width="' + ( marker.icon.size.width / 2 ) + '" height="' + ( marker.icon.size.height / 2 ) + '">'; 
        }
        html += '</td><td>' + marker.title2 + '</a></td></tr>';
        if (n == overlaymanager.maxLinesPerInfoBox - 1 && cClusterIcon.cluster_.markers_.length > overlaymanager.maxLinesPerInfoBox) {
          html += '<tr><td colspan="2">'+overlaymanager.lang.txtclustercount1+' ' + ( cClusterIcon.cluster_.markers_.length - n ) + ' '+overlaymanager.lang.txtclustercount2+'</td></tr>';
          break;
        }
      }
    }
    html += '<tr><td colspan="2"><a href="javascript:OverlayManager.ZoomIntoCluster('+overlaymanager.myvar+'.overlayman)">'+overlaymanager.lang.txtzoomin+'</a></td></tr>';
    html += '</table>';
  
    // overlaymanager.map.closeInfoWindow(); close Last Marker
      if (overlaymanager.paren.lastMarker&&overlaymanager.paren.lastMarker.infoWindow)
      overlaymanager.paren.lastMarker.infoWindow.close();
    var infoWindowOptions = { 
          content: html,
          pixelOffset: new google.maps.Size(0, 2),
          position: cClusterIcon.cluster_.bounds_.getCenter()
          };
    if(overlaymanager.paren.maxiwwidth){
            infoWindowOptions.maxWidth = overlaymanager.paren.maxiwwidth;
            }
    cClusterIcon.infoWindow = new google.maps.InfoWindow(infoWindowOptions);
    overlaymanager.paren.lastMarker = cClusterIcon;
    overlaymanager.paren.lastMarker.infoWindow.open(overlaymanager.paren.map);
      overlaymanager.poppedUpCluster = cClusterIcon;
      */
};

OverlayManager.ZoomIntoCluster = function (overlaymanager) {
    /*
    if (overlaymanager.poppedUpCluster) {
        var mc = overlaymanager.poppedUpCluster.cluster_.getMarkerClusterer();
        // This event is fired when a cluster marker is clicked.
        google.maps.event.trigger(mc, mc.ClusterZoom_, overlaymanager.poppedUpCluster.cluster_);
        google.maps.event.trigger(mc, "cluster"+mc.ClusterZoom_, overlaymanager.poppedUpCluster.cluster_); // deprecated name
  
        // The default dblclick handler follows. Disable it by setting
  
        // the zoomOnClick property to false.
        if (mc.getZoomOnClick()) {
          // Zoom into the cluster.
          mz = mc.getMaxZoom();
          theBounds = overlaymanager.poppedUpCluster.cluster_.getBounds();
          mc.getMap().fitBounds(theBounds);
          // There is a fix for Issue 170 here:
          setTimeout(function () {
            mc.getMap().fitBounds(theBounds);
            // Don't zoom beyond the max zoom level
            if (mz !== null && (mc.getMap().getZoom() > mz)) {
              mc.getMap().setZoom(mz + 1);
            }
          }, 100);
        }
    }
    */
};

OverlayManager.ZoomIntoMarker = function (marker) {
    if (marker) {
        marker.geoxml.map.setZoom(marker.geoxml.overlayman.ClusterMarkerZoom);
        marker.geoxml.map.setCenter(marker.getPosition());
    }
};

OverlayManager.RePop = function (overlaymanager) {
    //    if ( overlaymanager.poppedUpCluster!= null ){ 
    //  OverlayManager.PopUp( overlaymanager.poppedUpCluster ); }
};

OverlayManager.PopDown = function (overlaymanager) {
    overlaymanager.poppedUpCluster = null;
    overlaymanager.paren.lastMarker = null;
};

// This returns a function closure that calls the given routine with the specified arg.
OverlayManager.MakeCaller = function (func, arg) {
    return function () { func(arg); };
};

// Call this to change the group icon.
OverlayManager.prototype.SetIcon = function (icon) {
    this.icon = icon;
};

// Changes the maximum number of visible markers before clustering kicks in.
OverlayManager.prototype.SetMaxVisibleMarkers = function (n) {
    this.maxVisibleMarkers = n;
};

// Sets the minumum number of markers for a group.
OverlayManager.prototype.SetMinMarkersPerCluster = function (n) {
    this.minMarkersPerCluster = n;
};

OverlayManager.prototype.SetMaxLinesPerInfoBox = function (n) {
    this.maxLinesPerInfoBox = n;
};

OverlayManager.prototype.addMarker = function (marker, title2, idx, sidebar, visible, forcevisible) {

    if (isNaN(marker.getPosition().lat()) || isNaN(marker.getPosition().lng())) return; //invalid coordinates

    if (marker.setMap != null) {
        marker.onMap = true;
        marker.setMap(this.map);
    }
    marker.hidden = false;
    if (visible != true) { marker.hidden = true; }
    if (this.paren.hideall) { marker.hidden = true; }
    
    this.folders[idx].push(this.markers.length);

    var bounds = this.map.getBounds();
    var vis = false;
    if (bounds) { //map doesnt have bounds defined?
        if (typeof marker.getBounds == "undefined") {
            if (bounds.contains(marker.getPosition())) {
                vis = true;
            }
        }
        else {
            var b = marker.getBounds();
            if (!b.isEmpty()) {
                if (bounds.intersects(b)) {
                    vis = true;
                }
            }
        }
    }
    else {
        vis = true;
    }
    if (forcevisible) { vis = true; }
    // var id = this.markers.length;
    this.markers.push(marker);
    if (vis) {
        if (marker.hidden) {
            marker.setMap(null);
            marker.onMap = false;
            //      if(!!marker.label){ marker.label.hide();} 
            if (!!marker.label) { marker.label.setMap(null); }
        }
        else {
            marker.setMap(this.map);
            marker.onMap = true;
            //      if(!!marker.label){ marker.label.show();} 
            if (!!marker.label) { marker.label.setMap(this.map); }
        }
    }
    //this.cluster.addMarker(marker);
    this.DisplayLater();
    if (sidebar) {
        this.folderhtml[idx].push(sidebar);
    }
    // return id;
};

OverlayManager.prototype.zoomToFolder = function (idx) {
    var bounds = this.folderBounds[idx];
    this.map.fitBounds(bounds);
};

OverlayManager.prototype.RemoveMarker = function (marker) {
    for (var i = 0; i < this.markers.length; ++i) {
        if (this.markers[i] == marker) {
            if (marker.onMap) {
                marker.setMap(null);
            }
            if (!!marker.label) {
                //      marker.label.hide();
                marker.label.setMap(null);
            }
            for (var j = 0; j < this.groups.length; ++j) {

                var group = this.groups[j];
                if (group != null) {
                    for (var k = 0; k < group.markers.length; ++k) {
                        if (group.markers[k] == marker) {
                            group.markers[k] = null;
                            --group.markerCount;
                            break;
                        }
                    }
                    if (group.markerCount == 0) {
                        this.ClearGroup(group);
                        this.groups[j] = null;
                    }
                    else {
                        if (group == this.poppedUpCluster) { OverlayManager.RePop(this); }
                    }
                }
            }
            this.markers[i] = null;
            break;
        }
    }
    //this.cluster.removeMarker(marker);
    this.DisplayLater();
};

OverlayManager.prototype.Hide = function (group) {
    for (var i = 0; i < this.markers.length; i++) {
        marker = this.markers[i];
        if (!!group && marker.group != group)
            continue;
        marker.setMap(null);
        marker.onMap = false;
        if (!!marker.label)
            marker.label.setMap(null);
        var bar = Lance$(marker.sidebarid);
        if (bar)
            bar.style.display = "none";
    }
};

OverlayManager.prototype.Show = function (group) {
    for (var i = 0; i < this.markers.length; i++) {
        marker = this.markers[i];
        if (!!group && marker.group != group)
            continue;
        marker.setMap(this.map);
        marker.onMap = true;
        if (!!marker.label)
            marker.label.setMap(this.map);
        var bar = Lance$(marker.sidebarid);
        if (bar)
            bar.style.display = "block";
    }
};

OverlayManager.prototype.DisplayLater = function () {
    if (this.timeout != null) {
        clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(OverlayManager.MakeCaller(OverlayManager.Display, this), 50);
};

OverlayManager.prototype.getMapBounds = function (overlaymanager) {
    var bounds;

    if (overlaymanager.map.getZoom() > 1) {
        var b = overlaymanager.map.getBounds();
        if (!b || typeof b === "undefined")
            bounds = new google.maps.LatLngBounds(new google.maps.LatLng(-85.08136444384544, -178.48388434375), new google.maps.LatLng(85.02070771743472, 178.00048865625));
        else
            bounds = new google.maps.LatLngBounds(b.getSouthWest(), b.getNorthEast());
    } else {
        bounds = new google.maps.LatLngBounds(new google.maps.LatLng(-85.08136444384544, -178.48388434375), new google.maps.LatLng(85.02070771743472, 178.00048865625));
    }

    var projection = overlaymanager.overlayview.getProjection();
    if (projection) {
        // Turn the bounds into latlng.
        var tr = new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getNorthEast().lng());
        var bl = new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getSouthWest().lng());

        // Convert the points to pixels and the extend out by the grid size.
        var trPix = projection.fromLatLngToDivPixel(tr);
        trPix.x += overlaymanager.gridSize;
        trPix.y -= overlaymanager.gridSize;

        var blPix = projection.fromLatLngToDivPixel(bl);
        blPix.x -= overlaymanager.gridSize;
        blPix.y += overlaymanager.gridSize;

        // Convert the pixel points back to LatLng
        var ne = projection.fromDivPixelToLatLng(trPix);
        var sw = projection.fromDivPixelToLatLng(blPix);

        // Extend the bounds to contain the new bounds.
        bounds.extend(ne);
        bounds.extend(sw);
    }

    return bounds;

};

OverlayManager.prototype.ClearGroup = function (group) {
    var i, marker;

    for (i = 0; i < group.markers.length; ++i) {
        if (group.markers[i] != null) {
            group.markers[i].inCluster = false;
            group.markers[i] = null;
        }
    }
    group.markers.length = 0;
    group.markerCount = 0;
    if (group == this.poppedUpCluster) {
        this.map.closeInfoWindow();
    }
    if (group.onMap) {
        group.marker.setMap(null);
        group.onMap = false;
    }
};

function OverlayManagerView(map) {
    this.setMap(map);
};

OverlayManagerView.prototype = new google.maps.OverlayView();

OverlayManagerView.prototype.onAdd = function () {
};

OverlayManagerView.prototype.draw = function () {
};

OverlayManagerView.prototype.onRemove = function () {
};

