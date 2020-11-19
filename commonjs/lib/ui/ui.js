
function toggleUrlcheckbox(elem) {
    urlcheckbox = setparam(urlcheckbox, elem.id, elem.checked ? "on" : "off");
    setCookie("urlcheckbox", urlcheckbox, 360*10); // 10 years
    gtrans2 = 'x';
    loadTranslation();
}

function togglewchk(varname) {
    var varval = !eval(varname);
    setCookie(varname, varval ? "on" : "", 360*10); // 10 years
    document.body.style.cursor = 'wait';
    window.location.reload();
}

function toggleStarrate(force) {
    starrate = !starrate;
    setCookie("starrate", starrate ? "on" : "", 360 * 10); // 10 years
    if (starrate) {
        loadStars();
    } else {
        document.body.style.cursor = 'wait';
        window.location.reload();
    }
    //google.map.event.trigger(map,'resize');
}

function toggleLabels(force) {
    labels = !labels;
    setCookie("labels", labels ? "on" : "", 360*10); // 10 years
    document.body.style.cursor = 'wait';
    window.location.reload();
    //google.map.event.trigger(map,'resize');
}

function toggleSlideshow(force) {
    slideshowchk = !slideshowchk;
    if (typeof force != 'undefined')
        slideshowchk = force;
    setCookie("slideshowchk", slideshowchk ? "on" : "", 360 * 10); // 10 years
    var elems = document.getElementsByClassName('slideshow');
    for (var i = 0; i < elems.length; i++)
        elems[i].style.display = slideshowchk ? "" : "none";
    var elems = document.getElementsByClassName('slideshowschk');
    for (var i = 0; i < elems.length; i++)
        elems[i].checked = slideshowchk;
    if (!slideshowchk) {
        document.body.style.zIndex = 1;
        document.body.style.zoom = 1.0000001;
    } else {
        document.body.style.zIndex = 0;
        document.body.style.zoom = 1;
    }
}

function loadUserInterface(document) {
    $('title').addClass('notranslate');
    $('.firstHeading span').addClass('notranslate');
    $('#searchform').addClass('notranslate');
    $('.suggestions').addClass('notranslate');
    $('.mw-headline').addClass('ctranslate');
    $('.toctext').addClass('ctranslate');

    // table columns
    var colgroup = document.getElementsByClassName("colgroup");
    for (var i = 0; i < colgroup.length; ++i) {
        var table = colgroup[i];
        var list = table.id.split(".");

        findtag(table.childNodes,
            'TR',
            function addrow(item) {
                var l = 0;
                var cols = item.childNodes;
                for (var i = 0; i < cols.length && l < list.length; ++i) {
                    var td = cols[i];
                    if (td.nodeName == 'TD') {
                        var c = list[l];
                        if (c.length > 0)
                            if (td.getElementsByClassName(c).length == 0)
                                td.className += " " + c;
                        ++l;
                    }
                }
            });
    }

    // ==Background==
    var sections = document.getElementsByName("_section[Background]");
    for (var i = 0; i < sections.length; i++) {
        var text = sections[i].innerHTML;
        if (text.trim().split(' ').join() == "==Background==")
            sections[i].innerHTML = "";
    }

    // javascriptlink
    var jslink = document.getElementsByClassName('jslink');
    for (var i = 0; i < jslink.length; i++)
        jslink[i].innerHTML = '<a href="javascript:' + jslink[i].id + '();">' + jslink[i].innerHTML + '</a>';

    // tabs
    var tablinks = document.getElementsByClassName('tablinks');
    for (var i = 0; i < tablinks.length; i++) {
        var links = tablinks[i].getElementsByTagName('A');
        for (var j = 0; j < links.length; j++) {
            var link = links[j];
            link.target = 'tabIframe2';
        }
    }

    var tabmain = document.getElementsByClassName('tabMain');
    if (tablinks.length > 0 && tabmain.length > 0) {
        var tablink1 = tablinks[0].getElementsByTagName('A');
        if (tablink1.length > 0)
            tabmain[0].innerHTML = '<div class="tabIframeWrapper"><iframe class="tabContent" name="tabIframe2" src="' +
                tablink1[0].href +
                '" marginheight="8" marginwidth="8" frameborder="0"></iframe></div>';
    }

    // nofollow
    var nofollow = document.getElementsByClassName('nofollow');
    for (var i = 0; i < nofollow.length; i++) {
        var links = nofollow[i].getElementsByTagName('A');
        {
            for (var j = 0; j < links.length; j++) {
                var link = links[j];
                link.rel = "nofollow";
                //link.innerHTML = link.innerHTML+' X';
            }
        }
    }

    // popwin
    var popups = document.getElementsByClassName('popwin');
    for (var i = 0; i < popups.length; i++) {
        var links = popups[i].getElementsByTagName('A');
        {
            for (var j = 0; j < links.length; j++) {
                var link = links[j];
                var url = link.href;
                link.href = popupwin(url);
                //link.innerHTML = link.innerHTML+' X';
            }
        }
    }

    // popups
    var popups = document.getElementsByClassName('pops');
    for (var i = 0; i < popups.length; i++) {
        var links = popups[i].getElementsByTagName('A');
        {
            for (var j = 0; j < links.length; j++) {
                var link = links[j];
                link.target = '_blank';
                //link.innerHTML = link.innerHTML+' X';
            }
        }
    }

    //popupform
    var elems = document.getElementsByClassName('popforms');
    for (var i = 0; i < elems.length; i++) {
        var links = elems[i].getElementsByTagName('A');
        for (var l = 0; l < links.length; ++l) {
            var href = links[l].attributes['href'];
            if (href) {
                var str = href.value;
                str = str.replace('Special:FormEdit\/File', 'Special:Upload'); //\/File
                href.value = str;
                //console.log("new href: "+href.value);
            }
            /*
                  links[l].className = 'popupformlink'; //'sfFancyBox';
                  links[l].target = '_self'
                  //links[l].rev =  "width:650 height:500";
            */
        }
    }

    // setfield
    var setfield = $('ul.setfield'); //document.getElementsByClassName('setfield');
    for (var i = 0; i < setfield.length; i++) {
        var sp = setfield[i].innerHTML.split('<li>');
        for (var j = 1; j < sp.length; ++j) {
            var spj = sp[j].split('<');
            var name = spj[0].trim();
            spj[0] = '<span onclick="setfield(this)" style="cursor:pointer;" >' + name + '</span>';
            sp[j] = spj.join('<');
        }
        setfield[i].innerHTML = sp.join('<li>');
    }

    // regionfield
    var setfield = $('ul.regioncount'); //document.getElementsByClassName('setfield');
    for (var i = 0; i < setfield.length; i++) {
        var sp = setfield[i].innerHTML.split('<li>');
        for (var j = 1; j < sp.length; ++j) {
            var len = sp[j].indexOf('<', sp[j].indexOf('</a') + 1);
            var text = sp[j].substring(0, len).trim().replace('(i)', '<hr id="vri">');
            text = '<span class="regioncount">' + text + '</span>';
            sp[j] = text + sp[j].substring(len)
        }
        setfield[i].innerHTML = sp.join('<li>');
    }

    // readmore
    var readmore = document.getElementsByClassName('readmore');
    for (var i = 0; i < readmore.length; i++) {
        var text = readmore[i].innerHTML;
        readmore[i].innerHTML = '<a href="#overviewstart" class="readmorebutton">' + text + '</a>';
    }

    // load star votes
    loadStars();

    // load months
    var months = document.getElementsByClassName('monthv');
    for (var i = 0; i < months.length; i++) {
        var str = months[i].innerHTML;
        if (str.length == 0)
            continue;

        var out = '<table class="wikitable bst mbst nostranslate"><tr>';
        for (var s = 0; s < str.length; ++s)
            switch (str.charAt(s)) {
            case ',':
                out += '<td class="bss"></td>';
                break;
            case 'X':
                out += '<td class="bsg"></td>';
                break;
            case 'x':
                out += '<td class="bsy"></td>';
                break;
            case '.':
                out += '<td></td>';
                break;
            }
        out += '</tr></table>';
        months[i].innerHTML = out;
        months[i].style.display = "block";
    }

    // load metric system
    if (metric) {
        var texts = document.getElementsByClassName('uft');
        for (var i = 0; i < texts.length; i++)
            texts[i].innerHTML = uconv(texts[i].innerHTML, ft);
        texts = document.getElementsByClassName('umi');
        for (var i = 0; i < texts.length; i++)
            texts[i].innerHTML = uconv(texts[i].innerHTML, mi);
        texts = document.getElementsByClassName('urap');
        for (var i = 0; i < texts.length; i++)
            texts[i].innerHTML = uconv(texts[i].innerHTML, rap);
    }

    //if (french)
    {
        var texts = document.getElementsByClassName('uaca');
        for (var i = 0; i < texts.length; i++)
            texts[i].innerHTML = acaconv(texts[i].innerHTML);
        var texts = document.getElementsByClassName('uacamore');
        for (var i = 0; i < texts.length; i++)
            texts[i].innerHTML = acaconv(texts[i].innerHTML, true);
    }

    elem = document.getElementsByClassName('urlcheckbox');
    for (var i = 0; i < elem.length; i++) {
        var on = getparam(urlcheckbox, elem[i].id, elem[i].innerHTML);
        elem[i].className += " notranslate";
        elem[i].innerHTML = '<input id="' +
            elem[i].id +
            '" class="gmnoprint" type="checkbox" onclick="toggleUrlcheckbox(this)" ' +
            (on == 'on' ? 'checked' : '') +
            '>';
    }

    elem = document.getElementsByClassName('uchk');
    for (var i = 0; i < elem.length; i++) {
        elem[i].className += " notranslate";
        elem[i].innerHTML = '<label><input class="gmnoprint" type="checkbox" onclick="toggleMetric()" ' +
            (metric ? 'checked' : '') +
            '>Metric</label>';
    }

    elem = document.getElementsByClassName('fchk');
    for (var i = 0; i < elem.length; i++) {
        elem[i].className += " notranslate";
        var label = elem[i].innerHTML;
        elem[i].innerHTML = '<label><input class="gmnoprint" type="checkbox" onclick="toggleFrench()" ' +
            (french ? 'checked' : '') +
            '>' +
            label +
            '</label>';
    }

    elem = document.getElementsByClassName('wchk');
    for (var i = 0; i < elem.length; i++) {
        var id = elem[i].id;
        var label = elem[i].innerHTML;
        elem[i].innerHTML = '<label><input class="gmnoprint" type="checkbox" onclick="togglewchk(\'' +
            id +
            '\')" ' +
            (eval(id) ? 'checked' : '') +
            '>' +
            label +
            '</label>';
    }

    elem = document.getElementsByClassName('schk');
    for (var i = 0; i < elem.length; i++) {
        elem[i].className += " notranslate";
        var label = elem[i].innerHTML;
        elem[i].innerHTML = '<label><input class="gmnoprint" type="checkbox" onclick="toggleStarrate()" ' +
            (starrate ? 'checked' : '') +
            '>' +
            label +
            '</label>';
    }
    elem = document.getElementsByClassName('schkon');
    for (var i = 0; i < elem.length; i++)
        elem[i].style.display = starrate ? "table-row" : "none";

    elem = document.getElementsByClassName('external');
    for (var i = 0; i < elem.length; i++) {
        var link = elem[i];
        var from = getLinkLang(link);
        if (from) {
            var to = "en";
            var ourl = link.href;
            ourl.replace("&", "%26");
            div = document.createElement("SPAN");
            //div.id = "transnode";
            div.innerHTML =
                ' <a rel="nofollow" class="external text" style="display:none" href="http://translate.google.com/translate?' +
                '&hl=' +
                to +
                '&sl=' +
                from +
                '&tl=' +
                to +
                '&u=' +
                ourl +
                '">' +
                '[Translated]</a>';
            //elem[i].appendChild(div);
            link.parentNode.insertBefore(div, link.nextSibling);
        }
    }

    // Facebook user name
    var fbuser = document.getElementById('fbuser');
    if (fbuser)
        fbuser.innerHTML = '<input class="submitoff" type="submit" onclick="fbusersearch()" value="' +
            fbuser.innerHTML +
            '">';

    // PDF button only for credited pages
    var hdr = document.getElementById('firstHeading');
    var pdf = document.getElementById('idcredits');
    var kml = document.getElementById('kmlmapdisplay');
    var edit = window.location.href.toString().indexOf("&action=") > 0;
    if (hdr && pdf && kml && !edit) {
        var text = ' <select class="notranslate" style="width:27px;height:32px;background-image:url(' +
            SITE_BASE_URL +
            '/images/a/ad/DownIcon.png);" id="pdfselect" value="" onchange="pdfselect(this)">';
        text += '<option selected disabled hidden style="display: none" value=""></option>';
        //text += '<option value="" disabled>Download</option>'
        text += '<option value="P">PDF: Page</option>';
        text +=
            '<option value="PM">PDF: Map</option><option value="KM">KML: Map</option><option value="GM">GPX: Map</option>';
        text += '<option value="ZPM">ZIP: Page + Maps</option><option value="ZALL">ZIP: P + M + Links</option>';
        text += '<option value="S">*: Settings</option></select>';
        text += '<img id="ptext" height="32" style="display:none;vertical-align:top" src="' +
            SITE_BASE_URL +
            '/extensions/SemanticForms/skins/loading.gif"/>';
        //text += '<span id="processing" class="rwwarningbox" style="display:none">Processing...</span>';
        var div = document.createElement('SPAN');
        div.className = "gmnoprint";
        div.title = "Download";
        div.id = "pdfbutton";
        div.innerHTML = text;
        hdr.appendChild(div);
    }

    // load credits
    var creditsline = document.getElementById('idcredits');
    if (creditsline) {
        var pagename = creditsline.innerHTML;
        loadcredits(pagename, 'K', 'Kcredits');
        loadcredits(pagename, 'P', 'Pcredits');
        loadcredits(pagename, 'J', 'Jcredits');
    }

    // insert reference pictures
    var referencepic = document.getElementById('referencepic');
    if (referencepic) {
        var approach = document.getElementById('Approach');
        if (approach) {
            var h2 = approach.parentNode;
            while (h2 != null && h2.nodeName != 'H2')
                h2 = h2.parentNode;
            if (h2 != null) {
                h2.parentNode.insertBefore(referencepic, h2);
                referencepic.style.display = "block";
            }
        }
    }

    // customize title
    elem = document.getElementsByClassName('titleuser');
    if (elem.length > 0) {
        var floatdiv = "";
        for (var i = 0; i < elem.length; i++) {
            var str = elem[i].innerHTML.split(',');
            var img = '<img src="' + str[0] + '"/>';
            if (str.length > 1)
                floatdiv += '<a href="' + str[1] + '" title="Visit the main page">' + img + '</a>';
            else
                floatdiv += img;
        }
        elem = document.getElementById('firstHeading');
        if (elem) {
            var src = elem.innerHTML;
            elem.innerHTML = '<div style="float:right;clear:right">' + floatdiv + '</div>' + src;
        }
    }

    // flashing warning
    var wdir = 1, wval = 0xFF, wstep = 0x80;
    var wtimer = setInterval(function() {
            wval += wdir;
            if (wval > 0xFF) {
                wval = 0xFF;
                wdir = -wstep;
            }
            if (wval < 0xef) {
                wval = 0xef;
                wdir = wstep;
            }
            var welem = document.getElementsByClassName('rwwarning');
            var color = "#" + ((wval << 16) + (wval << 8)).toString(16);
            //console.log(color);
            for (var i = 0; i < welem.length; ++i) {
                welem[i].style.backgroundColor = color;
                var wchild = welem[i].childNodes;
                for (var j = 0; j < wchild.length; ++j)
                    if (wchild[j].style) wchild[j].style.backgroundColor = color;
            }
            var welem2 = document.getElementsByClassName('rwwarningbox');
            for (var i = 0; i < welem2.length; ++i)
                if (welem2[i].style) welem2[i].style.backgroundColor = color;
        },
        1000);

    // user real names
    var realnames = document.getElementById('userrealnames');
    if (realnames) {
        var userids = [], usernames = [];
        var list = realnames.innerHTML.split('title="User:');
        for (var i = 1; i < list.length; ++i) {
            var id = list[i].split('"')[0].split(' (page')[0];
            var name = list[i].split('<')[0].split('>')[1];
            userids.push(id);
            usernames.push(name);
        }
        elem = document.getElementsByClassName('userid');
        for (var i = 0; i < elem.length; i++) {
            var id = elem[i].innerHTML;
            var n = userids.indexOf(id);
            if (n >= 0) {
                elem[i].innerHTML = usernames[n];
                elem[i].style.display = "block";
            }
        }
    }

    // autorefresh
    var autorefresh = document.getElementById("autorefresh");
    if (autorefresh != null) {
        var id = autorefresh.innerHTML;
        //id.split(' ').join('_');
        var fr = document.createElement("IFRAME");
        fr.src = SITE_BASE_URL +
            '/api.php?action=sfautoedit&form=AutoRefresh&target=Votes:AutoRefresh&query=AutoRefresh[Location]=' +
            id;
        fr.style.display = "none";
        document.body.appendChild(fr);
    }

    // process pinmap
    var kmlicons = document.getElementById("kmlicons");
    if (kmlicons != null)
        KML_ICON_LIST = kmlicons.innerHTML.split(',');
    var lines = document.getElementsByClassName('pinmap');
    for (var i = 0; i < lines.length; i++) {
        var icon;
        if (lines[i].id) {
            var idlist = lines[i].id.split(".");
            if (idlist.length > 1)
                icon = KML_ICON_LIST[Number(idlist[1]) * 6 + Number(idlist[0])];
        }
        var link = lines[i].parentNode.getElementsByTagName('A')[0];
        lines[i].id = id = link.innerHTML; //link.title;
        //lines[i].title = "Show location on map";
        //link.title = "Double click to display canyon location on the map";

        //console.log(lines[i].id);
        //lines[i].title
        //lines[i].style.cursor="pointer";
        lines[i].innerHTML = pinicon(lines[i].id, icon) + lines[i].innerHTML;
    }

    //inline weather
    var coords = "";
    var kmlmarker = document.getElementById('kmlmarker');
    if (kmlmarker)
        coords = kmlmarker.innerHTML.toString().split(' ').join('');
    var staticdebug = (typeof staticscripts) != 'undefined'; // debug

    var weatherdiv = document.getElementById('weatherdiv');
    if (coords.length > 0 && weatherdiv && weather) {
        var url = "http://api.wunderground.com/api/bc1f237fb64ef165/alerts/forecast10day/geolookup/q/" +
            coords +
            ".json";
        if (staticdebug) // debug
            url = SITE_BASE_URL + "/rw/umpqua.json";
        $.getJSON(geturl(url),
            function(data) {
                // forecast.txt_forecast.forecastday.   period, icon_url, title, metric ? fcttext_metric : fcttext  Night
                // simpleforecast

                if (data &&
                    data.forecast &&
                    data.forecast.simpleforecast &&
                    data.forecast.simpleforecast.forecastday &&
                    data.forecast.simpleforecast.forecastday.length > 0) {
                    var link;
                    var a = weatherdiv.getElementsByTagName('A');
                    if (a && a.length > 0 && a[0].href)
                        link = a[0].href;
                    var periods = data.forecast.simpleforecast.forecastday;
                    var w = "";
                    //var weatherchk =document.getElementById('weather');
                    //weatherchk.innerHTML += '<div class="wstlogo noprint">Powered by<br><img src="https://icons.wxug.com/logos/PNG/wundergroundLogo_4c_horz.png"/></span></div>';

                    w += '<div class="wstlogo noprint">';
                    if (link) w += '<a href="' + link + '">';
                    w += '<span class="notranslate">';

                    var station, station2;
                    if (data.location &&
                        data.location.nearby_weather_stations &&
                        data.location.nearby_weather_stations.pws &&
                        data.location.nearby_weather_stations.pws.station &&
                        data.location.nearby_weather_stations.pws.station.length > 0) {
                        station = data.location.nearby_weather_stations.pws.station[0];
                        station.name = "((&#9899;)) " + station.id;
                    }
                    if (data.location &&
                        data.location.nearby_weather_stations &&
                        data.location.nearby_weather_stations.airport &&
                        data.location.nearby_weather_stations.airport.station &&
                        data.location.nearby_weather_stations.airport.station.length > 0) {
                        station2 = data.location.nearby_weather_stations.airport.station[0];
                        station2.name = "&#9992;" + station2.city;
                    }

                    //if (station.neighborhood)
                    //  w += ", "+station.city;
                    var ll = coords.split(',');
                    if (ll.length >= 2) {
                        var distance = 1e15, distance2 = 1e15;
                        if (station)
                            distance = distance({ lat: ll[0], lng: ll[1] }, { lat: station.lat, lng: station.lon });
                        if (station2)
                            if ((distance2 = distance({ lat: ll[0], lng: ll[1] },
                                    {
                                        lat: station2.lat,
                                        lng: station2.lon
                                    })) <
                                distance)
                                station = station2, distance = distance2;
                        w += "~" + mi(distance) + " ";
                        if (map && station) {
                            var stationinfo = [];
                            if (station.neighborhood)
                                stationinfo.push(station.neighborhood);
                            if (station.city)
                                stationinfo.push(station.city);
                            if (station.state)
                                stationinfo.push(station.state);
                            else if (station.country)
                                stationinfo.push(station.country);
                            var myLatlng = new google.maps.LatLng(station.lat, station.lon);
                            var infowindow = new google.maps.InfoWindow({
                                content: '<b>' +
                                    station.name +
                                    '</b>' +
                                    '<div class="textselect">' +
                                    stationinfo.join(', ') +
                                    '</div>' +
                                    '<div class="textselect">' +
                                    displaylocation(station.lat, station.lon) +
                                    '<div id="elevation"></div>' +
                                    '</div>'
                            });
                            var marker = new google.maps.Marker({
                                position: myLatlng,
                                map: map,
                                infowindow: infowindow,
                                optimized: false,
                                zIndex: 10,
                                icon: {
                                    url: "https://icons.wxug.com/logos/PNG/wundergroundLogo_4c.png",
                                    scaledSize: new google.maps.Size(45, 32)
                                }
                            }); //SITE_BASE_URL + "/images/f/f2/Wunderground.png"
                            google.maps.event.addListener(marker,
                                'click',
                                function() {
                                    this.infowindow.open(map, this);
                                    getGeoElevation(this.getPosition(), "elevation", "Elevation: ");
                                });
                        }
                    }

                    if (station)
                        w += ' ' + station.name;

                    var e = periods.length - 1;
                    w += ': ' +
                        periods[0].date.day +
                        ' ' +
                        periods[0].date.monthname_short +
                        ' - ' +
                        periods[e].date.day +
                        ' ' +
                        periods[e].date.monthname_short +
                        ' ';

                    w += '</span>';
                    w +=
                        '<div style="position:relative"><img style="position:absolute;left:-75px;width:75px" src="https://icons.wxug.com/logos/PNG/wundergroundLogo_4c.png"/></div>';

                    if (link) w += '</a>';
                    w += '</div>';

                    w += '<table class="wikitable wst bst notranslate"><tr style="line-height:5px">';
                    for (var i = 0; i < periods.length; ++i) {
                        w += '<th>' + periods[i].date.weekday_short + '<br>';
                        w += '</th>';
                    }
                    w += '</tr><tr>';
                    for (var i = 0; i < periods.length; ++i) {
                        var h = metric ? periods[i].high.celsius : periods[i].high.fahrenheit;
                        var l = metric ? periods[i].low.celsius : periods[i].low.fahrenheit;
                        w += '<td title="' +
                            periods[i].date.day +
                            ' ' +
                            periods[i].date.monthname +
                            ' : ' +
                            periods[i].conditions +
                            ', Max ' +
                            h +
                            ' Min ' +
                            l +
                            '">';
                        w += '<div><img class="weatherimg" src="' + periods[i].icon_url + '"/></div>';
                        w += '<div class="weatherh">' + h + '</div><div class="weatherl">' + l + '</div>';
                        w += '</td>';
                    }
                    w += '</tr>';

                    // alerts
                    if (data.alerts && data.alerts.length > 0) {
                        w += '<tr><td colspan="' + periods.length + '" style="padding:0;">';
                        var list = [];
                        for (var i = 0; i < data.alerts.length; ++i)
                            list.push(data.alerts[i].description + '!');
                        if (link) w += '<a href="' + link + '">';
                        w += '<div class="weatheralt rwwarningbox">' + list.join('<br>') + '</div>';
                        if (link) w += '</a>';
                        w += '</td></tr>';
                    }
                    w += '</table>';

                    weatherdiv.innerHTML = '<div>' + w + '</div>';
                }
            });
    }

    var maptype = document.getElementById("kmltype");
    var waterflowdiv = document.getElementById('waterflowdiv');
    if (coords.length > 0 && waterflowdiv)
        if (maptype && (maptype.innerHTML == 'topo' || staticdebug)) // USA & Canada
        {
            function extractVal(str, label) {
                var s = str.indexOf(label);
                if (s < 0) return "";
                s = str.indexOf(':', s);
                if (s < 0) return "";
                var e = str.indexOf(' ', s);
                return str.substring(s + 1, e);
            }

            var url = LUCA_BASE_URL + "/rwr?waterflow=winfo=" + coords;
            if (staticdebug)
                url = LUCA_BASE_URL + "/rwr?waterflow=winfo=" + "33.7717,-111.1197";
            $.getJSON(geturl(url),
                function(data) {
                    // forecast.txt_forecast.forecastday.   period, icon_url, title, metric ? fcttext_metric : fcttext  Night
                    // simpleforecast

                    var w = "";
                    if (data && data.list && data.list.length > 0) {
                        var str = data.list[0];
                        var num = parseInt(extractVal(str, 'Drain'));
                        if (!isNaN(num)) {
                            if (metric)
                                w = Math.round(num) + "km<sup>2</sup>";
                            else
                                w = Math.round(num * 0.386) + "mi<sup>2</sup>";
                            w = '<span class="notranslate">~' + w + '</span>';
                            if (num > 100)
                                w +=
                                    '<hr id="cd5" title="May massively flood with heavy rains and keep flooded for many days afterwards">';
                            else if (num > 50)
                                w += '<hr id="cd4" title="May massively flood with heavy rains">';
                            else if (num > 25)
                                w += '<hr id="cd3" title="May flood with heavy rains">';
                        }
                        //var avg = extractVal(str,'Avg');
                        //if (avg!="")
                        //  w += ' [~'+avg+']';
                    }
                    waterflowdiv.className = ''; // no noprint
                    waterflowdiv.innerHTML += ' ' + w;
                });
        }

    /*
   var nearbydiv = document.getElementById('nearbydiv');
   if (coords.length>0 && nearbydiv)
   {
       var distmi = [ '5mi', '10mi', '25mi', '50mi', '100mi' ];
       var distkm = [ '5km', '10km', '25km', '50km', '100km' ];
       var dist = metric ? distkm : distmi;
       var def = Math.floor(dist.length / 2);
       var text = ' <select id="nearbyselect" value="'+dist[def]+'" onchange="nearbyselect(this)">';
       //text += '<option selected disabled hidden style="display: none" value=""></option>';
       for (var i=0; i<dist.length; ++i)
         text += '<option '+(i==def ? ' selected ' : '')+'value="'+dist[i]+'">'+dist[i]+'</option>';
      text += '</select>';

      var a = nearbydiv.getElementsByTagName('A');
      if (a && a.length>0)
         {
       var href = a[0].href;
       var e = href.indexOf(locdist);
       a[0].href = href.substring(0, e)+locdist+dist[def];
          }

    nearbydiv.innerHTML += text;
   }
  */

    //gallerybox
    var tt, it, isrc = null, ttmove = 0, ttshow = 0;
    var boxes = document.getElementsByClassName('galleryboxview');

    /*
    setInterval(function(){
       if (isrc && tt && it && ttshow>0)
         {
         ttmove = -10;
         it.src = isrc;
         tt.style.display = "block";
         }
       ++ttshow;
       }, 100);
    */

    document.onmousemove = function() {
        //console.log("move");
        if (tt && it && ttmove > 0) {
            tt.style.display = "none";
            it.src = "";
        }
        ++ttmove;
        ttshow = -3;
    }
    for (var i = 0; i < boxes.length; i++) {
        boxes[i].onmouseout = function() {
            //console.log("out");
            isrc = null;
        }
        boxes[i].onmouseover = function() {
            /*
            // user srcset to get higher res image
            var img = this.getElementsByTagName('IMG');
            if (!img) return;
            var srcset = img[0].getAttribute("srcset");
            if (!srcset) return;
            var src = srcset.split(',');
            var imgsrc = src[src.length-1].trim().split(' ');
            isrc = SITE_BASE_URL + '/' + imgsrc[0];
            */

            // use a highres div
            var img = $(this).find('#highres');
            if (!img || img.length == 0) return;
            isrc = img[0].innerHTML;

            //console.log("over "+isrc);

            if (!tt) {
                tt = document.createElement('div');
                tt.style.cssText =
                    "background-color:inherit; position: fixed; top:5%; left:5%; zIndex:9999; width:90%; height: 90%; text-align:center; display:none";
                it = document.createElement('img');
                it.style.cssText =
                    "width:auto; height:100%;border: 1px solid #404040;margin:10px;background-color:#f0f0f0";
                it.src = isrc;
                it.alt = "LOADING...";
                tt.appendChild(it);
                document.body.appendChild(tt);
            }

            //tt.style.cssText({"background-color:red; position: fixed; top:0; left:0; zIndex:9999; width:"+ $(window).width()-3 +"px; height: "+ $(window).height()-3 +"px; display: block;" );
        }
    }
}

function loadFormInterface() {
    //console.log('setting form');
    function setinput(id, inputstr, keysubmit) {
        elem = document.getElementById(id);
        if (!elem) return;

        var str = getparam(url, id, elem.innerHTML);

        var color;
        color = 'black';
        if (deftext(str))
            color = 'silver';
        elem.innerHTML = inputstr + 'color:' + color + ';" onfocus="inputfocus(this)" onkeydown="inputkey(event,' + keysubmit + ')" value="' + str + '">';
    }

    var url = window.location.href.toString();
    
    // location search
    var locfind = document.getElementById('locfind');
    if (locfind) {
        //<form name="input" action="Location" method="get">
        setinput('locname', '<input id="locnameval" class="submitoff" autocomplete="on" style="width:90%;', 'locsearch');
        setinput('locdist', '<input id="locdistval" class="submitoff" autocomplete="on" size="15" style="', 'locsearch');
        locfind.innerHTML = '<input class="submitoff" type="submit" onclick="locsearch()" value="' + locfind.innerHTML + '">';

        var mapfind = document.getElementById('mapfind');
        if (mapfind)
            mapfind.innerHTML = '<input class="submitoff" type="submit" onclick="mapsearch()" value="' + mapfind.innerHTML + '">';
        //</form>;
    }

    // region search
    var regfind = document.getElementById('regfind');
    if (regfind) {
        //<form name="input" action="Location" method="get">
        setinput('regname', '<input id="regnameval" class="submitoff" autocomplete="on" style="width:30em;', 'regsearch');
        regfind.innerHTML = '<input class="submitoff" type="submit" onclick="regsearch()" value="' + regfind.innerHTML + '">';

        var regnameval = urldecode(getCookie("regnameval"));
        if (regnameval != "") {
            var elem = document.getElementById('regnameval');
            elem.value = regnameval;
            if (url.split('?').length > 1)
                elem.focus();
        }
        //</form>;
    }

    // read option on/off from url (but only on filter page)
    var filters = document.getElementById('filters');
    if (filters) {
        var chks = document.getElementsByClassName('optionchk');
        for (var i = 0; i < chks.length; i++) {
            var id = chks[i].id + 'chk';
            var checked = url.indexOf('&' + id) > 0;
            //eval('if (typeof '+id+' != "undefined") checked='+id+'!="";');
            chks[i].innerHTML = '<label style="white-space: nowrap;"><input id="' + id + '" class="optionschk submitoff" type="checkbox" onclick="toggle' + id + '(' + "'" + id + "'" + ')" ' + (checked ? 'checked' : '') + '>' + chks[i].innerHTML + '</label>';
            toggleOption(id, checked);
        }
    }

    // rw table sort ONLY when in menu options
    if (filters) {
        var chks = document.getElementsByClassName('rwSort');
        var sortbydiv = document.getElementById('sortby');
        if (sortbydiv)
            sortby = sortbydiv.innerHTML;
        for (var i = 0; i < chks.length; i++) {
            var img = "rwsortud.gif";
            if (chks[i].id == sortby)
                img = "rwsortdn.gif";
            if ('-' + chks[i].id == sortby)
                img = "rwsortup.gif";

            chks[i].className += " notranslate";
            chks[i].style.cssText += 'cursor: pointer; background-repeat: no-repeat; background-position: center right; padding-right:9px; padding-left:0px; background-image: url(https://sites.google.com/site/rwicons/' + img + ');';

            //"rwSortDn";
            //chks[i].className = "rwSortDown";

            chks[i].onclick = function rwsort(event) {
                var offset = $(this).offset();
                var height = $(this).height();
                var top = offset.top;
                var center = top + height / 2;
                if (event.pageY < center) {
                    psortby = '-' + this.id;
                    nsortby = this.id;
                } else {
                    psortby = this.id;
                    nsortby = '-' + this.id;
                }
                // if select twice the same, invert sorting
                sortby = (sortby == psortby) ? nsortby : psortby;
                filtersearch();
            }
        }
    }

    var chks = document.getElementsByClassName('filtersel');
    for (var i = 0; i < chks.length; i++) {
        var mid = chks[i].id + 'flt';
        var list = chks[i].innerHTML.split(',');
        var str = "";
        // get value from url
        var param = urlget(url, chks[i].id + '=', '').split(',');
        var cookie = getCookie(mid).split(',');
        for (var l = 0; l < list.length; ++l) {
            //console.log("id:"+id);
            // set checked if cookie or url said so
            var checked = cookie.indexOf(list[l]) >= 0;
            if (param.length > 0 && param[0] != "") checked = param.indexOf(list[l]) >= 0;
            str += '<option ' + (checked ? 'selected="selected"' : '') + 'value="' + list[l] + '">' + list[l] + '</option>';
            if (checked) {
                var subopt = document.getElementsByClassName(mid + list[l]);
                for (var c = 0; c < subopt.length; c++)
                    subopt[c].style.display = "";
            }
        }
        chks[i].innerHTML = '<select id="' + mid + '" class="' + mid + '" onclick="toggleFilterSel(this)">' + str + '</select>'; //'+"'"+mid+"'"+'
    }

    var chks = document.getElementsByClassName('filterchk');
    for (var i = 0; i < chks.length; i++) {
        var mid = chks[i].id + 'flt';
        var list = chks[i].innerHTML.split(',');
        var icons = document.getElementById(chks[i].id + 'icons');
        var str = "";
        // get value from url
        var param = urlget(url, chks[i].id + '=', '').split(',');
        for (var l = 0; l < list.length; ++l) {
            var id = mid + '_' + list[l];
            //console.log("id:"+id);
            // set checked if cookie or url said so
            var checked = getCookie(id) != "";
            if (param.length > 0 && param[0] != "") checked = param.indexOf(list[l]) >= 0;
            if (icons)
                str += ' ' + '<label title="' + icons.childNodes[l].title + '"><input id="' + id + '" class="' + mid + '" style="margin:0;padding=0" type="checkbox" onclick="toggleFilter(' + "'" + id + "'" + ')" ' + (checked ? 'checked' : '') + '>' + icons.childNodes[l].innerHTML + '</label>';
            else
                str += ' ' + '<label title="' + list[l] + '"><input id="' + id + '" class="' + mid + '" style="" type="checkbox" onclick="toggleFilter(' + "'" + id + "'" + ')" ' + (checked ? 'checked' : '') + '>' + list[l] + '</label>';
        }
        chks[i].innerHTML = str;
    }

    var filter = document.getElementById('filterbutton');
    if (filter)
        filter.innerHTML = '<input class="submitoff" type="submit" onclick="filtersearch()" value="' + filter.innerHTML + '">';

    // starshowhide
    var starsh = document.getElementById('starshowhide');
    if (starsh && filters) {
        /*
        // hidden apply button
        var applybutton = document.createElement('span');
        applybutton.innerHTML = filter.innerHTML;
        applybutton.style.display = "none";
        starsh.appendChild(applybutton);
        */

        // clickable filters
        var links = starsh.getElementsByTagName('A');
        for (var i = 0; i < links.length; ++i)
            links[i].removeAttribute('href');
        var border = "border:2px solid #0070B0";
        var children = starsh.getElementsByTagName('IMG');
        for (var i = 0; i < children.length; ++i) {
            children[i].style.cssText = border;
            children[i].removeAttribute('href');
            children[i].active = true;
            children[i].q = 0;
            if (children[i].alt)
                children[i].q = Number(children[i].alt);
            children[i].onclick = function showhide(event) {
                this.active = !this.active
                this.style.cssText = this.active ? border : "";
                //for (var j=0; j<children.length; ++j) {
                //  toggleFilter('starflt_'+children[j].q, children[j].active);
                //  }
                //applybutton.style.display = "inline";
                //toggleOption('filterschk', true);
                // show/hide map markers
                var qmap = qmaps[this.q] = this.active ? map : null;
                for (var j = 0; j < markers.length; ++j) {
                    if (markers[j].q == this.q) {
                        markers[j].setMap(qmap);
                        if (markers[j].highlight)
                            markers[j].highlight.setMap(qmap);
                    }
                }
            };
        }
    }

    // location search
    var locdefault = document.getElementById('locdefault');
    if (locdefault) {
        var id = 'locsearchchk';
        toggleOption(id, true);
        //var locsearchchk = document.getElementById('locsearchchk');
        //if (locsearchchk) locsearchchk.style.display = "none";
    }

    // slideshow on/off
    var chks = document.getElementsByClassName('slideshowchk');
    for (var i = 0; i < chks.length; i++)
        chks[i].innerHTML = '<label style="white-space: nowrap;"><input class="slideshowschk submitoff" type="checkbox" onclick="toggleSlideshow()" ' + (slideshowchk ? 'checked' : '') + '>' + chks[i].innerHTML + '</label>';
    toggleSlideshow(slideshowchk);

    // propagate jform
    var elems = document.getElementsByClassName('optionform');
    var urllink = window.location.href;
    var urllink = urllink.split('#')[0].split('?');
    if (urllink.length > 1) {
        var ulink = urllink[1].replace('&locname=', '&noloc=').replace('&locsearchchk=on', '')
        for (var i = 0; i < elems.length; i++) {
            var links = elems[i].getElementsByTagName('A');
            for (var l = 0; l < links.length; ++l) {
                var href = links[l].attributes['href'];
                if (href && href.value) {
                    var str = href.value;
                    if (str.indexOf('?') >= 0)
                        str += '&' + ulink;
                    else
                        str += '?' + ulink;
                    href.value = str;
                    //console.log("new href: "+href.value);
                }
            }
        }
    }

    CollapsibleLists.apply();
}

// Pop-out link support
function addPopOutLinkSupport() {
    var popOuts = document.getElementsByClassName('mw-popout-link');
    var i;
    for (i = 0; i < popOuts.length; i++) {
        var args = popOuts[i].innerText;
        var iSpace = args.indexOf(' ');
        var link = (iSpace < 0) ? args : args.substring(0, iSpace);
        var caption = (iSpace < 0) ? link : args.substring(iSpace + 1);
        popOuts[i].innerHTML = '<a href="' + link + '" target="_blank">' + caption + '</a>';
    }
}
