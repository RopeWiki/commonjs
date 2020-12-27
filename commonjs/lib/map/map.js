
var zindex = 0;
var lastinfowindow = null;

function displayinfowindow(marker) {
    tooltip.hide();

    if (lastinfowindow) {
        if (lastinfowindow.map) {
            lastinfowindow.close();

            if (lastinfowindow === marker.infowindow)
                return;
        }
    }

    marker.infowindow.setZIndex(++zindex);
    marker.infowindow.open(map, marker);
    lastinfowindow = marker.infowindow;
}

function pinicon(id, icon) {
    if (!icon)
        icon = SITE_BASE_URL + "/images/8/86/PinMap.png";

    return '<img src="' + icon + '" id="' + id + '" class="pinicon" title="Show location on map" style="cursor:pointer;vertical-align:middle" onclick=\'pinmap(this.id)\'/>';
}

function pinmap(id) {
    for (var i = 0; i < markers.length; ++i)
        if (markers[i].name === id) {
            var mapboxoffset = $("#mapbox").offset().top;
            if (mapboxoffset < $(window).scrollTop())
                window.scrollTo(0, mapboxoffset);
            $("#mapcover").css({display: "none"});
            map.panTo(markers[i].position);
            window.setTimeout(function () {
                displayinfowindow(markers[i]);
            }, 500);

            return;
        }
}

function loadlist(list, fitbounds) {
    var i;

    // calc nearby (only 1 shot of 100 or less)
    var calcnearby = document.getElementById('kmlnearby');
    if (calcnearby) {
        // process list
        for (i = 0; i < list.length; ++i) {
            var o = list[i];
            var sortlist = [];
            // compute distance
            var ic;
            for (ic = 0; ic < list.length; ++ic)
                sortlist.push({ id: list[ic].id.split(" ")[0], distance: distance(o.location, list[ic].location) });
            sortlist.sort(function(a, b) {
                return a.distance - b.distance;
            });

            var distlist = [];
            for (ic = 1; ic < sortlist.length && ic <= 5 && sortlist[ic].distance < 20; ++ic)
                distlist.push(sortlist[ic].id);

            var id = o.id.substr(1).split(" ")[0];
            if (!id || id === "")
                continue;
            var elems = document.getElementsByClassName("nearby");
            var e;
            for (e = 0; e < elems.length && elems[e].id !== id; ++e);
            if (e < elems.length)
                elems[e].innerHTML = "~" + distlist.join();
        }
    }

    var numberAdded = 0;
    for (i = 0; i < list.length; ++i) {
        var item = list[i];

        if (!item.id || item.id === "")
            continue;

        var alreadyExists = false;
        for (var j = 0; j < markers.length; ++j) {
            if (markers[j].name === item.id) {
                alreadyExists = true;
                break;
            }
        }
        if (alreadyExists) continue;

        ++numberAdded;
        --nlist;
        // set up icon
        var zindexm = 5000 + nlist;
        if (item.stars)
            zindexm += item.stars * 1000;

        var iconm = "";
        if (item.icon)
            iconm = item.icon;

        // set up description
        var descm = "", sdescm = "";
        if (item.description) {
            // convert unist
            var str = item.description;
            if (metric) {
                var pk = str.split(' ');
                for (var p = 0; p < pk.length; ++p) {
                    var pre = "";
                    var ps = pk[p];
                    var idot = ps.indexOf(':');
                    if (i >= 0) {
                        pre = ps.substr(0, idot + 1);
                        ps = ps.substr(idot + 1);
                    }
                    if (ps[0] >= '0' && ps[0] <= '9') {
                        var unit = ps.slice(-2);
                        if (unit === 'mi')
                            pk[p] = pre + uconv(ps, miStr);
                        else if (unit === 'ft')
                            pk[p] = pre + uconv(ps, ftStr);
                    }
                }
                str = pk.join(' ');
            }

            str = acaconv(str);
            descm = sdescm = str;
        }

        // set up stars
        sdescm = '<div class="notranslate">' + sdescm.split('*').join('&#9733;') + '</div>';

        // set up thumbnail
        if (item.thumbnail) {
            //width of 186 produces an even white border on both sides for standard infowindow size
            //(the infowindow will get wider if the canyon name is very long, and produce more whitespace on the right)
            sdescm += '<div><img style="border:1px solid #808080;max-width:186px;max-height:150px;width:auto;height:auto" src="' + item.thumbnail + '"/></div>';
        }

        // set up extras
        if (item.kmlfile && item.kmlfile !== "") {
            sdescm += '<div><i>';
            sdescm += '<a href="javascript:toggleRoutes(\'' + urlencode(item.kmlfile) + '\',\'' + urlencode(item.id) + '\');">Show track data on map</a>';
            sdescm += '</i></div>';
        }
        var extra = ' - <a href="' + SITE_BASE_URL + '/Location?locdist=30mi&locname=Coord:' + item.location.lat.toFixed(4) + ',' + item.location.lng.toFixed(4) + '">Search nearby</a>';
        sdescm += displaydirections(item.location.lat, item.location.lng, extra);
        
        var permitStatus = "None";
        if (item.permits && item.permits !== 'No') {
            permitStatus = item.permits;
        }

        // set up infowindow
        var contentString = '<div style="width:auto;height:auto;overflow:hidden;">';

        // add title
        contentString += '<b class="notranslate">' + sitelink(item.id, nonamespace(item.id)) + '</b>';

        // load addbutton
        var kmladdbutton = document.getElementById("kmladdbutton");
        if (kmladdbutton)
            contentString += '<input class="submitoff addbutton" title="Add to List" type="submit" onclick="addToList(\'' + item.id.split("'").join("%27") + '\')" value="+">';

        // add elevation
        //contentString += '<br><span id="infoelevation"></span>';

        // add permit status
        var permitStatusString = "";
        if (permitStatus !== 'None') {
            switch (permitStatus) {
            case "Yes":
                permitStatusString += "<br>*permit required*";
                break;
            case "Restricted":
                permitStatusString += "<br>*access restricted*";
                break;
            case "Closed":
                permitStatusString += "<br>*closed to access*";
                break;
            }
        }
        contentString += permitStatusString;

        // add separator and mini-description
        contentString += '<hr/>' + sdescm + '</div>';

        if (item.infocontent) contentString = item.infocontent;
        var infowindowm = new google.maps.InfoWindow({ content: contentString });

        var tooltipString = item.infodescription
            ? item.infodescription
            : '<b class="nostranslate">' + nonamespace(item.id) + '</b><br>' + descm.split('*').join('&#9733;');

        tooltipString += permitStatusString;

        // build and add marker with infowindow callback
        var positionm = new google.maps.LatLng(item.location.lat, item.location.lng);

        var marker = new google.maps.Marker({
            position: positionm,
            map: map,
            icon: iconm,
            name: nonamespace(item.id), /*title:item.id/*+":"+line[4],*/
            description: tooltipString,
            infowindow: infowindowm,
            zIndex: zindexm,
            optimized: false
        });

        // add permit status icon by overlaying the corresponding 'closed' image on the marker
        var closedMarker = null;
        if (permitStatus !== 'None') {
            var iconUrl = "";
            var iconSize, iconAnchor;

            switch (permitStatus) {
            case "Yes":
                iconUrl = ICON_PERMIT_YES;
                iconSize = new google.maps.Size(25, 25);
                iconAnchor = new google.maps.Point(12, 26);
                break;
            case "Restricted":
                iconUrl = ICON_RESTRICTED;
                iconSize = new google.maps.Size(20, 20);
                iconAnchor = new google.maps.Point(9.5, 24);
                break;
            case "Closed":
                iconUrl = ICON_CLOSED;
                iconSize = new google.maps.Size(25, 25);
                iconAnchor = new google.maps.Point(12, 26);
                break;
            }

            var closedImage = {
                url: iconUrl,
                scaledSize: iconSize,
                anchor: iconAnchor
            };

            closedMarker = new google.maps.Marker({
                position: positionm,
                map: map,
                icon: closedImage,
                clickable: false,
                zIndex: zindexm + 1,
                optimized: false
            });
        }

        google.maps.event.addListener(marker,
            "mouseover",
            function(e) {
                this.highlight = new google.maps.Marker({
                    position: this.getPosition(),
                    icon: SITE_BASE_URL + "/images/3/39/Starn_b.png",
                    draggable: false,
                    clickable: false,
                    optimized: false,
                    zIndex: this.zIndex - 1
                });
                this.priority = 0;
                this.highlight.setMap(map);
                tooltip.show(this.description, e, this);
            });

        google.maps.event.addListener(marker,
            "mouseout",
            function() {
                tooltip.hide(this);
                if (this.highlight != null) {
                    this.highlight.setMap(null);
                    this.highlight = null;
                }
            });

        google.maps.event.addListener(marker,
            'click',
            function() {
                displayinfowindow(this);
            });

        
        item.stars = (item.stars != null ? item.stars : -1);
        
        marker.locationData = item;
        marker.oposition = positionm;
        marker.isVisible = true;

        // add marker to map
        markers.push(marker);
        if (!!closedMarker) {
            marker.closedMarker = closedMarker;
        }

        boundslist.extend(positionm);
    }

    // highlight
    var kmladdlist = document.getElementById("kmladdlist");
    if (kmladdlist) {
        var addlist = kmladdlist.innerHTML.split(';');
        if (addlist.length > 0)
            addhighlight(addlist);
    }

    if (numberAdded > 0 && fitbounds) {
        // auto zoom & center map
        var ne = boundslist.getNorthEast();
        var sw = boundslist.getSouthWest();
        if (distance({ lat: ne.lat(), lng: ne.lng() }, { lat: sw.lat(), lng: sw.lng() }) < 1) {
            map.setZoom(11);
            map.panTo(markers[0].position);
        } else {
            map.fitBounds(boundslist);
            map.panToBounds(boundslist);
        }

        zindex = 6000;
    }

    addNewItemsToTable(list);
}

function getrwlist(data) {
    var list = [];
    $.each(data.query.results,
        function(i, item) {
            var v;
            var obj = { id: item.fulltext };
            v = item.printouts["Has coordinates"];
            if (v && v.length > 0) {
                obj.location = { lat: v[0].lat, lng: v[0].lon };

                // icon
                v = item.printouts["Has star rating"];
                obj.stars = (v && v.length > 0) ? v[0] : 0;
                v = item.printouts["Has location class"];
                if (v && v.length > 0) {
                    obj.activity = v[0];
                    obj.icon = KML_ICON_LIST[Number(obj.stars) + Number(obj.activity) * 6];
                }

                // numeric icons
                if (kmlsummary)
                    if (obj.id[0] === '#') {
                        var num = obj.id.slice(1).split(' ')[0];
                        obj.icon = 'https://sites.google.com/site/rwicons/bg' + obj.stars + '_' + num + '.png';
                    }

                v = item.printouts["Has summary"];
                if (v && v.length > 0) {
                    obj.description = v[0];
                }
                obj.technicalRating = parseTechnicalRating(obj.description);
                v = item.printouts["Has banner image file"];
                if (v && v.length > 0)
                    obj.thumbnail = v[0];
                v = item.printouts["Has KML file"];
                if (v && v.length > 0)
                    obj.kmlfile = v[0];
                v = item.printouts["Located in region"];
                if (v && v.length > 0)
                    obj.region = v[0].fulltext;
                v = item.printouts["Requires permits"];
                if (v && v.length > 0) {
                    obj.permits = v[0];
                    if (obj.permits === "No") obj.permits = "None";
                }
                v = item.printouts["Has best season parsed"];
                if (v && v.length > 0)
                    obj.bestMonths = parseBestMonths(v[0].fulltext);

                v = item.printouts["Has info major region"];
                if (v && v.length > 0) {
                    obj.parentRegions = parseMajorRegion(v[0]);
                }
                v = item.printouts["Has total rating"];
                if (v && v.length > 0)
                    obj.totalRating = v[0];
                v = item.printouts["Has total counter"];
                if (v && v.length > 0)
                    obj.totalCounter = v[0];
                v = item.printouts["Has rank rating"];
                if (v && v.length > 0)
                    obj.rankRating = v[0];
                v = item.printouts["Has info typical time"];
                if (v && v.length > 0) {
                    obj.typicalTime = v[0];
                    obj.averageTime = parseTypicalTime(obj.typicalTime);
                }
                v = item.printouts["Has length of hike"];
                if (v && v.length > 0)
                    obj.hikeLength = v[0];
                v = item.printouts["Has length"];
                if (v && v.length > 0)
                    obj.descentLength = v[0];
                v = item.printouts["Has depth"];
                if (v && v.length > 0)
                    obj.descentDepth = v[0];
                v = item.printouts["Has info rappels"];
                if (v && v.length > 0) {
                    obj.rappels = v[0];
                    if (obj.rappels === "r") obj.rappels = "?r"; //ropewiki doesn't handle 'unknown' values for rappels correctly and sends just 'r'
                }
                v = item.printouts["Has longest rappel"];
                if (v && v.length > 0) {
                    obj.longestRappel = v[0];
                    if (obj.rappels === undefined) { //ropewiki sets 0 rap height if it's non-technical canyon, so need to match with 0r
                        obj.rappels = "0r";
                    }
                }
                obj.rappelsNum = parseRappels(obj.rappels);
                v = item.printouts["Has info"];
                if (v && v.length > 0)
                    obj.infoSummary = v[0];
                v = item.printouts["Has condition summary"];
                if (v && v.length > 0) {
                    obj.conditionSummary = v[0];
                    obj.conditionDate = parseConditionDate(obj.conditionSummary);
                }

                list.push(obj);
            }
        });
    return list;
}

function getkmllist(data, fitbounds) {
    var list = getrwlist(data);

    loadlist(list, fitbounds);

    hideSearchMapLoader();
}

const loadLimit = 100;
var loadOffset = 0;
var locationsTotalWithinArea;
var locationsLoadedWithinArea = 0;

function loadMoreLocations() {
    
    displaySearchMapLoader();

    if (locationsTotalWithinArea === undefined) //need to query for the total
    {
        var urlCount = SITE_BASE_URL +
            '/index.php?action=raw&templates=expand&ctype=text/x-wiki' +
            '&title=Template:RegionCountArea' +
            '&query=' + urlencode('[[Category:Canyons]][[Has coordinates::+]]' + locationsQuery);

        $.get(geturl(urlCount), function (data) {
            if (data !== undefined) {
                locationsTotalWithinArea = Number(data);
                loadMoreLocations();
            }
        });

        return;
    }

    var numberToLoad = locationsTotalWithinArea - (loadOffset + loadLimit * 2) > 0
        ? loadLimit
        : loadLimit * 2; //if it's less than twice the load number to load all of them, then just load all of them.

    $.getJSON(geturl(SITE_BASE_URL + '/api.php?action=ask&format=json' +
            '&query=' + urlencode('[[Category:Canyons]][[Has coordinates::+]]'+ locationsQuery) + getLocationParameters(numberToLoad) +
            "|order=descending,ascending|sort=Has rank rating,Has name" +
            "|offset=" + loadOffset),
        function (data) {
            var fitBounds = searchMapRectangle === undefined;
            getkmllist(data, fitBounds);
        });

    loadOffset += numberToLoad;
}

function setLoadingInfoText() { //called at the end of updateTable()

    setHeaderText();

    locationsLoadedWithinArea = searchMapRectangle !== undefined
        ? countLocationsWithinSearchArea()
        : Math.min(loadOffset, locationsTotalWithinArea);

    if (loadOffset >= locationsTotalWithinArea) {
        loadingFinished();
    }
    
    // more button
    var loadmore = document.getElementById("loadmore");
    loadmore.innerHTML = '<button onclick="loadMoreLocations()">+</button> ';

    var info = "Loaded ";

    var totalLoaded = markers.length;

    var moreToLoad = locationsLoadedWithinArea < locationsTotalWithinArea;
    if (!moreToLoad) {
        loadingFinished();
        return;
    }

    info += locationsLoadedWithinArea + " of ";

    var regionOrSearchArea = searchMapRectangle === undefined ? "region" : "search area";

    info += locationsTotalWithinArea + " locations in this " + regionOrSearchArea + " (highest rated locations are loaded first).";

    if (locationsLoadedWithinArea !== totalLoaded) info += ". " + totalLoaded + " total locations loaded.";

    info += getFilteringInfo();

    var loadingInfo = document.getElementById("loadinginfo");
    loadingInfo.innerHTML = info;


    //this is the link to load more that is below the bottom of the table, but it should only affect the rows on the table
    var morelist = $(".loctable .smw-template-furtherresults a");
    if (morelist.length === 1) {
        morelist[0].href = 'javascript:loadMoreLocations();';
    }
}

function loadingFinished() {
    // loaded all available locations
    var regionOrSearchArea = searchMapRectangle === undefined ? "region" : "search area";
    var info;
    switch (locationsLoadedWithinArea) {
        case 0:
            info = "There are no locations within this " + regionOrSearchArea;
            break;
        case 1:
            info = "Loaded the single location in this " + regionOrSearchArea;
            break;
        case 2:
            info = "Loaded both locations in this " + regionOrSearchArea;
            break;
        default:
            info = "Loaded all " + locationsLoadedWithinArea + " locations in this " + regionOrSearchArea;
            break;
    }

    var totalLoaded = markers.length;
    if (locationsLoadedWithinArea !== totalLoaded) info += ". (" + totalLoaded + " total locations loaded)";

    if (searchMapRectangle === undefined && locationsTotalWithinArea === 0) //search map was used but is now cancelled
        info = "Loaded " + totalLoaded + " total locations";

    var filterInfo = getFilteringInfo(); 
    if (filterInfo) info += "." + filterInfo;
    
    var loadingInfo = document.getElementById("loadinginfo");
    loadingInfo.innerHTML = info;

    var loadmore = document.getElementById("loadmore");
    loadmore.innerHTML = "";

    //var morelist = $(".loctable .smw-template-furtherresults a");
    //if (morelist.length === 1) morelist[0].parentNode.removeChild(morelist[0]);
}

function setHeaderText() {
    if (!searchWasRun) return; //don't change header unless custom search rectangle was run

    var regions = [];
    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        if (!marker.isVisible) continue;
        
        var parentRegions = marker.locationData.parentRegions;
        var parentRegion = parentRegions && parentRegions.length !== 0
            ? parentRegions[0]
            : marker.locationData.region;

        if (!regions.includes(parentRegion))
                regions.push(parentRegion);
    }

    var firstHeadingText = "";
    if (regions.length > 0)
        firstHeadingText = regions[0];

    if (regions.length > 1)
        firstHeadingText += ", " + regions[1];

    if (regions.length > 2)
        firstHeadingText += ", and others";

    if (firstHeadingText !== "")
    document.getElementById("firstHeading").children[1].innerHTML = firstHeadingText;
}

function getFilteringInfo() {
    var filterInfo = "";

    var filterschk = document.getElementById('filterschk');
    if (filterschk != null && filterschk.checked) {
        filterInfo = " Filters match ";
        var locationsDisplayed = 0;
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].isVisible) locationsDisplayed++;
        }

        var totalLoaded = markers.length;

        if (totalLoaded === locationsDisplayed)
            filterInfo += "all " + totalLoaded;
        else
            switch (locationsDisplayed) {
            case 0:
                filterInfo += "no";
                break;
            case 1:
                filterInfo += "a single";
                break;
            default:
                filterInfo += locationsDisplayed;
                break;

            }

        filterInfo += " location" + (locationsDisplayed !== 1 ? "s" : "") + ".";
    }
    return filterInfo;
}

function countLocationsWithinSearchArea() {
    if (searchMapRectangle === undefined) return 0;

    var bounds = searchMapRectangle.bounds;

    var numLocations = 0;

    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        if (bounds.contains(marker.position))
            numLocations++;
    }

    return numLocations;
}

function nonamespace(label) {
    return label.replace("Events:", "");
}

function setPrimaryMarker(name, lat, lng, zIndex) {
    var titleStyle = 'style = "font-family: arial, sans-serif;font-size: medium;font-weight:bold;"';
    var html = "<div " + titleStyle + ">" + name.replaceAll("_", " ") + "</div>";
    html += "<br/>";
    html += '<div id="elevation" style="font-size: small;">' + displaylocation(lat, lng, '<br>Elevation: ~') + '</div>';

    var latLng = new google.maps.LatLng(lat, lng);

    var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        infowindow: new google.maps.InfoWindow({ content: html }),
        optimized: false,
        zIndex: zIndex
    });

    google.maps.event.addListener(marker,
        'click',
        function () {
            this.infowindow.open(map, this);
            getGeoElevation(this.getPosition(), "elevation", "~");
        });

    boundslist.extend(latLng);
}

function centermap() {
    if (!map) return;

    var center = map.getCenter();
    google.maps.event.trigger(map, 'resize');

    map.panTo(center);
}

function addToList(id) {
    var oldid;

    function reattribute(elem) {
        var elems = elem.childNodes;
        for (var e = 0; e < elems.length; ++e) {
            elem = elems[e];
            if (elem.attributes)
                for (var a = 0; a < elem.attributes.length; ++a) {
                    if (elem.attributes[a].value.indexOf(oldid) >= 0)
                        elem.attributes[a].value = elem.attributes[a].value.split(oldid).join(id);
                }
            reattribute(elem);
        }
    }

    var kmladdbutton = document.getElementById("kmladdbutton");
    if (kmladdbutton) {
        reattribute(kmladdbutton);
        var kmlform = kmladdbutton.getElementsByTagName('BUTTON');
        if (kmlform.length > 0)
            kmlform[0].click();

        if (lastinfowindow)
            lastinfowindow.close();

        var idlist = [id];
        addhighlight(idlist);
        oldid = id;
    }
}

function parseBestMonths(bestSeasonRaw) {
    var parsed = bestSeasonRaw.replace(/,/g, '');
    //example: "Season=Spring to Fall, BEST Apr,May,Oct,Nov"  returns "...,xXX,xxx,xXX" where the months are Dec(12) through Nov
    //because format of 'parsed' is dec to nov, move dec to the end of the string so that the months line up 1 to 12 (-1)
    parsed = parsed.substr(1) + parsed.substr(0, 1);
    var locationBestMonths = [];
    for (var month = 0; month < 12; ++month) {
        var test = parsed.substr(month, 1);
        if (test === "X" || test === "x") locationBestMonths.push(months[month]);
    }

    return locationBestMonths;
}

function parseTechnicalRating(description) {
    //example (Tanner Creek):  "4.6*  4C4 III R (<i>v5a7&nbsp;III</i>) 5h-8h 5.5mi 5r 90ft"

    //ACA
    const technical = ["1", "2", "3", "4"];
    const water = ["A", "B", "C", "C1", "C2", "C3", "C4"];
    const time = ["I", "II", "III", "IV", "V", "VI"];
    const risk = ["PG", "R", "R-", "X", "XX"];

    //French
    const vertical = ["v1", "v2", "v3", "v4", "v5", "v6", "v7"];
    const aquatic = ["a1", "a2", "a3", "a4", "a5", "a6", "a7"];
    const commitment = ["III", "II", "IV", "I", "VI", "V"]; //order this way because using 'startsWith' to test

    var technicalRating = {};

    if (!description) description = "";
    description = description.replace(/&nbsp;/g, ' ');
    var entries = description.split(/ +/); //regex for multiple spaces combine to single space
    for (var i = 0; i < entries.length; ++i) {
        testEntry: {
            var test = entries[i];
            if (test.includes("*")) break testEntry; //star rating

            var j;
            if (technicalRating["technical"] == null)
                for (j = 0; j < technical.length; ++j) {
                    if (test.startsWith(technical[j])) {
                        technicalRating["technical"] = technical[j];
                        test = test.substr(technical[j].length);
                        break; //just break the 'for j' loop, need to test 'water' using same entry
                    }
                }

            if (technicalRating["water"] == null)
                for (j = 0; j < water.length; ++j) {
                    if (test === water[j]) {
                        technicalRating["water"] = water[j];
                        break testEntry;
                    }
                }

            if (technicalRating["time"] == null)
                for (j = 0; j < time.length; ++j) {
                    if (test === time[j]) {
                        technicalRating["time"] = time[j];
                        break testEntry;
                    }
                }

            if (technicalRating["risk"] == null)
                for (j = 0; j < risk.length; ++j) {
                    if (test === risk[j]) {
                        technicalRating["risk"] = risk[j];
                        break testEntry;
                    }
                }

            if (technicalRating["vertical"] == null)
                for (j = 0; j < vertical.length; ++j) {
                    var index = test.indexOf(vertical[j]);
                    if (index >= 0) {
                        technicalRating["vertical"] = vertical[j];
                        test = test.substr(index + vertical[j].length);
                        break; //just break the 'for j' loop, need to test 'aquatic' using same entry
                    }
                }

            if (technicalRating["aquatic"] == null)
                for (j = 0; j < aquatic.length; ++j) {
                    if (test.includes(aquatic[j])) {
                        technicalRating["aquatic"] = aquatic[j];
                        break testEntry;
                    }
                }

            if (technicalRating["commitment"] == null)
                for (j = 0; j < commitment.length; ++j) {
                    if (test.startsWith(commitment[j])) {
                        technicalRating["commitment"] = commitment[j];
                        break testEntry;
                    }
                }
        }
    }

    technicalRating.combinedACA =
        (!!technicalRating.technical ? technicalRating.technical : "") + (!!technicalRating.water ? technicalRating.water : "") +
        " " + (!!technicalRating.time ? technicalRating.time : "") +
        ((!!technicalRating.extra_risk) ? " " + technicalRating.extra_risk : "");

    technicalRating.combinedFrench =
        (!!technicalRating.vertical ? technicalRating.vertical : "") + (!!technicalRating.aquatic ? technicalRating.aquatic : "") +
        " " + (!!technicalRating.commitment ? technicalRating.commitment : "");
    
    return technicalRating;
}

function parseMajorRegion(majorRegion) {
    const regex = /\|(.*?)\]\]]*/g; //matches the pattern: | match ]]
    
    var regions = [];
    var match = regex.exec(majorRegion);
    while (match != null) {
        regions.push(match[1]);
        match = regex.exec(majorRegion);
    }

    return regions;
}

function parseRappels(rappels) {
    //example: 8-15r + 2j
    if (!rappels) return rappels;

    var index = rappels.indexOf("r");
    var index2 = rappels.indexOf("-");
    if (index2 > 0 && index2 < index) index = index2;

    if (index < 0) return 999; //unknown, could be anything
    var rapNumRaw = rappels.substring(0, index);
    var rapNum = Number(rapNumRaw);

    if (rapNum === "NaN") return 999;

    return rapNum;
}

function parseTypicalTime(typicalTime) {
    //examples: 1h, 2-4h, 4 days, 14h - 2 days, 1-2 days
    if (typicalTime === undefined || typicalTime == null) return typicalTime;

    function getHours(time) {
        var hours, units = undefined;
        var hIndex = time.indexOf("h");
        var dIndex = time.indexOf("d");
        if (hIndex > 0) {
            hours = Number(time.substr(0, hIndex));
            units = "h";
        }
        else if (dIndex > 0) {
            hours = Number(time.substr(0, dIndex));
            units = "d";
        } else
            hours = Number(time);

        return { hours: hours, units: units };
    }

    var times = typicalTime.split("-");
    var shortestTime = getHours(times[0]);

    if (times.length === 1) {
        if (shortestTime.units === undefined) return undefined;
        if (shortestTime.units === "d") {
            shortestTime.hours *= 24;
            shortestTime.units = "h";
        }
        return shortestTime.hours;
    } else {
        var longestTime = getHours(times[1]);
        if (shortestTime.units === undefined) shortestTime.units = longestTime.units;
        if (shortestTime.units === undefined || longestTime.units === undefined) return undefined;

        if (shortestTime.units === "d") {
            shortestTime.hours *= 24;
            shortestTime.units = "h";
        }
        if (longestTime.units === "d") {
            longestTime.hours *= 24;
            longestTime.units = "h";
        }

        var avgTime = (shortestTime.hours + longestTime.hours) / 2;

        return avgTime;
    }
}

function parseConditionDate(conditionsSummary) {
    if (conditionsSummary == undefined) return undefined;

    const regex = /'''(.*?)'''/g; //matches the pattern: ''' match '''

    var date = regex.exec(conditionsSummary);
    return date.length > 1
        ? new Date(date[1]).getTime() / 1000
        : undefined;
}
