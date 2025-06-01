// Needed to display tiles properly
mw.loader.load('/leaflet/1.9.4/leaflet.css', 'text/css');
mw.loader.load('/leaflet-fullscreen/1.0.1/leaflet.fullscreen.css', 'text/css');

function initializeLeafletMap() {

    // Ensure the "mapbox" div exists
    const mapbox = document.getElementById('mapbox');
    if (!mapbox) {
        console.log('No "mapbox" div found, so no map to build.');
        return;
    }

    // Logged in users don't currently get maps.
    if (!currentUser) {
        mapbox.style = "";
        mapbox.id = "mapbox_disabled";
        getMWPage("{{Template:Warning|Maps are currently limited to logged-in users only. " +
            "Unfortunately this also disables other map-dependent pages like region overviews.}}",
            function (html) { mapbox.innerHTML = html }
        );
        return;
    }

    // This ensures the external leaflet code is loaded before going further.
    // In future versions of mediawiki this will change to mw.loader.getScript()
    $.getScript('/leaflet/1.9.4/leaflet.js')
    .then(function () {
        return $.getScript('/leaflet-fullscreen/1.0.1/leaflet.fullscreen.min.js');
    })
    .then(function () {
        buildLeafletMap(); // Both scripts loaded
    })
    .fail(function (e) {
        mw.log.error(e);
    });
}

function logLeafletUsage() {
    $.get(geturl(SITE_BASE_URL + "/rwlog?leaflet&" + currentUser + "&" + pageName));
}

function waterflowinit() {
    waterflow(); //this is in waterflow.js, which needs to be loaded first
}


function buildLeafletMap() {

    var table = document.getElementById('waterflow-table');
    if (!!table) {
        if (typeof waterflow == 'undefined')
            $.getScript(geturl(SITE_BASE_URL + "/index.php?title=MediaWiki:Waterflow.js&action=raw&ctype=text/javascript"), waterflowinit);
        else
            setTimeout(waterflowinit, 100);
    }

    logLeafletUsage();

    // Create the map instance
    map = L.map('mapbox', {
        fullscreenControl: true,
        // maxZoom: 15
    }).setView([0, 0], 14);

    // addLeafletBaseMaps(map);

    // Setup an empty legend
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        legendDiv = L.DomUtil.create('div', 'info legend');
        legendDiv.id = 'legend';
        return legendDiv;
    };
    legend.addTo(map);


    findAndAddDataToMap(map).then(function () {
        // Safe to get map center and zoom
        // addStaticTile(map);
        if (!document.getElementById("kmllistquery")) {
                      addStaticTile(map);
      }
        // Safe to get map center and zoom
// setTimeout(function() {
//       addStaticTile(map);
//   }, 100);

        L.Control.BaseMapButton = L.Control.extend({
            onAdd: function(map) {
                const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
                btn.innerHTML = 'Load Interactive Maps';
                btn.style.cursor = 'pointer';
                btn.style.backgroundColor = 'white';
                btn.style.padding = '4px';

                btn.style.padding = '10px 16px';
                btn.style.fontSize = '16px';
                btn.style.height = 'auto';
                btn.style.width = 'auto';
                btn.style.backgroundColor = 'white';
                btn.style.cursor = 'pointer';
                btn.style.border = '2px solid #666';
                btn.style.borderRadius = '4px';

                L.DomEvent.on(btn, 'click', function(e) {
                    L.DomEvent.stopPropagation(e);
                    L.DomEvent.preventDefault(e);

                    // Remove the static image overlay if it exists
                    if (window.staticOverlay && map.hasLayer(window.staticOverlay)) {
                        map.removeLayer(window.staticOverlay);
                    }

                    addLeafletBaseMaps(map);
                    enabledControls(map);

                     map.removeControl(this);
                });

                return btn;
            },

            onRemove: function(map) {
                // Nothing to clean up
            }
        });

        L.control.baseMapButton = function(opts) {
            return new L.Control.BaseMapButton(opts);
        };

        L.control.baseMapButton({ position: 'topright' }).addTo(map);


      });

    
}

function computeLength(polyline) {
    var latlngs = polyline.getLatLngs();
    var total = 0;
    for (var i = 0; i < latlngs.length - 1; i++) {
        total += latlngs[i].distanceTo(latlngs[i + 1]); // returns meters
    }
    return total;
}


function findAndAddDataToMap(map) {
    return new Promise(function (resolve) {
      var asyncTasks = 0;
      var pageName = mw.config.get("wgPageName");
      var legend = document.getElementById("legend");
  
      function done() {
        asyncTasks--;
        console.log(asyncTasks);
        if (asyncTasks <= 0) resolve();
      }
  
      function tryAddMarker(id, label, iconUrl) {
        var el = document.getElementById(id);
        if (el) {
          var coords = el.innerText.split(",");
          if (coords.length > 1) {
            addMarker(coords, map, label, pinIcon(iconUrl));
            return coords;
          }
        }
        return null;
      }
  
      // Main canyon marker
      var mainCoords = tryAddMarker(
        "kmlmarker",
        pageName.replace(/_/g, " "),
        "https://maps.google.com/mapfiles/kml/paddle/grn-stars.png"
      );
      if (mainCoords) map.setView(mainCoords);
  
      // Optional shuttle/parking markers
      tryAddMarker("kmlmarkershuttle", "Shuttle", "/leaflet/images/S.png");
      tryAddMarker("kmlmarkerparking", "Parking", "/leaflet/images/P.png");
  
      // KML Track
      var kmlfile = document.getElementById("kmlfilep");
      if (kmlfile && kmlfile.innerHTML.length > 0) {
        asyncTasks++;
        setupLeafletKML();
  
        $.get(kmlfile.innerHTML, function (kmltext) {
          var parser = new DOMParser();
          parser.parseFromString(kmltext, "text/xml");
  
          var track = new L.KML(kmltext, "text/xml");
  
          track.on("add", function () {
            function printLayerNames(layers) {
              for (var key in layers) {
                if (!layers.hasOwnProperty(key)) continue;
                var layer = layers[key];
                if (layer.options && layer.options.name && layer.options.color) {
                  var length = 0;
                  if (layer instanceof L.Polyline) {
                    length = computeLength(layer);
                  }
                  var lengthStr = length > 0 ? " (" + (length / 1000).toFixed(2) + " km)" : "";
                  legend.innerHTML += '<i style="background:' + layer.options.color +
                    ';width:12px;height:12px;display:inline-block;"></i> ' +
                    layer.options.name + lengthStr + "<br>";
                }
                if (layer._layers) printLayerNames(layer._layers);
              }
            }
            printLayerNames(track._layers);
          });
  
          map.addLayer(track);
          // Don't consider the work done until the map has finished resizing.
          map.once('moveend', function () {
            done();
          });
          map.fitBounds(track.getBounds());

        }).fail(function (xhr, status, error) {
          console.log(error);
          done();
        });
      }
  
      // Region page marker list
      var kmllistquery = document.getElementById("kmllistquery");
      if (kmllistquery) {
        asyncTasks++;
        var queryRaw = decodeURIComponent(kmllistquery.innerHTML.replace(/\+/g, " ")).replace(/\n/g, "");
        locationsQuery = queryRaw;  // <- ADD THIS LINE
        var numberToLoad = 100;
        var urlQuery = SITE_BASE_URL + "/api.php?action=ask&format=json" +
          "&query=" + urlencode("[[Category:Canyons]][[Has coordinates::+]]" + queryRaw) +
          getLocationParameters(numberToLoad) +
          "|order=descending,ascending|sort=Has rank rating,Has name" +
          "|offset=0";
  
        $.getJSON(geturl(urlQuery), function (data) {
          if (data.error) {
            var loadingInfo = document.getElementById("loadinginfo");
            if (loadingInfo) {
              loadingInfo.innerHTML = '<div class="rwwarningbox"><b>2 Error communicating with Ropewiki server</b></div>';
            }
          } else {
            loadMoreLocations();
          }
          hideSearchMapLoader();
          done();
        });
      }
  
      if (asyncTasks === 0) resolve(); // fallback if nothing async was scheduled
    });
  }
  


function addMouseoverHighlightToMarker(marker, map) {
    marker.on("mouseover", function (e) {
        this.mouseoverhighlight = L.marker(this.getLatLng(), {
            icon: canyonIcon(MARKER_MOUSEOVER_HIGHLIGHT),
            interactive: false, // Disable interactivity for the highlight marker
            zIndexOffset: -1, // Lower z-index to place it below the main marker
        }).addTo(map);
    });

    marker.on("mouseout", function () {
        // Remove the highlight marker if it exists
        if (this.mouseoverhighlight) {
            map.removeLayer(this.mouseoverhighlight);
            this.mouseoverhighlight = null;
        }
    });

}


 function addClosedOverlayToMarker(marker, map) {
  // TODO
 }


function buildTooltipString(item) {
    return '<b class="nostranslate">' + nonamespace(item.id) + '</b><br>' + itemDescriptionToSummary(item);
}

// This parses the "description" field of a canyon search results and produces a one-line summary.
function itemDescriptionToSummary(item) {
    // convert units
    if (item.description) {
        var description = item.description;
        if (metric) {
            var words = description.split(' ');
            for (var p = 0; p < words.length; ++p) {
                var pre = "";
                var word = words[p];
                var idot = word.indexOf(':');
                // if (i >= 0) {  // not sure what this if does
                    pre = word.substr(0, idot + 1);
                    word = word.substr(idot + 1);
                // }
                if (word[0] >= '0' && word[0] <= '9') {
                    var unit = word.slice(-2);
                    if (unit === 'mi')
                        words[p] = pre + uconv(word, miStr);
                    else if (unit === 'ft')
                        words[p] = pre + uconv(word, ftStr);
                }
            }
            description = words.join(' ');
        }
        description = acaconv(description);
        return description.split('*').join('&#9733;');
    }
    else {
        return description = "?";
    }
}


// A function to add a marker from a canyon search result to the map.
// It wraps addMarker, adding ropewiki specific parameters, and tracking them in
// the markers array, used by filtering tools.
function addRWResultMarker(item, map) {

    var popup_string = buildPopupString(item);
    var tooltipString = buildTooltipString(item)

    marker = addMarker(
        [item.location.lat, item.location.lng],
        map,
        popup_string,
        canyonIcon(item.icon),
        tooltipString,
    );

    marker.locationData = item;
    marker.isVisible = true;
    marker.name = item.nameWithoutRegion;

    // On mobile tapping triggers both popup and tooltip - just popup is needed.
    if (L.Browser.mobile) {
        // Disable the tooltip on touch devices
        marker.unbindTooltip();
    }


    // This implements a "setMap" method which mimics the google maps API.
    // It avoids the need to change the code in filtering.js during migration.
    // It adds/removes the marker from the map.
    marker.setMap = function(map) {
        map ? this.addTo(map) : this.remove();
    }

    addMouseoverHighlightToMarker(marker, map);

    // item.stars = (item.stars != null ? item.stars : -1);

    status_icons = {
        "Yes": ICON_PERMIT_YES,
        "Restricted": ICON_RESTRICTED,
        "Closed": ICON_CLOSED
    }

    status_text = {
        "Yes": "Permit Required",
        "Restricted": "Access Restricted",
        "Closed": "Closed to Entry"
    }

    if (item.permits && item.permits !== 'None') {

        // We take the popup & tooltip from the underlying marker and add access warnings.
        closed_img = '<img width=25px src="' + status_icons[item.permits] + '" title="' + status_text[item.permits] + '" />';
        closed_tooltipString = closed_img + tooltipString;
        closed_popupString = closed_img + marker._popup._content;

        closedMarker = addMarker(
            [item.location.lat, item.location.lng],
            map,
            closed_popupString, // use the same content as the underlying marker
            closedIcon(status_icons[item.permits]),
            closed_tooltipString, // use the same content as the underlying marker
        )

        // This removes the closed marker if the underlying marker is removed.
        closedMarker.setMap = marker.setMap;
        marker.closedMarker = closedMarker;

    }


    markers.push(marker);

    return marker;

}


// A function to add a generic marker to the map. Doesn't require ropewiki specific parameters.
function addMarker(coords, map, popup_text, icon, tooltip_text) {
    if (coords != null && coords.length > 1) {
        var marker = L.marker(coords, { icon: icon })
            .addTo(map)
            .bindPopup(popup_text, {maxWidth: 186, maxHeight: 300, autoPan: true})
            .bindTooltip(tooltip_text, {offset: [10, -10]});

        return marker;
    }
}


function updateMapBounds(map) {
    const allBounds = L.latLngBounds();

    map.eachLayer(function(layer) {
        if (layer.getBounds) {
            allBounds.extend(layer.getBounds());
        } else if (layer.getLatLng) {
            allBounds.extend(layer.getLatLng());
        }
    });

    if (allBounds.isValid()) {
        map.fitBounds(allBounds);
    }
}

function buildPopupString(item) {

    // We set display:inline to allow the access warning icon to prepended without complex dom parsing.
    var contentString = '<div class="canyon-popup-content" >';

    // Add title & link
    var label = nonamespace(!!item.nameWithoutRegion ? item.nameWithoutRegion : item.id);
    contentString += '<b class="notranslate">' + aref(item.id, label, label, 'target="_blank"') + '</b>';

    contentString += '<hr/>'

    // Add summary
    contentString += '<div class="sdescm notranslate">' + itemDescriptionToSummary(item) + '</div>';

    // Add thumbnail
    if (item.thumbnail) {
        contentString += '<img src="' + item.thumbnail + '"/>';
    }

    contentString += '</div>';

    // Show the "Add to list" button
    if (document.getElementById("kmladdbutton"));
        contentString += '<input class="submitoff addbutton" title="Add to a custom list" type="submit" onclick="addToList(\'' + item.id.split("'").join("%27") + '\')" value="+">';

    /* The "extra" links at the bottom of the popup window are likely very infrequently used. Disabled until complaints arrive.*/

    // TODO - determine if we want to show tracks on routes page.
    // if (item.kmlfile && item.kmlfile !== "") {
    //     sdescm += '<div><i>';
    //     sdescm += '<a href="javascript:toggleRoutes(\'' + escapequotes(item.kmlfile) + '\',\'' + escapequotes(item.id) + '\');">Show track data on map</a>';
    //     sdescm += '</i></div>';
    // }

    // TODO - determine if we want to show nearby on routes page.
    //var extra = ' - <a href="' + SITE_BASE_URL + '/Location?locdist=30mi&locname=' + item.location.lat.toFixed(4) + ',' + item.location.lng.toFixed(4) + '">Search nearby</a>';

    // TODO - determine if we want to show hide from map on routes page.
    // var extra = ' - <a href="javascript:removeMarker(\'' + escapequotes(item.id).split("'").join("\\\'") + '\');">Hide from map</a>';

    // TODO - determine if we want to show directions on routes page.
    // sdescm += displaydirections(item.location.lat, item.location.lng, extra);

    return contentString;
}



function loadRWResultsListIntoMap(rwresults, fitbounds) {
    // was called "loadlist()"
    var i;


    // TODO figure out what nearby does

    // // calc nearby (only 1 shot of 100 or less)
    // var calcnearby = document.getElementById('kmlnearby');
    // if (calcnearby) {
    //     // process list
    //     for (i = 0; i < rwresults.length; ++i) {
    //         var o = rwresults[i];
    //         var sortlist = [];
    //         // compute distance
    //         var ic;
    //         for (ic = 0; ic < rwresults.length; ++ic)
    //             sortlist.push({ id: rwresults[ic].id.split(" ")[0], distance: distance(o.location, rwresults[ic].location) });
    //         sortlist.sort(function(a, b) {
    //             return a.distance - b.distance;
    //         });

    //         var distlist = [];
    //         for (ic = 1; ic < sortlist.length && ic <= 5 && sortlist[ic].distance < 20; ++ic)
    //             distlist.push(sortlist[ic].id);

    //         var id = o.id.substr(1).split(" ")[0];
    //         if (!id || id === "")
    //             continue;
    //         var elems = document.getElementsByClassName("nearby");
    //         var e;
    //         for (e = 0; e < elems.length && elems[e].id !== id; ++e);
    //         if (e < elems.length)
    //             elems[e].innerHTML = "~" + distlist.join();
    //     }
    // }

    for (i = 0; i < rwresults.length; ++i) {
        var item = rwresults[i];

        if (!item.id || item.id === "")
            continue;

        if (markerAlreadyExists(item.id)) continue;

        // Add marker to the map!
        marker = addRWResultMarker(item, map);
    }

    updateUserlistHighlights();

    updateMapBounds(map);
    addStaticTile(map);

    addNewItemsToTable(rwresults);
}

// TODO de-dup this with highlight logic in loadRWResultsListIntoMap()
function addhighlight(idlist, style, force) { // COOPS FIX ME
    var i;
    for (i = 0; i < markers.length; ++i)
        if (idlist.includes(markers[i].name)) {
            var marker = markers[i];

            if (marker.highlight && !force)
                continue;

            if (marker.highlight) { //remove old highlight
                marker.highlight.setMap(null);
                marker.highlight = null;
            }

            var highlight = L.marker(marker.getLatLng(), {
                icon: canyonIcon(style),
                interactive: false, // Disable interactivity for the highlight marker
                zIndexOffset: -1, // Lower z-index to place it below the main marker
            }).addTo(map);

            highlight.setMap = marker.setMap;
            marker.highlight = highlight;

            if (marker.infowindow && marker.infowindow.content)
                marker.infowindow.content = marker.infowindow.content.replace('value="+"', 'value="*"');
        }

    var pinicons = document.getElementsByClassName('pinicon');
    for (i = 0; i < pinicons.length; ++i)
        if (idlist.indexOf(pinicons[i].id) >= 0)
            pinicons[i].style.backgroundImage = "url(" + style + ")";
}



function centerMapOnMarkerById(markerId, map) {
    var marker = null;
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].name === markerId) {
            marker = markers[i];
            break;
        }
    }

    if (marker && map) {
        const popup = marker.getPopup();
        if (popup) {
            map.openPopup(popup, marker.getLatLng());
        } else {
            map.panTo(marker.getLatLng());
        }
        marker.openPopup();
    } else {
        console.error('Marker with ID "' + markerId + '" not found or map is undefined.');
    }
}
