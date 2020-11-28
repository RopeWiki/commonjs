function displayinfowindow(marker) {
    tooltip.hide();

    if (lastinfowindow)
        lastinfowindow.close();

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
        if (markers[i].name == id) {
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
    if (qmaps.length == 0)
        for (var i = 0; i < 6; ++i)
            qmaps.push(map);
    
    // calc nearby (only 1 shot of 100 or less)
    var calcnearby = document.getElementById('kmlnearby');
    if (calcnearby) {
        // process list
        for (i = 0; i < list.length; ++i) {
            var o = list[i];
            var sortlist = [];
            // compute distance
            for (ic = 0; ic < list.length; ++ic)
                sortlist.push({ id: list[ic].id.split(" ")[0], distance: distance(o.location, list[ic].location) });
            sortlist.sort(function(a, b) {
                return a.distance - b.distance;
            });

            var distlist = [];
            for (ic = 1; ic < sortlist.length && ic <= 5 && sortlist[ic].distance < 20; ++ic)
                distlist.push(sortlist[ic].id);

            id = o.id.substr(1).split(" ")[0];
            if (!id || id == "")
                continue;
            elems = document.getElementsByClassName("nearby");
            for (var e = 0; e < elems.length && elems[e].id != id; ++e);
            if (e < elems.length)
                elems[e].innerHTML = "~" + distlist.join();
        }
    }

    var i, n = list.length;
    for (i = 0; i < list.length; ++i) {
        var item = list[i];

        if (!item.id || item.id == "")
            continue;

        ++n;
        --nlist;
        // set up icon
        var zindexm = 5000 + nlist;
        if (item.q)
            zindexm += item.q * 1000;

        var iconm = "";
        if (item.icon)
            iconm = item.icon;

        // set up description
        var descm = "", sdescm = "";
        if (item.description) {
            // convert unist
            str = item.description;
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
                        if (unit == 'mi')
                            pk[p] = pre + uconv(ps, mi);
                        else if (unit == 'ft')
                            pk[p] = pre + uconv(ps, ft);
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
        {
            if (item.kmlfile && item.kmlfile != "") {
                sdescm += '<div><i>';
                sdescm += '<a href="javascript:toggleRoutes(\'' + urlencode(item.kmlfile) + '\',\'' + urlencode(item.id) + '\');">Show track data on map</a>';
                sdescm += '</i></div>';
            }
            var extra = ' - <a href="' + SITE_BASE_URL + '/Location?locdist=30mi&locname=Coord:' + item.location.lat.toFixed(4) + ',' + item.location.lng.toFixed(4) + '">Search nearby</a>';
            sdescm += displaydirections(item.location.lat, item.location.lng, extra);
        }

        // set up infowindow
        var contentString = '<div style="width:auto;height:auto;overflow:hidden;">';

        // add title
        contentString += '<b class="notranslate">' + sitelink(item.id, nonamespace(item.id)) + '</b>';

        // load addbutton
        var kmladdbutton = document.getElementById("kmladdbutton");
        if (kmladdbutton)
            contentString += '<input class="submitoff addbutton" type="submit" onclick="addbutton(\'' + item.id.split("'").join("%27") + '\')" value="+">';

        // add elevation
        //contentString += '<br><span id="infoelevation"></span>';

        contentString += '<hr/>' + sdescm + '</div>';
        if (item.infocontent) contentString = item.infocontent;
        var infowindowm = new google.maps.InfoWindow({ content: contentString });

        var descriptionString = '<b class="nostranslate">' +
            nonamespace(item.id) +
            '</b><br>' +
            descm.split('*').join('&#9733;');
        if (item.infodescription) descriptionString = item.infodescription;
        
        // build and add marker with infowindow callback
        var q = -1, qmap = map;
        if (item.q != null)
            qmap = qmaps[q = item.q];

        var positionm = new google.maps.LatLng(item.location.lat, item.location.lng);

        var marker = new google.maps.Marker({
            position: positionm,
            map: qmap,
            icon: iconm,
            name: nonamespace(item.id), /*title:item.id/*+":"+line[4],*/
            description: descriptionString,
            infowindow: infowindowm,
            zIndex: zindexm,
            optimized: false
        });

        marker.q = q;
        marker.oposition = positionm;
        //var tooltip = tooltip({ marker: marker, content: "<b>"+nonamespace(item.id)+"</b><br>"+descm, cssClass: 'tooltip' });

        // add permit status by overlaying the 'closed' image on the marker
        if (item.permits && item.permits !== 'No') {
            var iconUrl = "";

            switch (item.permits) {
            case "Yes":
                iconUrl = ICON_PERMIT_YES;
                break;
            case "Restricted":
                iconUrl = ICON_RESTRICTED;
                break;
            case "Closed":
                iconUrl = ICON_CLOSED;
                break;
            }

            var closedImage = {
                url: iconUrl,
                scaledSize: new google.maps.Size(25, 25),
                anchor: new google.maps.Point(12, 26)
            };

            var closedMarker = new google.maps.Marker({
                position: positionm,
                map: qmap,
                icon: closedImage,
                clickable: false,
                zIndex: zindexm + 1,
                optimized: false
            });
        }

        google.maps.event.addListener(marker,
            "mouseover",
            function(e) {
                //marker.setZIndex(++zI);
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

        markers.push(marker);

        google.maps.event.addListener(marker,
            'click',
            function() {
                displayinfowindow(this);
            });

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
                    obj.q = Number(v[0]);
                    v = item.printouts["Has location class"];
                    if (v && v.length > 0)
                        obj.icon = KML_ICON_LIST[obj.q + Number(v[0]) * 6];
                }

                // numeric icons
                if (kmlsummary)
                    if (obj.id[0] == '#') {
                        var num = obj.id.slice(1).split(' ')[0];
                        obj.icon = 'https://sites.google.com/site/rwicons/bg' + obj.q + '_' + num + '.png';
                    }

                v = item.printouts["Has summary"];
                if (v && v.length > 0)
                    obj.description = v[0];
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

function morekmllist(loccontinue, loctotal) {
    loadingquery = true;
    console.log("loadingquery true");
    ++moremapc;
    map.setOptions({ draggableCursor: 'wait' });
    $.getJSON(geturl(kmllisturl + "|offset=" + loccontinue), getkmllist)
        .always(function() {
            setTimeout(function() {
                    loadingquery = false;
                    console.log("loadingquery false");
                },
                5000);
            if (--moremapc <= 0)
                map.setOptions({ draggableCursor: '' });
        });

    if (loccontinue > 0) {
        var tablelist = $(".loctable .loctabledata");

        if (tablelist.length == 1)
        {
            ++morelistc;
            document.body.style.cursor = 'wait';
            $.get(geturl(tablelisturl + '&offset=' + loccontinue),
                function(data) {
                    //alert( "Load was performed." );
                    var newtablelist = $('#morekmllist').html($(data).find('.loctable').html());
                    if (newtablelist.length == 1) {
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
    if (morelist.length == 1) {
        morelist[0].href = 'javascript:morekmllist(' + loccontinue + ',' + loctotal + ');';
    }
}

function morestop() {
    // finished loading
    var loccount = document.getElementById("loccount");
    if (loccount)
        loccount.parentNode.removeChild(loccount);
    var loadmore = document.getElementById("loadmore");
    if (loadmore)
        loadmore.parentNode.removeChild(loadmore);
    var morelist = $(".loctable .smw-template-furtherresults a");
    if (morelist.length == 1)
        morelist[0].parentNode.removeChild(morelist[0]);
}

function nonamespace(label) {
    return label.replace("Events:", "");
}
