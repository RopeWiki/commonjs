
/*
 * Elevation computation with Google Elevation Service added by Luca Chiarabini
 */

var miperslope = 0.1;
var samplesize = 200;
var zeroelev = 0;
var mousemarker;
//var pelevations;


var elevationService;

function elevationinfowindowm(m) {
    if (m.elevation != null)
        return;

    var latlngs = [];
    var pt = m.getPosition();
    latlngs.push(pt);

    if (!elevationService)
        elevationService = new google.maps.ElevationService();
    if (elevationService)
        elevationService.getElevationForLocations({ 'locations': latlngs }, function (results) {
            // process elevation for marker
            //var div = document.getElementById('elevation');
            //if (div!=null) 
            if (results[0]) {
                var str = m.infoWindow.getContent(); //div.innerHTML;
                var elev = Math.round(results[0].elevation * m2ft);
                str = str.replace("#Computing#", ft(elev));
                m.infoWindow.setContent(str); //div.innerHTML = str;
            }
            m.elevation = results;
            //m.infoWindow.open(map);
        });
}

// plots the elevation profile on a chart
function plotelevation(results, ticks, conv) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Sample');
    data.addColumn('number', 'Elevation');

    for (var i = 0; i < results.length; i++) {
        var slope = "";
        if (results[i].g != 0)
            slope = "Slope: " + xdeg(results[i].g) + "º " + results[i].g + "% " + ftxmi(results[i].g / 100 * mi2ft);
        data.addRow([slope, Math.round(conv * results[i].elevation)]);
    }

    var elem = document.getElementById('elevationgraph');
    elem.style.display = 'block';
    var elem = document.getElementById('elevationgraph');
    var chart = new google.visualization.AreaChart(elem);
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
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            });
            mousemarker.infowindow = new google.maps.InfoWindow({ content: "" });
            google.maps.event.addListener(mousemarker, 'click', function () {
                //alert("click");
                mousemarker.infowindow.open(map, mousemarker);
            });
        }
        mousemarker.setPosition(results[e.row].location);
        mousemarker.infowindow.setContent(Math.round(results[e.row].location.lat() * 1e5) / 1e5 + "," + Math.round(results[e.row].location.lng() * 1e5) / 1e5);
    });
}

var elevationpl = [];
function getnextelevation() {
    if (elevationpl.length > 0)
        elevationinfowindowp(elevationpl[0], getnextelevation);
}
function getelevation(pl) {
    elevationpl.push(pl);
    if (elevationpl.length == 1)
        getnextelevation();
}

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
        //alert(ticks);
        ticks[0] = pl.minelev;
        var height = Math.round((ticks[ticks.length - 1] - ticks[0]) / pl.conv * hscale);
        pl.ticks = ticks;

        //var elem = document.getElementById('elevationgraph');
        //elem.style.height = height;
        $("#elevationgraph").height(height);

        pl.infoWindow.setContent(document.getElementById('elevationiw').innerHTML);
        pl.infoWindow.open(map);
        google.maps.event.addListener(pl.infoWindow, 'domready', function () {
            plotelevation(pl.elevation, pl.ticks, pl.conv);
        });
    }

    function getresults(results) {
        // unit conversion  
        if (!results) {
            console.log("getElevationAlongPath failed len:" + len);
            return;
        }
        var dist = 0;
        for (var i = 0; i < results.length; i++) {
            results[i].elevation = Math.round(results[i].elevation * m2ft);
            if (i > 0) dist += DistanceLength(results[i - 1].location, results[i].location);
            results[i].distance = dist;
        }
        var gup = 0, gdn = 0, cup = 0, cdn = 0, gmax = 0, gmin = 0;
        var miperslope2 = miperslope / 2;
        for (var i = 0; i < results.length; i++) {
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
        for (var i = 1; i < results.length; i++) {
            var elev = results[i].elevation;
            if (elev > maxelev) maxelev = elev, maxi = i;
            if (elev < minelev) minelev = elev, mini = i;
            var diffelev = elev - lastelev;
            if (diffelev > zeroelev) gainelev += diffelev;
            if (diffelev < -zeroelev) losselev += diffelev;
            lastelev = elev;
            path.push(results[i].location);
        }

        /*
        polyline = new google.maps.Polyline({
          path: path,
          strokeColor: "#000000",
          map: map});
        */

        var abselev = (maxelev - minelev) * (mini < maxi ? 1 : -1);
        var bar = Lance$(pl.sidebarid);
        if (bar && bar.innerHTML)
            bar.innerHTML = bar.innerHTML.replace("</a></span>", " " + ft(abselev) + "</a> </span>");

        var absdist = (results[maxi].distance - results[mini].distance) * (mini < maxi ? 1 : -1);
        if (absdist < miperslope) absdist = miperslope;
        var slope = Math.round(abselev / (absdist * mi2ft) * 100);

        //var iwstr = pl.infoWindow.content; //
        var div = document.getElementById('elevation');
        if (div != null) {
            //var str = iwstr; //
            var str = div.innerHTML;
            str = str.replace("####Computing1####", ft(minelev) + " - " + ft(maxelev));
            //str = str.replace("#GL#", abselev>0 ? "Gain" : "Loss");
            var absdistr = Math.round(absdist * 10) / 10;
            str = str.replace("####Computing2####", ft(abselev) + " / " + mi(absdistr) + " = " + ftxmi(abselev / absdistr) + "ft/mi");
            str = str.replace("####Computing3####", ft(gainelev) + " / " + ft(losselev));
            str = str.replace("####Computing4####", xdeg(gup) + "º / " + xdeg(gdn) + "º (Max " + xdeg(gmax) + "º / " + xdeg(gmin) + "º)");
            str = str.replace("####Computing5####", gup + "% / " + gdn + "% (Max " + gmax + "% / " + gmin + "%)");
            str = str.replace("####Computing6####", ftxmi(gup / 100 * mi2ft) + " / " + ftxmi(gdn / 100 * mi2ft));
            //iwstr = str; //
            div.innerHTML = str;
        }

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
    var a = pl.getPath(), len = a.getLength();
    var maxlen = len;
    if (len > maxpathlen) len = maxpathlen;
    for (var i = 0; i < len; i++) {
        var ii = i;
        if (len != maxlen)
            ii = Math.round(i * maxlen / len);
        var pt = a.getAt(ii);
        latlngs.push(pt);
    }

    if (!elevationService)
        elevationService = new google.maps.ElevationService();
    if (elevationService)
        elevationService.getElevationAlongPath({ path: latlngs, samples: samplesize }, getresults);
}


function vizloaded() {
    //alert("loaded");
}
