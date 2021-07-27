
/*
 * Elevation computation with Google Elevation Service added by Luca Chiarabini
 */

var miperslope = 0.1;
var samplesize = 200;
var zeroelev = 0;
var mousemarker;

function elevationinfowindowm(m) {
    if (m.elevation != null) {
        var str = m.infoWindow.getContent();

        str = adjustHtmlStringForMetric(str);

        m.infoWindow.setContent(str);
        return;
    }

    var latlngs = [];
    var pt = m.getPosition();
    latlngs.push(pt);

    if (!elevationService)
        elevationService = new google.maps.ElevationService();

    if (elevationService)
        elevationService.getElevationForLocations({ 'locations': latlngs }, function (results) {
            // process elevation for marker
            if (results[0]) {
                var str = m.infoWindow.getContent();
                var elev = Math.round(results[0].elevation * m2ft);
                str = str.replace("#Computing#", "<span class='uft'>" + ftStr(elev) + "</span>");
                m.infoWindow.setContent(str);
            }
            m.elevation = results;
        });
}

// plots the elevation profile on a chart
function plotelevation(results, ticks, conv) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Sample');
    data.addColumn('number', 'Elevation');

    for (var i = 0; i < results.length; i++) {
        //if (results[i].g != 0) {
            let slope = ftxmi(results[i].g / 100 * mi2ft);
            var slopeStr = "Slope: " + (slope >= 0 ? "+":"") + ftxmi(results[i].g / 100 * mi2ft) + " ft/mi";
            data.addRow([slopeStr, Math.round(conv * results[i].elevation)]);
        //}
    }

    var graph = document.getElementById('elevationgraph');
    graph.style.display = 'block';

    var chart = new google.visualization.AreaChart(graph);

    chart.draw(data, {
        //width: 100,
        //height: height-5, //$("#elevationgraph").height(),
        //backgroundColor: {fill: '#00ffff'},
        legend: 'none',
        //legend: {textStyle:  {fontName: 'TimesNewRoman',fontSize: 12,bold: false}},
        //titleY: 'Elevation ('+ft+')',
        vAxis: { textPosition: 'in', ticks: ticks }, //// gridlines: {color: '#ff0000'}}, //, viewWindow: {min:minelev, max:maxelev} },
        chartArea: { left: 0, top: 0, width: '100%', height: '100%' },
        //axisTitlesPosition: 'none',
        focusBorderColor: '#00ffff',
        //bar: { groupWidth: '100%' },
        //vAxis: {textPosition: 'in' },
        hAxis: { textPosition: 'none' },
        focusTarget: 'category',
        tooltip: { trigger: 'selection' }
    });

    google.visualization.events.addListener(chart, 'onmouseover', function (e) {
        if (mousemarker == null) {
            mousemarker = new google.maps.Marker({
                position: results[e.row].location,
                map: map,
                icon: PROTOCOL + "maps.google.com/mapfiles/ms/icons/blue-dot.png"
            });

            mousemarker.infowindow = new google.maps.InfoWindow({ content: "" });

            google.maps.event.addListener(mousemarker, 'click', function () {
                mousemarker.infowindow.open(map, mousemarker);
            });
        }
        mousemarker.setPosition(results[e.row].location);
        mousemarker.infowindow.setContent(results[e.row].location.lat().toFixed(4) + "," + results[e.row].location.lng().toFixed(4));

        // code to vertically scroll the elevation chart. imo it is a better user experience to just shrink the chart to fit instead of scrolling it
        //var graph = document.getElementById('elevationgraph');

        //let graphMin = results.minTick;
        //let graphMax = results.maxTick;
        //let currentElevation = results[e.row].elevation;
        //let scrollTop = graph.scrollTop;
        //let clientHeight = graph.clientHeight;
        //let scrollHeight = graph.scrollHeight;
        //let scalePerPixel = (graphMax - graphMin) / scrollHeight;
        //let currentDisplayedElevationMax = graphMax - (scrollTop) * scalePerPixel; //top of graph on screen
        //let currentDisplayedElevationMin = graphMax - (scrollTop + clientHeight) * scalePerPixel; //bottom of graph on screen

        //if (currentElevation < currentDisplayedElevationMin) {
        //    graph.scrollTop = (graphMax - currentElevation) / scalePerPixel - clientHeight;
        //}

        //if (currentElevation > currentDisplayedElevationMax) {
        //    graph.scrollTop = (graphMax - currentElevation) / scalePerPixel;
        //}
    });
}

var elevationpl = [];
function getelevation(pl) {
    elevationpl.push(pl);

    if (elevationpl.length === 1)
        getnextelevation();
}

function getnextelevation() {
    if (elevationpl.length > 0)
        elevationinfowindowp(elevationpl[0], getnextelevation);
}

var lastPolyline;

function elevationinfowindowp(pl, computeonly) {
    function plotinfowindow(pl) {
        // ticks
        var hscale = 40 / 500; // 40px per 500ft
        var pertick = metric ? 100 : 250;
        var ticks = [];
        var mint = Math.floor(pl.minelev / pertick) * pertick;
        var maxt = Math.ceil(pl.maxelev / pertick) * pertick;

        for (var t = mint; t <= maxt; t += pertick)
            ticks.push(t);

        ticks[0] = pl.minelev;
        pl.ticks = ticks;

        //only needed if scrolling the client window
        //pl.elevation.minTick = ticks[0];
        //pl.elevation.maxTick = maxt;

        var elevationiw = document.getElementById('elevationiw');
        if (!!elevationiw)
            pl.infoWindow.setContent(elevationiw.innerHTML);

        pl.infoWindow.open(map);

        google.maps.event.addListener(pl.infoWindow, 'domready', function () {

            var height = Math.round((pl.ticks[pl.ticks.length - 1] - pl.ticks[0]) / pl.conv * hscale);

            let graph = $("#elevationgraph")[0];

            let parentHeight = graph.parentElement.offsetHeight;
            let grandparentHeight = parseInt(graph.parentElement.parentElement.style.maxHeight, 10);
            let maxHeight = grandparentHeight - (parentHeight - graph.offsetHeight);
            graph.style.maxHeight = maxHeight + 'px';

            graph.style.height = height + 'px';

            plotelevation(pl.elevation, pl.ticks, pl.conv);
        });

        google.maps.event.addListener(pl.infoWindow, 'closeclick', function () {
            if (!!mousemarker) {
                mousemarker.setMap(null);
                mousemarker = null;
            }
            lastPolyline = null;
        });
    }

    var len;

    function processresults(results) {
        // unit conversion  
        if (!results) {
            console.log("getElevationAlongPath failed len:" + len);
            return;
        }

        var i;

        if (pl.rawResults === undefined) {
            var rawResults = [];
            for (i = 0; i < results.length; i++) {
                rawResults[i] = {
                    elevation: results[i].elevation,
                    location: results[i].location
                };
            }
            pl.rawResults = rawResults;
        } else { //make copy of the original array
            results = [];
            for (i = 0; i < pl.rawResults.length; i++) {
                results[i] = {
                    elevation: pl.rawResults[i].elevation,
                    location: pl.rawResults[i].location
                };
            }
        }

        var dist = 0;
        for (i = 0; i < results.length; i++) {
            results[i].elevation = Math.round(results[i].elevation * m2ft);
            if (i > 0) dist += DistanceLength(results[i - 1].location, results[i].location);
            results[i].distance = dist;
        }

        var gup = 0, gdn = 0, cup = 0, cdn = 0, gmax = 0, gmin = 0;
        var miperslope2 = miperslope / 2;
        for (i = 0; i < results.length; i++) {
            for (var j = i; j >= 0 && results[i].distance - results[j].distance < miperslope2; --j);
            for (var k = i; k <= results.length - 1 && results[k].distance - results[i].distance < miperslope2; ++k);
            results[i].g = 0;
            if (j >= 0 && k < results.length) {
                var g, h, d;
                h = results[k].elevation - results[j].elevation;
                d = results[k].distance - results[j].distance;
                results[i].g = g = Math.round(h / (d * mi2ft) * 100);
                if (g > 1) { gup += g; cup++; if (g > gmax) gmax = g; }
                if (g < -1) { gdn += g; cdn++; if (g < gmin) gmin = g; }
            }
        }

        gup = cup > 0 ? Math.round(gup / cup) : 0;
        gdn = cdn > 0 ? Math.round(gdn / cdn) : 0;

        var path = [];

        var mini, maxi, minelev, maxelev, lastelev, gainelev = 0, losselev = 0;
        minelev = maxelev = lastelev = results[maxi = mini = 0].elevation;
        for (i = 1; i < results.length; i++) {
            var elev = results[i].elevation;
            if (elev > maxelev) maxelev = elev, maxi = i;
            if (elev < minelev) minelev = elev, mini = i;
            var diffelev = elev - lastelev;
            if (diffelev > zeroelev) gainelev += diffelev;
            if (diffelev < -zeroelev) losselev += diffelev;
            lastelev = elev;
            path.push(results[i].location);
        }

        var abselev = (maxelev - minelev) * (mini < maxi ? 1 : -1);
        var bar = Lance$(pl.sidebarid);
        if (bar && bar.innerHTML)
            bar.innerHTML = bar.innerHTML.replace("</a></span>", " " + "<span class='uft'>" + ftStr(abselev) + "</span>" + "</a> </span>");

        var absdist = (results[maxi].distance - results[mini].distance) * (mini < maxi ? 1 : -1);
        if (absdist < miperslope) absdist = miperslope;
        //var slope = Math.round(abselev / (absdist * mi2ft) * 100);

        var div = document.getElementById('elevation');
        if (div != null) {
            var str = div.innerHTML;
            /* Min/Max Elev*/         str = str.replace("####Computing1####", "<span class='uft'>" + ftStr(maxelev) + "</span>" + " / " + "<span class='uft'>" + ftStr(minelev) + "</span>");
            //str = str.replace("#GL#", abselev>0 ? "Gain" : "Loss");
            /* Elev. Change*/         str = str.replace("####Computing2####", (abselev >= 0 ? "+" : "") + "<span class='uft-round'>" + ftStrRound(abselev) + "</span>" + " in " + "<span class='uft'>" + miStr(absdist) + "</span>");
            /* Total Gain/Loss*/      str = str.replace("####Computing3####", "+" + "<span class='uft-round'>" + ftStrRound(gainelev) + "</span>" + " / " + "<span class='uft-round'>" + ftStrRound(losselev) + "</span>");
            /* Average Slope*/        //str = str.replace("####Computing4####", xdeg(gup) + "º / " + xdeg(gdn) + "º (Max " + xdeg(gmax) + "º / " + xdeg(gmin) + "º)");
            /* Average Slope %*/      //str = str.replace("####Computing5####", gup + "% / " + gdn + "% (Max " + gmax + "% / " + gmin + "%)");
            /* Average Slope ft/mi*/  //str = str.replace("####Computing6####", ftxmi(gup / 100 * mi2ft) + " / " + ftxmi(gdn / 100 * mi2ft));

            div.innerHTML = str;
        }

        pl.metric = metric;
        pl.conv = metric ? 1 / m2ft : 1;
        pl.minelev = Math.round(minelev * pl.conv);
        pl.maxelev = Math.round(maxelev * pl.conv);
        pl.elevation = results;

        if (computeonly) {
            elevationpl.shift();
            getnextelevation();
            return;
        }

        plotinfowindow(pl);
    }

    lastPolyline = pl;

    if (pl.metric !== undefined && pl.metric !== metric) {
        processresults(pl.rawResults);
        return;
    }

    // already plotted
    if (pl.ticks != null)
        return;

    // already computed 
    if (pl.elevation != null) {
        plotinfowindow(pl);
        return;
    }

    // Create a new chart in the elevation_chart DIV.    
    var latlngs = [];
    var a = pl.getPath();
    len = a.getLength();
    var maxlen = len;
    if (len > maxpathlen) len = maxpathlen;
    for (var i = 0; i < len; i++) {
        var ii = i;
        if (len !== maxlen)
            ii = Math.round(i * maxlen / len);
        var pt = a.getAt(ii);
        latlngs.push(pt);
    }

    if (!elevationService)
        elevationService = new google.maps.ElevationService();
    if (elevationService)
        elevationService.getElevationAlongPath({ path: latlngs, samples: samplesize }, processresults);
}

function drawElevationGraph() {

    var pl = lastPolyline;
    if (pl === undefined || pl === null) return;

    elevationinfowindowp(pl);
}