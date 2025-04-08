/******************************************************************************\
  geoxml+.js by Luca Chiarabini
  A Google Maps API Extension GeoXml parser
  GeoXML+ is heavily based on geoxmlfullv3 by Lance Dyas 
  geoxmlfullv3 is based on my maps kml parser by Mike Williams called egeoxml
  Additions by Lance Dyas include:  GML/WFS/GeoRSS/GPX expanded GE KML style support
  Addition by Luca Chiarabini include: marker highlight, distance and elevation computations
\******************************************************************************/

var useLegacyLocalLoad = true;

function GeoXml(myvar, map, url, opts) {

    if (!!google && !!google.load)
        google.load("visualization", "1", { packages: ['corechart'], "callback": vizloaded });

    // store the parameters
    this.myvar = myvar;
    this.opts = opts || {};
    this.mb = new MessageBox(map, this, "mb", this.opts.messagebox);
    this.map = map;
    this.map.geoxml = this;
    this.url = url;

    if (typeof url == "string") {
        this.urls = [url];
    } else {
        this.urls = url;
        this.url = this.url[0];
    }

    this.urlindex = 0;
    this.urllist = [];
    this.urltitle2 = "";
    this.urlfile = "";
    this.urlgroup = "";

    opts.debug = window.location.href.toString().indexOf('debug=') >= 0;

    if (opts.openbyid)
        this.openbyid = opts.openbyid;
    if (opts.openbyname)
        this.openbyname = opts.openbyname;

    this.maxopacity = 0.6;
    this.showLabels = this.opts.showLabels || false;
    this.showArrows = this.opts.showArrows || false;
    this.showRouteLabels = this.opts.showRouteLabels || false;
    this.showElevation = this.opts.showElevation || false;
    this.mb.style = this.opts.messagestyle || { backgroundColor: "silver" };
    this.alwayspop = this.opts.alwaysinfopop || false;
    this.veryquiet = this.opts.veryquiet || false;
    this.quiet = this.opts.quiet || false;
    this.suppressFolders = this.opts.suppressallfolders || false;
    this.rectangleLegend = this.opts.simplelegend || false;

    // infowindow styles
    this.titlestyle = this.opts.titlestyle || 'style = "font-family: arial, sans-serif;font-size: medium;font-weight:bold;"';
    this.descstyle = this.opts.descstyle || 'style = "font-family: arial, sans-serif;font-size: small;padding-bottom:.7em;white-space:normal;"';

    if (this.opts.directionstyle && typeof this.opts.directionstyle != "undefined") {
        this.directionstyle = this.opts.directionstyle;
    }
    else {
        this.directionstyle = 'style="font-family: arial, sans-serif;font-size: small;padding-left: 1px;padding-top: 1px;padding-right: 4px;"';
    }

    // sidebar
    this.sidebarfn = this.opts.sidebarfn || GeoXml.addSidebar;

    // elabel options
    this.pointlabelopacity = this.opts.pointlabelopacity || 100;
    this.polylabelopacity = this.opts.polylabelopacity || 100;

    // other useful "global" stuff
    this.hilite = this.opts.hilite || { color: "#aaffff", opacity: 0.3, width: 10, textcolor: "#000000" };
    this.latestsidebar = "";
    this.forcefoldersopen = false;

    if (typeof this.opts.allfoldersopen != "undefined") { this.forcefoldersopen = this.opts.allfoldersopen; }

    this.iwmethod = this.opts.iwmethod || "click";
    this.linkmethod = this.opts.linkmethod || "dblclick";
    this.linktarget = this.opts.linktarget || "_self";

    this.contentlinkmarkers = false;
    if (typeof this.opts.contentlinkmarkers == "boolean") {
        this.contentlinkmarkers = this.opts.contentlinkmarkers;
    }

    this.extcontentmarkers = false;
    if (typeof this.opts.extcontentmarkers == "boolean") {
        this.extcontentmarkers = this.opts.extcontentmarkers;
    }

    this.dohilite = true;
    if (typeof this.opts.dohilite != "undefined" && this.opts.dohilite === false) {
        this.dohilite = false;
    }

    this.clickablepolys = true;

    this.zoomHere = 15;
    if (typeof this.opts.zoomhere == "number") {
        this.zoomHere = this.opts.zoomhere;
    }

    if (typeof this.opts.clickablepolys == "boolean") {
        this.clickablepolys = this.opts.clickablepolys;
    }

    this.clickablemarkers = true;
    if (typeof this.opts.clickablemarkers == "boolean") {
        this.clickablemarkers = this.opts.clickablemarkers;
    }

    this.opendivmarkers = '';
    if (typeof this.opts.opendivmarkers == "string") {
        this.opendivmarkers = this.opts.opendivmarkers;
    }

    this.opts.singleInfoWindow = true;
    if (this.opts.singleInfoWindow)
        google.maps.event.addListener(map,
            'click',
            function() {
                if (this.geoxml.lastMarker &&
                    this.geoxml.lastMarker.infoWindow &&
                    this.geoxml.lastMarker.infoWindow.getMap()
                ) {
                    this.geoxml.lastMarker.infoWindow.close();

                    if (!!mousemarker) {
                        mousemarker.setMap(null);
                        mousemarker = null;
                    }
                }

                this.geoxml.lastmarker = null;
            });

    this.clickablelines = true;
    if (typeof this.opts.clickablelines == "boolean") {
        this.clickablelines = this.opts.clickablelines;
    }

    if (typeof this.opts.nolegend != "undefined") {
        this.nolegend = true;
    }

    if (typeof this.opts.preloadHTML == "undefined") {
        this.opts.preloadHTML = true;
    }

    this.sidebariconheight = 16;
    if (typeof this.opts.sidebariconheight == "number") {
        this.sidebariconheight = this.opts.sidebariconheight;
    }

    this.sidebarsnippet = false;
    if (typeof this.opts.sidebarsnippet == "boolean") {
        this.sidebarsnippet = this.opts.sidebarsnippet;
    }

    this.hideall = false;
    if (this.opts.hideall) {
         this.hideall = this.opts.hideall;
    }

    if (this.opts.markerpane && typeof this.opts.markerpane != "undefined") {
        this.markerpane = this.opts.markerpane;
    }
    else {
        var div = document.createElement("div");
        div.style.border = "";
        div.style.position = "absolute";
        div.style.padding = "0px";
        div.style.margin = "0px";
        div.style.fontSize = "0px";
        div.zIndex = 1001;
        //map.getPane(G_MAP_MARKER_PANE).appendChild(div);
        this.markerpane = div;
        this.markerpaneOnMap = false;
    }

    if (typeof proxy != "undefined") { this.proxy = proxy; }
    if (this.opts.token && this.opts.id) { this.token = '&' + this.opts.token + '=1&id=' + this.opts.id; } else { this.token = ''; }

    if (!this.proxy && typeof getcapproxy != "undefined") {
        if (fixUrlEnd) { getcapproxy = fixUrlEnd(getcapproxy); }
    }

    this.publishdirectory = PROTOCOL + "www.dyasdesigns.com/tntmap/";
    topwin = top;
    try { topname = top.title2; }
    catch (err) { topwin = self; }
    if (topwin.publishdirectory) { this.publishdirectory = topwin.publishdirectory; }
    if (topwin.standalone) { this.publishdirectory = ""; }

    this.kmlicon = this.publishdirectory + "images/ge.png";
    this.docicon = this.publishdirectory + "images/ge.png";
    this.docclosedicon = this.publishdirectory + "images/geclosed.png";
    this.foldericon = this.publishdirectory + "images/folder.png";
    this.folderclosedicon = this.publishdirectory + "images/folderclosed.png";
    this.gmlicon = this.publishdirectory + "images/geo.gif";
    this.rssicon = this.publishdirectory + "images/rssb.png";
    this.globalicon = this.publishdirectory + "images/geo.gif";
    this.WMSICON = "<img src=\"" + this.publishdirectory + "images/geo.gif\" style=\"border:none\" />";
    GeoXml.WMSICON = this.WMSICON;
    this.baseLayers = [];
    this.bounds = new google.maps.LatLngBounds();
    this.style = { width: 2, opacity: 0.75, fillopacity: 0.4 };
    this.style.color = this.randomColor();
    this.style.fillcolor = this.randomColor();
    this.iwwidth = this.opts.iwwidth || 400;
    this.maxiwwidth = this.opts.maxiwwidth || 0;
    this.iwheight = this.opts.iwheight || 0;
    this.lastMarker = {};
    this.verySmall = 0.0000001;
    this.progress = 0;
    this.ZoomFactor = 2;
    this.NumLevels = 18;
    this.maxtitlewidth = 0;
    this.styles = [];
    this.currdeschead = "";
    this.jsdocs = [];
    this.jsonmarks = [];
    this.polyset = []; /* used while rendering */
    this.polygons = []; /*stores indexes to multi-polygons */
    this.polylines = []; /*stores indexes to multi-line */
    this.multibounds = []; /*stores extents of multi elements */

    if (typeof this.opts.clustering == "undefined") {
        this.opts.clustering = {};
    }

    if (typeof this.opts.clustering.lang == "undefined") {
        this.opts.clustering.lang = { txtzoomin: "Zoom In", txtclustercount1: "...and", txtclustercount2: "more" };
    }

    this.overlayman = new OverlayManager(map, this, this.opts.clustering);
    this.overlayman.rowHeight = 20;
    if (this.opts.sidebarid) { this.basesidebar = this.opts.sidebarid; }
    this.kml = [new KMLObj("GeoXML", "", true, 0)];
    this.overlayman.folders.push([]);
    this.overlayman.subfolders.push([]);
    this.overlayman.folderhtml.push([]);
    this.overlayman.folderhtmlast.push(0);
    this.overlayman.folderBounds.push(new google.maps.LatLngBounds());
    this.wmscount = 0;

    // patch for tooltips which dont seem to want to close 
    google.maps.event.addListener(this.map, 'mouseout', function () { window.setTimeout(function (e) { tooltip.hide(); }, 1); });

    // recompute tolerance for each zoom change
    getTolerance(map);
    google.maps.event.addListener(this.map, "zoom_changed", function () { getTolerance(map); });

    this.unnamedpath = "un-named path";
    this.unnamedplace = "un-named place";
    this.unnamedarea = "un-named area";

    // input type size
    if (typeof this.opts.inputsize == "undefined")
        this.inputsize = 35;
    else
        this.inputsize = this.opts.inputsize;

    // Language parameters
    if (typeof this.opts.lang == "undefined") {
        this.lang = {};
        this.lang.txtdir = "Get Directions:";
        this.lang.txtto = "To Here";
        this.lang.txtfrom = "From Here";
        this.lang.txtsrchnrby = "Search nearby";
        this.lang.txtzoomhere = "Zoom Here";
        this.lang.txtaddrstart = "Start address:";
        this.lang.txtgetdir = "Go";
        this.lang.txtback = "&#171; Back";
        this.lang.txtsearchnearby = "Search nearby: e.g. \"pizza\"";
        this.lang.txtsearch = "Go";
    } else {
        this.lang = this.opts.lang;
    }
}

function vizloaded() {
    //alert("loaded");
}

GeoXml.SEMI_MAJOR_AXIS = 6378137.0;
GeoXml.ECCENTRICITY = 0.0818191913108718138;
GeoXml.DEG2RAD = 180.0 / (Math.PI);

GeoXml.merc2Lon = function (lon) {
    return (lon * GeoXml.DEG2RAD) * GeoXml.SEMI_MAJOR_AXIS;
};

GeoXml.merc2Lat = function (lat) {
    var rad = lat * GeoXml.DEG2RAD;
    var sinrad = Math.sin(rad);
    return (GeoXml.SEMI_MAJOR_AXIS * Math.log(Math.tan((rad + Math.PI / 2) / 2) * Math.pow(((1 - GeoXml.ECCENTRICITY * sinrad) / (1 + GeoXml.ECCENTRICITY * sinrad)), (GeoXml.ECCENTRICITY / 2))));
};

// Dropdown factory method
GeoXml.addDropdown = function (myvar, name, type, i, graphic) {
    return '<option value="' + i + '">' + name + '</option>';
};

// Sidebar factory method One - adds an entry to the sidebar
GeoXml.addSidebar = function (myvar, type, name, e, graphic, ckd, i, snippet) {
    var check = "checked";
    if (ckd == "false") { check = ""; }
    var h = "";
    var mid = myvar + "sb" + e;

    if (snippet && snippet != "undefined") {
        snippet = "<br><span class='" + myvar + "snip'>" + snippet + "</span>";
    }
    else {
        snippet = "";
    }

    switch (type) {
    case "polygon":
    case "marker":
    case "polyline":
        h = '<li id="' + mid + '" onmouseout="' + myvar + '.overlayman.markers[' + e + '].onOut(null)" onmouseover="' + myvar + '.overlayman.markers[' + e + '].onOver(null)" >' +
            (checkbox ? '<input id="' + myvar + '' + e + 'CB" type="checkbox" ' + check + ' onclick="' + myvar + '.showHide(null,this.checked,' + i + ')">' : '') +
            '<span><a href="javascript:void(0);" onclick="' + myvar + '.onClick(' + e + ');">' + graphic + name + '</a></span>' + snippet + '</li>';
        break;
    }

    return h;
};

GeoXml.stripHTML = function (s) {
    return (s.replace(/(<([^>]+)>)/ig, ""));
};

GeoXml.getDescription = function (node) {
    var sub = "";
    var n = 0;
    var cn;

    if (typeof XMLSerializer != "undefined") {
        var serializer = new XMLSerializer();
        for (; n < node.childNodes.length; n++) {
            cn = serializer.serializeToString(node.childNodes.item(n));
            sub += cn;
        }
    }
    else {
        for (; n < node.childNodes.length; n++) {
            cn = node.childNodes.item(n);
            sub += cn.xml;
        }
    }

    var s = sub.replace("<![CDATA[", "");
    var u = s.replace("]]>", "");
    u = u.replace(/\&amp;/g, "&");
    u = u.replace(/\&lt;/g, "<");
    u = u.replace(/\&quot;/g, '"');
    u = u.replace(/\&apos;/g, "'");
    u = u.replace(/\&gt;/g, ">");
    u = u.replace(" (Data by", "<br>(Data by"); //put credits on its own line
    if (u.startsWith("<br>")) u = u.substring(4);
    return u;
};

GeoXml.prototype.setOpacity = function (opacity) {
    this.opts.overrideOpacity = opacity;

    for (var m = 0; m < this.overlayman.markers.length; m++) {
        var marker = this.overlayman.markers[m];

        if (marker.getPaths) { //polygon set fill opacity
            this.overlayman.markers[m].fillOpacity = opacity;
            this.overlayman.markers[m].setOptions({ fillOpacity: opacity });
        }
        else {
            if (marker.getPath) {
                this.overlayman.markers[m].strokeOpacity = opacity;
                this.overlayman.markers[m].setOptions({ strokeOpacity: opacity });
            }
        }
    }
};

GeoXml.prototype.showIt = function (str, h, w) {
    var features = "status=yes,resizable=yes,toolbar=0,height=" + h + ",width=" + h + ",scrollbars=yes";
    var myWin;
    if (topwin.widget) {
        alert(str);
        this.mb.showMess(str);
    }
    else {
        myWin = window.open("", "_blank", features);
        myWin.document.open("text/xml");
        myWin.document.write(str);
        myWin.document.close();
    }
};

GeoXml.prototype.clear = function () {
    for (var m = 0; m < this.overlayman.markers.length; m++) {
        this.overlayman.RemoveMarker(this.overlayman.markers[m]);
    }
    this.kml = [new KMLObj("GeoXML", "", true, 0)];
    this.maxtitlewidth = 0;
    this.styles = [];
    // associative array
    this.jsdocs = [];
    this.jsonmarks = [];
    this.polyset = [];
    /* used while rendering */
    this.polylines = [];
    this.multibounds = [];
    this.bounds = new google.maps.LatLngBounds();
    this.overlayman = new OverlayManager(this.map, this, this.opts.clustering);
    this.overlayman.rowHeight = 20;

    if (typeof this.basesidebar != "undefined" && this.basesidebar != "") {
        Lance$(this.basesidebar).innerHTML = "";
    }

    this.currdeschead = "";
    this.overlayman.folders.push([]);
    this.overlayman.subfolders.push([]);
    this.overlayman.folderhtml.push([]);
    this.overlayman.folderhtmlast.push(0);
    this.overlayman.byname = [];
    this.overlayman.byid = [];
    this.filteredNames = [];
    this.folderCBNames = [];
    this.overlayman.folderBounds.push(new google.maps.LatLngBounds());
    this.wmscount = 0;
};

GeoXml.prototype.createMarkerJSON = function (item, idx) {
    var that = this;

    var style = that.makeIcon(style, item.href);
    var point = new google.maps.LatLng(item.y, item.x);
    that.overlayman.folderBounds[idx].extend(point);
    that.bounds.extend(point);

    style.shadow = item.shadow ? item.shadow : null;

    if (!!that.opts.createmarker) {
        that.opts.createmarker(point, item.title2, unescape(item.description), null, idx, style, item.visibility, item.id, item.href, item.snip);
    }
    else {
        that.createMarker(point, item.title2, unescape(item.description), null, idx, style, item.visibility, item.id, item.href, item.snip);
    }
};

GeoXml.prototype.createMarker = function (point, name, desc, styleid, idx, instyle, visible, kml_id, markerurl, snip) {
    var myvar = this.myvar;
    var icon;
    var shadow;
    var href;
    var scale = 1;

    scale *= globalIconScaleFactor;
    
    var bicon;

    if (instyle) {
        bicon = instyle;

        if (instyle.scale)
            scale = instyle.scale;
    }
    else {
        bicon = {
            url: PROTOCOL + "maps.google.com/mapfiles/kml/pal3/icon40.png",
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(iconsize / 2 * scale, iconsize / 2 * scale),
            scaledSize: new google.maps.Size(iconsize * scale, iconsize * scale)
        };
    }

    if (this.opts.baseicon) {
        bicon.size = this.opts.baseicon.size;
        bicon.origin = this.opts.baseicon.origin;
        bicon.anchor = this.opts.baseicon.anchor;

        if (scale) {
            if (instyle) {
                bicon.scaledSize = instyle.scaledSize;
            }
        }
        else {
            bicon.scaledSize = this.opts.baseicon.scaledSize;
        }
        scale = 1;
    }
    icon = bicon;
    if (this.opts.iconFromDescription) {
        var text = desc;
        var pattern = new RegExp("<\\s*img", "ig");
        var result;
        var pattern2 = /src\s*=\s*[\'\"]/;
        var pattern3 = /[\'\"]/;
        while ((result = pattern.exec(text)) != null) {
            var stuff = text.substr(result.index);
            var result2 = pattern2.exec(stuff);
            if (result2 != null) {
                stuff = stuff.substr(result2.index + result2[0].length);
                var result3 = pattern3.exec(stuff);
                if (result3 != null) {
                    var imageUrl = stuff.substr(0, result3.index);
                    href = imageUrl;
                }
            }
        }
        shadow = null;
        if (!href) {
            href = PROTOCOL + "maps.google.com/mapfiles/kml/pal3/icon40.png";
        }
        icon = bicon;
        bicon.size = null;
        bicon.scaledSize = new google.maps.Size(iconsize * scale, iconsize * scale); //scaledSize 
        icon.url = href;
    }
    else {
        href = PROTOCOL + "maps.google.com/mapfiles/kml/pal3/icon40";
        if (instyle == null || typeof instyle == "undefined") {
            shadow = href + "s.png";
            href += ".png";
            if (this.opts.baseicon) {
                href = this.opts.baseicon.url;
            }
        }
        else {
            if (instyle.url) { href = instyle.url; }
        }
        icon = bicon;
        icon.url = href;
    }
    var iwoptions = this.opts.iwoptions || {};
    var markeroptions = this.opts.markeroptions || {};
    var icontype = this.opts.icontype || "style";

    if (icontype == "style") {
        var blark = this.styles[styleid];
        if (!!blark) {
            icon = bicon;
            icon.url = blark.url;
            icon.anchor = blark.anchor;
            href = blark.url;
        }
    }

    markeroptions.icon = icon;

    if (this.contentlinkmarkers) {
        var text = desc;
        var pattern = new RegExp("<\\s*a", "ig");
        var result;
        var pattern2 = /href\s*=\s*[\'\"]/;
        var pattern3 = /[\'\"]/;

        while ((result = pattern.exec(text)) != null) {
            var stuff = text.substr(result.index);
            var result2 = pattern2.exec(stuff);
            if (result2 != null) {
                stuff = stuff.substr(result2.index + result2[0].length);
                var result3 = pattern3.exec(stuff);
                if (result3 != null) {
                    var urlLink = stuff.substr(0, result3.index);
                }
            }
        }
    }

    if (this.extcontentmarkers) {
        var contentUrl = Array();
        var text = desc;
        var pattern = new RegExp("<\\s*object", "ig");
        var result;
        var pattern1 = /<\/\s*object>/i;
        var pattern2 = /data\s*=\s*[\'\"]/;
        var pattern3 = /[\'\"]/;
        var x = 0;

        while ((result = pattern.exec(text)) != null) {
            var stuff = text.substr(result.index);
            var result1 = pattern1.exec(stuff);
            var result2 = pattern2.exec(stuff);
            if (result2 != null) {
                var stuff2 = stuff.substr(result2.index + result2[0].length);
                var result3 = pattern3.exec(stuff2);
                if (result3 != null) {
                    var urlLink = stuff2.substr(0, result3.index);
                    urlLink = urlLink.replace("http://", "");
                    urlLink = urlLink.replace("https://", "");
                    contentUrl[x] = urlLink;
                    text = text.substr(0, result.index) + "<span id='geoxmlobjcont" + x + "'></span>" + stuff.substr(result1.index + result1[0].length, stuff.length);
                    x++;
                }
            }
        }
        desc = text;
    }

    var start = icon.url.substring(0, 4); //handle relative urls
    if (!start.match(/^http/i) && start.substr(0, 1) != '/') {

        if (typeof this.url == "string") {
            var slash = this.url.lastIndexOf("/");
            var newurl;
            if (slash != -1) {
                newurl = this.url.substring(0, slash);
                slash = 0;
            }

            while (slash != -1 && icon.url.match(/^..\//)) {
                slash = newurl.lastIndexOf("/");
                icon.url = icon.url.substring(3);
                if (slash != -1) {
                    newurl = newurl.substring(0, slash);
                }
            }

            if (newurl != "" && icon.url.match(/^..\//)) {
                newurl = "";
                icon.url = icon.url.substring(3);
            }

            if (newurl == "") { markeroptions.icon.url = icon.url; }
            else { markeroptions.icon.url = newurl + "/" + icon.url; }
        }
    }

    var ta = document.createElement("textarea");
    ta.innerHTML = name;
    name = ta.value;
    markeroptions.file = this.urlfile;
    markeroptions.group = this.urlgroup;
    markeroptions.title2 = this.urltitle2 + name;

    markeroptions.clickable = true;
    markeroptions.pane = this.markerpane;
    markeroptions.position = point;
    markeroptions.zIndex = ++zI;
    markeroptions.optimized = false;


    var m = new google.maps.Marker(markeroptions);
    m.id = kml_id;
    m.urlLink = urlLink;
    m.geoxml = this;

    desc = removeRedundantInfo(desc);

    var obj = { type: "point", description: escape(desc), href: href, shadow: shadow, visibility: visible, x: point.x, y: point.y, id: m.id };
    this.kml[idx].marks.push(obj);

    if (this.opts.pointlabelclass) {
        var l = new ELabel(point, name, this.opts.pointlabelclass, this.opts.pointlabeloffset, this.pointlabelopacity, true);
        m.label = l;
        l.setMap(this.map);
    }
    var html, html1;
    
    html = "<div " + this.titlestyle + ">" + name + "</div>";
    if (name != desc) {
        html += "<div " + this.descstyle + ">" + desc + "</div>";
    }
    html += '<div id="elevation" style="font-size: small;">' + displaylocation(point.lat(), point.lng(), '<br>Elevation: #Computing#') + '</div>';
    html1 = html;

    if (this.opts.markerfollowlinks) {
        if (markerurl && typeof markerurl == "string") {
            if (markerurl != '') {
                m.url = markerurl;
                google.maps.event.addListener(m, this.linkmethod, function () {
                    if (m.geoxml.linktarget == "_blank")
                        window.open(m.url);
                    if (m.geoxml.linktarget == "_self")
                        document.location = m.url;
                    try {
                        eval(myvar + ".lastMarker = m");
                    }
                    catch (err) {
                    }
                });
            }
        }
    }
    else {
        if (this.clickablemarkers) {
            m.geoxml = this;
            var infoWindowOptions = {
                content: html1 + "</div>",
                pixelOffset: new google.maps.Size(0, 2)
            };
            if (m.geoxml.maxiwwidth) {
                infoWindowOptions.maxWidth = m.geoxml.maxiwwidth;
            }
            m.infoWindow = new google.maps.InfoWindow(infoWindowOptions);

            // Infowindow-opening event handler
            m.onClick = function () {

                if (m != m.geoxml.lastMarker) {
                    if (!!m.geoxml.opts.singleInfoWindow) {
                        if (!!m.geoxml.lastMarker && !!m.geoxml.lastMarker.infoWindow) {
                            if (!m.geoxml.lastMarker.onMap)
                                m.geoxml.lastMarker.setMap(m.geoxml.map);
                            m.geoxml.lastMarker.infoWindow.close();
                            if (!m.geoxml.lastMarker.onMap)
                                m.geoxml.lastMarker.setMap(null);
                        }
                        OverlayManager.PopDown(m.geoxml.overlayman);
                        m.geoxml.lastMarker = m;
                    }
                    if (!m.onMap)
                        m.geoxml.map.panTo(m.getPosition());
                }
                if (!m.infoWindow.getMap()) {
                    m.infoWindow.open(m.geoxml.map, this);
                    elevationinfowindowm(m);
                }
                tooltip.hide();
            };

            google.maps.event.addListener(m, this.iwmethod, m.onClick);
        }
    }
    if (this.extcontentmarkers) {
        m.geoxml = this;
        var infoWindowOptions = {
            content: html1 + "</div>",
            pixelOffset: new google.maps.Size(0, 2)
        };
        if (m.geoxml.maxiwwidth) {
            infoWindowOptions.maxWidth = m.geoxml.maxiwwidth;
        }
        m.infoWindow = new google.maps.InfoWindow(infoWindowOptions);
        m.contentUrl = contentUrl;

        m.onClick = function () {
            m.geoxml.lastMarker = m;
            if (m.contentUrl.length > 0) {
                m.infoWindow.open(m.geoxml.map, this);
                for (var x = 0; x < m.contentUrl.length; x++) {
                    var url = m.geoxml.proxy + 'url=' + m.contentUrl[x];
                    setTimeout(m.geoxml.myvar + ".getextContent('" + m.contentUrl[x] + "', " + x + ")", 100 + x * 50);
                }
            } else {
                m.infoWindow.open(m.geoxml.map, this);
                elevationinfowindowm(m);
            }
            tooltip.hide();
        };
        google.maps.event.addListener(m, this.iwmethod, m.onClick);

    }

    if (this.contentlinkmarkers) {
        google.maps.event.addListener(m, this.linkmethod, function () {
            if (m.geoxml.linktarget == "_blank")
                window.open(m.urlLink);
            if (m.geoxml.linktarget == "_self")
                document.location = m.urlLink;
        });
    }

    if (this.opendivmarkers != '') {
        m.div = this.opendivmarkers;
        m.onClick = function () {
            if (m != m.geoxml.lastMarker) {
                if (!!m.geoxml.lastMarker && !!m.geoxml.lastMarker.setMap) {
                    if (!m.geoxml.lastMarker.onMap)
                        m.geoxml.lastMarker.setMap(null);
                }
                OverlayManager.PopDown(m.geoxml.overlayman);
                m.geoxml.lastMarker = m;
                m.geoxml.map.panTo(m.getPosition());
            }
            var obj = document.getElementById(m.div);
            if (obj)
                obj.innerHTML = html1 + "</div>";
        };
        google.maps.event.addListener(m, this.iwmethod, m.onClick);
    }

    if (this.opts.domouseover) {
        m.mess = html1 + "</div>";
        m.geoxml = this;
        google.maps.event.addListener(m, "mouseover", function (point) { if (!point) { point = m.getPosition(); } m.geoxml.mb.showMess(m.mess, 5000); });
    }

    var parm;
    if (this.opts.sidebarid) {
        var n = this.overlayman.markers.length;
        var blob = '<img class="legend-icon" border="0" src="' + href + '">';
        if (this.sidebarsnippet) {
            var desc2 = GeoXml.stripHTML(desc);
            desc2 = desc2.substring(0, 40);
        }
        else { desc2 = ''; }
        parm = this.myvar + "$$$marker$$$" + name + "$$$" + n + "$$$" + blob + "$$$" + visible + "$$$null$$$" + desc2;
        m.sidebarid = this.myvar + "sb" + n;
        m.hilite = this.hilite;
        m.geoxml = this;
    }

    m.onOver = function (e) {
        if (this.geoxml.dohilite) {
            var bar = Lance$(this.sidebarid);
            if (bar && typeof bar != "undefined") {
                bar.style.backgroundColor = this.hilite.color;

                bar.style.color = this.hilite.textcolor;
            }
            if (this.highlight == null) {
                var color = this.geoxml.hilite.color.replace("#", "");
                var fs = iconsize + this.geoxml.hilite.width;
                this.setZIndex(++zI);

                this.highlight = new google.maps.Marker({
                    position: m.getPosition(),
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: iconsize / 2,
                        color: this.geoxml.hilite.color,
                        strokeColor: this.geoxml.hilite.color,
                        strokeOpacity: this.geoxml.hilite.opacity,
                        strokeWeight: this.geoxml.hilite.width
                    },
                    draggable: false,
                    clickable: false,
                    optimized: false,
                    zIndex: this.zIndex - 1
                });

                this.highlight.setMap(this.map);
            }
        }
        // title2 used to avoid system tooltip interference
        this.priority = 1;
        if (e) tooltip.show(this.title2, e, this);
    };
    m.onOut = function () {
        if (this.geoxml.dohilite) {
            var bar = Lance$(this.sidebarid);
            if (bar && typeof bar != "undefined") {
                bar.style.background = "none";
                bar.style.color = "";
            }
        }

        if (this.highlight != null) {
            this.highlight.setMap(null);
            this.highlight = null;
        }
        tooltip.hide(this);
    };

    google.maps.event.addListener(m, "mouseover", m.onOver);
    google.maps.event.addListener(m, "mouseout", m.onOut);

    if (!!this.opts.addmarker) {
        this.opts.addmarker(m, name, idx, parm, visible);
    } else {
        this.overlayman.addMarker(m, name, idx, parm, visible);
    }

    if (this.showLabels)
        m.label = ILabel(point, name, this.map, scale, "");
};

GeoXml.prototype.getextContent = function (url, x) {
    var that = this;
    that.DownloadURL(url, function (doc) {
        if (doc) {
            obj = document.getElementById('geoxmlobjcont' + x);
            if (obj)
                obj.innerHTML = doc;
        }
    }, 'geoxmlobjcont' + x + ' ' + url, false);
};

GeoXml.prototype.processLine = function (pnum, lnum, idx, multi) {
    var that = this;
    var op = that.polylines[pnum];
    if (op == null) {
        return;
    }

    if (op.opacity) {
        var opacity = Math.round(op.opacity * 0xFF + 0.5);
        if (op.opacity > this.maxopacity)
            op.opacity = this.maxopacity;
    }

    var isnew = true;
    if (pnum > 0) {
        var last = that.polylines[pnum - 1];
        if (op.name == last.name) {
            isnew = false;
            that.polylines[pnum - 1] = null;
            pnum = pnum - 1;
            that.polylines[pnum] = last;
        }
    }

    var line = op.lines[lnum];
    var obj;
    var p;
    if (!line) { return; }
    obj = { points: line, color: op.color, weight: op.width, opacity: op.opacity, type: "line", id: op.id };
    var pline = line;

    if (line.length == 1) {
        pline = line[0];
    }

    var icons;

    if (this.opts.showArrows) {
        var lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
            fillColor: "black",
            strokeColor: "black",
            strokeOpacity: 0.75,
            scale: 1.0
        };
        icons = [{
            icon: lineSymbol,
            offset: '50%',
            repeat: '50px'
        }];
    }

    p = new google.maps.Polyline({ map: this.map, path: pline, strokeColor: op.color, strokeWeight: op.width, strokeOpacity: op.opacity, zIndex: op.zIndex, icons: icons });
    p.bounds = op.pbounds;
    p.id = op.id;

    if (isnew == false) {
        if (this.opts.sidebarid) { p.sidebarid = this.latestsidebar; }
    }

    var n = this.overlayman.markers.length;
    var parm;
    var awidth = this.iwwidth;
    var desc = op.description;
    
    var dist = Length(p);
    op.name += ": " + "<span class='uft'>" + miStr(dist) + "</span>";

    if (this.opts.debug) {
        var ccolor = parseInt(op.color.replace("#", "0x"));
        var r = (ccolor & 0xFF);
        var g = (ccolor & 0xFF00) >> 8;
        var b = (ccolor & 0xFF0000) >> 16;
        var color = (r << 16) + (g << 8) + (b << 0);
        var color16 = "000000" + color.toString(16);
        function pc(c) { return c > 0x80 ? "1" : "0"; }
        op.name += " O:" + opacity.toString(16) + " C:" + color16.substr(-6) + " BGR:" + pc(r) + pc(g) + pc(b);

        console.log("FILE:" + this.urlfile + " LINE:" + op.name);

        var e = document.createElement("div");
        e.innerHTML = "FILE:" + this.urlfile + " LINE:" + op.name;
        document.body.appendChild(e);
    }

    if (desc.length * 8 < awidth) {
        awidth = desc.length * 8;
    }

    if (awidth < op.name.length * 12) {
        awidth = op.name.length * 12;
    }

    var html = "<div id='elevationiw' style='width:auto;height:auto;overflow:hidden;'><div style='font-weight: bold; font-size: medium; margin-bottom: 0em;width:auto;overflow:hidden;'>" + op.name + "</div>";
    html += "<div style='font-family: Arial, sans-serif;font-size: small;width:auto;overflow:hidden;'>" + desc + "</div>"; //"+awidth+"px
    html += "<div id='elevation' style='font-family: Arial, sans-serif;font-size: small;width:auto;overflow:hidden;'><p>Highest / lowest pt: ####Computing1####<br>Max elev change: ####Computing2####<br>Total gain / loss: ####Computing3####</div>";
    html += "<div id='elevationgraph' style='height:5px;overflow:hidden;'></div>";

    if (lnum == 0) {
        if (this.opts.sidebarid && isnew) {
            var s_w = op.width;
            if (s_w <= 2) { s_w = 2; }
            if (s_w > 16) { s_w = 16; };
            var blob;
            if (this.rectangleLegend) {
                var m_w = parseInt(((16 - s_w) / 2));
                blob = '<svg xmlns="' + PROTOCOL + 'www.w3.org/2000/svg" style="vertical-align:text-top;margin-left:2px;;margin-right:2px;margin-top:0px" version="1.2" fill="#ffeecc" width="16px" height="16px">';
                if (op.color == '#ffffff' || op.color == '#FFFFFF') {
                    blob += ' <rect stroke="none" height="16" width="16" y="0" x="0" stroke-width="null" fill="#cbcbcb"/>';
                }
                blob += ' <rect stroke="none" width="16" height="' + s_w + '" x="0" y="' + m_w + '" stroke-width="null" fill="' + op.color + '"/></svg>';
            }
            else {
                blob = '<svg xmlns="' + PROTOCOL + 'www.w3.org/2000/svg" style="vertical-align:text-top;margin-left:0px;margin-top:0px" version="1.2" fill="#ffeecc" width="16px" height="16px">';
                if (op.color == '#ffffff' || op.color == '#FFFFFF') {
                    blob += ' <rect stroke="none" height="16" width="16" y="0" x="0" stroke-width="null" fill="#cbcbcb"/>';
                }
                blob += '<path stroke="' + op.color + '" d="m1.514515,10.908736c-0.457545,0.489079 0.473927,-7.091639 5.261762,-7.336174c4.787838,-0.244535 -0.457535,7.825252 4.804223,2.445392c5.261755,-5.37986 1.949991,11.609838 2.287748,3.179009"  stroke-width="2" fill="none"/></svg>';
            }

            if (this.sidebarsnippet) {
                var desc2 = GeoXml.stripHTML(desc);
                desc2 = desc2.substring(0, 20);
            }
            else { desc2 = ''; }

            parm = this.myvar + "$$$polyline$$$" + op.name + "$$$" + n + "$$$" + blob + "$$$" + op.visibility + "$$$" + pnum + "$$$" + desc2;
            this.latestsidebar = this.myvar + "sb" + n;
        }
    }

    if ((lnum + 1) < op.lines.length) {
        evalTimeout(this.myvar + ".processLine(" + pnum + "," + (lnum + 1) + ",'" + idx + "'," + multi + ");", 15);
    }

    if (this.opts.sidebarid) { p.sidebarid = this.latestsidebar; }
    if (this.opts.domouseover) {
        p.mess = html;
    }

    p.file = this.urlfile;
    p.group = this.urlgroup;
    p.title2 = this.urltitle2 + op.name;
    p.geoxml = this;
    p.strokeColor = op.color;
    p.strokeWeight = op.width;
    p.strokeOpacity = op.opacity;
    p.hilite = this.hilite;
    p.mytitle = p.title2;
    p.map = this.map;
    p.idx = pnum;
    var position = p.getPosition();

    if (this.clickablelines) {
        var infoWindowOptions = {
            content: html,
            pixelOffset: new google.maps.Size(0, 2),
            position: position
        };
        if (this.maxiwwidth) {
            infoWindowOptions.maxWidth = this.maxiwwidth;
        }
        p.infoWindow = new google.maps.InfoWindow(infoWindowOptions);
    }

    p.onOver = function (e) {
        var pline = this.geoxml.polylines[this.idx];
        if (this.geoxml.dohilite) {
            if (this.hidden != true) {

                this.highlight = new google.maps.Polyline({
                    path: this.getPath(),
                    strokeColor: this.geoxml.hilite.color,
                    strokeOpacity: this.geoxml.hilite.opacity,
                    strokeWeight: this.strokeWeight + this.geoxml.hilite.width,
                    zIndex: this.zIndex - 1
                });
                this.highlight.setMap(this.map);
            }

            if (this.sidebarid) {
                Lance$(this.sidebarid).style.backgroundColor = this.hilite.color;
                Lance$(this.sidebarid).style.color = this.hilite.textcolor;
            }
        }

        this.priority = 2;
        if (e) {
            var text = this.title2.split("<br>");
            function addtitle(txt) {
                if (!txt) return;

                var t = txt.split("<br>");
                if (t.length > 1) {
                    for (var j = 0; j < text.length; ++j) {
                        if (text[j] === t[0]) {
                            text.splice(j + 1, 0, t[1]);
                            return;
                        }
                        if (text[j] === t[1]) {
                            text.splice(j, 0, t[0]);
                            return;
                        }
                    }
                    text.push(t[0]);
                    text.push(t[1]);
                }
                else {
                    text.push(t[0]);
                }
            }
            function findLatLng(poly, ll) {
                var point = ll;
                var mini = -1, mind = 1e10;
                var a = poly.getPath(), len = a.getLength();
                for (var i = 0; i < len; i++) {
                    var d = DistanceLength(a.getAt(i), point);

                    if (d < mind) {
                        mind = d;
                        mini = i;
                    }
                }

                if (mini >= 0)
                    point = a.getAt(mini);
                
                return point;
            }

            var ll = findLatLng(this, e.latLng);

            // find more overlapping lines      
            var markers = this.geoxml.overlayman.markers;
            for (var i = 0; i < markers.length; ++i)
                if (markers[i].ismouseover(ll) && markers[i] !== this)
                    addtitle(markers[i].title2);
            text = text.join("<br>");
            text = adjustHtmlStringForMetric(text);
            tooltip.show(text, e, this);
        }
        if (this.mess) { this.geoxml.mb.showMess(this.mess, 5000); } else { this.title2 = this.mytitle; }
    };

    p.onOut = function () {
        if (this.geoxml.dohilite) {
            if (this.highlight) {
                this.highlight.setMap(null);
                this.highlight = null;
            }
            if (this.sidebarid) {
                Lance$(this.sidebarid).style.background = "none";
                Lance$(this.sidebarid).style.color = "";
            }

        }
        this.geoxml.mb.hideMess();
        tooltip.hide(this);
    };

    p.onClick = function (point) {
        if (p.geoxml.clickablelines || doit) {
            if (p != p.geoxml.lastMarker) {
                if (!!p.geoxml.opts.singleInfoWindow) {
                    if (!!p.geoxml.lastMarker && !!p.geoxml.lastMarker.infoWindow) {
                        if (!p.geoxml.lastMarker.onMap)
                            p.geoxml.lastMarker.setMap(p.geoxml.map);
                        p.geoxml.lastMarker.infoWindow.close();
                        if (!p.geoxml.lastMarker.onMap)
                            p.geoxml.lastMarker.setMap(null);
                    }
                    p.geoxml.lastMarker = p;
                }
            }

            var dest;
            var doit = false;
            if (!point) {
                doit = true; //sidebar click
                dest = p.infoWindow.position;
                var pline = this.geoxml.polylines[this.idx];
                p.geoxml.map.fitBounds(pline.bounds);
            } else {
                dest = point.latLng;
                p.infoWindow.setPosition(dest);
            }
        }
        var str = p.infoWindow.getContent();
        str = adjustHtmlStringForMetric(str);
        p.infoWindow.setContent(str);

        p.infoWindow.open(p.geoxml.map); //, this
        elevationinfowindowp(p);
        tooltip.hide();
    };

    google.maps.event.addListener(p, "mouseout", p.onOut);
    google.maps.event.addListener(p, "mouseover", p.onOver);
    google.maps.event.addListener(p, this.iwmethod, p.onClick);

    obj.name = op.name;
    obj.description = escape(op.description);

    if (this.hideall) {
        op.visibility = false;
    }

    obj.visibility = op.visibility;
    this.kml[idx].marks.push(obj);


    // black lines (roads) do not add to bounds
    if (p.strokeColor != "#000000") {
        var ne = p.getBounds().getNorthEast();
        var sw = p.getBounds().getSouthWest();
        this.bounds.extend(ne);
        this.bounds.extend(sw);
        this.overlayman.folderBounds[idx].extend(sw);
        this.overlayman.folderBounds[idx].extend(ne);
        this.polylines[pnum].bounds.extend(ne);
        this.polylines[pnum].bounds.extend(sw);
    }

    n = this.overlayman.markers.length;
    this.polylines[pnum].lineidx.push(n);

    this.overlayman.addMarker(p, op.name, idx, parm, op.visibility, true);

    if (this.showRouteLabels) {
        var point = p.getPosition();
        p.label = ILabel(point, op.name.split(":")[0], this.map, 1, op.color.replace("#", "")); //.replace("Descent","").replace("Approach","").replace("Exit", "")
    }

    if (this.showElevation)
        getelevation(p);
};

GeoXml.prototype.createPolyline = function (lines, color, width, opacity, pbounds, name, desc, idx, visible, kml_id) {
    var that = this;
    var p = {};
    if (!color) { p.color = that.randomColor(); }
    else { p.color = color; }
    if (!opacity) { p.opacity = 0.45; }
    else { p.opacity = opacity; }
    if (!width) { p.width = 4; }
    else { p.width = width; }
    p.idx = idx;
    p.visibility = visible;
    if (that.hideall) { p.visibility = false; }
    p.name = name;
    p.bounds = new google.maps.LatLngBounds();
    p.description = desc;
    p.lines = [];
    p.lines.push(lines);
    p.lineidx = [];
    p.id = kml_id;
    p.zIndex = ++zI;
    that.polylines.push(p);
    evalTimeout(that.myvar + ".processLine(" + (that.polylines.length - 1) + ",0,'" + idx + "',true);", 15);
};

GeoXml.prototype.processPLine = function (pnum, linenum, idx) {

    //alert(p.lines.length);
    var p = this.polyset[pnum];
    var line = p.lines[linenum];

    if (line && line.length) {
        p.obj.polylines.push(line);
    }

    if (linenum == p.lines.length - 1) {
        this.finishPolygon(p.obj, idx);
    }
    else {
        evalTimeout(this.myvar + ".processPLine(" + pnum + "," + (linenum + 1) + ",'" + idx + "');", 5);
    }
};

GeoXml.prototype.finishPolygon = function (op, idx) {
    op.type = "polygon";
    this.finishPolygonJSON(op, idx, false);
};

GeoXml.prototype.getBounds = function (polygon) {
    var bounds = new google.maps.LatLngBounds();
    var paths = polygon.getPaths();
    var path;

    for (var p = 0; p < paths.getLength(); p++) {
        path = paths.getAt(p);
        for (var i = 0; i < path.getLength(); i++) {
            bounds.extend(path.getAt(i));
        }
    }

    return bounds;
};

GeoXml.prototype.finishPolygonJSON = function (op, idx, updatebound, lastpoly) {
    var that = this;
    if (typeof op.visibility == "undefined") { op.visibility = true; }
    if (that.hideall) { op.visibility = false; }
    var desc = unescape(op.description);
    op.opacity = op.fillOpacity;
    var p = {};
    p.paths = op.polylines;

    var html = "<p style='font-family: Arial, sans-serif; font-weight: bold; font-size: medium; margin-bottom: 0em; margin-top:0em'>" + op.name + "</p>";
    if (desc != op.name) {
        html += "<div style='font-family: Arial, sans-serif;font-size: small;width:auto>" + desc + "</div>";
    }

    var newgeom = (lastpoly != "p_" + op.name);
    if (newgeom && this.opts.sidebarid) {
        this.latestsidebar = that.myvar + "sb" + this.overlayman.markers.length;
    }
    else {
        this.latestsidebar = "";
    }

    if (that.opts.domouseover) {
        p.mess = html;
    }

    if (op.strokeColor) {
        p.strokeColor = op.strokeColor;
    }
    else {
        p.strokeColor = op.color;
    }

    if (op.outline) {
        if (op.strokeWeight) {
            p.strokeWeight = op.strokeWeight;
        }
        else {
            p.strokeWeight = op.width;
        }
        p.strokeOpacity = op.strokeOpacity;
    }
    else {
        p.strokeWeight = 0;
        p.strokeOpacity = 0;
    }

    p.hilite = that.hilite;
    p.fillOpacity = !op.fill ? 0.0 : op.opacity;
    p.fillColor = op.color.toString();

    var polygon = new google.maps.Polygon(p);
    polygon.mb = that.mb;

    if (that.domouseover) {
        polygon.mess = html;
    }
    polygon.geoxml = that;
    polygon.file = this.urlfile;
    polygon.group = this.urlgroup;
    polygon.title2 = this.urltitle2 + op.name;
    polygon.id = op.id;
    var n = this.overlayman.markers.length;

    if (newgeom) {
        that.multibounds.push(new google.maps.LatLngBounds());
        that.polygons.push([]);
    }

    var len = that.multibounds.length - 1;
    that.multibounds[len].extend(polygon.getBounds().getSouthWest());
    that.multibounds[len].extend(polygon.getBounds().getNorthEast());
    that.polygons[that.polygons.length - 1].push(n);
    polygon.polyindex = that.polygons.length - 1;
    polygon.geomindex = len;
    polygon.sidebarid = this.latestsidebar;
    
    var infoWindowOptions = {
        content: html,
        pixelOffset: new google.maps.Size(0, 2),
        position: polygon.getCenter()
    };

    if (this.maxiwwidth) {
        infoWindowOptions.maxWidth = this.maxiwwidth;
    }

    polygon.infoWindow = new google.maps.InfoWindow(infoWindowOptions);

    polygon.onOver = function (e) {
        if (this.geoxml.dohilite) {
            if (this.sidebarid) {
                var bar = Lance$(this.sidebarid);
                if (!!bar) {
                    bar.style.backgroundColor = this.hilite.color;
                    bar.style.color = this.hilite.textcolor;
                }
            }

            this.highlight = new google.maps.Polygon({
                path: this.getPath(),
                strokeColor: this.geoxml.hilite.color,
                strokeOpacity: this.geoxml.hilite.opacity,
                strokeWeight: this.strokeWeight + this.geoxml.hilite.width,
                fillColor: this.geoxml.hilite.color,
                fillOpacity: this.geoxml.hilite.opacity,
                zIndex: this.zIndex + 1
            });
            this.highlight.setMap(this.map);
        }

        this.priority = 3;
        if (e) tooltip.show(this.title2, e, this);
        if (this.mess) { polygon.geoxml.mb.showMess(this.mess, 5000); }
    };

    polygon.onOut = function () {
        if (this.geoxml.dohilite) {
            if (this.sidebarid) {
                var bar = Lance$(this.sidebarid);
                if (!!bar) {
                    bar.style.background = "none";
                    bar.style.color = "";
                }
            }

            if (this.highlight) {
                this.highlight.setMap(null);
                this.highlight = null;
            }
        }

        if (this.mess) { this.geoxml.mb.hideMess(); }
        tooltip.hide(this);
    };

    var bounds;
    polygon.onClick = function (point) {

        if (!point) {
            if (this.geoxml.alwayspop) {
                bounds = this.geoxml.multibounds[this.geomindex];
                this.geoxml.map.fitBounds(bounds);
                point = {};
                point.latLng = bounds.getCenter();
            } else {
                bounds = this.geoxml.multibounds[this.geomindex];
                this.geoxml.map.fitBounds(bounds);
                point = bounds.getCenter();
            }
        } else {
            point = point.latLng;
        }

        if (this.geoxml.clickablepolys) {
            if (!!this.geoxml.opts.singleInfoWindow) {
                if (!!this.geoxml.lastMarker && !!this.geoxml.lastMarker.infoWindow) {
                    this.geoxml.lastMarker.infoWindow.close();
                }
                this.geoxml.lastMarker = this;
            }
            this.infoWindow.setPosition(point);
            this.infoWindow.open(this.geoxml.map);
            tooltip.hide();
        }
    };

    google.maps.event.addListener(polygon, "mouseout", polygon.onOut);
    google.maps.event.addListener(polygon, "mouseover", polygon.onOver);
    google.maps.event.addListener(polygon, this.iwmethod, polygon.onClick);

    op.description = escape(desc);
    this.kml[idx].marks.push(op);
    polygon.setMap(this.map);
    
    if (this.opts.polylabelclass && newgeom) {
        var epoint = this.getBounds(polygon).getCenter();
        var off = this.opts.polylabeloffset;
        if (!off) { off = new google.maps.Size(0, 0); }
        off.x = -(op.name.length * 6);
        var l = new ELabel(epoint, " " + op.name + " ", this.opts.polylabelclass, off, this.polylabelopacity, true);
        polygon.label = l;
        l.setMap(this.map);
    }

    var parm;

    if (this.basesidebar && newgeom) {
        var blob;
        if (this.rectangleLegend) {
            blob = '<svg xmlns="' + PROTOCOL + 'www.w3.org/2000/svg" style="vertical-align:text-top;margin-left:0px;margin-top:0px" version="1.2" width="16px" height="16px">';
            blob += ' <rect stroke="none" height="16" width="16" y="0" x="0" stroke-width="null" fill="' + op.color + '"/></svg>';
        }
        else {
            blob = '<svg xmlns="' + PROTOCOL + 'www.w3.org/2000/svg" style="vertical-align:text-top;margin-left:0px;margin-top:0px" version="1.2" width="16px" height="16px">';
            blob += '<path stroke="' + op.strokeColor + '" transform="rotate(139.901 9.70429 10.2675)" fill="' + op.color + '" stroke-dasharray="null" stroke-linejoin="null" stroke-linecap="null" d="m2.72366,9.83336c3.74686,-4.221 6.00924,-2.11097 7.43079,1.52863c1.42154,3.63961 3.85727,-1.60143 6.07385,1.67422c2.21659,3.27565 -4.2,6.26012 -7.17232,7.93434" id="svg_2"/></svg>';
        }

        if (this.sidebarsnippet) {
            var desc2 = GeoXml.stripHTML(desc);
            desc2 = desc2.substring(0, 20);
        }

        else { desc2 = ''; }
        parm = this.myvar + "$$$polygon$$$" + op.name + "$$$" + n + "$$$" + blob + "$$$" + op.visibility + "$$$null$$$" + desc2;
    }

    if (updatebound) {
        var ne = polygon.getBounds().getNorthEast();
        var sw = polygon.getBounds().getSouthWest();
        this.bounds.extend(ne);
        this.bounds.extend(sw);
        this.overlayman.folderBounds[idx].extend(sw);
        this.overlayman.folderBounds[idx].extend(ne);
    }

    this.overlayman.addMarker(polygon, op.name, idx, parm, op.visibility);
    return op.name;
};

GeoXml.prototype.finishLineJSON = function (po, idx, lastlinename) {
    var m;
    var that = this;

    m = new google.maps.Polyline({
        path: po.points,
        strokeColor: po.color,
        strokeWeight: po.weight,
        strokeOpacity: po.opacity,
        clickable: this.clickablelines,
        zIndex: this.zIndex
    });

    m.mytitle = po.name;
    m.title2 = po.name;
    m.strokeColor = po.color;
    m.strokeOpacity = po.opacity;
    m.geoxml = this;
    m.hilite = this.hilite;
    var n = that.overlayman.markers.length;
    var lineisnew = false;
    var pnum;
    if (("l_" + po.name) != lastlinename) {
        lineisnew = true;
        that.polylines.push(po);
        pnum = that.polylines.length - 1;
        that.polylines[pnum].lineidx = [];
        that.polylines[pnum].lineidx.push(n);
        that.latestsidebar = that.myvar + "sb" + n;
    }
    else {
        pnum = that.polylines.length - 1;
        that.polylines[pnum].lineidx.push(n);
    }

    if (this.opts.basesidebar) {
        m.sidebarid = that.latestsidebar;
    }

    m.onOver = function () {
        if (this.geoxml.dohilite) {
            if (!!this.sidebarid) {
                var bar = Lance$(this.sidebarid);
                if (bar && typeof bar != "undefined") { bar.style.backgroundColor = this.hilite.color; }
            }
            this.realColor = this.strokeColor;
            if (m.hidden != true) {
                if (m && typeof m != "undefined") {
                    m.setOptions({ strokeColor: this.hilite.color });
                }
                //this.redraw(true);
            }
        }
        if (this.mess) { this.geoxml.mb.showMess(this.mess, 5000); } else { this.title2 = /*"Click for more information about "+*/this.mytitle; }
    };

    m.onOut = function () {
        if (this.geoxml.dohilite) {
            if (!!this.sidebarid) {
                var bar = Lance$(this.sidebarid);
                if (bar && typeof bar != "undefined") { bar.style.background = "none"; }
            }
            if (m.hidden != true) {
                if (m && typeof m != "undefined") { m.setOptions({ strokeColor: this.realColor }); }
                //this.redraw(true);
            }
        }
        if (this.mess) { this.geoxml.mb.hideMess(); }
    };

    google.maps.event.addListener(m, "mouseover", m.onOver);
    google.maps.event.addListener(m, "mouseover", m.onOut);
    
    var parm = "";
    that.kml[idx].marks.push(po);
    var desc = unescape(po.description);
    var awidth = this.iwwidth;

    if (desc.length * 8 < awidth) {
        awidth = desc.length * 8;
    }
    if (awidth < po.name.length * 12) {
        awidth = po.name.length * 12;
    }

    var html = "<div style='font-family: Arial, sans-serif; font-weight: bold; font-size: medium; margin-bottom: 0em;'>" + po.name + "</div>";
    if (po.name != desc) {
        html += "<div style='font-family: Arial, sans-serif;font-size: small;width:auto;white-space:normal;>" + desc + "</div>";
    }

    m.map = this.map;

    var infoWindowOptions = {
        content: html,
        pixelOffset: new google.maps.Size(0, 2),
        position: point
    };

    if (this.maxiwwidth) {
        infoWindowOptions.maxWidth = this.maxiwwidth;
    }

    m.infoWindow = new google.maps.InfoWindow(infoWindowOptions);
    if (this.clickablelines) {
        m.onClick = function (point) {
            if (!!!point) { point = m.getPosition(); }
            m.infoWindow.open();
            tooltip.hide();
        };
        google.maps.event.addListener(m, this.iwmethod, m.onClick);
    }

    if (that.basesidebar && lineisnew) {
        var blob;
        if (this.rectangleLegend) {
            var s_w = po.weight;
            if (s_w < 1) { s_w = 1; }
            var m_w = parseInt(((16 - s_w) / 2));
            blob = '<svg xmlns="' + PROTOCOL + 'www.w3.org/2000/svg" style="vertical-align:text-top;margin-left:0px;margin-top:0px" version="1.2" width="16px" height="16px">';
            blob += ' <rect stroke="none" height="16" width="' + s_w + '" y="0" x="' + m_w + '" stroke-width="null" fill="' + po.color + '"/></svg>';
        }
        else {
            blob = '<svg xmlns="' + PROTOCOL + 'www.w3.org/2000/svg" style="vertical-align:text-top;margin-left:0px;margin-top:0px" version="1.2" width="16px" height="16px">';
            if (op.color == '#ffffff' || op.color == '#FFFFFF') {
                blob += ' <rect stroke="none" height="16" width="16" y="0" x="0" stroke-width="null" fill="#cbcbcb"/>';
            }
            blob += '<path stroke="' + op.color + '" d="m1.514515,10.908736c-0.457545,0.489079 0.473927,-7.091639 5.261762,-7.336174c4.787838,-0.244535 -0.457535,7.825252 4.804223,2.445392c5.261755,-5.37986 1.949991,11.609838 2.287748,3.179009"  stroke-width="' + po.weight + '" fill="none"/></svg>';
        }
        if (typeof po.visibility == "undefined") { po.visibility = true; }
        if (this.sidebarsnippet) {
            var desc2 = GeoXml.stripHTML(desc);
            desc2 = desc2.substring(0, 20);
        }
        else { desc2 = ''; }
        parm = that.myvar + "$$$polyline$$$" + po.name + "$$$" + n + "$$$" + blob + "$$$" + po.visibility + "$$$" + (that.polylines.length - 1) + "$$$" + desc2;
    }

    var ne = m.getBounds().getNorthEast();
    var sw = m.getBounds().getSouthWest();
    that.bounds.extend(ne);
    that.bounds.extend(sw);
    that.overlayman.folderBounds[idx].extend(sw);
    that.overlayman.folderBounds[idx].extend(ne);
    that.overlayman.addMarker(m, po.name, idx, parm, po.visibility);
    return (po.name);
};

GeoXml.prototype.handlePlaceObj = function (num, max, idx, lastlinename, depth) {
    var that = this;
    var po = that.jsonmarks[num];
    var name = po.name;
    if (po.title2) { name = po.title2; }
    if (name.length + depth > that.maxtitlewidth) { that.maxtitlewidth = name.length + depth; }

    switch (po.type) {
        case "polygon":
            lastlinename = "p_" + that.finishPolygonJSON(po, idx, true, lastlinename);
            break;
        case "line":
        case "polyline":
            lastlinename = "l_" + that.finishLineJSON(po, idx, lastlinename);
            break;
        case "point":
            that.createMarkerJSON(po, idx);
            lastlinename = "";
            break;
    }

    if (num < max - 1) {
        var act = that.myvar + ".handlePlaceObj(" + (num + 1) + "," + max + "," + idx + ",\"" + lastlinename + "\"," + depth + ");";
        document.status = "processing " + name;
        evalTimeout(act, 1);
    }
    else {
        lastlinename = "";
        if (num == that.jsonmarks.length - 1) {
            that.progress--;
            if (that.progress <= 0) {
                // Shall we zoom to the bounds?
                if (!that.opts.nozoom) {
                    that.map.fitBounds(that.bounds);
                }
                google.maps.event.trigger(that, "parsed");
                that.setFolders();
                that.mb.showMess("Finished Parsing", 1000);
                that.ParseURL();
            }
        }
    }
};

GeoXml.prototype.parseJSON = function (doc, title2, latlon, desc, sbid) {
    var that = this;
    that.overlayman.miStart = new Date();
    that.jsdocs = eval('(' + doc + ')');
    var bar = Lance$(that.basesidebar);
    if (bar) { bar.style.display = ""; }
    that.recurseJSON(that.jsdocs[0], title2, desc, that.basesidebar, 0);
};

GeoXml.prototype.setFolders = function () {
    var that = this;
    var len = that.kml.length;
    for (var i = 0; i < len; i++) {
        var fid = that.kml[i].folderid;
        var fidstr = new String(fid);
        var fb = fidstr.replace("_folder", "FB");
        var fi = Lance$(fb);
        var fob = Lance$(fid);
        if (fob !== null && fid != that.opts.sidebarid) {
            if (!!that.kml[i].open) {
                fob.style.display = 'block';
            }
            else {
                fob.style.display = 'none';
                if (fi.src == that.foldericon) { fi.src = that.folderclosedicon; }
                if (fi.src == that.docicon) { fi.src = that.docclosedicon; }
            }
        }
    }
};

GeoXml.prototype.recurseJSON = function (doc, title2, desc, sbid, depth) {
    var that = this;
    var polys = doc.marks;
    var name = doc.title2;
    if (!sbid) { sbid = 0; }
    var description = unescape(doc.description);
    if (!description && desc) { description = desc; }
    var keepopen = that.forcefoldersopen;
    if (doc.open) { keepopen = true; }
    var visible = true;
    if (typeof doc.visibility != "undefined" && doc.visibility) { visible = true; }
    if (that.hideall) { visible = false; }
    var snippet = doc.snippet;
    var idx = that.overlayman.folders.length;
    if (!description) { description = name; }
    var folderid;
    var icon;
    that.overlayman.folders.push([]);
    that.overlayman.subfolders.push([]);
    that.overlayman.folderhtml.push([]);
    that.overlayman.folderhtmlast.push(0);
    that.overlayman.folderBounds.push(new google.maps.LatLngBounds());
    that.kml.push(new KMLObj(title2, description, keepopen));

    if ((!depth && (doc.folders && doc.folders.length > 1)) || doc.marks.length) {
        if (depth < 2 || doc.marks.length < 1) { icon = that.globalicon; }
        else { icon = that.foldericon; }
        folderid = that.createFolder(idx, name, sbid, icon, description, snippet, keepopen, visible);
    }
    else {
        folderid = sbid;
    }

    var m;
    var num = that.jsonmarks.length;
    var max = num + polys.length;
    for (var p = 0; p < polys.length; p++) {
        var po = polys[p];
        that.jsonmarks.push(po);
        desc = unescape(po.description);
        m = null;
        if (that.opts.preloadHTML && desc && desc.match(/<(\s)*img/i)) {
            var preload = document.createElement("span");
            preload.style.visibility = "visible";
            preload.style.position = "absolute";
            preload.style.left = "-1200px";
            preload.style.top = "-1200px";
            preload.style.zIndex = this.overlayman.markers.length;
            document.body.appendChild(preload);
            preload.innerHTML = desc;
        }
    }

    if (polys.length) { that.handlePlaceObj(num, max, idx, null, depth); }
    var fc = 0;
    var fid = 0;

    if (typeof doc.folders != "undefined") {
        fc = doc.folders.lenth;
        for (var f = 0; f < doc.folders.length; ++f) {
            var nextdoc = that.jsdocs[doc.folders[f]];
            fid = that.recurseJSON(nextdoc, nextdoc.title2, nextdoc.description, folderid, (depth + 1));
            that.overlayman.subfolders[idx].push(fid);
            that.overlayman.folderBounds[idx].extend(that.overlayman.folderBounds[fid].getSouthWest());
            that.overlayman.folderBounds[idx].extend(that.overlayman.folderBounds[fid].getNorthEast());
            if (fid != idx) { that.kml[idx].folders.push(fid); }
        }
    }

    if (fc || polys.length) {
        that.bounds.extend(that.overlayman.folderBounds[idx].getSouthWest());
        that.bounds.extend(that.overlayman.folderBounds[idx].getNorthEast());
    }

    return idx;
};

GeoXml.prototype.createPolygon = function (lines, color, width, opacity, fillcolor, fillOpacity, pbounds, name, desc, folderid, visible, fill, outline, kml_id) {

    var p = {};
    p.obj = { "description": desc, "name": name };
    p.obj.polylines = [];
    p.obj.id = kml_id;
    p.obj.visibility = visible;
    p.obj.fill = fill;
    p.obj.outline = outline;
    p.obj.fillcolor = fillcolor;
    p.obj.strokeColor = color;
    p.obj.strokeOpacity = opacity;

    p.obj.strokeColor = !color ? this.style.color : color;

    p.obj.color = !fillcolor ? this.randomColor() : fillcolor;

    if (!!opacity) { p.obj.opacity = opacity; }
    else {
        p.obj.opacity = this.style.opacity;
        p.obj.strokeOpacity = this.style.opacity;
    }

    p.obj.fillOpacity = !!fillOpacity ? fillOpacity : this.style.fillopacity;

    p.obj.strokeWeight = !width ? this.style.width : width;

    p.bounds = pbounds;
    p.lines = lines;
    p.sidebarid = this.opts.sidebarid;
    this.polyset.push(p);

    evalTimeout(this.myvar + ".processPLine(" + (this.polyset.length - 1) + ",0,'" + folderid + "')", 1);
};

GeoXml.prototype.toggleFolder = function (i) {
    var f = Lance$(this.myvar + "_folder" + i);
    var tb = Lance$(this.myvar + "TB" + i);

    var folderimg = Lance$(this.myvar + 'FB' + i);

    if (f.style.display == "none") {
        f.style.display = "";
        if (tb) { tb.style.fontWeight = "normal"; }
        if (folderimg.src == this.folderclosedicon) {
            folderimg.src = this.foldericon;
        }
        if (folderimg.src == this.docclosedicon) {
            folderimg.src = this.docicon;
        }
    }
    else {
        f.style.display = "none";
        if (tb) { tb.style.fontWeight = "bold"; }
        if (folderimg.src == this.foldericon) {
            folderimg.src = this.folderclosedicon;
        }
        if (folderimg.src == this.docicon) {
            folderimg.src = this.docclosedicon;
        }
    }
};

GeoXml.prototype.saveJSON = function () {

    if (topwin.standalone) {
        var fpath = browseForSave("Select a directory to place your json file", "JSON Data Files (*.js)|*.js|All Files (*.*)|*.*", "JSON-DATA");

        if (typeof fpath != "undefined") {
            var jsonstr = JSON.stringify(this.kml);
            saveLocalFile(fpath + ".js", jsonstr);
        }
        return;
    }

    if (typeof JSON != "undefined") {
        var jsonstr = JSON.stringify(this.kml);
        if (typeof serverBlessJSON != "undefined") {
            serverBlessJSON(escape(jsonstr), "MyKJSON");
        }
        else {
            this.showIt(jsonstr);
        }
    }
    else {
        var errmess = "No JSON methods currently available";
        if (console) {
            console.error(errmess);
        }
        else { alert(errmess); }
    }
};

GeoXml.prototype.hide = function () {
    this.contentToggle(1, false);
    this.overlayman.currentZoomLevel = -1;
    OverlayManager.Display(this.overlayman);
    google.events.trigger(this, "changed");
};

GeoXml.prototype.setMap = function (map) {
    if (map) {
        this.show();
    }
    else {
        this.hide();
    }
};

GeoXml.prototype.show = function () {
    this.contentToggle(1, true);
    this.overlayman.currentZoomLevel = -1;
    OverlayManager.Display(this.overlayman);
};

GeoXml.prototype.toggleContents = function (i, show) {
    this.contentToggle(i, show);
    this.overlayman.currentZoomLevel = -1;
    OverlayManager.Display(this.overlayman);
};

GeoXml.prototype.contentToggle = function (i, show) {
    var f = this.overlayman.folders[i];
    var cb;
    var j;

    if (typeof f == "undefined") {
        this.mb.showMess("folder " + f + " not defined");
        return;
    }

    if (show) {
        for (j = 0; j < f.length; j++) {
            this.overlayman.markers[f[j]].setMap(this.map);
            this.overlayman.markers[f[j]].onMap = true;
            if (!!this.overlayman.markers[f[j]].label) { this.overlayman.markers[f[j]].label.setMap(this.map) }

            if (this.basesidebar) {
                cb = Lance$(this.myvar + '' + f[j] + 'CB');
                if (cb && typeof cb != "undefined") { cb.checked = true; }
            }
            this.overlayman.markers[f[j]].hidden = false;
        }
    }
    else {
        for (j = 0; j < f.length; j++) {
            this.overlayman.markers[f[j]].hidden = true;
            this.overlayman.markers[f[j]].onMap = false;
            this.overlayman.markers[f[j]].setMap(null);
            if (!!this.overlayman.markers[f[j]].label) { this.overlayman.markers[f[j]].label.setMap(null) }

            if (this.basesidebar) {
                cb = Lance$(this.myvar + '' + f[j] + 'CB');
                if (cb && typeof cb != "undefined") { cb.checked = false; }
            }
        }
    }

    var sf = this.overlayman.subfolders[i];
    if (typeof sf != "undefined") {
        for (j = 0; j < sf.length; j++) {
            if (sf[j] != i) {
                if (this.basesidebar) {
                    cb = Lance$(this.myvar + '' + sf[j] + 'FCB');
                    if (cb && typeof cb != "undefined") { cb.checked = (!!show); }
                }
                this.contentToggle(sf[j], show);
            }
        }
    }
};

GeoXml.prototype.showHide = function (a, show, p) { // if a is not defined then p will be.
    var i;
    if (a !== null) {
        if (show) {
            this.overlayman.markers[a].setMap(this.map);
            this.overlayman.markers[a].onMap = true;
            this.overlayman.markers[a].hidden = false;
            if (!!this.overlayman.markers[a].label) { this.overlayman.markers[a].label.setMap(this.map) }
        }
        else {
            this.overlayman.markers[a].setMap(null);
            this.overlayman.markers[a].onMap = false;
            this.overlayman.markers[a].hidden = true;   
            if (!!this.overlayman.markers[a].label) { this.overlayman.markers[a].label.setMap(null); }
        }
    }
    else {
        var ms = this.polylines[p];

        if (show) {
            for (i = 0; i < ms.lineidx.length; i++) {
                var li = ms.lineidx[i];
                this.overlayman.markers[li].setMap(this.map);
                this.overlayman.markers[li].onMap = true;
                this.overlayman.markers[li].hidden = false;
                if (!!ms.label) { ms.label.setMap(this.map); }
            }
        }
        else {
            for (i = 0; i < ms.lineidx.length; i++) {
                this.overlayman.markers[ms.lineidx[i]].setMap(null);
                this.overlayman.markers[ms.lineidx[i]].onMap = false;
                this.overlayman.markers[ms.lineidx[i]].hidden = true;
                if (!!ms.label) { ms.label.setMap(null); }
            }
        }
    }
    this.overlayman.currentZoomLevel = -1;
    OverlayManager.Display(this.overlayman, true);
};

GeoXml.prototype.toggleOff = function (a, show) {
    if (show) {
        this.overlayman.markers[a].setMap(this.map);
        this.overlayman.markers[a].hidden = false;
    }
    else {
        this.overlayman.markers[a].setMap(null);
        this.overlayman.markers[a].hidden = true;
    }
    if (this.labels && this.labels.onMap) {
        this.labels.setMap(null);
        this.labels.setMap(this.map);
    }
};

GeoXml.prototype.onClick = function (e) {
    var marker = this.overlayman.markers[e];
    $("#mapcover").css({ display: "none" });
    map.panTo(marker.getPosition());
    window.setTimeout(function () {
        marker.onClick();
    }, 500);
}

// Request to Load an XML file
GeoXml.prototype.load = function (url, group, title2) {
    var that = this;
    that.progress += 1;
    that.mb.showMess("Loading...");
    that.loadXMLUrl(url, group, title2);
};

// Request to Parse an XML file
GeoXml.prototype.parse = function (titles) {
    var that = this;
    var names = [];
    if (typeof titles != "undefined") {
        if (typeof titles != "string") {
            names = titles;
        }
        else {
            names = titles.split(",");
        }
    }
    that.progress += that.urls.length;
    for (var u = 0; u < that.urls.length; u++) {
        var title2 = names[u];
        if (typeof title2 == "undefined" || !title2 || title2 == "null") {
            var segs = that.urls[u].split("/");
            title2 = segs[segs.length - 1];
        }
        that.mb.showMess("Loading " + title2);
        var re = /\.js$/i;
        if (that.urls[u].search(re) != -1) {
            that.loadJSONUrl(this.urls[u], title2);
        }
        else {
            that.loadXMLUrl(this.urls[u], this.urls[u], title2);
        }
    }
};

GeoXml.prototype.removeAll = function () {
    this.allRemoved = true;
    for (var a = 0; a < this.overlayman.markers.length; a++) {
        this.toggleOff(a, false);
    }
};

GeoXml.prototype.addAll = function () {
    this.allRemoved = false;
    for (var a = 0; a < this.overlayman.markers.length; a++) {
        this.toggleOff(a, true);
    }
};

GeoXml.prototype.processString = function (doc, titles, latlon) {
    var names = [];
    if (titles) {
        names = titles.split(",");
    }
    if (typeof doc == "string") {
        this.docs = [doc];
    } else {
        this.docs = doc;
    }
    this.progress += this.docs.length;
    for (var u = 0; u < this.docs.length; u++) {
        this.mb.showMess("Processing " + names[u]);
        this.processing(this.parseXML(this.docs[u]), names[u], latlon);
    }
};

// Cross-browser xml parsing
GeoXml.prototype.parseXML = function (data) {
    var xml, tmp;
    try {
        if (window.DOMParser) { // Standard
            tmp = new DOMParser();
            xml = tmp.parseFromString(data, "text/xml");
        } else { // IE
            xml = new ActiveXObject("Microsoft.XMLDOM");
            xml.async = "false";
            xml.loadXML(data);
        }
    } catch (e) {
        xml = undefined;
    }
    if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
        var errmess = "Invalid XML: " + data.substring(0, 4);
        if (console) {
            console.error(errmess);
        }
        else { alert(errmess); }
    }
    return xml;
};

GeoXml.prototype.getText = function (elems) {
    var ret = "", elem;
    if (!!elems && !!elems.length && elems.length > 0)
        elems = elems[0];
    if (!elems || !elems.childNodes)
        return ret;

    elems = elems.childNodes;

    for (var i = 0; elems[i]; i++) {
        elem = elems[i];

        // Get the text from text nodes and CDATA nodes
        if (elem.nodeType === 3 || elem.nodeType === 4) {
            ret += elem.nodeValue;
        }
        else if (elem.nodeType === 1 && elem.textContent) {
            ret += elem.textContent;
        } else if (elem.nodeType !== 8) { // Traverse everything else, except comment nodes
            ret += this.getText(elem.childNodes);
        }
    }

    return ret;
};

GeoXml.prototype.processXML = function (doc, titles, latlon) {
    var names = [];
    if (typeof titles != "undefined") {
        if (typeof titles == "string") {
            names = titles.split(",");
        }
        else { names = titles; }
    }

    this.docs = [doc];

    this.progress += this.docs.length;
    for (var u = 0; u < this.docs.length; u++) {
        var mess = "Processing " + names[u];
        this.mb.showMess(mess);
        this.processing(this.docs[u], names[u], latlon);
    }
};

GeoXml.prototype.makeDescription = function (elem, title2, depth) {
    //@Bullshit???
    var d = "";
    var len = elem.childNodes.length;
    var ln = 0;
    var val;

    while (len--) {
        var subelem = elem.childNodes.item(ln);
        var nn = subelem.nodeName;
        var sec = nn.split(":");
        var base = "";
        base = sec.length > 1 ? sec[1] : nn;

        if (base.match(/^(lat|long|visible|visibility|boundedBy|StyleMap|drawOrder|styleUrl|posList|coordinates|Style|Polygon|LineString|Point|LookAt|drawOrder|Envelope|Box|MultiPolygon|where|guid)/)) {
            this.currdeschead = "";
        }
        else {
            if (base.match(/#text|the_geom|SchemaData|ExtendedData|#cdata-section/)) { }
            else {
                if (base.match(/Snippet/i)) {
                }
                else {
                    if (base.match(/SimpleData/)) {
                        base = subelem.getAttribute("name");
                    }
                    this.currdeschead = "<b>&nbsp;" + base + "&nbsp;</b> :";
                }
            }

            val = subelem.nodeValue;

            if (nn == "link") {
                var href = subelem.getAttribute("href");
                if (href && href != 'null') {
                    val = '<a target="_blank" title2="' + href + '" href="' + href + '">Link</a>';
                }
                else {
                    if (val && val != "null") {
                        val = '<a target="_blank" title2="' + val + '" href="' + val + '">Link</a>';
                    }
                }
                this.currdeschead = "Link to Article";
            }

            if (base.match(/(\S)*(name|title2)(\S)*/i)) {
                if (!val) { val = this.getText(subelem) }
                title2 = val;
                if (val && typeof title2 != "undefined" && title2.length > this.maxtitlewidth) {
                    this.maxtitlewidth = title2.length;
                }
                this.currdeschead = "";
            }
            else {
                if (val && val.match(/(\S)+/)) {
                    if (val.match(/^http:\/\/|^https:\/\//i)) {
                        val = '<a target="_blank" " href="' + val + '">[go]</a>';
                    }
                    else {
                        if (!title2 || title2 == "") {
                            title2 = val;
                            if (val && typeof title2 != "undefined" && title2.length > this.maxtitlewidth) {
                                this.maxtitlewidth = title2.length;
                            }
                        }
                    }

                }

                if (val && val != "null" && val != '  ' && val != ' ' && (val.match(/(\s|\t|\n)*/) != true)) {
                    if (this.currdeschead != '') { d += '<br />'; }
                    d += this.currdeschead + "" + val + ""; this.currdeschead = "";
                }

                if (subelem.childNodes.length) {
                    var con = this.makeDescription(subelem, title2, depth + 1);
                    if (con) {
                        d += con.desc;
                        if (typeof con.title2 != "undefined" && con.title2) {
                            title2 = con.title2;
                            if (title2.length > this.maxtitlewidth) {
                                this.maxtitlewidth = title2.length + depth;
                            }
                        }
                    }
                }
            }
        }

        ln++;
    }
    var dc = {};
    dc.desc = d;
    dc.title2 = title2;
    return dc;
};

GeoXml.prototype.randomColor = function () {
    var color = "#";
    for (var i = 0; i < 6; i++) {
        var idx = parseInt(Math.random() * 16, 10) + 1;
        color += idx.toString(16);
    }
    return (color.substring(0, 7));
};

GeoXml.prototype.handleGeomark = function (mark, idx, trans) {
    var that = this;
    var desc, name, style;
    desc = "";
    var styleid = 0;
    var lat, lon;
    var visible = true;
    if (this.hideall) { visible = false; }
    var fill = true;
    var outline = true;
    var width, color, opacity, fillOpacity, fillColor;
    var cor = [];
    var node, nv, cm;
    var coords = "";
    var poslist = [];
    var point_count = 0;
    var box_count = 0;
    var line_count = 0;
    var poly_count = 0;
    var p;
    var points = [];
    var cc, l;
    var pbounds = new google.maps.LatLngBounds();
    var coordset = mark.getElementsByTagName("coordinates");

    if (coordset.length < 1) {
        coordset = mark.getElementsByTagName("gml:coordinates");
        
        coordset = [];
        poslist = mark.getElementsByTagName("gml:posList");
        if (poslist.length < 1) { poslist = mark.getElementsByTagName("posList"); }

        for (l = 0; l < poslist.length; l++) {
            coords = " ";
            cor = this.getText(poslist.item(l)).split(' ');
            if (that.isWFS) {
                for (cc = 0; cc < (cor.length - 1); cc++) {
                    if (cor[cc] && cor[cc] != " " && !isNaN(parseFloat(cor[cc]))) {
                        coords += "" + parseFloat(cor[cc]) + "," + parseFloat(cor[cc + 1]);
                        coords += " ";
                        cc++;
                    }
                }
            }
            else {
                for (cc = 0; cc < (cor.length - 1); cc++) {
                    if (cor[cc] && cor[cc] != " " && !isNaN(parseFloat(cor[cc]))) {
                        coords += "" + parseFloat(cor[cc + 1]) + "," + parseFloat(cor[cc]);
                        coords += " ";
                        cc++;
                    }
                }
            }
            if (coords) {
                if (poslist.item(l).parentNode && (poslist.item(l).parentNode.nodeName == "gml:LineString")) { line_count++; }
                else { poly_count++; }
                cm = coordst + coords + coorded;
                node = this.parseXML(cm);
                if (coordset.push) { coordset.push(node); }
            }
        }

        var pos = mark.getElementsByTagName("gml:pos");

        if (pos.length < 1) { pos = mark.getElementsByTagName("gml:pos"); }
        if (pos.length) {
            for (p = 0; p < pos.length; p++) {
                nv = this.getText(pos.item(p));
                cor = nv.split(" ");
                if (!that.isWFS) {
                    node = this.parseXML(coordst + cor[1] + "," + cor[0] + coorded);
                }
                else {
                    node = this.parseXML(coordst + cor[0] + "," + cor[1] + coorded);
                }
                if (coordset.push) { coordset.push(node); }
            }
        }
    }

    var newcoords = false;
    point_count = 0;
    box_count = 0;
    line_count = 0;
    poly_count = 0;

    var dc = that.makeDescription(mark, "");
    desc = "<div id='currentwindow' style='overflow:auto;height:" + this.iwheight + "px' >" + dc.desc + "</div> ";
    if (!name && dc.title2) {
        name = dc.title2;
        if (name.length > this.maxtitlewidth) {
            this.maxtitlewidth = name.length;
        }
    }

    if (newcoords && typeof lat != "undefined") {
        coordset.push("" + lon + "," + lat);
    }

    var lines = [];
    var point;
    var skiprender;
    var bits;

    for (var c = 0; c < coordset.length; c++) {
        skiprender = false;
        if (coordset[c].parentNode && (coordset[c].parentNode.nodeName == "gml:Box" || coordset[c].parentNode.nodeName == "gml:Envelope")) {
            skiprender = true;
        }

        coords = this.getText(coordset[c]);
        coords += " ";
        coords = coords.replace(/\s+/g, " ");
        // tidy the whitespace
        coords = coords.replace(/^ /, "");
        // remove possible leading whitespace
        coords = coords.replace(/, /, ",");
        // tidy the commas
        var path = coords.split(" ");
        // Is this a polyline/polygon?

        if (path.length == 1 || path[1] == "") {
            bits = path[0].split(",");
            point = new google.maps.LatLng(parseFloat(bits[1]) / trans.ys - trans.y, parseFloat(bits[0]) / trans.xs - trans.x);
            that.bounds.extend(point);
            // Does the user have their own createmarker function?
            if (!skiprender) {
                if (typeof name == "undefined") {
                    name = GeoXml.stripHTML(dc.desc);
                    desc = '';
                }
                if (name == desc) { desc = ""; }
                if (!!that.opts.createmarker) {
                    that.opts.createmarker(point, name, desc, styleid, idx, null, visible);
                }
                else {
                    that.createMarker(point, name, desc, styleid, idx, null, visible);
                }
            }
        }
        else {
            // Build the list of points
            for (p = 0; p < path.length - 1; p++) {
                bits = path[p].split(",");
                point = new google.maps.LatLng(parseFloat(bits[1]) / trans.ys - trans.y, parseFloat(bits[0]) / trans.xs - trans.x);
                points.push(point);
                pbounds.extend(point);
            }
            that.bounds.extend(pbounds.getNorthEast());
            that.bounds.extend(pbounds.getSouthWest());
            if (!skiprender) { lines.push(points); }
        }
    }

    if (!lines || lines.length < 1) { return; }

    var linestring = mark.getElementsByTagName("LineString");
    if (linestring.length < 1) {
        linestring = mark.getElementsByTagName("gml:LineString");
    }

    if (linestring.length || line_count > 0) {
        // its a polyline grab the info from the style
        if (!!style) {
            width = style.strokeWeight;
            color = style.strokeColor;
            opacity = style.strokeOpacity;
        } else {
            width = this.style.width;
            color = this.style.color;
            opacity = this.style.opacity;
        }
        // Does the user have their own createpolyline function?
        if (typeof name == "undefined") { name = GeoXml.stripHTML(dc.desc); }
        if (name == desc) { desc = ""; }
        if (!!that.opts.createpolyline) {
            that.opts.createpolyline(lines, color, width, opacity, pbounds, name, desc, idx, visible);
        } else {
            that.createPolyline(lines, color, width, opacity, pbounds, name, desc, idx, visible);
        }
    }
    var polygons = mark.getElementsByTagName("Polygon");
    if (polygons.length < 1) {
        polygons = mark.getElementsByTagName("gml:Polygon");
    }

    if (polygons.length || poly_count > 0) {
        // its a polygon grab the info from the style
        if (!!style) {
            width = style.strokeWeight;
            color = style.strokeColor;
            opacity = style.strokeOpacity;
            fillOpacity = style.fillOpacity;
            fillColor = style.fillColor;
            fill = style.fill;
            outline = style.outline;
        }
        fillColor = this.randomColor();
        color = this.randomColor();
        fill = 1;
        outline = 1;
        //alert("found Polygon");
        if (typeof name == "undefined") { name = GeoXml.stripHTML(desc); desc = "" }
        if (name == desc) { desc = ""; }
        if (!!that.opts.createpolygon) {
            that.opts.createpolygon(lines, color, width, opacity, fillColor, fillOpacity, pbounds, name, desc, idx, visible, fill, outline);
        } else {
            that.createPolygon(lines, color, width, opacity, fillColor, fillOpacity, pbounds, name, desc, idx, visible, fill, outline);
        }
    }
};

GeoXml.prototype.handlePlacemark = function (mark, idx, depth, fullstyle) {
    var mgeoms = mark.getElementsByTagName("MultiGeometry");
    if (mgeoms.length < 1) {
        this.handlePlacemarkGeometry(mark, mark, idx, depth, fullstyle);
    }
    else {
        var p;
        var pts = mgeoms[0].getElementsByTagName("Point");
        for (p = 0; p < pts.length; p++) {
            this.handlePlacemarkGeometry(mark, pts[p], idx, depth, fullstyle);
        }
        var lines = mgeoms[0].getElementsByTagName("LineString");
        for (p = 0; p < lines.length; p++) {
            this.handlePlacemarkGeometry(mark, lines[p], idx, depth, fullstyle);
        }
        var polygons = mgeoms[0].getElementsByTagName("Polygon");
        for (p = 0; p < polygons.length; p++) {
            this.handlePlacemarkGeometry(mark, polygons[p], idx, depth, fullstyle);
        }
    }
};

GeoXml.prototype.handlePlacemarkGeometry = function (mark, geom, idx, depth, fullstyle) {
    var that = this;
    var desc, title2, name, style;
    title2 = "";
    desc = "";
    var styleid = 0;
    var lat, lon;
    var visible = true;
    if (this.hideall) { visible = false; }
    var newcoords = false;
    var outline;
    var opacity;
    var fillcolor;
    var fillOpacity;
    var color;
    var width;
    var pbounds;
    var fill;
    var points = [];
    var lines = [];
    var bits = [];
    var point;
    var cor, node, cm, nv;
    var l, pos, p, j, k, cc;
    var kml_id = mark.getAttribute("id");
    var box_count = 0;
    var line_count = 0;
    var poly_count = 0;
    var coords = "";
    var markerurl = "";
    var snippet = "";
    l = mark.getAttribute("lat");
    if (!!l) { lat = l; }
    l = mark.getAttribute("lon");
    if (!!l) {
        newcoords = true;
        lon = l;
    }
    l = 0;
    var coordset = geom.getElementsByTagName("coordinates");
    if (coordset.length < 1)
        coordset = geom.getElementsByTagName("gml:coordinates");

    if (coordset.length < 1) {
        coordset = [];
        var gxcoord = false;
        var poslist = geom.getElementsByTagName("gml:posList");
        if (!poslist.length)
            poslist = geom.getElementsByTagName("posList");
        if (!poslist.length) {
            poslist = geom.getElementsByTagName("gx:coord");
            if (!poslist.length)
                poslist = geom.getElementsByTagName("coord");
            if (poslist.length > 0)
                gxcoord = true;
        }
        for (l = 0; l < poslist.length; l++) {
            if (gxcoord)
                coords += " ";
            else
                coords = " ";

            var plitem = this.getText(poslist.item(l)) + " ";
            plitem = plitem.replace(/(\s)+/g, ' ');
            cor = plitem.split(' ');

            if (that.isWFS || gxcoord) {
                for (cc = 0; cc < (cor.length - 1); cc++) {
                    if (!isNaN(parseFloat(cor[cc])) && !isNaN(parseFloat(cor[cc + 1]))) {
                        coords += "" + parseFloat(cor[cc]) + "," + parseFloat(cor[cc + 1]);
                        coords += " ";
                        cc++;
                    }
                }
            }
            else {
                for (cc = 0; cc < (cor.length - 1); cc++) {
                    if (!isNaN(parseFloat(cor[cc])) && !isNaN(parseFloat(cor[cc + 1]))) {
                        coords += "" + parseFloat(cor[cc + 1]) + "," + parseFloat(cor[cc]);
                        coords += " ";
                        cc++;
                    }
                }
            }

            if (coords && !gxcoord) {
                if (poslist.item(l).parentNode && (poslist.item(l).parentNode.nodeName == "gml:LineString")) { line_count++; }
                else { poly_count++; }
                cm = coordst + coords + coorded;
                node = this.parseXML(cm);
                if (coordset.push) { coordset.push(node); }
            }
        }

        if (gxcoord) {
            poly_count++;
            cm = coordst + coords + coorded;
            node = this.parseXML(cm);
            if (coordset.push) { coordset.push(node); }
        }

        pos = geom.getElementsByTagName("gml:pos");
        if (pos.length < 1) { pos = geom.getElementsByTagName("gml:pos"); }
        if (pos.length) {
            for (p = 0; p < pos.length; p++) {
                nv = this.getText(pos.item(p)) + " ";
                cor = nv.split(' ');
                if (!that.isWFS) {
                    node = this.parseXML(coordst + cor[1] + "," + cor[0] + coorded);
                }
                else {
                    node = this.parseXML(coordst + cor[0] + "," + cor[1] + coorded);
                }
                if (coordset.push) { coordset.push(node); }
            }
        }
    }

    for (var ln = 0; ln < mark.childNodes.length; ln++) {
        var nn = mark.childNodes.item(ln).nodeName;
        nv = this.getText(mark.childNodes.item(ln));
        var ns = nn.split(":");
        var base;
        if (ns.length > 1) { base = ns[1].toLowerCase(); }
        else { base = ns[0].toLowerCase(); }

        var processme = false;

        switch (base) {
            case "name":
                name = textTranslation(nv);
                if (name.length + depth > this.maxtitlewidth) { this.maxtitlewidth = name.length + depth; }
                break;
            case "title":
                title2 = textTranslation(nv);
                if (title2.length + depth > this.maxtitlewidth) { this.maxtitlewidth = title2.length + depth; }
                break;
            case "desc":
            case "description":
                desc = GeoXml.getDescription(mark.childNodes.item(ln));
                if (!desc) { desc = nv; }
                var srcs = desc.match(/src=\"(.*)\"/i);

                if (srcs) {
                    for (var sr = 1; sr < srcs.length; sr++) {
                        if (srcs[sr].match(/^http/)) {
                        }
                        else {
                            if (this.url.match(/^http/)) {
                                //remove all but last slash of url
                                var slash = this.url.lastIndexOf("/");
                                if (slash != -1) {
                                    newsrc = this.url.substring(0, slash) + "/" + srcs[sr];
                                    desc = desc.replace(srcs[sr], newsrc);
                                }

                            }
                            else {
                                //compute directory of html add relative path of kml and relative path of src.
                                var slash = this.url.lastIndexOf("/");
                                if (slash != -1) {
                                    newsrc = this.url.substring(0, slash) + "/" + srcs[sr];
                                    desc = desc.replace(srcs[sr], newsrc);
                                }
                            }
                        }
                    }
                }
                if (that.opts.preloadHTML && desc && desc.match(/<(\s)*img/i)) {
                    var preload = document.createElement("span");
                    preload.style.visibility = "visible";
                    preload.style.position = "absolute";
                    preload.style.left = "-12000px";
                    preload.style.top = "-12000px";
                    preload.style.zIndex = this.overlayman.markers.length;
                    preload.onload = function () { preload.style.visibility = "hidden"; }
                    document.body.appendChild(preload);
                    preload.innerHTML = desc;
                }
                if (desc.match(/^http:\/\/|^https:\/\//i)) {
                    var flink = desc.split(/(\s)+/);
                    if (flink.length > 1) {
                        desc = "<a href=\"" + flink[0] + "\">" + flink[0] + "</a>";
                        for (var i = 1; i < flink.length; i++) {
                            desc += flink[i];
                        }
                    }
                    else {
                        desc = "<a href=\"" + desc + "\">" + desc + "</a>";
                    }
                }
                break;
            case "visibility":
                //ignore this setting, it is for initially hiding items when loaded on Google Earth but will
                //prevent them from showing on our map until the map overlay changes when it will show anyway
                //if (nv == "0") { visible = false; }
                break;
            case "Snippet":
            case "snippet":
                snippet = nv;
                break;
            case "href":
            case "link":
                if (nv) {
                    desc += "<p><a target='_blank' href='" + nv + "'>link</a></p>";
                    markerurl = nv;
                }
                else {
                    var href = mark.childNodes.item(ln).getAttribute("href");
                    if (href) {
                        var imtype = mark.childNodes.item(ln).getAttribute("type");
                        if (imtype && imtype.match(/image/)) {
                            desc += "<img style=\"width:256px\" src='" + href + "' />";
                        }
                        markerurl = href;
                    }
                }
                break;
            case "author":
                //@No bullshit//desc += "<p><b>author:</b>" + nv + "</p>";
                break;
            case "time":
                //@No bullshit//desc += "<p><b>time:</b>" + nv + "</p>";
                break;
            case "lat":
                lat = nv;
                break;
            case "long":
                lon = nv;
                newcoords = true;
                break;
            case "box":
                box_count++; processme = true; break;
            case "styleurl":
                styleid = nv;
                style = that.styles[styleid];
                break;
            case "stylemap":
                var found = false;
                node = mark.childNodes.item(ln);
                for (j = 0; (j < node.childNodes.length && !found); j++) {
                    var pair = node.childNodes[j];
                    for (k = 0; (k < pair.childNodes.length && !found); k++) {
                        var pn = pair.childNodes[k].nodeName;
                        if (pn == "Style") {
                            style = this.handleStyle(pair.childNodes[k], null, style);
                            found = true;
                        }
                    }
                }
                break;
            case "Style":
            case "style":
                styleid = null;
                style = this.handleStyle(mark.childNodes.item(ln), null, style);
                break;
        }

        if (processme) {
            cor = nv.split(' ');
            coords = "";
            for (cc = 0; cc < (cor.length - 1); cc++) {
                if (!isNaN(parseFloat(cor[cc])) && !isNaN(parseFloat(cor[cc + 1]))) {
                    coords += "" + parseFloat(cor[cc + 1]) + "," + parseFloat(cor[cc]);
                    coords += " ";
                    cc++;
                }
            }
            if (coords != "") {
                node = this.parseXML(coordst + coords + coorded);
                if (coordset.push) { coordset.push(node); }
            }
        }
    }

    if (fullstyle) {
        style = fullstyle;
    }
    var iwheightstr;
    if (this.iwheight != 0) {
        iwheightstr = "height:" + this.iwheight + "px";
    }
    if (typeof desc == "undefined" || !desc || this.opts.makedescription) {
        var dc = that.makeDescription(mark, "");

        desc = "";
        //@No bullshit//desc = "<div id='currentpopup' style='overflow:auto;" + iwheightstr + "' >" + dc.desc + "</div> ";
        if (!name && dc.title2) {
            name = dc.title2;
            if ((name.length + depth) > this.maxtitlewidth) {
                this.maxtitlewidth = name.length + depth;
            }
        }
    }
    else {
        if (this.iwheight) {
            desc = "<div id='currentpopup' style='overflow:auto;" + iwheightstr + "' >" + desc + "</div> ";
        }
    }

    if (coordset.length == 0 && typeof lat != "undefined") {
        if (!lat && !lon) //@No bullshit
        {
            console.log("invalid position name:" + name + " desc:" + desc);
            return;
        }
        point = new google.maps.LatLng(lat, lon);
        this.overlayman.folderBounds[idx].extend(point);
        // Does the user have their own createmarker function?
        if (!skiprender) {
            if (typeof name == "undefined") { name = GeoXml.stripHTML(desc); desc = ""; }
            if (name == desc) { desc = ""; }
            if (!!that.opts.createmarker) {
                that.opts.createmarker(point, name, desc, styleid, idx, style, visible, kml_id, markerurl, snippet);
            }
            else {
                that.createMarker(point, name, desc, styleid, idx, style, visible, kml_id, markerurl, snippet);
            }
        }
    }
    else {
        for (var c = 0; c < coordset.length; c++) {
            var skiprender = false;
            if (coordset[c].parentNode && (coordset[c].parentNode.nodeName.match(/^(gml:Box|gml:Envelope)/i))) {
                skiprender = true;
            }
            coords = this.getText(coordset[c]);
            coords += " ";
            coords = coords.replace(/(\s)+/g, " ");
            // tidy the whitespace
            coords = coords.replace(/^ /, "");
            ////ensure trailing space
            coords = coords.replace(/, /, ",");
            // tidy the commas
            var path = coords.split(" ");
            // Is this a polyline/polygon?

            if ((path.length === 1 || path[1] === "") && !path[0].startsWith("geom:")) {
                bits = path[0].split(",");
                point = new google.maps.LatLng(parseFloat(bits[1]), parseFloat(bits[0]));
                this.overlayman.folderBounds[idx].extend(point);
                // Does the user have their own createmarker function?
                if (!skiprender) {
                    if (typeof name == "undefined") { name = GeoXml.stripHTML(desc); desc = ""; }
                    if (name == desc) { desc = ""; }
                    if (!!that.opts.createmarker) {
                        that.opts.createmarker(point, name, desc, styleid, idx, style, visible, kml_id, markerurl, snippet);
                    }
                    else {
                        that.createMarker(point, name, desc, styleid, idx, style, visible, kml_id, markerurl, snippet);
                    }
                }
            }
            else {
                if (path[0].startsWith("geom:")) { //wikiloc encoded string
                    path = decodeWikilocEncodedPath(path[0]);
                }

                // Build the list of points
                points = [];
                pbounds = new google.maps.LatLngBounds();
                for (p = 0; p < path.length - 1; p++) {
                    bits = path[p].split(",");
                    point = new google.maps.LatLng(parseFloat(bits[1]), parseFloat(bits[0]));
                    points.push(point);
                    pbounds.extend(point);
                }

                if (!skiprender) { lines.push(points); }
            }
        }
    }

    if (!lines || lines.length < 1) { return; }

    if (!coordset[0].parentNode) {
        // default style
        width = style.strokeWeight;
        color = style.strokeColor;
        opacity = style.strokeOpacity;
        if (name == desc) { desc = ""; }
        if (!!that.opts.createpolyline) {
            that.opts.createpolyline(lines, color, width, opacity, pbounds, name, desc, idx, visible, kml_id);
        } else {
            that.createPolyline(lines, color, width, opacity, pbounds, name, desc, idx, visible, kml_id);
        }
        return;
    }

    var nn = coordset[0].parentNode.nodeName;
    if (nn.match(/^(LineString)/i) || nn.match(/^(gml:LineString)/i)) {
        // its a polyline grab the info from the style
        if (!!style) {
            width = style.strokeWeight;
            color = style.strokeColor;
            opacity = style.strokeOpacity;
        } else {
            width = this.style.width;
            color = this.style.color;
            opacity = this.style.opacity;
        }
        // Does the user have their own createmarker function?
        if (typeof name == "undefined") { name = GeoXml.stripHTML(desc); desc = ""; }

        if (name == desc) { desc = ""; }
        if (!!that.opts.createpolyline) {
            that.opts.createpolyline(lines, color, width, opacity, pbounds, name, desc, idx, visible, kml_id);
        } else {
            that.createPolyline(lines, color, width, opacity, pbounds, name, desc, idx, visible, kml_id);
        }
    }

    if (nn.match(/^(LinearRing)/i) || nn.match(/^(gml:LinearRing)/i)) {
        // its a polygon grab the info from the style
        if (!!style) {
            width = style.strokeWeight;
            color = style.strokeColor;
            opacity = style.strokeOpacity;
            fillOpacity = style.fillOpacity;
            fillcolor = style.fillColor;
            fill = style.fill;
            outline = style.outline;
        }
        if (typeof fill == "undefined") { fill = 1; }
        if (typeof color == "undefined") { color = this.style.color; }
        if (typeof fillcolor == "undefined") { fillcolor = this.randomColor(); }
        if (typeof name == "undefined") { name = GeoXml.stripHTML(desc); desc = ""; }
        if (name == desc) { desc = ""; }
        if (!!that.opts.createpolygon) {
            that.opts.createpolygon(lines, color, width, opacity, fillcolor, fillOpacity, pbounds, name, desc, idx, visible, fill, outline, kml_id);
        } else {
            that.createPolygon(lines, color, width, opacity, fillcolor, fillOpacity, pbounds, name, desc, idx, visible, fill, outline, kml_id);
        }
    }
};

GeoXml.prototype.makeIcon = function (currstyle, href, id, myscale, hotspot) {

    var scale = 1;
    var size, scaledSize, anchorscale, shadow;
    var origin = new google.maps.Point(0, 0);

    //hotspot in a .kml file specifies the position within the Icon that is "anchored" to the <Point>
    if (hotspot) {

        anchorscale = {};

        anchorscale.x = hotspot.getAttribute("x");
        anchorscale.xunits = hotspot.getAttribute("xunits");

        anchorscale.y = hotspot.getAttribute("y");
        anchorscale.yunits = hotspot.getAttribute("yunits");
    }
    else {
        //no hotspot defined, default google maps anchor is center of bottom of icon
        //however, if icon is a diamond, set it to the center
        if (href.includes("open-diamond"))
            anchorscale = { x: 0.5, y: 0.5 };
    }

    if (typeof myscale == "number") {
        scale = myscale;
    }

    if (href) {

        if (!!this.opts.baseicon) {
            origin = this.opts.baseicon.origin;
            if (!!this.opts.baseicon.size) size = this.opts.baseicon.size;
            if (!!this.opts.baseicon.scaledSize) scaledSize = this.opts.baseicon.scaledSize;
        }
        else {
            //shadow image code probably needs removed
            //google maps removed shadows, but we could manually add them back as a separate marker
            if (!!this.opts.noshadow
            ) { 
                shadow = "";
            } else {
                // Try to guess the shadow image
                if (href.includes("/red.png") ||
                    href.includes("/blue.png") ||
                    href.includes("/green.png") ||
                    href.includes("/yellow.png") ||
                    href.includes("/lightblue.png") ||
                    href.includes("/purple.png") ||
                    href.includes("/orange.png") ||
                    href.includes("/pink.png") ||
                    href.includes("-dot.png")
                ) {
                    shadow = PROTOCOL + "maps.google.com/mapfiles/ms/icons/msmarker.shadow.png";
                }
                else if (href.includes("-pushpin.png") ||
                    href.includes("/pause.png") ||
                    href.includes("/go.png") ||
                    href.includes("/stop.png")
                ) {
                    shadow = PROTOCOL + "maps.google.com/mapfiles/ms/icons/pushpin_shadow.png";
                }
                else if (!href.includes(".jpg"))
                    shadow = href.replace(".png", ".shadow.png");
            }
        }
    }
    else { //no url assigned for the icon

        if (!!currstyle && !!currstyle.url) {
            href = currstyle.url;
            scale = currstyle.scale;
        } else {
            href = PROTOCOL + "maps.google.com/mapfiles/kml/shapes/placemark_circle.png";
            anchorscale = { x: 0.5, y: 0.5 };
        };
    }

    //now assemble the icon

    scale *= globalIconScaleFactor;

    var scaledSizeRaw = (id === undefined || id === null || !id.startsWith("parking"))
        ? iconsize * scale
        : parkingiconsize;

    scaledSize = new google.maps.Size(scaledSizeRaw, scaledSizeRaw);

    //anchor is set based on the final 'scale size' of the image. if the anchorscale is set to 'fraction', then we can set the
    //anchor now. but if it is set to 'pixels', we can't set it until we know the size of the image, which needs to be an async call
    //in addition, the units of x and y can be a mix of 'fraction' and 'pixels'
    var anchor;
    if (!!anchorscale) {
        let x, y;
        switch (anchorscale.xunits) {
        case "pixels":
        case "insetPixels":
            break;
        case "fraction":
        default:
            x = anchorscale.x * scaledSize.width;
            break;
        }

        switch (anchorscale.yunits) {
        case "pixels":
        case "insetPixels":
            break;
        case "fraction":
        default:
            y = scaledSize.height - anchorscale.y * scaledSize.height;
            break;
        }

        if (!!x && !!y) { //both are set, we can set the anchor and clear the anchorscale
            anchor = new google.maps.Point(x, y);
            anchorscale = null;
        }
    }

    var icon = {
        id: id,
        url: href,
        size: size,
        scaledSize: scaledSize,
        origin: origin,
        anchor: anchor,
        shadow: shadow
    };

    if (!!anchorscale) { //anchorscale still needs to be set, but not until we know the image size
        const img = new Image();
        img.icon = icon;
        img.anchorscale = anchorscale;
        img.overlaymanager = this.overlayman;
        img.onload = iconImageLoad;
        img.src = href;
    }

    return icon;
};

function iconImageLoad() {

    //image is loaded, we can set the anchor based on its dimensions now that we know them
    let anchorscale = this.anchorscale;

    if (!!anchorscale) {
        let x, y;

        switch (anchorscale.xunits) {
        case "pixels": //coordinates start at left
            x = anchorscale.x;
            break;
        case "insetPixels": // reversed, coordinates start at right
            x = this.width - anchorscale.x;
            break;
        case "fraction":
        default:
            x = anchorscale.x * this.width;
            break;
        }

        switch (anchorscale.yunits) {
        case "pixels": // coordinates start at top
            y = this.height - anchorscale.y;
            break;
        case "insetPixels": // reversed, coordinates start at bottom
            y = anchorscale.y;
            break;
        case "fraction":
        default:
            y = this.height - (anchorscale.y * this.height);
            break;
        }

        //now scale based on scaledSize
        if (!!this.overlaymanager && !!this.overlaymanager.markers) {
            let markers = this.overlaymanager.markers.filter(marker => (typeof marker.icon !== 'undefined') && marker.icon.id === this.icon.id);
            
            let anchor = new google.maps.Point(x * (this.icon.scaledSize.width / this.width), y * (this.icon.scaledSize.height / this.height));
            markers.forEach(marker => marker.icon.anchor = anchor);
        }
    }
}

GeoXml.prototype.handleStyle = function (style, sid, currstyle) {
    var that = this;
    var icons = style.getElementsByTagName("IconStyle");
    var tempstyle, opacity;
    var aa, bb, gg, rr;
    var fill, href, color, colormode, outline;
    fill = 1;
    outline = 1;
    var myscale = 1;
    var strid = "#";
    if (sid) {
        strid = "#" + sid;
    }

    if (icons.length > 0) {
        href = this.getText(icons[0].getElementsByTagName("href")[0]);
        if (currstyle) {
            href = currstyle.url;
        }
        if (href) {

            href = validateIconUrl(href);

            var scale = parseFloat(this.getText(icons[0].getElementsByTagName("scale")[0]), 10);
            if (scale) {
                myscale = scale;
            }
            var hs = icons[0].getElementsByTagName("hotSpot");
            tempstyle = this.makeIcon(currstyle, href, sid, myscale, hs[0]);
            tempstyle.scale = myscale;
            that.styles[strid] = tempstyle;
        }
    }

    var labelstyles = style.getElementsByTagName("LabelStyle");
    if (labelstyles.length > 0) {
        var scale = parseFloat(this.getText(labelstyles[0].getElementsByTagName("scale")[0]), 10);
        color = this.getText(labelstyles[0].getElementsByTagName("color")[0]);
        aa = color.substr(0, 2);
        bb = color.substr(2, 2);
        gg = color.substr(4, 2);
        rr = color.substr(6, 2);
        color = "#" + rr + gg + bb;
        opacity = parseInt(aa, 16) / 256;
        if (that.opts.overrideOpacity) {
            opacity = that.opts.overrideOpacity;
        }
        if (!!!that.styles[strid]) {
            that.styles[strid] = {};
        }
        tempstyle = that.styles[strid];
        that.styles[strid].textColor = color;
        if (scale == 0) {
            scale = 1;
        }
        that.styles[strid].scale = scale;
    }

    // is it a LineStyle ?
    var linestyles = style.getElementsByTagName("LineStyle");
    if (linestyles.length > 0) {
        var width = parseInt(this.getText(linestyles[0].getElementsByTagName("width")[0]), 10);
        if (width < 1) { width = 1; }
        color = this.getText(linestyles[0].getElementsByTagName("color")[0]);
        aa = color.substr(0, 2);
        bb = color.substr(2, 2);
        gg = color.substr(4, 2);
        rr = color.substr(6, 2);
        color = "#" + rr + gg + bb;
        opacity = parseInt(aa, 16) / 256;
        if (that.opts.overrideOpacity) {
            opacity = that.opts.overrideOpacity;
        }
        if (!!!that.styles[strid]) {
            that.styles[strid] = {};

        }
        that.styles[strid].strokeColor = color;
        that.styles[strid].strokeWeight = width;
        that.styles[strid].strokeOpacity = opacity;
    }
    // is it a PolyStyle ?
    var polystyles = style.getElementsByTagName("PolyStyle");
    if (polystyles.length > 0) {

        color = this.getText(polystyles[0].getElementsByTagName("color")[0]);
        colormode = this.getText(polystyles[0].getElementsByTagName("colorMode")[0]);
        if (polystyles[0].getElementsByTagName("fill").length != 0) {
            fill = parseInt(this.getText(polystyles[0].getElementsByTagName("fill")[0]), 10);
        }
        if (polystyles[0].getElementsByTagName("outline").length != 0) {
            outline = parseInt(this.getText(polystyles[0].getElementsByTagName("outline")[0]), 10);
        }
        aa = color.substr(0, 2);
        bb = color.substr(2, 2);
        gg = color.substr(4, 2);
        rr = color.substr(6, 2);
        color = "#" + rr + gg + bb;
        opacity = parseInt(aa, 16) / 256;
        if (that.opts.overrideOpacity) {
            opacity = that.opts.overrideOpacity;
        }

        if (!!!that.styles[strid]) {
            that.styles[strid] = {};
        }

        that.styles[strid].fill = fill;
        that.styles[strid].outline = outline;

        if (colormode != "random") {
            that.styles[strid].fillColor = color;
        }
        else {
            that.styles[strid].colortint = color;
        }

        that.styles[strid].fillOpacity = opacity;
        if (!fill) { that.styles[strid].fillOpacity = 0; }
        if (!outline) { that.styles[strid].strokeOpacity = 0; }
    }

    tempstyle = that.styles[strid];

    return tempstyle;
};

GeoXml.prototype.processKML = function (node, marks, title2, sbid, depth, paren) {
    var that = this;
    var thismap = this.map;
    var icon;
    var keepopen = this.forcefoldersopen;
    if (node.nodeName == "kml") { icon = this.docicon; }
    if (node.nodeName == "Document") {
        icon = this.kmlicon;
    }
    if (node.nodeName == "Folder") {
        icon = this.foldericon;
    }
    var pm = [];
    var sf = [];
    var desc = "";
    var snippet = "";
    var i;
    var visible = false;
    if (!this.hideall) { visible = true; }
    var boundsmodified = false;
    var networklink = false;
    var url;
    var ground = null;
    var opacity = 1.0;
    var wmsbounds;
    var makewms = false;
    var makeground = false;
    var wmslist = [];
    var groundlist = [];
    var mytitle;
    var color;
    var ol;
    var n, ne, sw, se;

    for (var ln = 0; ln < node.childNodes.length; ln++) {
        var nextn = node.childNodes.item(ln);
        var nn = nextn.nodeName;

        switch (nn) {
            case "name":
            case "title":
                title2 = this.getText(nextn);
                if (title2.length + depth > this.maxtitlewidth) { this.maxtitlewidth = title2.length + depth; }
                break;
            case "Folder":
            case "Document":
                sf.push(nextn);
                break;
            case "GroundOverlay":
                url = this.getText(nextn.getElementsByTagName("href")[0]);
                var north = parseFloat(this.getText(nextn.getElementsByTagName("north")[0]));
                var south = parseFloat(this.getText(nextn.getElementsByTagName("south")[0]));
                var east = parseFloat(this.getText(nextn.getElementsByTagName("east")[0]));
                var west = parseFloat(this.getText(nextn.getElementsByTagName("west")[0]));
                var attr = this.getText(nextn.getElementsByTagName("attribution")[0]);
                sw = new google.maps.LatLng(south, west);
                ne = new google.maps.LatLng(north, east);
                this.bounds.extend(sw);
                this.bounds.extend(ne);
                color = this.getText(nextn.getElementsByTagName("color")[0]);
                opacity = parseInt(color.substring(1, 3), 16) / 256;
                mytitle = this.getText(nextn.getElementsByTagName("name")[0]);
                var arcims = /arcimsproxy/i;
                if (url.match(arcims)) {
                    url += "&bbox=" + west + "," + south + "," + east + "," + north + "&response=img";
                    wmsbounds = new google.maps.LatLngBounds(sw, ne);
                    makewms = true;
                    ol = this.makeWMSTileLayer(url, visible, mytitle, opacity, attr, title2, wmsbounds);
                    if (ol) {
                        ol.bounds = wmsbounds;
                        ol.title2 = mytitle;
                        ol.opacity = opacity;
                        ol.visible = visible;
                        ol.url = url;
                        if (!this.quiet) {
                            this.mb.showMess("Adding Tiled ArcIms Overlay " + title2, 1000);
                        }
                        wmslist.push(ol);
                    }
                }
                else {
                    var rs = /request=getmap/i;
                    if (url.match(rs)) {
                        url += "&bbox=" + west + "," + south + "," + east + "," + north;
                        wmsbounds = new google.maps.LatLngBounds(sw, ne);
                        makewms = true;
                        ol = this.makeWMSTileLayer(url, visible, mytitle, opacity, attr, title2, wmsbounds);
                        if (ol) {
                            ol.bounds = wmsbounds;
                            ol.title2 = mytitle;
                            ol.opacity = opacity;
                            ol.visible = visible;
                            ol.url = url;
                            if (!this.quiet) { this.mb.showMess("Adding Tiled WMS Overlay " + title2, 1000); }
                            wmslist.push(ol);
                        }
                    }
                    else {
                        wmsbounds = new google.maps.LatLngBounds(sw, ne);
                        ground = new google.maps.GroundOverlay(url, wmsbounds);
                        ground.url = url;
                        ground.title2 = mytitle;
                        ground.visible = visible;
                        ground.bounds = wmsbounds;
                        ground.getBounds = function () { return this.bounds; };
                        boundsmodified = true;
                        makeground = true;
                        if (!this.quiet) { this.mb.showMess("Adding GroundOverlay " + title2, 1000); }
                        groundlist.push(ground);
                    }
                }
                break;
            case "NetworkLink":
                {
                    var url = this.getText(nextn.getElementsByTagName("href"));
                    var name = this.getText(nextn.getElementsByTagName("name"));
                    this.urllist.push({ url: url, name: name });
                    that.progress++;
                    networklink = true;
                }
                break;
            case "description":
            case "Description":
                desc = GeoXml.getDescription(nextn);
                break;
            case "open":
                if (this.getText(nextn) == "1") { keepopen = true; }
                if (this.getText(nextn) == "0") { keepopen = this.forcefoldersopen; }
                break;
            case "visibility":
                if (this.getText(nextn) == "0") { visible = false; }
                break;
            case "snippet":
            case "Snippet":
                snippet = GeoXml.stripHTML(this.getText(nextn));
                snippet = snippet.replace(/\n/g, '');
                break;
            default:
                for (var k = 0; k < marks.length; k++) {
                    if (nn == marks[k]) {
                        pm.push(nextn);
                        break;
                    }
                }
        }
    }

    var folderid;

    var idx = this.overlayman.folders.length;
    var me = paren;
    if (sf.length > 1 || pm.length || ground || makewms) {
        this.overlayman.folders.push([]);
        this.overlayman.subfolders.push([]);
        this.overlayman.folderhtml.push([]);
        this.overlayman.folderhtmlast.push(0);
        this.overlayman.folderBounds.push(new google.maps.LatLngBounds());
        this.kml.push(new KMLObj(title2, desc, false, idx));
        me = this.kml.length - 1;
        var suppressfolder = false;
        folderid = this.createFolder(idx, title2, sbid, icon, desc, snippet, true, visible, suppressfolder);
    }
    else {
        folderid = sbid;
    }

    if (node.nodeName == "Folder" || node.nodeName == "Document") {
        this.kml[me].open = keepopen;
        this.kml[me].folderid = folderid;
    }

    if (ground || makewms) {
        this.kml[this.kml.length - 1].visibility = visible;
        this.kml[this.kml.length - 1].groundOverlays.push({ "url": url, "bounds": wmsbounds });
    }

    if (networklink) {
        while (this.urlindex < this.urllist.length) {
            var urlname = this.urllist[this.urlindex++];
            var url = urlname.url;
            var title2 = urlname.name;
            title2.replace('\'', "");
            var re = /&amp;/g;
            url = url.replace(re, "&");
            var nl = /\n/g;
            url = url.replace(nl, "");
            var comm = this.myvar + ".loadXMLUrl('" + url + "','" + url + "','" + title2 + "',null,null,'" + sbid + "');";
            eval(comm);
        }
    }

    if (makewms && wmslist.length) {
        for (var wo = 0; wo < wmslist.length; wo++) {
            var ol = wmslist[wo];
            var blob = "";
            if (this.basesidebar) {
                var n = this.overlayman.markers.length;
                if (!this.nolegend) {
                    var myurl = ol.url.replace(/height=(\d)+/i, "height=100");
                    myurl = myurl.replace(/width=(\d)+/i, "width=100");
                    blob = '<img src="' + myurl + '" style="width:100px" />';
                }
            }
            if (this.sidebarsnippet && snippet == "") {
                snippet = GeoXml.stripHTML(desc);
                desc2 = desc2.substring(0, 40);
            }
            parm = this.myvar + "$$$tiledoverlay$$$" + ol.title2 + "$$$" + n + "$$$" + blob + "$$$" + ol.visible + "$$$" + (this.baseLayers.length - 1) + "$$$" + snippet;
            var thismap = this.map;
            google.maps.event.addListener(ol, "zoomto", function () {
                thismap.fitBounds(this.getBounds());

            });
            this.overlayman.addMarker(ol, title2, idx, parm, true, true);
        }
    }

    if (makeground && groundlist.length) {
        for (var gro = 0; gro < groundlist.length; gro++) {
            if (this.basesidebar) {
                var n = this.overlayman.markers.length;
                var blob = '<span style="background-color:black;border:2px solid brown;">&nbsp;&nbsp;&nbsp;&nbsp;</span> ';
                if (this.sidebarsnippet && snippet == "") {
                    snippet = GeoXml.stripHTML(desc);
                    desc2 = desc2.substring(0, 40);
                }
                parm = this.myvar + "$$$polygon$$$" + groundlist[gro].title2 + "$$$" + n + "$$$" + blob + "$$$" + groundlist[gro].visible + "$$$null$$$" + snippet;

                var thismap = this.map;
                google.maps.event.addListener(groundlist[gro], "zoomto", function () {
                    this.map.fitBounds(groundlist[gro].getBounds());
                });
                this.overlayman.folderBounds[idx].extend(groundlist[gro].getBounds().getSouthWest());
                this.overlayman.folderBounds[idx].extend(groundlist[gro].getBounds().getNorthEast());
                boundsmodified = true;
                this.overlayman.addMarker(groundlist[gro], title2, idx, parm, visible);
            }
            groundlist[gro].setMap(this.map);
        }
    }

    for (i = 0; i < pm.length; i++) {
        this.handlePlacemark(pm[i], idx, depth + 1);
    }

    var fc = 0;

    for (i = 0; i < sf.length; i++) {
        var fid = this.processKML(sf[i], marks, title2, folderid, depth + 1, me);
        if (typeof fid == "number" && fid != idx) {
            var sub = this.overlayman.folderBounds[fid];
            if (!sub) {
                this.overlayman.folderBounds[fid] = new google.maps.LatLngBounds();
            }
            else if (!this.overlayman.folderBounds[fid].isEmpty()) {
                var sw = this.overlayman.folderBounds[fid].getSouthWest();
                var ne = this.overlayman.folderBounds[fid].getNorthEast();
                this.overlayman.folderBounds[idx].extend(sw);
                this.overlayman.folderBounds[idx].extend(ne);
            }
            this.overlayman.subfolders[idx].push(fid);
            if (fid != idx) { this.kml[idx].folders.push(fid); }
            fc++;
        }
    }

    if (fc || pm.length || boundsmodified) {
        this.bounds.extend(this.overlayman.folderBounds[idx].getSouthWest());
        this.bounds.extend(this.overlayman.folderBounds[idx].getNorthEast());
    }

    if (sf.length == 0 && pm.length == 0) {
        this.ParseURL();
    }

    return idx;
};

GeoXml.prototype.processGPX = function (node, title2, sbid, depth) {
    var icon;
    if (node.nodeName == "gpx") { icon = this.gmlicon; }
    if (node.nodeName == "rte" || node.nodeName == "trk" || node.nodeName == "trkseg") { icon = this.foldericon; }
    var pm = [];
    var sf = [];
    var desc = "";
    var snip = "";
    var i, lon, lat, l;
    var open = this.forcefoldersopen;
    this.showLabels = false;
    var coords = "";
    var visible = true;

    for (var ln = 0; ln < node.childNodes.length; ln++) {
        var nextn = node.childNodes.item(ln);
        var nn = nextn.nodeName;
        if (nn == "name" || nn == "title") {
            title2 = this.getText(nextn);
            if (title2.length + depth > this.maxtitlewidth) {
                this.maxtitlewidth = title2.length + depth;
            }
        }
        if (nn == "rte") {
            sf.push(nextn);
        }
        if (nn == "trk") {
            sf.push(nextn);
        }
        if (nn == "trkseg") {
            sf.push(nextn);
        }

        if (nn == "trkpt") {
            pm.push(nextn);
            l = nextn.getAttribute("lat");
            if (typeof l != "undefined") { lat = l; }
            l = nextn.getAttribute("lon");
            if (typeof l != "undefined") {
                lon = l;
                coords += lon + "," + lat + " ";
            }
        }

        if (nn == "rtept") {
            pm.push(nextn);
            l = nextn.getAttribute("lat");
            if (typeof l != "undefined") { lat = l; }
            l = nextn.getAttribute("lon");
            if (typeof l != "undefined") {
                lon = l;
                coords += lon + "," + lat + " ";
            }
        }
        if (nn == "wpt") {
            pm.push(nextn);
        }
        if (nn == "description" || nn == "desc") {
            desc = this.getText(nextn);
        }
    }

    if (coords.length) {
        var nc = "<?xml version=\"1.0\"?><Placemark><name>" + title2 + "</name><description>" + desc + "</description><LineString>" + coordst + coords + coorded + "</LineString></Placemark>";
        var pathnode = this.parseXML(nc).documentElement;
        pm.push(pathnode);
    }

    var folderid;
    var idx = this.overlayman.folders.length;
    if (pm.length || node.nodeName == "gpx") {
        this.overlayman.folders.push([]);
        this.overlayman.subfolders.push([]);
        this.overlayman.folderhtml.push([]);
        this.overlayman.folderhtmlast.push(0);
        this.overlayman.folderBounds.push(new google.maps.LatLngBounds());
        this.kml.push(new KMLObj(title2, desc, open, idx));
        folderid = this.createFolder(idx, title2, sbid, icon, desc, snip, true, visible, (pm.length == 1));
    }
    else {
        folderid = sbid;
    }

    for (i = 0; i < pm.length; i++) {
        this.handlePlacemark(pm[i], idx, depth + 1);
    }

    for (i = 0; i < sf.length; i++) {
        var fid = this.processGPX(sf[i], title2, folderid, depth + 1);
        this.overlayman.subfolders[idx].push(fid);
        this.overlayman.folderBounds[idx].extend(this.overlayman.folderBounds[fid].getSouthWest());
        this.overlayman.folderBounds[idx].extend(this.overlayman.folderBounds[fid].getNorthEast());
    }

    if (this.overlayman.folderBounds[idx]) {
        this.bounds.extend(this.overlayman.folderBounds[idx].getSouthWest());
        this.bounds.extend(this.overlayman.folderBounds[idx].getNorthEast());
    }

    return idx;
};

GeoXml.prototype.ParseURL = function () {
    var query = topwin.location.search.substring(1);
    var pairs = query.split("&");
    var marks = this.overlayman.markers;
    for (var i = 0; i < pairs.length; i++) {
        var pos = pairs[i].indexOf("=");
        var argname = pairs[i].substring(0, pos).toLowerCase();
        var val = unescape(pairs[i].substring(pos + 1));
        var m = 0;
        var nae;

        if (!val) {
            if (this.overlayman.paren.openbyid) {
                val = this.overlayman.paren.openbyid;
                argname = "openbyid";
            }
            if (this.overlayman.paren.openbyname) {
                val = this.overlayman.paren.openbyname;
                argname = "openbyname";
            }
        }

        if (val) {
            switch (argname) {
                case "openbyid":
                    for (m = 0; m < marks.length; m++) {
                        nae = marks[m].id;
                        if (nae == val) {
                            this.overlayman.markers[m].setVisible(true);
                            this.overlayman.markers[m].hidden = false;
                            google.maps.event.trigger(this.overlayman.markers[m], "click");
                            break;
                        }
                    }
                    break;
                case "kml":
                case "url":
                case "src":
                case "geoxml":
                    this.urls.push(val);
                    this.parse();
                    break;
                case "openbyname":
                    for (m = 0; m < marks.length; m++) {
                        nae = marks[m].title2;
                        if (nae == val) {
                            this.overlayman.markers[m].setVisible(true);
                            this.overlayman.markers[m].hidden = false;
                            google.maps.event.trigger(this.overlayman.markers[m], "click");
                            break;
                        }
                    }
                    break;
            }
        }
    }
};

GeoXml.prototype.processing = function (xmlDoc, title2, latlon, desc, sbid) {
    this.overlayman.miStart = new Date();
    if (!desc) { desc = title2; }
    var that = this;
    if (!sbid) { sbid = 0; }
    var shadow;
    var idx;
    var root = xmlDoc.documentElement;
    if (!root) {
        return 0;
    }
    var placemarks = [];
    var name;
    var pname;
    var styles;
    var basename = root.nodeName;
    var keepopen = that.forcefoldersopen;
    var bases = basename.split(":");
    if (bases.length > 1) { basename = bases[1]; }
    var bar, sid, i;
    that.wfs = false;
    if (basename == "FeatureCollection") {
        bar = Lance$(that.basesidebar);
        if (!title2) { title2 = name; }
        if (typeof title2 == "undefined") {
            title2 = "Un-named GML";
        }
        that.isWFS = true;
        if (title2.length > that.maxtitlewidth) {
            that.maxtitlewidth = title2.length;
        }
        if (bar) { bar.style.display = ""; }
        idx = that.overlayman.folders.length;
        that.processGML(root, title2, latlon, desc, (that.kml.length - 1));
        that.kml[0].folders.push(idx);
    }

    if (basename == "gpx") {
        if (!title2) { title2 = name; }
        if (typeof title2 == "undefined") {
            title2 = "Un-named GPX";
        }
        that.title2 = title2;
        if (title2.length > that.maxtitlewidth) {
            that.maxtitlewidth = title2.length;
        }

        bar = Lance$(that.basesidebar);
        if (bar) { bar.style.display = ""; }
        idx = that.overlayman.folders.length;
        that.processGPX(root, title2, that.basesidebar, sbid);
        that.kml[0].folders.push(idx);
    }
    else {
        if (basename == "kml") {
            styles = root.getElementsByTagName("Style");
            for (i = 0; i < styles.length; i++) {
                sid = styles[i].getAttribute("id");
                if (sid) {
                    that.handleStyle(styles[i], sid);
                }
            }
            styles = root.getElementsByTagName("StyleMap");
            for (i = 0; i < styles.length; i++) {
                sid = styles[i].getAttribute("id");
                if (sid) {
                    var found = false;
                    var node = styles[i];
                    for (var j = 0; (j < node.childNodes.length && !found); j++) {
                        var pair = node.childNodes[j];
                        for (var k = 0; (k < pair.childNodes.length && !found); k++) {
                            var pn = pair.childNodes[k].nodeName;
                            if (pn == "styleUrl") {
                                var pid = this.getText(pair.childNodes[k]);
                                that.styles["#" + sid] = that.styles[pid];
                                found = true;
                            }
                            if (pn == "Style") {
                                that.handleStyle(pair.childNodes[k], sid);
                                found = true;
                            }
                        }
                    }
                }
            }

            if (!title2) { title2 = name; }
            if (typeof title2 == "undefined") {
                title2 = "KML Document";
            }

            that.title2 = title2;
            if (title2.length > that.maxtitlewidth) {
                that.maxtitlewidth = title2.length;
            }

            var marknames = ["Placemark"];
            var schema = root.getElementsByTagName("Schema");
            for (var s = 0; s < schema.length; s++) {
                pname = schema[s].getAttribute("parent");
                if (pname == "Placemark") {
                    pname = schema[s].getAttribute("name");
                    marknames.push(pname);
                }
            }

            bar = Lance$(that.basesidebar);
            if (bar) { bar.style.display = ""; }
            idx = that.overlayman.folders.length;
            var paren = that.kml.length - 1;
            var fid = that.processKML(root, marknames, title2, that.basesidebar, idx, paren);
            that.kml[paren].folders.push(idx);
        }
        else {
            placemarks = root.getElementsByTagName("item");
            if (placemarks.length < 1) {
                placemarks = root.getElementsByTagName("atom");
            }
            if (placemarks.length < 1) {
                placemarks = root.getElementsByTagName("entry");
            }
            if (!title2) { title2 = name; }
            if (typeof title2 == "undefined") {
                title2 = "News Feed";
            }
            that.title2 = title2;
            if (title2.length > that.maxtitlewidth) {
                that.maxtitlewidth = title2.length;
            }
            var style;
            if (that.opts.baseicon) {
                style = that.opts.baseicon;
                shadow = that.rssicon.replace(".png", ".shadow.png");
                style.shadow = shadow + "_shadow.png";
            }
            else {
                style = {
                    url: that.rssicon,
                    size: new google.maps.Size(iconsize, iconsize),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(iconsize / 2, iconsize)
                };
                shadow = that.rssicon.replace(".png", ".shadow.png");
                style.shadow = shadow + "_shadow.png";
            }

            style.strokeColor = "#00FFFF";
            style.strokeWeight = "3";
            style.strokeOpacity = 0.50;

            if (!desc) { desc = "RSS feed"; }
            that.kml[0].folders.push(that.overlayman.folders.length);

            if (placemarks.length) {
                bar = Lance$(that.basesidebar);
                if (bar) { bar.style.display = ""; }
                that.overlayman.folders.push([]);
                that.overlayman.folderhtml.push([]);
                that.overlayman.folderhtmlast.push(0);
                that.overlayman.folderBounds.push(new google.maps.LatLngBounds());
                idx = that.overlayman.folders.length - 1;
                that.kml.push(new KMLObj(title2, desc, keepopen, idx));
                that.kml[that.kml.length - 1].open = keepopen;
                if (that.basesidebar) {
                    var visible = true;
                    if (that.hideall) { visible = false; }
                    var folderid = that.createFolder(idx, title2, that.basesidebar, that.globalicon, desc, null, keepopen, visible);
                }
                for (i = 0; i < placemarks.length; i++) {
                    that.handlePlacemark(placemarks[i], idx, sbid, style);
                }
            }
        }
    }

    that.progress--;
    if (that.progress == 0) {
        google.maps.event.trigger(that, "parsed");

        if (!that.opts.sidebarid) {
            that.mb.showMess("Finished Parsing", 1000);
            // Shall we zoom to the bounds?
        }
        if (!that.opts.nozoom && !that.basesidebar) {
            that.map.fitBounds(that.bounds);
        }
    }
};

GeoXml.prototype.createFolder = function (idx, title2, sbid, icon, desc, snippet, keepopen, visible, suppressIt) {
    var sb = Lance$(sbid);
    keepopen = true;
    var folderid = this.myvar + '_folder' + idx;
    var checked = "";
    if (visible) { checked = " checked "; }
    this.overlayman.folderhtml[folderid] = "";
    var disp = "display:block";
    var fw = "font-weight:normal";
    if (typeof keepopen == "undefined" || !keepopen) {
        disp = "display:none";
        fw = "font-weight:bold";
    }
    if (!desc || desc == "") {
        desc = title2;
    }

    desc = escape(desc);
    if (this.suppressFolders == true || suppressIt) {
        htm = '<span id=\"' + folderid + '\" style="' + disp + '"></span>';
        //onclick="'+this.myvar+'.overlayman.zoomToFolder('+idx+');'+this.myvar+'.mb.showMess(\''+desc+'\',3000);return false;"
    }
    else {
        var htm = '<ul>' + (checkbox ? '<input type="checkbox" id="' + this.myvar + '' + idx + 'FCB" style="vertical-align:middle" ' + checked + 'onclick="' + this.myvar + '.toggleContents(' + idx + ',this.checked)">&nbsp;' : '');
        htm += '<span title2="' + snippet + '" id="' + this.myvar + 'TB' + idx + '" oncontextmenu=\"' + this.myvar + '.saveJSON(' + idx + ');\" onclick="' + this.myvar + '.toggleFolder(' + idx + ')" style=\"' + fw + '\">';
        htm += '<img id=\"' + this.myvar + 'FB' + idx + '\" style=\"vertical-align:text-top;padding:0;margin:0;height:"+this.sidebariconheight+"px;\" border=\"0\" src="' + icon + '" /></span>&nbsp;';
        htm += '<a href="#" onclick="' + this.myvar + '.overlayman.zoomToFolder(' + idx + ');' + this.myvar + '.mb.showMess(\'' + desc + '\',3000);return false;">' + title2 + '</a><br><span id=\"' + folderid + '\" style="' + disp + '"></span></ul>';
    }
    if (sb) { sb.innerHTML = sb.innerHTML + htm; }

    return folderid;
};

GeoXml.prototype.processGML = function (root, title2, latlon, desc, me) {
    var that = this;
    var placemarks = [];
    var srsName;
    var isLatLon = false;
    var xmin = 0;
    var ymin = 0;
    var xscale = 1;
    var yscale = 1;
    var pt, pts;
    var coor, coorstr;
    var x, y, k, i;
    var name = title2;
    var visible = true;
    this.showLabels = false;
    if (this.hideall) { visible = false; }
    var keepopen = that.allfoldersopen;
    var pt1, pt2, box;

    for (var ln = 0; ln < root.childNodes.length; ln++) {
        var kid = root.childNodes.item(ln).nodeName;
        var n = root.childNodes.item(ln);

        if (kid == "gml:boundedBy" || kid == "boundedBy") {
            for (var j = 0; j < n.childNodes.length; j++) {
                var nn = n.childNodes.item(j).nodeName;
                var llre = /CRS:84|(4326|4269)$/i;
                if (nn == "Box" || nn == "gml:Box") {
                    box = n.childNodes.item(j);
                    srsName = n.childNodes.item(j).getAttribute("srsName");
                    if (srsName.match(llre)) {
                        isLatLon = true;
                    }
                    else {
                        alert("SRSname =" + srsName + "; attempting to create transform");
                        for (k = 0; k < box.childNodes.length; k++) {
                            coor = box.childNodes.item(k);
                            if (coor.nodeName == "gml:coordinates" || coor.nodeName == "coordinates") {
                                coorstr = this.getText(coor);
                                pts = coorstr.split(" ");
                                pt1 = pts[0].split(",");
                                pt2 = pts[1].split(",");
                                xscale = (parseFloat(pt2[0]) - parseFloat(pt1[0])) / (latlon.xmax - latlon.xmin);
                                yscale = (parseFloat(pt2[1]) - parseFloat(pt1[1])) / (latlon.ymax - latlon.ymin);
                                xmin = pt1[0] / xscale - latlon.xmin;
                                ymin = pt1[1] / yscale - latlon.ymin;
                            }
                        }
                    }
                    break;
                }

                if (nn == "Envelope" || nn == "gml:Envelope") {
                    box = n.childNodes.item(j);
                    srsName = n.childNodes.item(j).getAttribute("srsName");
                    if (srsName.match(llre)) {
                        isLatLon = true;
                    }
                    else {
                        alert("SRSname =" + srsName + "; attempting to create transform");
                        for (k = 0; k < box.childNodes.length; k++) {
                            coor = box.childNodes.item(k);
                            if (coor.nodeName == "gml:coordinates" || coor.nodeName == "coordinates") {
                                pts = coor.split(" ");
                                var b = { "xmin": 100000000, "ymin": 100000000, "xmax": -100000000, "ymax": -100000000 };
                                for (var m = 0; m < pts.length - 1; m++) {
                                    pt = pts[m].split(",");
                                    x = parseFloat(pt[0]);
                                    y = parseFloat(pt[1]);
                                    if (x < b.xmin) { b.xmin = x; }
                                    if (y < b.ymin) { b.ymin = y; }
                                    if (x > b.xmax) { b.xmax = x; }
                                    if (y > b.ymax) { b.ymax = y; }
                                }
                                xscale = (b.xmax - b.xmin) / (latlon.xmax - latlon.xmin);
                                yscale = (b.ymax - b.ymin) / (latlon.ymax - latlon.ymin);
                                xmin = b.xmin / xscale - latlon.xmin;
                                ymin = b.ymin / yscale - latlon.ymin;
                            }
                        }
                    }

                }
                break;
            }
        }
        if (kid == "gml:featureMember" || kid == "featureMember") {
            placemarks.push(n);
        }
    }

    var folderid;
    if (!title2) { title2 = name; }
    this.title2 = title2;

    if (placemarks.length < 1) {
        alert("No features found in " + title2);
        this.mb.showMess("No features found in " + title2, 3000);
    }
    else {
        this.mb.showMess("Adding " + placemarks.length + " features found in " + title2);
        this.overlayman.folders.push([]);
        this.overlayman.folderhtml.push([]);
        this.overlayman.folderhtmlast.push(0);
        this.overlayman.folderBounds.push(new google.maps.LatLngBounds());
        var idx = this.overlayman.folders.length - 1;

        if (this.basesidebar) {
            folderid = this.createFolder(idx, title2, this.basesidebar, this.gmlicon, desc, null, keepopen, visible, (placemarks.length == 1));
        }

        this.kml.push(new KMLObj(title2, desc, true, idx));
        this.kml[me].open = that.opts.allfoldersopen;
        this.kml[me].folderid = folderid;
        
        if (isLatLon) {
            for (i = 0; i < placemarks.length; i++) {
                this.handlePlacemark(placemarks[i], idx, 0);
            }
        }
        else {
            var trans = { "xs": xscale, "ys": yscale, "x": xmin, "y": ymin };
            for (i = 0; i < placemarks.length; i++) {
                this.handleGeomark(placemarks[i], idx, trans, 0);
            }
        }
    }
    // Is this the last file to be processed?
};

GeoXml.prototype.loadJSONUrl = function (url, title2, latlon, desc, idx) {
    var that = this;
    GDownloadUrl(url, function (doc) {
        that.parseJSON(doc, title2, latlon, desc, idx);
    });
};

GeoXml.prototype.loadXMLUrl = function (url, group, title2, latlon, desc, idx) {
    var that = this;
    that.DownloadURL(url, function (doc) {
        that.urlfile = url;
        that.urlgroup = group ? group : "";
        that.urltitle2 = title2 ? '<b>' + title2 + ':</b><br>' : "";
        // fix style bug
        that.styles = [];
        var xmlDoc = that.parseXML(doc);
        that.processing(xmlDoc, title2, latlon, desc, idx);
    }, title2, true);
};

GeoXml.prototype.upgradeLayer = function (n) {
    var mt = this.map.getMapTypes();
    var found = false;
    for (var i = 0; i < mt.length; i++) {
        if (mt[i] === this.baseLayers[n]) {
            found = true;
            this.map.removeMapType(this.baseLayers[n]);
        }
    }
    if (!found) { this.map.addMapType(this.baseLayers[n]); }
};

GeoXml.prototype.makeWMSTileLayer = function (getmapstring, on, title2, opac, attr, grouptitle, wmsbounds) { //not yet working.
    var that = this;
    gmapstring = new String(getmapstring);
    getmapstring = gmapstring.replace("&amp;", "&");
    var args = getmapstring.split("?");
    var baseurl = args[0] + "?";
    baseurl = baseurl.replace(/&request=getmap/i, "");
    baseurl = baseurl.replace(/&service=wms/i, "");
    //alert("base"+baseurl);
    var version = "1.1.0";
    var format = "image/png";
    var styles = "";
    var layers = "";
    var queryable = false;
    var opacity = 0.5;
    if (typeof opac != "undefined") { opacity = opac; }
    var bbox = "-180,-90,180,90";
    var pairs = args[1].split("&");
    var sld = "";
    var servicename = "";
    var atlasname = "";
    var gmcrs = "";
    var epsg;
    for (var i = 0; i < pairs.length; i++) {
        var dstr = pairs[i];
        var duo = pairs[i].split("=");
        var dl = duo[0].toLowerCase();
        switch (dl) {
            case "version": version = duo[1]; break;
            case "bbox": bbox = duo[1]; break;
            case "width":
            case "height": break;
            case "service": break;
            case "servicename": servicename = duo[1]; break;
            case "atlasname": atlasname = duo[1]; break;
            case "styles": styles = duo[1]; break;
            case "layers": layers = duo[1]; break;
            case "format": format = duo[1]; break;
            case "opacity": opacity = parseFloat(duo[1]); break;
            case "crs":
            case "srs": epsg = duo[1]; break;
            case "gmcrs": gmcrs = duo[1]; break;
            case "queryable": queryable = duo[1]; break;
            case "getmap": break;
            case "service": break;
            default: if (duo[0]) { baseurl += "&" + pairs[i]; } break;
        }
    }

    if (gmcrs) {
        epsg = gmcrs;
    }
    var bbn = bbox.split(",");
    var bb = { "w": parseFloat(bbn[0]), "s": parseFloat(bbn[1]), "e": parseFloat(bbn[2]), "n": parseFloat(bbn[3]) };
    var lon = (bb.n - bb.s);
    var z = 0;
    var ex = 180;

    while (ex >= lon) {
        ex = ex / 2;
        z++;
    }
    z--;
    if (z < 1) { z = 1; }

    if (!attr) { attr = "Base Map from OGC WMS"; }
    //var cr0 = new GCopyright(1, new google.maps.LatLngBounds(new google.maps.LatLng(bb.s,bb.w),new google.maps.LatLng(bb.n,bb.e)),0,attr);
    //   var cc0 = new GCopyrightCollection("");
    //    cc0.addCopyright(cr0);
    /*
     var twms = new IMGTileSet({baseUrl:baseurl}); //GTileLayer(cc0,z,19);
    twms.s = bb.s; twms.n = bb.n; twms.e = bb.e; twms.w = bb.w;
    twms.myBaseURL = baseurl;
    if(servicename){
      twms.servicename = servicename;
      }
    if(atlasname){
      twms.atlasname = atlasname;
      }
    twms.publishdirectory = this.publishdirectory;
    twms.epsg = epsg;
    twms.getPath = function(cords,c) {
      a,b
      if (typeof(this.myStyles)=="undefined") {
        this.myStyles=""; 
        }
      var lULP = new google.maps.Point(a.x*256,(a.y+1)*256);
      var lLRP = new google.maps.Point((a.x+1)*256,a.y*256);
      var lUL = G_NORMAL_MAP.getProjection().fromPixelToLatLng(lULP,b,c);
      var lLR = G_NORMAL_MAP.getProjection().fromPixelToLatLng(lLRP,b,c);
      var west = lUL.x;
      var east = lLR.x;
      var north = lUL.y;
      var south = lLR.y;
      var ge = east;
      var gw = west;
      var gs = south;
      var gn = north;
      if(gn < gs){ gs = gn; gn = south; }
      if(this.epsg != "EPSG:4326" && this.epsg != "CRS:84" && this.epsg!= "4326") {
        west = GeoXml.merc2Lon(west);
        north = GeoXml.merc2Lat(north);
        east = GeoXml.merc2Lon(east);
        south = GeoXml.merc2Lat(south);
        }
      var w = Math.abs(east - west);
      var h = Math.abs(north - south);
      var s = h/w;
       h = Math.round((256.0 * s) + 0.5);
   
      w = 256;
      var sud = south; 
      if(north < south){
        south = north; north = sud; 
        }
  
        if(gs>(this.n) || ge < (this.w) || gn < (this.s) || gw > (this.e)  ){
        var retstr = this.publishdirectory +"black.gif";
        }
  
          var lBbox=west+","+south+","+east+","+north;
      var lSRS="EPSG:41001";
      if(typeof this.epsg != "undefined" || this.srs == "4326"){
            lSRS=this.epsg;
        }
  
  
      var lURL=this.myBaseURL;  
      if(typeof this.myVersion == "undefined"){ this.myVersion = "1.1.1"; }
  
      var ver = parseFloat(this.myVersion);
      var arcims = /arcimsproxy/i; 
      if(!this.myBaseURL.match(arcims)) {
        lURL+="&SERVICE=WMS";
        if(this.myVersion !="1.0.0"){
          var gmap = /request=getmap/i;
          if(!lURL.match(gmap)){
            lURL+="&REQUEST=GetMap";
            }
          }
        else {
          lURL+="&REQUEST=Map";
          }
        }
      if(this.servicename){
        lURL += "?ServiceName="+this.servicename;
        }
      if(this.atlasname){
        lURL += "&AtlasName="+this.servicename;
        }
      lURL+="&VERSION="+this.myVersion;
      if(this.myLayers) {
        lURL+="&LAYERS="+this.myLayers;
        lURL+="&STYLES="+this.myStyles; 
        }
      if(this.mySLD){
        lURL+="&SLD="+this.mySLD; 
        }
        lURL+="&FORMAT="+this.myFormat;
      lURL+="&BGCOLOR=0x000000";
      lURL+="&TRANSPARENT=TRUE";
      if(this.myVersion == "1.1.1" || ver<1.3 ){
        lURL += "&SRS=" + lSRS;
        }
  
      else {
        lURL += "&CRS=" + lSRS;
  
        }
      lURL+="&WIDTH="+w;
      lURL+="&HEIGHT="+h;
      lURL+="&BBOX="+lBbox;
      this.requestCount++;
      return lURL;
      };
    twms.myFormat = format;
    twms.myVersion = version;
    twms.myExtents = bbox;
    twms.queryable = queryable;
    twms.opacity = opacity;
    twms.getOpacity = function() { return this.opacity; };
    if(sld){
      twms.mySLD = sld;
      }
    else {
      twms.myLayers = layers;
      twms.myStyles = styles;
      }
  
    var ol = new IMGTileSet(twms);
    
  
    ol.myBounds = new google.maps.LatLngBounds();
    ol.myBounds.extend(new google.maps.LatLng(bb.n,bb.e));
    ol.myBounds.extend(new google.maps.LatLng(bb.s,bb.w));
  
    this.wmscount++;
     if(this.opts.doMapTypes){
      
       var twms2 = new GTileLayer(cc0,z,19);
      twms2.s = bb.s; 
      twms2.n = bb.n;
      twms2.e = bb.e;
      twms2.w = bb.w;
      twms2.myBaseURL = baseurl;
      twms2.servicename = servicename;
      twms2.publishdirectory = this.publishdirectory;
      twms2.getTileUrl = twms.getTileUrl;
      twms2.myFormat =  twms.myFormat;
      twms2.myVersion = version;
      twms2.opacity = 1.0;
      twms2.title2 = title2;
      if(attr) {
        twms2.attribution = attr;
        }
      twms2.getOpacity = function() { return this.opacity; };
      if(sld){
        twms2.mySLD = sld;
        }
      else {
        twms2.myLayers = layers;
        twms2.myStyles = styles;
        }
      twms2.epsg = epsg;
      var base = new GTileLayer(cc0,z,19);
      base.s = bb.s; 
      base.n = bb.n;
      base.e = bb.e;
      base.w = bb.w;  
      base.dir = this.publishdirectory;
      base.getTileUrl = function () {
        return (this.dir +"black.gif");
        };
      base.opacity = 1.0;
      base.title2 = title2;
      if(attr) {
        base.attribution = attr;
        }
      base.getOpacity = function() { return this.opacity; };
      //base,
      var layer = [twms2, G_HYBRID_MAP.getTileLayers()[1]];
      var cmap = new GMapType(layer, G_HYBRID_MAP.getProjection(), ""+title2+"", G_HYBRID_MAP);
      cmap.bounds = new google.maps.LatLngBounds(new google.maps.LatLng(bb.s,bb.w),new google.maps.LatLng(bb.n,bb.e));
      if(grouptitle) { cmap.grouptitle = grouptitle; }
      that.baseLayers.push(cmap);
      that.map.addMapType(cmap);
      
      return null;
      }
    else { return ol; }
    */
};

GeoXml.prototype.toggleLabels = function (on) {
    if (!on) {
        this.removeLabels();
    }
    else {
        this.addLabels();
    }
};

GeoXml.prototype.addLabels = function () {
    this.labels.onMap = true;
    this.labels.setMap(this.map);
};

GeoXml.prototype.removeLabels = function() {
    this.labels.onMap = false;
    this.labels.setMap(null);
};

GeoXml.prototype.DownloadURL = function(fpath, callback, title2, xmlcheck) {
    if (!fpath) {
        return;
    }
    fpath = geturl(fpath);

    //correct for out of date luca server url
    if (!fpath.startsWith(PROTOCOL) && fpath.indexOf("luca") > 0) {
        fpath = PROTOCOL + LUCA_HOSTNAME + fpath.substring(fpath.indexOf("luca.ropewiki.com") + "luca.ropewiki.com".length);
    }

    var xmlDoc;
    var that = this;

    if (!title2) title2 = "data";

    // add timestamp to disable caching
    if (fpath.indexOf("localhost") > 0) {
        timestamp = new Date().getTime();
        if (fpath.indexOf('?') > 0)
            fpath += '&timestamp=' + timestamp;
        else
            fpath += '?timestamp=' + timestamp;
    }

    var cmlurl = fpath;

    if (!topwin.standalone && this.proxy) {
        // Remove http:// because of protection on servers
        cmlurl = cmlurl.replace("http://", "");
        cmlurl = cmlurl.replace("http%3A//", "");
        cmlurl = cmlurl.replace("https://", "");
        cmlurl = cmlurl.replace("https%3A//", "");
        cmlurl = this.proxy + "url=" + escape(cmlurl) + this.token;
    }

    if (topwin.standalone || useLegacyLocalLoad) {
        if (cmlurl.substring(2, 3) == ":") {
            xmlDoc = new ActiveXObject("Msxml2.DOMDocument.4.0");
            xmlDoc.validateOnParse = false;
            xmlDoc.async = true;
            xmlDoc.load(cmlurl);
            if (xmlDoc.parseError.errorCode != 0) {
                var myErr = xmlDoc.parseError;
                alert("GeoXml file appears incorrect\n" + myErr.reason + " at line:" + myErr.line);
            } else {
                callback(xmlDoc.doc);
            }
            return;
        }
    }
    var cmlreq;
    /*@cc_on @*/
    /*@if(@_jscript_version>=5)
    try{
    cmlreq=new ActiveXObject("Msxml2.XMLHTTP");
    }catch(e){
    try{
    cmlreq=new ActiveXObject("Microsoft.XMLHTTP");
    }catch(E){
    alert("attempting xmlhttp");
    cmlreq=false;
    }
    }
    @end @*/
    if (!cmlreq && typeof XMLHttpRequest != 'undefined') {
        cmlreq = new XMLHttpRequest();
    } else {
        if (typeof ActiveXObject != "undefined") {
            cmlreq = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }

    var here = cmlurl;
    console.log("downloading " + here);
    if (cmlreq.overrideMimeType) {
        cmlreq.overrideMimeType("text/xml");
    }
    cmlreq.open("GET", here, true);
    cmlreq.onreadystatechange = function() {
        //console.log("state:"+cmlreq.readyState+" status:"+cmlreq.status+" readystate "+here);

        switch (cmlreq.readyState) {
        case 4:
            that.mb.showMess(title2 + " received", 2000);
            if (typeof ActiveXObject != "undefined") {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                var response = cmlreq.responseText;
                callback(response);
            } else {
                if (cmlreq.responseXML) {
                    that.mb.showMess(title2 + " received", 2000);
                    callback(cmlreq.responseText);
                } else {
                    if (cmlreq.status == 200) {
                        var resp = cmlreq.responseText;
                        var sresp = resp.substring(0, 400);
                        var isXML = resp.substring(0, 5);

                        if (!xmlcheck || (isXML == "<?xml" && sresp.indexOf("kml") != -1)) {
                            that.mb.showMess(title2 + " response received", 2000);
                            callback(resp);
                        } else {
                            var pkmsg = resp.substring(0, 2) == "PK" ? " (compressed files are not supported)" : "";
                            that.mb.showMess("File does not appear to be a valid GeoData:" +
                                resp.substring(0, 4) +
                                pkmsg,
                                600000);
                        }
                    } else {
                        console.log("ERROR! " + here);
                        that.mb.showMess("Download error", 3000);
                    }
                }
            }
            break;
        case 3:
            that.mb.showMess("Receiving " + title2 + "...", 2000);
            break;
        case 2:
            that.mb.showMess("Waiting for " + title2, 2000);
            break;
        case 1:
            that.mb.showMess("Sent request for " + title2, 2000);
            break;
        }
    };

    try {
        cmlreq.send(null);
    } catch (err) {
        if (cmlurl.substring(2, 3) == ":" && !useLegacyLocalLoad) {
            useLegacyLocalLoad = true;
            this.DownloadURL(cmlurl, callback, title2, xmlcheck);
        }
    }
};
