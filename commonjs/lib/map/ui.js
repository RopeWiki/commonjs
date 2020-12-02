
var lasthighlight; //most recent tooltip to be displayed

var tooltip = function () {
    var id = 'tooltip';
    var top = 3;
    var left = 6;
    var maxw = 300;
    var speed = 10;
    var timer = 20;
    var endalpha = 95;
    var alpha = 0;
    var tt, t, c, b, h;
    var ie = document.all ? true : false;
    return {
        show: function (v, w, highlight) {
            if (!v || v == "")
                return;

            if (highlight && lasthighlight)
                if (highlight.highlight && lasthighlight.highlight)
                    if (highlight.priority > lasthighlight.priority) {
                        // do not override if less priority
                        highlight.highlight.setMap(null);
                        highlight.highlight = null;
                        return;
                    }

            if (lasthighlight && highlight != lasthighlight && lasthighlight.highlight) {
                lasthighlight.highlight.setMap(null);
                lasthighlight.highlight = null;
            }

            lasthighlight = highlight;

            if (tt == null) {
                tt = document.createElement('div');
                tt.style.backgroundColor = "white";
                tt.style.padding = "3px";
                tt.style.position = "absolute";
                tt.style.zIndex = 60000;
                tt.style.fontFamily = "Arial,sans-serif";
                tt.style.fontSize = "10px";
                tt.setAttribute('id', id);
                tt.className = "notranslate";
                t = document.createElement('div');
                t.setAttribute('id', id + 'top');
                c = document.createElement('div');
                c.setAttribute('id', id + 'cont');
                b = document.createElement('div');
                b.setAttribute('id', id + 'bot');
                tt.appendChild(t);
                tt.appendChild(c);
                tt.appendChild(b);
                document.body.appendChild(tt);
                tt.style.opacity = 0;
                tt.style.filter = 'alpha(opacity=0)';
                document.onmousemove = this.pos;

                //need to move the tooltip into the map div so they display when the map is in fullscreen mode -- stackoverflow.com/questions/39644061/
                var mapDiv = document.getElementById('mapbox').getElementsByTagName('div')[0];
                mapDiv.appendChild(tt);
            }

            tt.style.display = 'block';

            if (c) c.innerHTML = v;

            tt.style.width = w ? w + 'px' : 'auto';

            if (!w && ie) {
                t.style.display = 'none';
                b.style.display = 'none';
                tt.style.width = tt.offsetWidth;
                t.style.display = 'block';
                b.style.display = 'block';
            }

            if (tt.offsetWidth > maxw) {
                tt.style.width = maxw + 'px';
            }

            h = parseInt(tt.offsetHeight) + top;

            clearInterval(tt.timer);

            tt.timer = setInterval(function () {
                tooltip.fade(1);
            },
                timer);
        },

        pos: function (e) {
            var u = ie ? event.clientY + document.documentElement.scrollTop : e.pageY - document.documentElement.scrollTop;
            var l = ie ? event.clientX + document.documentElement.scrollLeft : e.pageX - document.documentElement.scrollLeft;

            if (!isFullscreen(map.getDiv().firstChild)) {
                var mapDiv = document.getElementById('mapbox').getBoundingClientRect();
                u -= mapDiv.top;
                l -= mapDiv.left;
            }

            tt.style.top = (u - h) + 'px';
            tt.style.left = (l + left) + 'px';
        },

        fade: function (d) {
            var a = alpha;
            if ((a != endalpha && d == 1) || (a != 0 && d == -1)) {
                var i = speed;
                if (endalpha - a < speed && d == 1) {
                    i = endalpha - a;
                } else if (alpha < speed && d == -1) {
                    i = a;
                }
                alpha = a + (i * d);
                tt.style.opacity = alpha * 0.01;
                tt.style.filter = 'alpha(opacity=' + alpha + ')';
            } else {
                clearInterval(tt.timer);
                if (d == -1) {
                    tt.style.display = 'none';
                }
            }
        },

        hide: function (highlight) {
            if (highlight)
                if (highlight != lasthighlight) {
                    return;
                }

            if (typeof tt != "undefined") {
                if (tt.timer) {
                    clearInterval(tt.timer);
                }
                tt.timer = setInterval(function () {
                    tooltip.fade(-1);
                },
                    timer);
            }
        }
    };
}();

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
