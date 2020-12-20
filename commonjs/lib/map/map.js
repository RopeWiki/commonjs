
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

    var n = list.length;
    for (i = 0; i < list.length; ++i) {
        var item = list[i];

        if (!item.id || item.id === "")
            continue;

        var alreadyExists = false;
        for (var j = 0; j < markers.length; ++j) {
            if (markers[j].position.lat() === item.location.lat && markers[j].position.lng() === item.location.lng) {
                alreadyExists = true;
                break;
            }
        }
        if (alreadyExists) continue;

        ++n;
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

        contentString += '<hr/>' + sdescm + '</div>';
        if (item.infocontent) contentString = item.infocontent;
        var infowindowm = new google.maps.InfoWindow({ content: contentString });

        var descriptionString = item.infodescription
            ? item.infodescription
            : '<b class="nostranslate">' + nonamespace(item.id) + '</b><br>' + descm.split('*').join('&#9733;');

        if (permitStatus !== 'None') {
            switch (permitStatus) {
            case "Yes":
                descriptionString += "<br>*permit required*";
                break;
            case "Restricted":
                descriptionString += "<br>*access restricted*";
                break;
            case "Closed":
                descriptionString += "<br>*closed to access*";
                break;
            }
        }

        // build and add marker with infowindow callback
        var positionm = new google.maps.LatLng(item.location.lat, item.location.lng);

        var marker = new google.maps.Marker({
            position: positionm,
            map: map,
            icon: iconm,
            name: nonamespace(item.id), /*title:item.id/*+":"+line[4],*/
            description: descriptionString,
            infowindow: infowindowm,
            zIndex: zindexm,
            optimized: false
        });

        // add permit status by overlaying the 'closed' image on the marker
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

        var params = {};
        
        params.stars = (item.stars != null ? item.stars : -1);
        params.activity = item.activity;
        params.permits = permitStatus;
        params.bestMonths = item.bestMonths;
        params.technicalRating = item.technicalRating;

        marker.params = params;
        marker.oposition = positionm;
        
        markers.push(marker);
        if (!!closedMarker) {
            marker.closedMarker = closedMarker;
            markers.push(closedMarker);
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

    if (n > 0 && fitbounds) {
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

    return n;
}

function getrwlist(data) {
    var list = [];
    $.each(data.query.results,
        function(i, item) {
            var v;
            ++kmllistn;
            var obj = { id: item.fulltext };
            v = item.printouts["Has coordinates"];
            if (v && v.length > 0) {
                obj.location = { lat: v[0].lat, lng: v[0].lon };

                // icon
                v = item.printouts["Has star rating"];
                if (v && v.length > 0) {
                    obj.stars = Number(v[0]);
                    v = item.printouts["Has location class"];
                    if (v && v.length > 0) {
                        obj.icon = KML_ICON_LIST[obj.stars + Number(v[0]) * 6];
                        obj.activity = v[0];
                    }
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
                if (v && v.length > 0)
                    obj.permits = v[0];
                v = item.printouts["Has best season parsed"];
                if (v && v.length > 0)
                    obj.bestMonths = parseBestMonths(v[0].fulltext);
                list.push(obj);
            }
        });
    return list;
}

function getkmllist( data ) {
    var list = getrwlist(data);

    if (typeof data['query-continue-offset'] == "undefined")
        morestop();

    loadlist(list, true);
}

var morestep = 100;
var moremapc = 0, morelistc = 0;

function morekmllist(loccontinue, loctotal) {
    ++moremapc;
    map.setOptions({ draggableCursor: 'wait' });

    $.getJSON(geturl(kmllisturl + "|offset=" + loccontinue), getkmllist)
        .always(function() {
            if (--moremapc <= 0)
                map.setOptions({ draggableCursor: '' });
        });

    if (loccontinue > 0) {
        var tablelist = $(".loctable .loctabledata");

        if (tablelist.length === 1)
        {
            ++morelistc;
            document.body.style.cursor = 'wait';
            $.get(geturl(tablelisturl + '&offset=' + loccontinue),
                function(data) {
                    var newtablelist = $('#morekmllist').html($(data).find('.loctable').html());
                    if (newtablelist.length === 1) {
                        var newdocument = newtablelist[0];
                        newdocument.getElementsByName = function(name) {
                            var list = [];
                            return list;
                        }
                        newdocument.getElementById = function(name) {
                            return null;
                        }
                        loadUserInterface(newdocument);
                        findtag(newdocument.childNodes,
                            'TR',
                            function(item) {
                                tablelist[0].appendChild(item);
                            });
                    }
                }).always(function() {
                if (--morelistc <= 0)
                    document.body.style.cursor = '';
            });
        }
    }

    loccontinue += morestep;
    if (loccontinue >= loctotal) {
        morestop();
        return;
    }

    // more button
    var loadmore = document.getElementById("loadmore");
    if (loadmore)
        loadmore.innerHTML = '<button onclick="morekmllist(' + loccontinue + ',' + loctotal + ')">+</button> ';

    var loccount = document.getElementById("loccount");
    if (loccount)
        loccount.innerHTML = loccontinue + " of ";

    var morelist = $(".loctable .smw-template-furtherresults a");
    if (morelist.length === 1) {
        morelist[0].href = 'javascript:morekmllist(' + loccontinue + ',' + loctotal + ');';
    }
}

function morestop() {
    // finished loading
    var loccount = document.getElementById("loccount");
    if (loccount) loccount.parentNode.removeChild(loccount);

    var loadmore = document.getElementById("loadmore");
    if (loadmore) loadmore.parentNode.removeChild(loadmore);

    var morelist = $(".loctable .smw-template-furtherresults a");
    if (morelist.length === 1) morelist[0].parentNode.removeChild(morelist[0]);
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

function filterMarkers() {

    var filters = {};

    // append filters (if any)
    var mid, list, l, i;
    var filterschk = document.getElementById('filterschk');
    if (filterschk != null && filterschk.checked) {
        var chk = document.getElementsByClassName('filterchk');
        for (i = 0; i < chk.length; i++) {
            var attr = [];

            mid = chk[i].id;
            list = document.getElementsByClassName(mid + '_chk');
            
            var isDisabled = list[0].disabled;
            if (!isDisabled) {
                for (l = 0; l < list.length; l++)
                    if (list[l].checked) {
                        var value = list[l].id.substring(list[l].id.lastIndexOf('-') + 1);
                        attr.push(value);
                    }
            }
            filters[mid] = attr;
        }
    }

    for (i = 0; i < markers.length; ++i) {
        
        var marker = markers[i];
        var p = marker.params;
        if (!p) continue;

        var display = true;

        runFilter: {
            if (!filters || Object.keys(filters).length === 0) break runFilter; //no filters set, enable all

            //stars
            var stars = filters["star"];
            if (!!stars && stars.length > 0 && !(stars.includes(p.stars.toString())))
                display = false;

            //activity type
            var activityTypes = filters["loctype"];
            if (!!activityTypes && activityTypes.length > 0 && !(activityTypes.includes(p.activity)))
                display = false;

            //permits
            var permits = filters["permits"];
            if (!!permits && permits.length > 0 && !(permits.includes(p.permits)))
                display = false;

            //best season
            //example: Season=Spring to Fall, BEST Apr,May,Oct,Nov  returns ...,xXX,xxx,xXX where the months are Dec(12) through Nov
            var bestSeason = filters["best_month"];
            if (!!bestSeason && bestSeason.length > 0) {
                if (!!(p.bestMonths)) {
                    var monthMatched = false;
                    for (var j = 0; j < bestSeason.length; ++j) {
                        if (p.bestMonths.includes(bestSeason[j])) {
                            monthMatched = true;
                            break;
                        }
                    }
                    if (!monthMatched) display = false;
                } else {
                    display = false;
                }
            }

            //technical rating ACA
            var technical = filters["technical"];
            if (!!technical && technical.length > 0 && !(technical.includes(p.technicalRating.technical)))
                display = false;

            var water = filters["water"];
            if (!!water && water.length > 0 && !(water.includes(p.technicalRating.water)))
                display = false;

            var time = filters["time"];
            if (!!time && time.length > 0 && !(time.includes(p.technicalRating.time)))
                display = false;

            var extraRisk = filters["extra_risk"];
            if (!!extraRisk && extraRisk.length > 0 && !(extraRisk.includes(p.technicalRating.risk)))
                display = false;

            //technical rating French
            var vertical = filters["vertical"];
            if (!!vertical && vertical.length > 0 && !(vertical.includes(p.technicalRating.vertical)))
                display = false;

            var aquatic = filters["aquatic"];
            if (!!aquatic && aquatic.length > 0 && !(aquatic.includes(p.technicalRating.aquatic)))
                display = false;

            var commitment = filters["commitment"];
            if (!!commitment && commitment.length > 0 && !(commitment.includes(p.technicalRating.commitment)))
                display = false;
        }

        marker.setMap(display ? map : null);

        if (marker.closedMarker)
            marker.closedMarker.setMap(display ? map : null);
    }
}

function parseBestMonths(bestSeasonRaw) {
    var parsed = bestSeasonRaw.replace(/,/g, '');
    //format of 'parsed' is dec to nov. move dec to the end of the string so that the months line up 1 to 12 (-1)
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

    return technicalRating;
}