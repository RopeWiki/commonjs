function addhighlight(idlist) {
    for (var i = 0; i < markers.length; ++i)
        if (idlist.indexOf(markers[i].name) >= 0) {
            var m = markers[i];
            if (m.highlight)
                continue;

            var iconsize = 16;
            var highlight = new google.maps.Marker({
                position: m.getPosition(),
                icon: SITE_BASE_URL + "/images/e/e6/Starn_y.png",
                draggable: false,
                clickable: false,
                optimized: false,
                zIndex: m.zIndex - 1
            });
            //alert(m.zIndex);

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
    //id = urlencode(id);
    function reattribute(elem) {
        var elems = elem.childNodes;
        for (var e = 0; e < elems.length; ++e) {
            var elem = elems[e];
            if (elem.attributes)
                for (var a = 0; a < elem.attributes.length; ++a) {
                    /*
                    if (elem.attributes[a].oldattribute)
                     {
                     elem.attributes[a].value = elem.attributes[a].oldattribute.replace(/@/gi,id);
                     }
                    else if (elem.attributes[a].value.indexOf('@')>=0)
                     {
                     elem.attributes[a].oldattribute = elem.attributes[a].value;
                     elem.attributes[a].value = elem.attributes[a].value.replace(/@/gi,id);
                     }
                    */
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
        /*
           var kmlform = kmladdbutton.getElementsByTagName('FORM');
           if (kmlform.length>0)
             kmlform[0].submit();
        */

        if (lastinfowindow)
            lastinfowindow.close();
        var idlist = [id];
        addhighlight(idlist);
        oldid = id;
    }
}

function setmarker(lat, lng, z) {
    var myLatlng = new google.maps.LatLng(lat, lng);
    var infowindowm = new google.maps.InfoWindow({
        content: '<div class="textselect">' + displaylocation(lat, lng) + '<div id="elevation"></div>' + '<div id="geocode" style="max-width:200px"></div>' + displaydirections(lat, lng) + '</div>'
    });
    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        infowindow: infowindowm,
        optimized: false,
        zIndex: z
    });

    google.maps.event.addListener(marker,
        'click',
        function() {
            this.infowindow.open(map, this);
            getGeoElevation(this.getPosition(), "elevation", "Elevation: ");
            getGeoCode(lat, lng, "geocode");
        });
    boundslist.extend(myLatlng);
}

function centermap() {
    if (!map) return;
    //var bounds = map.getBounds();
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
        //$("#mapcover").show();
        $("#mapcover").css({display: "block"});
    else
        //$("#mapcover").hide();
        $("#mapcover").css({display: "none"});
}
