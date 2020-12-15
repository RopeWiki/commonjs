//google maps custom control to select the source of the track data overlayed on the map

const trackSourceControlBasename = "track-source";
var trackSourceDropdownHideTimer = true; //this holds the function, but give it some initial value so it's not undefined

function initTrackSourceControl(selection) {

    //add the general list items
    var entries = [], domains = [];

    selection.forEach(function (link) {
        
        var counter = 0;
        var domain = getdomain(link);
        domains.push(domain);

        for (var d = 0; d < domains.length; ++d) {
            if (domains[d] === domain) ++counter;
        }

        if (counter > 1) domain += "#" + counter;

        const options = {
            basename: trackSourceControlBasename,
            type: domain,
            text: prettyPrint(domain),
            tooltip: "",
            action: function () {
                loadSource(link, domain);
                setDropdownSelection(trackSourceControlBasename, options.type);
            }
        };

        var item = new dropdownItem(options);
        if (link === selection[0]) item.classList.add("selected"); //set first item to 'selected' state
        if (noextraction(link)) item.classList.add("noextraction");

        entries.push(item);
    });

    var big = document.getElementsByTagName('BIG');
    if (big && big.length > 0 && selection.length > 1) {
        var link = urlencode(big[0].innerHTML);
        var domain = "ALL COMBINED";
        
        const options = {
            basename: trackSourceControlBasename,
            type: domain,
            text: prettyPrint(domain),
            tooltip: "",
            action: function () {
                loadSource(link, domain);
                setDropdownSelection(trackSourceControlBasename, options.type);
            }
        };

        entries.push(new dropdownItem(options));
    }

    if (selection.length <= 1) return; //don't create the dropdown if there's only one (or no) beta sites
    
    //assemble the full control
    var dropdownOptions = {
        basename: trackSourceControlBasename,
        gmap: map,
        items: entries,
        position: google.maps.ControlPosition.LEFT_BOTTOM,
        zIndex: 1000,
        dropdownHideTimer: trackSourceDropdownHideTimer,
        bottomUp: true
    }
    createDropdownControl(dropdownOptions);
}

function loadSource(link, domain) {

    gxml.overlayman.Hide();

    var legend = document.getElementById("legend");
    if (legend != null) {
        legend.style.width = "auto";
        legendInitialWidth = 0;
        legendCondensed = false;
    }

    // set up new KML
    var isropewiki = link.includes(SITE_HOSTNAME);
    var kmlfile = link;

    if (!isropewiki)
        kmlfile = LUCA_BASE_URL + '/rwr?gpx=off&filename=tmp&kmlnfx&kmlx=' + kmlfile;

    var kmlfilep = document.getElementById("kmlfilep");
    if (kmlfilep)
        kmlfilep.innerHTML = kmlfile;

    var noex = noextraction(link);

    if (lastlinks.indexOf(link) >= 0) {
        // display pre-loaded kml
        gxml.overlayman.Show(link);
    } else {
        if (!noex) gxml.load(kmlfile, link);
        lastlinks.push(link);
    }

    // display warning or hide it for ropewiki
    var dlist = ["rw", "ex", "noex"];
    var dshow = [isropewiki, !isropewiki && !noex, !isropewiki && noex];

    for (var i = 0; i < dlist.length; ++i) {
        var elem = document.getElementsByClassName('display' + dlist[i]);
        for (var e = 0; e < elem.length; ++e)
            elem[e].style.display = dshow[i] ? "block" : "none";
    }

    // change links
    var dlist2 = ["ex", "noex"];
    for (var i = 0; i < dlist2.length; ++i) {
        var elem = document.getElementsByClassName('display' + dlist2[i]);
        for (var e = 0; e < elem.length; e++) {
            var links = elem[e].getElementsByTagName('A');
            for (var l = 0; l < links.length; ++l) {
                var clink = links[l].href;
                if (clink.indexOf("caltopo.com") > 0) {
                    var prefix = "kmlx%253D";
                    var postfix = "ext%253D.kml";
                    var start = clink.indexOf(prefix);
                    var end = clink.indexOf(postfix, start + 1);
                    links[l].href = clink.substr(0, start + prefix.length) + urlencode(link + '&') + clink.substr(end);
                } else if (clink.indexOf(LUCA_HOSTNAME) > 0) {
                    var prefix = "kmlx%3D";
                    var postfix = "ext%3D.kml";
                    var start = clink.indexOf(prefix);
                    var end = clink.indexOf(postfix, start + 1);
                    links[l].href = clink.substr(0, start + prefix.length) + link + '&' + clink.substr(end);
                } else if (clink.indexOf("/Map?pagename=") < 0) {
                    links[l].href = link;
                    links[l].innerHTML = domain;
                }
            }
        }
    }
}

function noextraction(url) {
    return url.includes("roadtripryan.com");
}

function prettyPrint(url) {
    var name = url;

    if (url.includes("ropewiki"))         name = "Ropewiki";
    if (url.includes("192.168."))         name = "Ropewiki";
    if (url.includes("bluugnome"))        name = "BluuGnome";
    if (url.includes("canyonchronicles")) name = "Canyon Chronicles";
    if (url.includes("hikearizona"))      name = "Hike Arizona";
    if (url.includes("wikiloc"))          name = "Wikiloc";
    if (url.includes("brennen"))          name = "Adventure Hikes";
    if (url.includes("roadtripryan"))     name = "Road Trip Ryan";
    if (url.includes("canyoncollective")) name = "Canyon Collective";
    if (url.includes("onropecanyoneer"))  name = "On Rope";
    if (url.includes("descente-canyon"))  name = "Descente Canyon";
    if (url.includes("carto.net"))        name = "Canyon Carto";

    var multiple = url.indexOf("#");

    if (multiple > 0)
        name += " " + url.substring(multiple);

    return name;
}
