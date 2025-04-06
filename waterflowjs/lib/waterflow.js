/******************************************************************************\
  waterflow.js by Luca Chiarabini
  A Google Maps water gage locator using USGS and RW gage servers
\******************************************************************************/

var sites = [];

function sitelink(siteid, label, url) {
    if (typeof url == "undefined") {
        url = siteid;
        var site = returnSiteByID(siteid);
        if (site) {
            var id = siteid.split(":")[1];
            url = site.urls[0].replace("%id", id);
        }
    }

    if (url === "")
        return '<span style="color:#808080">' + label + '</span>';
    return aref(url, label, label, 'target="_blank"');
}

function returnSiteByID(id) {
    for (var c = 0; c < sites.length; c++)
        if (sites[c].id === id)
            return sites[c];
    return null;
}


/**
 * HSV to RGB color conversion
 *
 * H runs from 0 to 360 degrees
 * S and V run from 0 to 100
 * 
 * Ported from the excellent java algorithm by Eugene Vishnevsky at:
 * http://www.cs.rit.edu/~ncs/color/t_convert.html
 */
 /*
function hsv2rgb(h, s, v) {
  var r, g, b;
  var i;
  var f, p, q, t;
 
  // Make sure our arguments stay in-range
  h = Math.max(0, Math.min(360, h));
  s = Math.max(0, Math.min(100, s));
  v = Math.max(0, Math.min(100, v));
 
  // We accept saturation and value arguments from 0 to 100 because that's
  // how Photoshop represents those values. Internally, however, the
  // saturation and value are calculated from a range of 0 to 1. We make
  // That conversion here.
  s /= 100;
  v /= 100;
 
  if(s == 0) {
    // Achromatic (grey)
    r = g = b = v;
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
 
  h /= 60; // sector 0 to 5
  i = Math.floor(h);
  f = h - i; // factorial part of h
  p = v * (1 - s);
  q = v * (1 - s * f);
  t = v * (1 - s * (1 - f));
 
  switch(i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
 
    case 1:
      r = q;
      g = v;
      b = p;
      break;
 
    case 2:
      r = p;
      g = v;
      b = t;
      break;
 
    case 3:
      r = p;
      g = q;
      b = v;
      break;
 
    case 4:
      r = t;
      g = p;
      b = v;
      break;
 
    default: // case 5:
      r = v;
      g = p;
      b = q;
  }
  
  

function hex(v)
{
    str = "0000"+Math.floor(v*255).toString(16);
    return str.substr(-2, 2);
}
 
  return hex(r)+hex(g)+hex(b);
}

function pcolor(p)
{
                 s = 20;
                 v = 100;
                 h = 0;
                 if (p>=100)
                    {
                    s = 30+(p-100)/100*50; // 30+50=80 at 200%
                    h = 120-(p-100)/100*120; //0 at 200%
                    v = 100;
                    }
                 else
                    {
                    s = 30-(100-p)/100*20; // 30-20=10 at 0%
                    h = 120-(100-p)/100*120; //0 at 0%
                    v = 100;
                    }
                 if (s<0) s = 0;
                 if (s>100) s = 100;
                 if (h<0) h = 0;                                       
                 return "#"+hsv2rgb(h, s, v);
}
*/


function adddays(date, days) {
    var d = new Date(date);
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    return d;
}

function isodate(date) { // YYYY-MM-DD
    var d = new Date(date);
    return d.toISOString().substr(0, 10);
}

function monthname(num) {
    var name = ["NULL", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return name[parseInt(num)];
}

function cleanup(str) {
    return str.split("\r").join(" ").split("\n").join(" ").split("\t").join(" ").split("  ").join(" ").split(" -").join("-").split("- ").join("-");
}

function wfsitelink(siteid, label, date, days, today) {
    url = "";
    var site = returnSiteByID(siteid);
    if (site) {
        var mode = site.mode;
        var stamp = new Date().getTime();
        var id = siteid.split(":")[1];

        var u = 1;
        if (days > 7 && site.urls.length > 2) u = 2;
        if (days > 30 && site.urls.length > 3) u = 3;
        var d2 = new Date(date), d1 = adddays(d2, -days);
        url = site.urls[u].split("%id").join(id).split("%lid").join(id.toLowerCase());
        var modes = mode.split(";")[0].split("=");
        if (modes.length > 1)
            url = url.split("%modeb").join(modes[1]);
        url = url.split("%mode").join(modes[0]);
        var date = isodate(d1);
        if (url.indexOf("%YYYY") < 0 && !today) {
            // disable link
            url = "";
        } else {
            // enable popup link
            url = url.replace("%YYYY1", date.substr(0, 4)).replace("%MM1", date.substr(5, 2))
                .replace("%DD1", date.substr(8, 2)).replace("%MT1", monthname(date.substr(5, 2)))
                .replace("%stamp", stamp);
            var date = isodate(d2);
            url = url.replace("%YYYY2", date.substr(0, 4)).replace("%MM2", date.substr(5, 2))
                .replace("%DD2", date.substr(8, 2)).replace("%MT2", monthname(date.substr(5, 2)))
                .replace("%stamp", stamp);
        }
    }

    return sitelink(siteid, label, url);
}


// load waterflow
var oldrow;
var forecast = [];
var watershowchk = false;
var watershowclass = "watershow";

function togglewatershowchk(id) {
    watershowchk = ! watershowchk;
    var tr = document.getElementsByClassName(watershowclass);
    for (var i = 0; i < tr.length; ++i)
        tr[i].style.display = watershowchk ? "table-row" : "none";
}

function waterflow() {
    var TODAY = 'T';
    var downloadth = 4;
    var wfwatershed = window.location.href.toString().indexOf('watershed=on') >= 0; // || url.indexOf('http')<0;
    var wflog = window.location.href.toString().indexOf('debug=log') >= 0; // || url.indexOf('http')<0;
    var wftest = window.location.href.toString().indexOf('debug=test') >= 0; // || url.indexOf('http')<0;
    var wfnousgs = window.location.href.toString().indexOf('debug=nousgs') >= 0; // || url.indexOf('http')<0;
    var wfallusgs = window.location.href.toString().indexOf('debug=allusgs') >= 0; // || url.indexOf('http')<0;
    var wflocal = window.location.href.toString().indexOf('debug=local') >= 0; // || url.indexOf('http')<0;
    if (window.location.href.toString().indexOf('debug=noth') >= 0)
        downloadth = 1;

    function isloading(str) { return str.indexOf('img') >= 0; }

    var loading = "<img height=12 src='" + SITE_BASE_URL + "/extensions/PageForms/skins/loading.gif'/>";
    var firstcoldate = 3;

    var table = document.getElementById('waterflow-table');
    if (!table) return;

    if (wfwatershed) {
        var ths = table.getElementsByTagName('TH');
        var newth = document.createElement('th');
        newth.innerHTML = "TODAY CFS<br>(from AvgFlow)";
        newth.style.fontSize = "small";
        ths[firstcoldate].parentNode.insertBefore(newth, ths[firstcoldate]);
        ++downloadth;
        ++firstcoldate;
    }

    var box = document.getElementById('kmlrect');
    var boxrect = cleanup(box.innerHTML).split(" ").join("").split(",");
    if (!box) return;
    var center = document.getElementById('kmlmarker');
    if (!center) return;
    var latlng = center.innerHTML.split(',');
    loc = { lat: latlng[0], lng: latlng[1] };
    var wficonlist;
    var kmlicons = document.getElementById("kmlicons");
    if (kmlicons != null)
        wficonlist = kmlicons.innerHTML.split(',');

    // set scale  
    var pscale = [];
    var waterscale = document.getElementById("waterscale");
    var td = waterscale.getElementsByTagName('TD');
    var th = waterscale.getElementsByTagName('TH');
    for (var i = 0; i < td.length; ++i) {
        var str = td[i].innerHTML;
        var vals = str.split(';').join('-').split('-');
        var l = parseInt(vals[0]);
        var h = parseInt(vals[1]);
        var avg = (l + h) / 2;
        var text = th[i].innerHTML;
        var regex = /(<([^>]+)>)/ig
        var text = text.replace(regex, "");
        var errl = l - 10; //Math.min(10,Math.max(20, (avg - l)/2));
        var errh = h + 10; //Math.min(10,Math.max(20, (h - avg)/2));
        if (i == 7) // Extreme
            avg = l = !isNaN(h) ? h : l, h = 1e10, errl = l - 10, errh = h + 10;
        if (isNaN(h) || isNaN(l))
            avg = 100, l = errl = 0, h = errh = 100;

        pscale.push({ h: h, l: l, avg: avg, errh: errh, errl: errl, text: text, rgb: td[i].style.backgroundColor });
        console.log("p" + i + " ~" + avg + " [" + l + " - " + h + "] [" + errl + " - " + errh + "] " + text);
    }

    var th = table.getElementsByTagName('TH');

    // set up reference headers
    var refcnt = 0;
    for (var d = firstcoldate + 1; d < th.length; ++d)
        th[d].pscale = -1;
    for (var rd = 0; rd < pscale.length; ++rd)
        for (var d = firstcoldate + 1; d < th.length; ++d) {
            var thi = ">" + th[d].innerHTML + "<";
            if (thi.indexOf(">" + pscale[rd].text + "<") >= 0)
                th[d].pscale = rd, ++refcnt; // pscale value
        }

    // set alternate reference
    var refalt = ['Smiley5.png', 'Smiley4.png', 'Smiley3.png', 'Smiley2.png', 'Smiley1.png', 'Smiley0.png'];
    for (var rd = 0; rd < refalt.length && !refcnt; ++rd)
        for (var d = firstcoldate + 1; d < th.length; ++d) {
            var thi = ">" + th[d].innerHTML + "<";
            if (thi.indexOf(refalt[d]) >= 0)
                th[d].pscale = 3, ++refcnt; // Moderate 100%
        }

    // set dates
    var datesid = [];
    for (var i = 0; i < th.length; ++i)
        if (th[i].id != null && th[i].id != "") {
            th[i].id = isodate(th[i].id.split("_").join(" "));
            if (th[i].className == 'rwwarning') {
                th[i].id = isodate(Date());
                th[i].onclick = function() { alert("Your computer says TODAY is\n" + Date().toString()) };
                th[i].style.cursor = 'pointer';
                //th[i].title = "Your computer says TODAY is\n"+Date().toString();
            }
            if (th[i].title.substr(0, 5) == 'http:') {
                var str = th[i].innerHTML;
                th[i].innerHTML = aref(th[i].title,
                    str /*+'<img src="'+SITE_BASE_URL+'/images/8/80/Camera.png" style="vertical-align:middle"/>'*/,
                    th[i].title,
                    ' target="_blank"');
            }
            // make list of unique dates
            if (datesid.indexOf(th[i].id) < 0)
                datesid.push(th[i].id)
        }

    if (wfallusgs)
        datesid.push(datesid[0] + 'A');

    if (!wftest && !wfnousgs) // turn USGS ON/OFF
    {
        //
        // USGS 
        //
        var usgsurl = [
            "https://waterdata.usgs.gov/monitoring-location/%id/#parameterCode=00060",
            "https://nwis.waterdata.usgs.gov/nwis/uv/?format=img_stats&site_no=%id&begin_date=%YYYY1%MM1%DD1&end_date=%YYYY2%MM2%DD2",
            "https://waterdata.usgs.gov/nwis/dv/?format=img_stats&site_no=%id&begin_date=%YYYY1%MM1%DD1&end_date=%YYYY2%MM2%DD2"
        ];

        function rnd(x) {
            return Math.round(x * 1e6) / 1e6;
        }

        var best3 = true;

        function usgsgetval(date, today, imode) {
            var stamp = "";
            var dayms = 24 * 60 * 60 * 1000;
            var dates = "&startDT=" + date + "&endDT=" + date;
            if (today) {
                dates = "";
            } else if (date.substr(-1, 1) == 'A') {
                var numdays = 5 * 365;
                var end = new Date(), start = new Date();
                start.setTime(end.getTime() - (numdays * dayms));
                var sdate = start.toISOString().substr(0, 10);
                var edate = end.toISOString().substr(0, 10);
                dates = "&startDT=" + sdate + "&endDT=" + edate;
            } else if (best3) {
                // 3 day average to avoid jumps    
                var ddate = new Date(date);
                var end = new Date(), start = new Date();
                start.setTime(ddate.getTime() - dayms);
                end.setTime(ddate.getTime() + dayms);
                var sdate = start.toISOString().substr(0, 10);
                var edate = end.toISOString().substr(0, 10);
                dates = "&startDT=" + sdate + "&endDT=" + edate;
            }

            var usgsrect = [rnd(boxrect[1]), rnd(boxrect[0]), rnd(boxrect[3]), rnd(boxrect[2])];
            var url = "https://waterservices.usgs.gov/nwis/" +
                (imode ? "iv" : "dv") +
                "/?format=json&bBox=" +
                usgsrect.join(",") +
                dates;
            url += "&parameterCd=00060,00065,00010" + stamp;

            $.getJSON(url,
                function(data) {

                    var sitelist = [];
                    var ts = data.value.timeSeries;

                    for (var i = 0; i < ts.length; ++i) {
                        var siteid = "USGS:" + ts[i].sourceInfo.siteCode[0].value;
                        if (returnSiteByID(siteid) == null) {
                            var sitename = ts[i].sourceInfo.siteName;
                            sitename = sitename.split(' A ').join(' AT ').split(' NEAR ').join(' NR ');
                            addsite(siteid,
                                sitename,
                                ts[i].sourceInfo.geoLocation.geogLocation.latitude,
                                ts[i].sourceInfo.geoLocation.geogLocation.longitude,
                                "",
                                "cfs/ft/C,600,500",
                                usgsurl,
                                -1);
                        }

                        var s;
                        for (s = 0; s < sitelist.length && sitelist[s].id != siteid; ++s);
                        if (s >= sitelist.length)
                            sitelist.push({ id: siteid });

                        if (ts[i].values.length > 0)
                            if (ts[i].values[0].value.length > 0) {
                                // compute days
                                var vlist = ts[i].values[0].value;

                                // single day
                                var last = vlist.length - 1;
                                var v = vlist[last].value;
                                var vdate = vlist[last].dateTime.substr(0, 10);
                                var vc = v >= 0;

                                // 3 days
                                var v3 = [-1, -1, -1];
                                if (best3) {
                                    vc = 0;
                                    var vd, vsum = 0, vcnt = 0;
                                    for (var vi = 0; vi <= vlist.length; ++vi) {
                                        var v = -1, vdate = 'LAST'
                                        if (vi < vlist.length)
                                            v = vlist[vi].value, vdate = vlist[vi].dateTime.substr(0, 10);
                                        if (vi == 0)
                                            vd = vdate;
                                        if (vd != '' && vdate != '' && vd != vdate) {
                                            // accumulate value
                                            if (vcnt > 0) {
                                                var days = (new Date(vd) - new Date(date)) / dayms;
                                                if (!isNaN(days)) {
                                                    if (days == 0)
                                                        v3[0] = vsum / vcnt, ++vc;
                                                    if (days == -1)
                                                        v3[1] = vsum / vcnt, ++vc;
                                                    if (days == 1)
                                                        v3[2] = vsum / vcnt, ++vc;
                                                }
                                            }
                                            vd = vdate, vcnt = vsum = 0;
                                        }
                                        // process value
                                        if (v >= 0)
                                            vsum += v, ++vcnt;
                                    }
                                    if (today) // future value is latest value
                                        v3[0] = v3[1] = v3[2] = vlist[vlist.length - 1].value;
                                    vdate = date;
                                }
                                if (vc > 0)
                                    if (ts[i].variable.variableCode[0].value == "00065") {
                                        sitelist[s].G = best3 ? v3.join('|') : v;
                                        sitelist[s].Gdate = vdate;
                                    } else if (ts[i].variable.variableCode[0].value == "00010") {
                                        sitelist[s].T = best3 ? v3.join('|') : v;
                                        sitelist[s].Tdate = vdate;
                                    } else {
                                        sitelist[s].Q = best3 ? v3.join('|') : v;
                                        sitelist[s].Qdate = vdate;
                                    }
                            }
                    }

                    for (var i = 0; i < sitelist.length; ++i) {
                        var val = [];
                        if (typeof sitelist[i].Qdate != "undefined")
                            val.push(sitelist[i].Qdate);
                        else if (typeof sitelist[i].Gdate != "undefined")
                            val.push(sitelist[i].Gdate);
                        else
                            continue;

                        // check today is within range
                        if (today) {
                            var d = (new Date(date).getTime() - new Date(val[0]).getTime()) / 1000 / 60 / 60 / 24;
                            if (isNaN(d) || d > 1)
                                continue;
                            val[0] = date;
                        }

                        if (typeof sitelist[i].Q != "undefined")
                            val.push(sitelist[i].Q);
                        else
                            val.push("");

                        if (typeof sitelist[i].G != "undefined")
                            val.push(sitelist[i].G);
                        else
                            val.push("");

                        if (typeof sitelist[i].T != "undefined")
                            val.push(sitelist[i].T);
                        else
                            val.push("");

                        if (today) {
                            var test = 1 + 3;
                        }
                        if (!today) {
                            var test = 1 + 3;
                        }
                        addval(sitelist[i].id, val);
                    }

                    usgs.error = false;
                }).always(function() {
                if (sitecountdown(usgs, -1)) {
                    // compute reference
                    for (var i = 0; i < sites.length; ++i)
                        if (sites[i].counter == -1)
                            datecountdown(sites[i].id, 1);
                }
            });
        }

        var usgs = { counter: 0, name: "USGS", error: true };
        sitecountdown(usgs, datesid.length);
        for (var i = 0; i < datesid.length; ++i) {
            if (i == 0)
                usgsgetval(datesid[i], true, true)
            else
                usgsgetval(datesid[i], false, false);
        }
    }

    var pointwatershed;
    var watersheds = [];

    {
        //
        // WF SERVER
        // MISC PROVIDERS
        //
        //sitecountdown(-1);
        //url = LUCA_BASE_URL + "/rwwf?html=https://cdec.water.ca.gov/cgi-progs/staSearch?staid=sensor_chk=on&sensor=20&active_chk=on&active=Y&loc_chk=on&lon1=-119.24328&lon2=-118.34252&lat1=36.191&lat2=36.9146&elev1=-5&elev2=99000&ext=.json";
        var misc = { counter: 0, name: "OTHER", error: true };
        //var preurl = LUCA_BASE_URL + "/rwwf?waterflow=";
        var location = urlget(window.location.href.toString(), "location=", "");
        var preurl = wflocal ? PROTOCOL + "localhost/rwr?waterflow=" : LUCA_BASE_URL + "/rwr?waterflow=";
        if (wftest) preurl += "&wftest=on";
        if (wflog) preurl += "&wflog=on";
        var preurld = preurl;

        var winfo = document.getElementById('winfo');
        if (winfo) {
            var url = preurl + "&winfo=" + center.innerHTML;

            $.getJSON(url,
                function(data) {

                    // load sites
                    var sum = "";
                    var list = data.list; //data.split('/cgi-progs/staMeta?station_id=');
                    if (list.length > 0) {
                        var str = pointwatershed = list[0];
                        /*
                        var s = str.indexOf(' Avg');
                        if (s>=0) 
                                {
                                str1 = str.substring(0,s);
                                str2 = str.substring(s);
                                str = str1+"</span><br><span>Annual Average: "+str2;
                                }
                        var s = str.indexOf(':',str.indexOf('Drain'));
                        if (s>=0)
                            str = str.substring(s+1);
                        */
                        ;
                        sum += "<span>" + str + "</span>";
                    }
                    if (list.length > 1)
                        sum += " " + aref(list[1], "more", "more", ' target="_blank"');
                    winfo.innerHTML = sum.length > 0 ? sum : "N/A";
                });
        }

/*
 // insert link to download KML 
 var kmlurl = preurl+"wfkmlrect="+boxrect.join();
 var kmllink = document.createElement("DIV");
 kmllink.innerHTML = '<a title="Download KML" href="'+kmlurl+'">Download KML</a>';
 var inselem = document.getElementById("mapbox");
 if (inselem) inselem = inselem.nextSibling;
 if (inselem) inselem.parentNode.insertBefore(kmllink, inselem);
*/

        function miscgetforecast() {
            var url = preurl + "&wffrect=" + boxrect.join();

            $.getJSON(url,
                function(data) {

                    // load sites
                    var sitelist = [];
                    var list = data.list; //data.split('/cgi-progs/staMeta?station_id=');
                    for (i = 0; i < list.length; ++i) {
                        var line = list[i].split(",");
                        forecast.push({ id: line[0], url: line[5] });
                    }

                    for (i = 0; i < forecast.length; ++i) {
                        var site = returnSiteByID(forecast[i].id);
                        if (!site)
                            continue;

                        //matched site
                        // if already processed, add now
                        if (site.counter == 0) {
                            var cell;
                            row = document.getElementById(site.id);
                            var cols = row.childNodes;
                            addforecast(cols[firstcoldate], site.id);
                        }
                    }
                });
        }

        miscgetforecast();

/*
 function miscgetval(siteid, date, today) 
 {
       //var stamp = "&stamp="+new Date().getTime();
       var url = (today ? preurld : preurl) + "&wfid="+siteid+"&wfdates="+date+(today ? TODAY : "");
       //console.log(siteid+"x"+date+": "+url);
       $.getJSON(url, function(data) {
         
         var list = data.list;         
         for(i=0; i<list.length; ++i)
            addval(siteid, list[i].split(','));
        }).always(function() {
          datecountdown(siteid, -1);
        });      
 }

 function miscgetsitelist(sitelist)
 {
       site = sitelist.shift();
       if (!site)
          return;
  
       var today = false;
       miscgetval(site.id, datesid[0], !today) 
       //var stamp = "&stamp="+new Date().getTime();
       var date = today ? datesid[0]+TODAY : datesid.slice(1).join(",");       
       var url = (today ? preurld : preurl) + "&wfid="+site.id+"&wfdates="+date;
       //console.log(site.id+"x"+date+": "+url);
       $.getJSON(url, function(data) {
         
         var list = data.list;         
         for(i=0; i<list.length; ++i)
            addval(site.id, list[i].split(','));
        }).always(function() {
          datecountdown(site.id, -1);
          miscgetsitelist(sitelist, today);
        });  
 }
*/

        function miscgetvalmulti2(val, vallist) {
            if (!val || val.datelist.length == 0)
                val = vallist.shift();
            if (!val)
                return;


            // request all dates at once
            //var stamp = "&stamp="+new Date().getTime();
            var url = (val.cnt == 0 ? preurld : preurl) + "&wfid=" + val.siteid + "&wfdates=" + val.datelist.join(',');
            date = val.datelist.shift();

            $.getJSON(url,
                function(data) {

                    var list = data.list;
                    for (i = 0; i < list.length; ++i) {
                        var line = list[i].split(',');
                        addval(val.siteid, line);
                        // delete from list of pending dates
                        do {
                            var d = val.datelist.indexOf(line[0].substr(0, 10));
                            if (d >= 0) {
                                val.datelist.splice(d, 1);
                                datecountdown(val.siteid, -1);
                            }
                        } while (d >= 0)
                    }
                }).always(function() {
                datecountdown(val.siteid, -1);
                miscgetvalmulti2(val, vallist);
            });
        }

        function miscgetvalmulti(vallist) {
            var val = vallist.shift();
            if (!val)
                return;

            var url = (val.today ? preurld : preurl) +
                "&wfid=" +
                val.siteid +
                "&wfdates=" +
                val.date +
                (val.today ? TODAY : "");

            $.getJSON(url,
                function(data) {

                    var list = data.list;
                    for (i = 0; i < list.length; ++i)
                        addval(val.siteid, list[i].split(','));
                }).always(function() {
                datecountdown(val.siteid, -1);
                miscgetvalmulti(vallist);
            });
        }

        function geturllist(id, urllist) {
            var grp = id.split(":")[0];
            for (var i = 0; i < urllist.length; ++i)
                if (urllist[i][0] == grp)
                    return i;
            return -1;
        }

        function miscgetsites(multi) {
            sitecountdown(misc, 1);
            var url = preurl + "&wflocation=" + urlencode(location) + "&wfrect=" + boxrect.join();

            $.getJSON(url,
                function(data) {

                    // load sites
                    var sitelist = [];
                    var list = data.list; //data.split('/cgi-progs/staMeta?station_id=');
                    for (i = 0; i < list.length; ++i) {
                        var line = list[i].split(",");
                        if (line.length > 9)
                            watersheds.push({ id: line[0], watershed: line[9].replace(" AvgFlow", "<br>AvgFlow") });
                        if (isprov(line[0], 'USGS'))
                            continue;
                        var counter = multi > 0 ? datesid.length : (datesid.length > 1 ? 2 : 1);
                        var grp = geturllist(line[0], data.urllist);
                        var urls = data.urllist[grp], nurls = [];
                        for (var u = 2; u < urls.length; ++u)
                            nurls.push(urls[u]);

                        var site = addsite(line[0],
                            line[1],
                            line[2],
                            line[3],
                            line[4],
                            data.urllist[grp][1],
                            nurls,
                            counter);
                        sitelist.push(site);
                    }

                    // sort by distance
                    sitelist.sort(function(a, b) { return a.dist - b.dist });

                    if (multi == 2) {
                        var vallist = [];
                        for (i = 0; i < sitelist.length; ++i) {
                            var datelist = [];
                            for (d = 0; d < datesid.length; ++d)
                                datelist.push(datesid[d] + (d == 0 ? TODAY : ""));
                            vallist.push({ siteid: sitelist[i].id, datelist: datelist });
                        }
                        for (t = 0; t < downloadth; ++t) {
                            setTimeout(function() {
                                    miscgetvalmulti2(null, vallist);
                                },
                                t * 500);
                        }
                    }
                    if (multi == 1) {
                        var vallist = [];
                        for (i = 0; i < sitelist.length; ++i)
                            for (d = 0; d < datesid.length; ++d)
                                vallist.push({ siteid: sitelist[i].id, date: datesid[d], today: d == 0 });
                        for (t = 0; t < downloadth; ++t) {
                            setTimeout(function() {
                                    miscgetvalmulti(vallist);
                                },
                                t * 500);
                        }
                    }


                    // all is good
                    misc.error = false;
                }).always(function() {

                if (sitecountdown(misc, -1)) {
                }
            });
        }

        miscgetsites(2);
    }


    // === Waterflow aux functions

    function finddate(date) {
        var oneday = 24 * 60 * 60 * 1000;
        var ddmin = 3 * oneday;
        var dmin = -1;
        var dmr = new Date(date).getTime();
        for (d = 0; d < datesid.length; ++d) {
            var dm = new Date(datesid[d]).getTime();
            var dd = (dm - dmr);
            if (dd == 0)
                return d;
            if (dd < 0) dd = -dd;
            if (dd < ddmin) {
                ddmin = dd;
                dmin = d;
            }
        }

        // max 1 day difference    
        if (ddmin / oneday > 1 || dmin < 0) {
            console.log("!dmatch");
            return -1;
        }

        return dmin;
    }

    function valrnd(Q) {
        return Math.floor(Q * 1e2 + 0.5) / 1e2;
    }

    function addval(siteid, val) {
        if (val.length < 2)
            return;
        var site = returnSiteByID(siteid);
        var dmatch = finddate(val[0].substr(0, 10));
        if (dmatch >= 0) {
            var cells = document.getElementsByClassName(datesid[dmatch] + "x" + siteid);
            for (c = 0; c < cells.length; ++c)
                if (isloading(cells[c].innerHTML)) {
                    var Q3 = [-1, -1, -1, -1, -1];
                    var G3 = [-1, -1, -1, -1, -1];
                    var str = "";
                    if (site.units.length > 0 && val.length > 1 && val[1] != "") {
                        var m3_to_cfs = 35.3146662127;
                        var val3 = val[1].split('|');
                        for (var v3 = 0; v3 < val3.length; ++v3) {
                            var Q = parseFloat(val3[v3]);
                            if (site.units[0] != 'cfs')
                                Q = Q * m3_to_cfs;
                            if (metric)
                                Q = Q / m3_to_cfs;
                            if (Q >= 0)
                                Q3[v3] = valrnd(Q);
                        }
                        var Q = Q3[0];
                        if (Q >= 0) {
                            str += Q + (metric ? 'm3s' : 'cfs');
                            if (Q3[1] >= 0) Q3[3] = valrnd((Q + Q3[1]) / 2);
                            if (Q3[2] >= 0) Q3[4] = valrnd((Q + Q3[2]) / 2);
                        }
                        if (val[0].length > 10 && val[0][10] != 'T')
                            str += '<sub>' + val[0][10].toLowerCase() + '</sub>';
                    }
                    if (site.units.length > 1 && val.length > 2 && val[2] != "") {
                        var m_to_ft = 3.28084;
                        var val3 = val[2].split('|');
                        for (var v3 = 0; v3 < val3.length; ++v3) {
                            var G = parseFloat(val3[v3]);
                            if (site.units[1] != 'ft')
                                G = G * m_to_ft;
                            if (metric)
                                G = G / m_to_ft;
                            if (G >= 0)
                                G3[v3] = valrnd(G);
                        }
                        var G = G3[0];
                        if (G >= 0) {
                            str += ' ';
                            str += G + (metric ? 'm' : 'ft');
                            if (G3[1] >= 0) G3[3] = valrnd((G + G3[1]) / 2);
                            if (G3[2] >= 0) G3[4] = valrnd((G + G3[2]) / 2);
                        }
                    }
                    if (site.units.length > 2 && val.length > 3 && val[3] != "") {
                        var T = parseFloat(val[3]);
                        if (site.units[2] != 'F')
                            T = T * 9 / 5 + 32;
                        if (metric)
                            T = (T - 32) * 5 / 9;
                        str += ' ';
                        str += Math.floor(T * 1e0 + 0.5) / 1e0 + "&deg;" + (metric ? 'C' : 'F');
                    }
                    cells[c].innerHTML = str;
                    cells[c].QG = [Q3, G3];
                }
        }
    }

    var statuslabel = "<br>Currently: ";
    var statusloading = "%DATA%";

    function isprov(id, prov) {
        return id.substr(0, prov.length + 1) == prov + ':'
    }

    function addsite(id, name, lat, lng, mode, conf, urls, datecounter) {
        sites.push({ id: id });
        var site = returnSiteByID(id);

        site.name = cleanup(name).toUpperCase();
        site.loc = { lat: parseFloat(cleanup(lat.toString())), lng: parseFloat(cleanup(lng.toString())) };
        var cfg = conf.split(",");
        site.units = cfg[0].split('/')
        site.pwidth = cfg[1];
        site.pheight = cfg[2];
        site.urls = urls;
        site.dist = Math.round(distance(site.loc, loc) * 10) / 10;
        // give first priority to USGS, last priority to DF
        if (isprov(id, 'DF')) site.dist += 0.03;
        if (isprov(id, 'USGS')) site.dist -= 0.03;

        site.counter = datecounter;
        site.mode = mode;
        site.icon = 0;
        site.status = statusloading;
        site.sorted = -100;
        site.p = -1;

        var newrow = document.createElement("TR");
        newrow.id = site.id;
        // insert in proper order
        var before = null;
        var rows = table.childNodes;
        for (r = 1; !before && r < rows.length; ++r)
            if (returnSiteByID(rows[r].id).dist > site.dist)
                before = rows[r];
        table.insertBefore(newrow, before);

        // add cols/rows
        var br = "<br>";
        var th = table.getElementsByTagName('TH');
        for (c = 0; c < th.length; ++c) {
            var newcol = null;
            switch (c) {
            case 0:
                newcol = document.createElement("TD");
                newcol.innerHTML = pinicon(site.id, wficonlist[0]) + sitelink(site.id, site.id);
                break;
            case 1:
                newcol = document.createElement("TD");
                var wdiv = "<div id='" + site.id + "watershed' style='font-size:x-small'></div>";
                newcol.innerHTML = "<div style='font-size:small;white-space:normal'>" + site.name + wdiv + "</div>";
                newcol.style.cssText = "white-space: normal;"
                break;
            case 2:
                newcol = document.createElement("TD");
                newcol.innerHTML = miStr(site.dist);
                break;
            default:
                newcol = document.createElement("TD");
                if (c >= firstcoldate) {
                    newcol.className = th[c].id + "x" + site.id;
                    newcol.style.cssText = "text-align:center; white-space: nowrap;"
                    newcol.innerHTML = loading;
                }
                break;
            }
            newrow.appendChild(newcol);
        }
        return site;
    }

    function updatemarkers() {
        if (wficonlist.length == 0 || markers.length == 0)
            return;

        for (var i = 0; i < markers.length; ++i) {
            marker = markers[i];
            var site = returnSiteByID(marker.locationData.id);
            if (site) {
                marker.setIcon(waterFlowIcon(wficonlist[site.icon]));
                marker.bindTooltip(marker.getTooltip().getContent().replace(statusloading, site.status))
                marker.bindPopup(marker.getPopup().getContent().replace(statusloading, site.status))
            }
        }
    }

    function findwatershed(id) {
        for (var i = 0; i < watersheds.length; ++i)
            if (watersheds[i].id == id)
                return watersheds[i].watershed;
        return "";
    }

    function updatewatersheds() {
        if (!wfwatershed)
            return;

        var pointCFS = -1;
        if (pointwatershed) {
            var tag = "AvgFlow:";
            var pointflow = pointwatershed.indexOf(tag);
            if (pointflow >= 0)
                pointCFS = parseFloat(pointwatershed.substring(pointflow + tag.length));
        }

        // change marker
        for (var i = 0; i < sites.length; ++i) {
            var site = sites[i];
            if (!site.status)
                continue; // no current flow

            var elem = document.getElementById(site.id + "watershed");
            if (!elem)
                continue; // no wdiv?!?

            var watershed = findwatershed(site.id);
            if (!watershed)
                continue; // no watershed
            elem.innerHTML = watershed;
            var flow = watershed.indexOf(tag);
            if (flow < 0)
                continue; // no AvgFlow

            if (pointCFS <= 0 || isNaN(pointCFS))
                continue; // AvFlow <= 0

            var Q = parseFloat(site.status);
            if (Q < 0 || isNaN(Q))
                continue; // Q no good

            var CFS = parseFloat(watershed.substring(flow + tag.length));
            if (CFS <= 0 || isNaN(CFS))
                continue; // AvFlow <= 0

            // Finally!!! CFS vs pointCFS
            var row = document.getElementById(site.id);
            if (!row || row.children.length < firstcoldate)
                continue;
            var cell = row.children[firstcoldate - 1]
            cell.style.fontSize = "small";
            cell.innerHTML = valrnd(Q * pointCFS / CFS) + (metric ? 'm3s' : 'cfs') + "?";
        }
    }

    function sitecountdown(site, val) {
        site.counter += val;
        var msg = document.getElementById(site.name);
        if (msg) {
            msg.innerHTML = (site.counter > 0)
                ? '<img height=12 src="' + SITE_BASE_URL + '/extensions/PageForms/skins/loading.gif"/>' + site.name
                : (site.error
                    ? '<img height=12 src="' + SITE_BASE_URL +'/images/8/87/Vxx.png"/>' +
                    '<span style="color:red">' +
                    site.name +
                    '</span>'
                    : '');
            msg.style.fontSize = 12;
            msg.style.verticalAlign = "middle";
        }

        if (site.counter != 0)
            return false;

        // add to map
        var list = [];
        for (c = 0; c < sites.length; ++c)
            list.push({
                id: sites[c].id,
                location: sites[c].loc,
                zindex: sites[c].icon,
                icon: wficonlist[sites[c].icon],
                description: sites[c].name.split(",").join(" ").split(";").join(" ") + statuslabel + statusloading
            });
        if (map != null) {
            loadRWResultsListIntoMap(list);
            updatemarkers();
        }

        updatewatersheds();
        return true;
    }

    function addforecast(cell, id) {
        for (var i = 0; i < forecast.length; ++i)
            if (forecast[i].id == id) {
                var list = [];
                var urlp = forecast[i].url.split(";");
                for (var p = 0; p < urlp.length; ++p)
                    list.push("<span>" + sitelink(id, p == 0 ? "FORECAST" : "+", urlp[p]) + "</span>");
                cell.innerHTML += "<br>" + list.join(" - ");
                return;
            }
    }

    function datecountdown(siteid, val) {
        site = returnSiteByID(siteid);
        if (site == null)
            return;

        site.counter += val;
        if (site.counter != 0)
            return;

        var cell;

        // process row
        row = document.getElementById(site.id);
        var cols = row.childNodes;
        var th = table.getElementsByTagName('TH');
/*
      for (ic=0; ic<children.length; ++ic)
        if (children[ic].className!="")
           cols.push(children[ic]);         
*/

        th[firstcoldate].style.cssText = "color: #FF0000";
        if (cols.length != th.length)
            console.log("column incongruency");

        /*
        var Ge=0;
        if (GGref.length>=3)
          {
          // compute Ge & Gc as per http://pubs.usgs.gov/twri/twri3-a10/pdf/TWRI_3-A10.pdf
          var G1 = GGref[0], G2= GGref[1], G3= GGref[2];
          Ge = (G1*G2-G3*G3)/(G1+G2-2*G3);
          }
        var Gc = -1, Ge = -1;
        if (QGref.length>=3)
          {
          // compute Ge & Gc as per http://pubs.usgs.gov/twri/twri3-a10/pdf/TWRI_3-A10.pdf
          var G1 = QGref[0].G, G2= QGref[1].G, G3= QGref[2].G;
          var Q1 = QGref[0].Q, Q2= QGref[1].Q;
          Ge = (G1*G2-G3*G3)/(G1+G2-2*G3);
          Gc = (Math.log(Q2)-Math.log(Q1))*(Math.log(G3-Ge)-Math.log(G1-Ge)) / (Math.log(G2-Ge)-Math.log(G1-Ge));
          }
        */
        // Q = c*G^b => G = (Q/c)^-b => G1/G2 = (Q1/Q2)^1/b

        function calcp(c, refindex, refindex2A, refindex2B, v3, QG) {

            if (validQG(c, v3, QG) && validQG(refindex, v3, QG)) {
                // volume -> normalized area pressure
                var bnorm = 1.5; // default normalization
                var refindex2 = cols[c].QG[QG][v3] < cols[refindex].QG[QG][v3] ? refindex2B : refindex2A;
                if (refindex != refindex2 && validQG(refindex2, v3, QG)) // custom normalization
                {
                    var div = Math.log(pscale[th[refindex2].pscale].avg / pscale[th[refindex].pscale].avg);
                    var b = Math.log(cols[refindex2].QG[QG][v3] / cols[refindex].QG[QG][v3]) / div;
                    if (div > 0 && b > 0) bnorm = b;
                }
                return Math.round(Math.pow(cols[c].QG[QG][v3] / cols[refindex].QG[QG][v3], 1 / bnorm) *
                    pscale[th[refindex].pscale].avg);
            }
            return -1;
        }

        function validQG(ref, v3, QG) {
            if (ref <= 0) return false;
            var c = cols[ref];
            return c.QG && v3 < c.QG[QG].length && c.QG[QG][v3] >= 0; //!isNaN(cols[ref].Q[v3]) && 
        }

        function validref(ref) {
            return th[ref].pscale >= 0 && th[ref].pscale <= 6;
        }

        function validrefQG(ref, v3, QG) {
            return ref > 0 && validref(ref) && validQG(ref, v3, QG);
        }

        function scorep(ref, ref2, ref3, v3, QG) {
            var cnt = 0, sum = 0, mul = 1, sum2 = 0;
            for (var d = firstcoldate + 1; d < th.length; ++d) {
                var extreme = th[d].pscale == 7;
                if (validref(d) || extreme) {
                    var diff = 10; // missing reference
                    if (validQG(d, v3, QG)) {
                        // valid reference
                        var pps = pscale[th[d].pscale];
                        var pd = calcp(d, ref, ref2, ref3, v3, QG) - pps.avg;
                        //if (p<pps.errl || p>pps.errh)
                        var div = pd > 0 ? (pps.errh - pps.avg) : (pps.avg - pps.errl);
                        //if (div<0) alert('div<0');           
                        diff = pd / div; // >1 out <1 in               
                    }
                    //sum += diff;
                    //mul *= (1+diff);
                    sum2 += diff * diff;
                    ++cnt;
                }
            }
            if (cnt == 0)
                return 1e100; // no references

            return sum2 / cnt;
        }

        // find best refefences to minimize score
        var minscore = 1e100;
        var fd = firstcoldate + 1;
        var refv3 = 0, refQG = 0, refindex = -1, refindex2 = -1, refindex3 = -1;
        for (var QG = 0; QG < 1 && minscore > 1; ++QG) //Q only
            for (var v3 = 0; v3 < 5 && minscore > 1; ++v3)
                for (var d = fd; d < th.length; ++d)
                    if (validrefQG(d, v3, QG)) {
                        for (var d2 = d; d2 < th.length; ++d2)
                            if (validrefQG(d2, v3, QG)) {
                                for (var d3 = fd; d3 <= d; ++d3)
                                    if (validrefQG(d3, v3, QG)) {
                                        var newscore = scorep(d, d2, d3, v3, QG);
                                        if (newscore < minscore)
                                            minscore = newscore, refindex = d, refindex2 = d2, refindex3 = d3, refv3 =
                                                v3, refQG = QG;
                                    }
                            }
                    }

        //process styles
        var sorted = 0, refs = 0, refpics = 0;

        // calc 100% ref
        for (r = firstcoldate; r < th.length; ++r)
            if (th[r].title != "")
                ++refpics;

        for (r = firstcoldate; r < th.length; ++r) {
            var today = r == firstcoldate;

            // add reference %
            cell = cols[r];
            if (cell == null)
                continue;

            // loading         
            if (isloading(cell.innerHTML))
                cell.innerHTML = "";

            if (today && cell.QG && !isNaN(cell.QG[0][0])) {
                site.status = cell.QG[0][0].toString() + (metric ? 'm3s' : 'cfs');
            }

            if (cell.innerHTML != "" && cell.QG) {
                // compute percent
                var p = calcp(r, refindex, refindex2, refindex3, refv3, refQG);
                if (sorted >= 0 && p >= 0 && th[r].title != "") {
                    var pps = pscale[th[r].pscale];
                    if (p < pps.errl || p > pps.errh)
                        sorted = -3; // diff desc, out of bounds
                    else
                        ++sorted;
                }
                if (p >= 0) {
                    var refstr = '', refv3str = '';
                    var refv3desc = ['', '-1d', '+1d', '-&#189;d', '+&#189;d'];
                    if (refv3 > 0 && r > firstcoldate) // show adjusted value
                    {
                        refv3str += cell.QG[refQG][refv3].toString();
                        refv3str += refQG ? (metric ? 'm' : 'ft') : (metric ? 'm3s' : 'cfs');
                        refv3str += '<sub>' + refv3desc[refv3] + '</sub>';
                        cell.innerHTML = refv3str;
                    }
                    if (refindex3 == r) refstr += '<sub>[</sub>';
                    if (refindex == r) refstr += '<sub>*</sub>';
                    if (refindex2 == r) refstr += '<sub>]</sub>';
                    var str = "<div style='font-size:larger'>" + p + "%" + refstr + "</div>";
                    if (wflog)
                        str += "<div>Q:" +
                            cell.QG[0].join("|") +
                            "</div>" +
                            "<div>G:" +
                            cell.QG[1].join("|") +
                            "</div>"; // debug
                    cell.innerHTML = str + cell.innerHTML;
                    if (r == firstcoldate)
                        site.status = site.status + ' (' + p + '%)';
                    // adjust color scale
                    for (s = 0; s < pscale.length - 1 && p > pscale[s].h; ++s);
                    //console.log("p:"+p+" hsv:"+h+" rgb:"+rgb);
                    cell.style.backgroundColor = pscale[s].rgb;
                }
            }

            if (sorted >= 0 && th[r].title != "")
                if (cell.innerHTML != "")
                    ++refs; // empty references

            // add graph links
            cell.innerHTML += "<br>" +
                wfsitelink(site.id, "7d", th[r].id, 7, today) +
                " - " +
                wfsitelink(site.id, "30d", th[r].id, 30, today) +
                " - " +
                wfsitelink(site.id, "1yr", th[r].id, 365, today);
            if (today)
                addforecast(cell, site.id);
        }

        // style row
        if (cols[firstcoldate].innerHTML.split("<br>")[0].trim() == "") {
            // disabled
            row.style.cssText = "opacity: 0.4; color:#404040";
            row.className = watershowclass;
            site.icon = 1;
            site.sorted = -3;
            if (!watershowchk)
                row.style.display = "none"

            // change hidden counter
            var el = document.getElementById("watershowcounter");
            if (el) el.innerHTML = parseInt(watershowcounter.innerHTML) + 1;
            var el = document.getElementById("watershow");
            if (el) el.style.display = "block";
        } else
        // highlight
        if (sorted > 1) {
            row.style.cssText = "font-weight: bold";
            // compute prediction
            var p = -100;
            var val = cols[firstcoldate].innerHTML.split('>');
            if (val.length > 1) {
                p = parseFloat(val[1]);
                if (isNaN(p))
                    p = -100;
            }
            site.icon = 3;
            site.p = p;
            site.sorted = sorted;
            if (p < 0)
                site.sorted = -4;
        } else {
            row.style.cssText = "color:#404040";
            site.icon = 2;
            site.sorted = -3;
        }

        var icon = row.getElementsByTagName('IMG');
        if (icon.length)
            icon[0].src = wficonlist[site.icon == 1 ? 0 : site.icon];

        // update forecast (multisite)
        var maxsorted = -100;
        for (var c = 0; c < sites.length; c++)
            if (sites[c].sorted > maxsorted)
                maxsorted = sites[c].sorted;

        var color = '#c00000';
        if (maxsorted > 1) {
            // success
            var mindist = 1000;
            var match = 0, matched = -1;
            var minp = 1000, maxp = -1, sump = 0, divp = 0;
            var matchdist = [], matchp = [];
            for (var c = 0; c < sites.length; c++)
                if (sites[c].sorted == maxsorted) {
                    // good forecast sites
                    ++match;
                    if (sites[c].p > maxp) maxp = sites[c].p;
                    if (sites[c].p < minp) minp = sites[c].p;
                    if (sites[c].dist < mindist) {
                        matched = c;
                        mindist = sites[c].dist;
                    }
                    matchp.push(sites[c].p);
                    matchdist.push(sites[c].dist);
                }

            if (oldrow)
                oldrow.style.color = 'black';
            var row = document.getElementById(sites[matched].id);
            row.style.color = color;
            oldrow = row;

            // compute weighted average
            var sump = 0, sumw = 0;
            for (var i = 0; i < matchp.length; ++i) {
                var w = mindist / matchdist[i];
                var w2 = w * w;
                sump += matchp[i] * w2;
                sumw += w2;
            }
            var avgp = sump / sumw;
            var p = sites[matched].p; // closest match

            for (var s = 0; s < pscale.length - 1 && p > pscale[s].h; ++s);
            var text = pscale[s].text;
            var prediction = document.getElementsByClassName('waterflow-prediction');
            for (var pd = 0; pd < prediction.length; ++pd) {
                prediction[pd].innerHTML = text;
                prediction[pd].style.color = color;
            }
            for (var mins = 0; mins < pscale.length - 1 && minp > pscale[mins].h; ++mins);
            for (var maxs = 0; maxs < pscale.length - 1 && maxp > pscale[maxs].h; ++maxs);
            var text = pscale[maxs].text;
            if (maxs != mins)
                text = pscale[mins].text + " to " + pscale[maxs].text;
            var prediction = document.getElementsByClassName('waterflow-explanation');
            for (var pd = 0; pd < prediction.length; ++pd) {
                prediction[pd].innerHTML = " (" + match + " matching sites reporting " + text + ")";
                prediction[pd].style.color = color;
            }
        } else {
            // diagnose failure
            var res = "(unknown error)";
            if (refpics < 2)
                res = " (insufficient reference pics)";
            else if (maxsorted == -1)
                res = " (insufficient gauge data)";
            else if (maxsorted == -2)
                res = " (no proper match found)"; // magnitude
            else if (maxsorted == -3)
                res = " (no match found)"; // order
            var prediction = document.getElementsByClassName('waterflow-explanation');
            for (var pd = 0; pd < prediction.length; ++pd)
                prediction[pd].innerHTML = res;
            var prediction = document.getElementsByClassName('waterflow-prediction');
            for (var pd = 0; pd < prediction.length; ++pd)
                prediction[pd].innerHTML = "unknown";
        }
        updatemarkers();
        updatewatersheds();
    }
}

//waterflow();
