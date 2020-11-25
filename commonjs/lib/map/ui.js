function addhighlight(idlist) {
    for (var i = 0; i < markers.length; ++i)
        if (idlist.indexOf(markers[i].name) >= 0) {
            var m = markers[i];
            if (m.highlight)
                continue;

            var highlight = new google.maps.Marker({
                position: m.getPosition(),
                icon: SITE_BASE_URL + "/images/e/e6/Starn_y.png",
                draggable: false,
                clickable: false,
                optimized: false,
                zIndex: m.zIndex - 1
            });

            highlight.setMap(qmaps[m.q]);
            m.highlight = highlight;

            if (m.infowindow && m.infowindow.content)
                m.infowindow.content = m.infowindow.content.replace('value="+"', 'value="*"');
        }

    var pinicons = document.getElementsByClassName('pinicon');
    for (var i = 0; i < pinicons.length; ++i)
        if (idlist.indexOf(pinicons[i].id) >= 0)
            pinicons[i].style.backgroundImage = "url(" + SITE_BASE_URL + "/images/e/e6/Starn_y.png)";
}

function addbutton(id) {
    function reattribute(elem) {
        var elems = elem.childNodes;
        for (var e = 0; e < elems.length; ++e) {
            var elem = elems[e];
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

function setmarker(name, lat, lng, zIndex) {
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
        function() {
            this.infowindow.open(map, this);
            getGeoElevation(this.getPosition(), "elevation", "~");
        });

    boundslist.extend(latLng);
}

function centermap() {
    if (!map) return;

    var center = map.getCenter();
    google.maps.event.trigger(map, 'resize');
    //map.panToBounds(bounds);
    //map.fitBounds(bounds);
    map.panTo(center);
}

function mapcover() {
    var mw = $("#mapbox").width();
    var dw = $(window).width() - mw;
    if (!toggleFS && (dw < 50 || mw < 500))
        $("#mapcover").css({display: "block"});
    else
        $("#mapcover").css({display: "none"});
}
