// @ts-checkoff

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
    if (!icon) icon = PINMAP_ICON;

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
        var extra = ' - <a href="' + SITE_BASE_URL + '/Location?locdist=30mi&locname=' + item.location.lat.toFixed(4) + ',' + item.location.lng.toFixed(4) + '">Search nearby</a>';
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
            contentString += '<input class="submitoff addbutton" title="Add to a custom list" type="submit" onclick="addToList(\'' + item.id.split("'").join("%27") + '\')" value="+">';

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
                permitStatusString += "<br>*access is restricted*";
                break;
            case "Closed":
                permitStatusString += "<br>*closed to entry*";
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
                this.mouseoverhighlight = new google.maps.Marker({
                    position: this.getPosition(),
                    icon: MARKER_MOUSEOVER_HIGHLIGHT,
                    draggable: false,
                    clickable: false,
                    optimized: false,
                    zIndex: this.zIndex - 1
                });
                this.priority = 0;
                this.mouseoverhighlight.setMap(map);
                tooltip.show(this.description, e, this);
            });

        google.maps.event.addListener(marker,
            "mouseout",
            function() {
                tooltip.hide(this);
                if (this.mouseoverhighlight != null) {
                    this.mouseoverhighlight.setMap(null);
                    this.mouseoverhighlight = null;
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

                // ratings & icon
                v = item.printouts["Has rank rating"]; //rating weighted by count (popularity), used for sorting only
                obj.rankRating = (v && v.length > 0) ? v[0] : 0;
                v = item.printouts["Has total rating"]; //weighted rating with users and conditions, used to select icon
                obj.totalRating = (v && v.length > 0) ? v[0] : 0;
                //apply formula -- raw rating rounded to integer, used for the icon selector.
                // 4-5-5.0 = 5, 4.0-4.5 = 4, the rest rounded down to nearest int
                obj.stars = obj.totalRating >= 4.5
                    ? 5
                    : Math.floor(obj.totalRating);
                v = item.printouts["Has total counter"];
                if (v && v.length > 0)
                    obj.totalCounter = v[0];
                //obj.rankRating = calculateRankRating(obj);
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
                v = item.printouts["Has info regions"];
                if (v && v.length > 0) {
                    obj.regionList = v[0].split(/[;/]+/); //split on both ; and /
                    obj.region = obj.regionList[obj.regionList.length - 1];
                    obj.nameWithoutRegion = parseLocationNameWithoutRegion(obj);
                }
                v = item.printouts["Has info major region"];
                if (v && v.length > 0) {
                    obj.parentRegions = parseMajorRegion(v[0]);
                }
                v = item.printouts["Requires permits"];
                if (v && v.length > 0) {
                    obj.permits = v[0];
                    if (obj.permits === "No") obj.permits = "None";
                }
                v = item.printouts["Has best season parsed"];
                if (v && v.length > 0)
                    obj.bestMonths = parseBestMonths(v[0].fulltext);
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
                    if (obj.longestRappel.value === 0 && obj.rappels === undefined) { //ropewiki sets 0 rap height if it's non-technical canyon, so need to match with 0r
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

                v = item.printouts["Has vehicle type"];
                if (v && v.length > 0) {
                    obj.vehicleType = v[0];
                }
                v = item.printouts["Has shuttle length"];
                if (v && v.length > 0) {
                    obj.shuttleLength = v[0];
                }

                if (userStarRatings != undefined) {
                    var index = userStarRatings.findIndex(function (x) { return x.name === obj.id; });
                    if (index >= 0) obj.userStars = userStarRatings[index].stars;
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
var userStarRatingsLoaded = false;

function loadMoreLocations(checkCountOnly) {
    
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
                loadMoreLocations(checkCountOnly); //self callback
            }
        });

        return;
    }

    //only call to load more locations if we haven't already loaded all available locations in the search box
    if (searchMapRectangle !== undefined) {
        locationsLoadedWithinArea = countLocationsWithinSearchArea();

        if (!searchWasRun)
            loadOffset = 0;

        var moreToLoad = locationsLoadedWithinArea < locationsTotalWithinArea;
        if (!!checkCountOnly || !moreToLoad) {
            hideSearchMapLoader();
            loadOffset = locationsLoadedWithinArea;
            setLoadingInfoText();
            return;
        }

        searchWasRun = true;
    }

    if (!!checkCountOnly) {
        hideSearchMapLoader();
        setLoadingInfoText();
        return;
    }

    var numberToLoad = locationsTotalWithinArea - (loadOffset + loadLimit * 2) > 0
        ? loadLimit
        : loadLimit * 2; //if it's less than twice the load number to load all of them, then just load all of them.

    //load location data
    $.getJSON(geturl(SITE_BASE_URL + '/api.php?action=ask&format=json' +
            '&query=' + urlencode('[[Category:Canyons]][[Has coordinates::+]]'+ locationsQuery) + getLocationParameters(numberToLoad) +
            "|order=descending,ascending|sort=Has rank rating,Has name" +
            "|offset=" + loadOffset),
        function (data) {
            var fitBounds = searchMapRectangle === undefined;
            getkmllist(data, fitBounds);
            
            //load user list - custom dates and comments
            if (isUserListTable()) {
                //general comment
                $.getJSON(geturl(SITE_BASE_URL + '/api.php?action=ask&format=json' +
                        '&query=' + urlencode('[[Lists:' + listUser + '/List:' + listName + ']]') +
                        '|?Has comment=|mainlabel=-'),
                    function (data) {
                        setUserListGeneralComment(data);
                    });
                //individual list entries
                $.getJSON(geturl(SITE_BASE_URL + '/api.php?action=ask&format=json' +
                        '&query=' + urlencode('[[Has user::' + listUser + ']][[Has list::~' + listName + '*]][[Has location::+]]') +
                        '|?Has location|?Has tentative date|?Has comment' +
                        '|limit=' + 100),
                    function (data) {
                        setUserListInfo(data);
                    });
            }
        });

    //load user star ratings
    var curuser = document.getElementById("curuser");
    if (curuser && !userStarRatingsLoaded) {
        var currentUser = curuser.innerHTML;
        userStarRatingsLoaded = true;

        $.getJSON(geturl(SITE_BASE_URL + '/api.php?action=ask&format=json' +
                '&query=' + urlencode('[[Has page rating::+]][[Has page rating user::' + currentUser + ']]') +
                '|?Has_page_rating_page=|?Has_page_rating=|mainlabel=-' +
                '|limit=' + 2000), //load all ratings the user has made
            function (data) {
                setUserStarRatings(data);
            });
    }

    loadOffset += numberToLoad;
}

function setLoadingInfoText() { //called at the end of updateTable()

    setHeadingTextForRegion();

    var loadingInfo = document.getElementById("loadinginfo");

    if (locationsTotalWithinArea === undefined) {
        loadingInfo.innerHTML = "Please wait, loading from server...";
        return;
    }

    locationsLoadedWithinArea =
        searchMapRectangle !== undefined //set this before possibly proceeding to loadingFinished() in the next line
        ? countLocationsWithinSearchArea()
        //: Math.min(loadOffset, locationsTotalWithinArea);
        //: countLocationsVisibleOnMap();
        : markers.length;

    if (loadOffset >= locationsTotalWithinArea) {
        loadingFinished();
    }
    
    var moreToLoad = locationsLoadedWithinArea < locationsTotalWithinArea;
    if (searchMapRectangle === undefined && searchWasRun) moreToLoad = false;
    if (!moreToLoad) {
        loadingFinished();
        return;
    }
    
    // more button
    var loadmore = document.getElementById("loadmore");
    loadmore.innerHTML = '<button onclick="loadMoreLocations()">+</button> ';

    var info = "Loaded ";

    var totalLoaded = markers.length;

    info += locationsLoadedWithinArea + " of ";

    info += locationsTotalWithinArea + " locations in this " + getRegionOrSearchAreaText() + " (highest rated locations are loaded first)";

    if (locationsLoadedWithinArea !== totalLoaded) info += ". " + totalLoaded + " total locations loaded";

    var filterInfo = getFilteringInfo();
    if (filterInfo) info += "." + filterInfo;

    loadingInfo.innerHTML = info;
}

function loadingFinished() {

    // loaded all available locations

    var loadmore = document.getElementById("loadmore");
    loadmore.innerHTML = "";

    if (isNaN(locationsLoadedWithinArea)) return; //page is first loading -- return

    var info;
    switch (locationsLoadedWithinArea) {
        case 0:
            info = "There are no locations within this " + getRegionOrSearchAreaText();
            break;
        case 1:
            info = "Loaded the single location in this " + getRegionOrSearchAreaText();
            break;
        case 2:
            info = "Loaded both locations in this " + getRegionOrSearchAreaText();
            break;
        default:
            info = "Loaded all " + locationsLoadedWithinArea + " locations in this " + getRegionOrSearchAreaText();
            break;
    }

    var totalLoaded = markers.length;
    if (locationsLoadedWithinArea !== totalLoaded) info += ". (" + totalLoaded + " total locations loaded)";

    if (searchMapRectangle === undefined && searchWasRun) //search map was used but is now cancelled
        info = "Loaded " + totalLoaded + " total locations";

    var filterInfo = getFilteringInfo(); 
    if (filterInfo) info += "." + filterInfo;
    
    var loadingInfo = document.getElementById("loadinginfo");
    loadingInfo.innerHTML = info;
}

function getRegionOrSearchAreaText() {
    return !isUserListTable()
        ? searchMapRectangle === undefined ? "region" : "search area"
        : "list";
}

function setHeadingTextForRegion() {

    var firstHeadingText = "";

    if (isUserListTable()) {
        firstHeadingText = listUser + "'s " + listName + ' list';
        
        // set browser tab title
        document.title = listName;
    } else {
        if (searchWasRun) //don't change heading unless custom search rectangle was run
        {
            var subRegions = {};
            var parentRegions = {};

            for (var i = 0; i < markers.length; i++) {
                var marker = markers[i];
                if (!marker.isVisible) continue;

                var sub = marker.locationData.region;
                var parentRgn = marker.locationData.parentRegions;
                var parent = parentRgn && parentRgn.length !== 0
                    ? parentRgn[0]
                    : null;

                if (sub == undefined && parent == undefined) continue;

                if (parent === null) { //the subregion is actually the parent in this case
                    parent = sub;
                    sub = null;
                }

                if (sub !== null) {
                    if (subRegions[sub] === undefined) {
                        subRegions[sub] = 0;
                    }
                    subRegions[sub] = subRegions[sub] + 1;
                }

                if (parent !== null) {
                    if (parentRegions[parent] === undefined) {
                        parentRegions[parent] = 0;
                    }
                    parentRegions[parent] = parentRegions[parent] + 1;
                }
            }

            var regionsToSort = Object.keys(parentRegions).length > 1 || Object.keys(subRegions).length === 0
                ? parentRegions
                : subRegions;

            // Create items array
            var regions = Object.keys(regionsToSort).map(function (key) {
                return [key, regionsToSort[key]];
            });

            // Sort the array based on the second element
            regions.sort(function (first, second) {
                return second[1] - first[1];
            });

            if (regions.length > 0)
                firstHeadingText = regions[0][0];

            if (regions.length > 1)
                firstHeadingText += ", " + regions[1][0];

            if (regions.length > 2)
                firstHeadingText += ", and others";
        }
    }

    if (firstHeadingText !== "") {
        var heading = document.getElementById("firstHeading");
        heading.children[heading.children.length - 1].innerHTML = firstHeadingText;
    }
}

function getFilteringInfo() {
    var filterInfo = "";

    var filterschk = document.getElementById('filterschk');
    if (filterschk != null && filterschk.checked) {
        filterInfo = " Filters match ";
        var locationsDisplayed = countLocationsVisibleOnMap();

        var totalLoaded = markers.length;

        if (totalLoaded === locationsDisplayed)
            filterInfo += (locationsDisplayed !== 1) ? "all " + totalLoaded : "the one";
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

function countLocationsVisibleOnMap() {
    var locationsDisplayed = 0;
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].isVisible) locationsDisplayed++;
    }
    return locationsDisplayed;
}

function nonamespace(label) {
    return label.replace("Events:", "");
}

function setPrimaryMarker(name, lat, lng, zIndex, iconurl) {
    var titleStyle = 'style = "font-family: arial, sans-serif;font-size: medium;font-weight:bold;"';
    var html = "<div " + titleStyle + ">" + name.replaceAll("_", " ") + "</div>";
    html += "<br/>";
    html += '<div id="elevation" style="font-size: small;">' + displaylocation(lat, lng, '<br>Elevation: ~') + '</div>';

    var latLng = new google.maps.LatLng(lat, lng);

    var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: { url: iconurl, scaledSize: new google.maps.Size(40, 40)},
        infowindow: new google.maps.InfoWindow({ content: html }),
        optimized: false,
        zIndex: zIndex
    });

    google.maps.event.addListener(marker,
        'click',
        function () {
            this.infowindow.open(map, this);
            getElevation(this.getPosition(), "elevation", "~");
        });

    boundslist.extend(latLng);
}

function centermap() {
    if (!map) return;

    var center = map.getCenter();
    google.maps.event.trigger(map, 'resize');

    map.panTo(center);
}

//function calculateRankRating(item) {
//    if (!item.totalRating || !item.totalCounter) return 0;
//    //{{#set:Has rank rating={{#expr: 2.5*{{#var:totalrating}}/5 + 2.5*(1-exp(-{{#var:totalsum}}/6)) }}}} <-Q of 6 here
//    //<!-- Formula: 2.5*stars/5+2.5*(1-exp(-numvotes/Q)) described at 
//    // http://math.stackexchange.com/questions/942738/algorithm-to-calculate-rating-based-on-multiple-reviews-using-both-review-score -->
//    const Q = 2.8;
//    return 2.5 * item.totalRating / 5 + 2.5 * (1 - Math.pow(2.71828183, (-1 * item.totalCounter / Q)));
//}

function parseLocationNameWithoutRegion(item) {
    //remove the region if it's in the table row as it is redundant
    var parsedName = item.id;
    var start, end = 0;

    while (true) {
        start = parsedName.indexOf(' (', end + 1);
        end = parsedName.indexOf(')', start);
        if (start < 0 || end < 0) break;

        //split and reassemble with any items that are not in the region list
        var newParenthetical = "";
        var extractedRegions = parsedName.substring(start + 2, end).split(',').map(function (item) { return item.trim(); });
        for (var i = 0; i < extractedRegions.length; ++i) {
            if (!item.regionList.includes(extractedRegions[i]) &&
                !item.regionList.includes(extractedRegions[i] + " National Park")) { //special case, i.e. Death Valley because it's such a long name
                if (i > 0) newParenthetical += ', ';
                newParenthetical += extractedRegions[i]; //not a region so add it
            }
        }
        if (newParenthetical !== "") newParenthetical = ' (' + newParenthetical + ')';
        parsedName = parsedName.substring(0, start) + newParenthetical + parsedName.substring(end + 1);
        end = end + newParenthetical.length - (end - start + 1); //adjust for new length of parenthetical
    }

    return parsedName;
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
    //examples:
    // "4.6*  4C4 III R (<i>v5a7&nbsp;III</i>) 5h-8h 5.5mi 5r 90ft"
    // "4.9*  <i>3C1&nbsp;IV</i>  (v3a4 III) 6h-13.5h  30r 98ft 2cars"
    // "4.9*  2A <i>IV</i> X (v3a4 III) 6h-13.5h  30r 98ft 2cars" <-note that only the ACA time is italicized; we don't italizice individual components right now

    //ACA
    const technical = ["1", "2", "3", "4"];
    const water = ["A", "B", "C", "C1", "C2", "C3", "C4"];
    const time = ["I", "II", "III", "IV", "V", "VI"];
    const risk = ["PG", "R", "R-", "X", "XX"];

    //French
    const vertical = ["v1", "v2", "v3", "v4", "v5", "v6", "v7"];
    const aquatic = ["a1", "a2", "a3", "a4", "a5", "a6", "a7"];
    const commitment = ["I", "II", "III", "IV", "V", "VI"];

    var technicalRating = {};

    if (!description) description = "";
    description = description.replace(/&nbsp;/g, ' ');
    var entries = description.split(/ +/); //regex for multiple spaces combine to single space
    for (var i = 0; i < entries.length; ++i) {
        testEntry: {
            var test = entries[i];
            if (test.includes("*")) break testEntry; //star rating

            if (test.includes("h") || test.includes("d") ||
                test.includes("r") ||
                test.includes("f") || test.includes("m") ||
                test.includes("c")) {
                entries.length = 0; //we're finished, now were into other fields
                break testEntry;
            }

            if (test.startsWith('(')) {
                test = test.substr(1);
            }

            var isConverted = false;
            if (test.startsWith('<i>')) {
                isConverted = true;
                test = test.substr(3);
            }

            if (test.endsWith(')')) {
                test = test.substr(0, test.length - 1);
            }
            if (test.endsWith('</i>')) {
                test = test.substr(0, test.length - 4);
            }

            var j;
            if (technicalRating["technical"] == null) {
                for (j = 0; j < technical.length; ++j) {
                    if (test.startsWith(technical[j])) {
                        technicalRating["technical"] = technical[j];
                        test = test.substr(technical[j].length);

                        technicalRating["convertedACA"] = isConverted;
                        
                        break; //break only the 'for j' loop, need to test 'water' using same entry
                    }
                }
            }

            if (technicalRating["water"] == null)
                for (j = 0; j < water.length; ++j) {
                    if (test === water[j]) {
                        technicalRating["water"] = water[j];
                        break testEntry;
                    }
                }

            if (technicalRating["time"] == null) {
                for (j = 0; j < time.length; ++j) {
                    if (test === time[j]) {
                        technicalRating["time"] = time[j];
                        break testEntry;
                    }
                }
            }

            if (technicalRating["risk"] == null)
                for (j = 0; j < risk.length; ++j) {
                    if (test === risk[j]) {
                        technicalRating["risk"] = risk[j];
                        break testEntry;
                    }
                }

            if (technicalRating["vertical"] == null) {
                for (j = 0; j < vertical.length; ++j) {
                    if (test.startsWith(vertical[j])) {
                        technicalRating["vertical"] = vertical[j];
                        test = test.substr(vertical[j].length);
                        technicalRating["convertedFrench"] = isConverted;
                        break; //break only the 'for j' loop, need to test 'water' using same entry
                    }
                }
            }

            if (technicalRating["aquatic"] == null)
                for (j = 0; j < aquatic.length; ++j) {
                    if (test.includes(aquatic[j])) {
                        technicalRating["aquatic"] = aquatic[j];
                        break testEntry;
                    }
                }

            if (technicalRating["commitment"] == null) {
                for (j = 0; j < commitment.length; ++j) {
                    if (test === commitment[j]) {
                        technicalRating["commitment"] = commitment[j];
                        break testEntry;
                    }
                }
            }
        }
    }

    var combinedACA =
        (!!technicalRating.technical ? technicalRating.technical : "") + (!!technicalRating.water ? technicalRating.water : "") +
        " " + (!!technicalRating.time ? technicalRating.time : "") +
        ((!!technicalRating.risk) ? " " + technicalRating.risk : "");
    if (combinedACA.trim().length > 0) technicalRating.combinedACA = combinedACA;

    var combinedFrench =
        (!!technicalRating.vertical ? technicalRating.vertical : "") + (!!technicalRating.aquatic ? technicalRating.aquatic : "") +
        " " + (!!technicalRating.commitment ? technicalRating.commitment : "");
    if (combinedFrench.trim().length > 0) technicalRating.combinedFrench = combinedFrench;
    
    return technicalRating;
}

function parseMajorRegion(majorRegion) {
    const regex = /\|(.*?)\]\]]*/g; //matches the pattern: | match ]]  ex: [[Sierra National Forest]] ([[:California|California]])
    
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
