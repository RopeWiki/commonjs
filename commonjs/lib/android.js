function isAndroid() {
    if (typeof Android != "undefined")
        return true;
    if (urlget(window.location.href.toString(), "debugandroid", "") !== "")
        return true;
    return false;
}

function iOS() {
    return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
        // iPad on iOS 13 detection
        ||
        (navigator.userAgent.includes("Mac") && "ontouchend" in document);
}

// TODO: It seems like this function should only be called once per page load, but it's ultimately referenced in two places; check logic accuracy.
function setViewForAndroid() {
    if (!isAndroid())
        return;

    var remove = " .noprint, .gmnoprint, .rwSortIcon, #contentSub, #top, #mw-head-base, #mw-page-base, #mw-navigation, #footer, .popupformlink, .toc, .mw-editsection "; //, #firstHeading,
    var style = " .mw-body { margin:0px !important; padding:5px !important; } body { margin:0px !important; padding:0px !important; }";
    //style += " @media only screen and (max-width: 800px) { .staticmap { width:100% !important; height:auto !important; } }";

    var pinmap = document.getElementsByClassName("pinmap");
    var i;
    for (var i = 0, n = 1; i < pinmap.length; ++i, ++n) {
        var num = n.toString();
        if (num.length < 2) num = "0" + num;
        var str = "#" + num + " " + pinmap[i].innerHTML;
        pinmap[i].innerHTML = str;
    }

    var kmltitle = document.getElementById("kmltitle");
    var size;
    if (kmltitle) {
        size = viewsize();
        remove += " #firstHeading ";
        style += " .kmlmapdisplay { width:" + size + "px !important; height:" + size + "px !important; }";
    }

    var kmlsummary = document.getElementById("kmlsummary");
    if (kmlsummary) {
        size = viewsize();
        remove += " #firstHeading, #displaysummary, ";
        style += " #mapbox { width:" + size + "px !important; height:" + size + "px !important; }";
    }

    var title = $(".tableregion td big");
    if (title.length > 0)
        $('#firstHeading').text($(".tableregion td big").text());

    $('.tableregion').remove();
    var mapmenu = document.getElementById("mapmenu");
    if (mapmenu) {
        var psum = $('a:contains("Printable Summary")');
        var pmap = $('a[href*="/Map?pagename"]');
        var menu = [];
        if (kmlsummary) {
            menu.push('<a class="button-link" href="' + kmlurl(window.location.href.toString()) + '">Open KML</a>');
        } else if (psum.length > 0) {
            $('#mapbox').remove();
            menu.push('<a class="button-link" href="' + psum[0].href + '">View Map</a>');
            menu.push('<a class="button-link" href="' + kmlurl(psum[0].href) + '">Open KML</a>');
        } else if (pmap.length > 0) {
            $('#kmlmapdisplay').remove();
            var elem = $('a:contains("Download KML")')
            if (elem.length > 0) {
                menu.push('<a class="button-link" href="' + pmap[0].href + '">View Map</a>');
                menu.push('<a class="button-link" href="' + elem[0].href + '">Open KML</a>');
            }
        }

        mapmenu.innerHTML = menu.join(" ");
    }

    // erase  {display:none !important; }
    var removelist = remove.split(",").join(" ").split(" ");
    for (i = 0; i < removelist.length; ++i)
        if (removelist[i].length > 0)
            $(removelist[i]).remove();

    // insert in documentc
    var sheet = document.createElement('style');
    sheet.id = 'androidstyle';
    sheet.innerHTML = style;
    document.body.appendChild(sheet);
}

// TODO: It seems unlikely this function is correct; seems like it's a holdover from debugging.
function kmlurl(url) {
    if (typeof Android != "undefined")
        return Android.kmlurl(url);
    var summaryurl = "query=%5B%5BCategory%3ACanyons%5D%5D%5B%5BLocated%20in%20region.Located%20in%20regions%3A%3AX%7C%7CSan%20Diego%5D%5D&sort=&order=ascending";
    return LUCA_BASE_URL + "/rwr?gpx=off&kml=" + SITE_BASE_URL + "/KMLList?action=raw&templates=expand&ctype=application/x-zope-edit&group=link&" + summaryurl + "&more=&num=on&ext=.kml";
}

function viewsize() {
    var size = 0;
    if (typeof Android != "undefined")
        size = Android.isWebView() - 10;
    if (size <= 0) size = 600;
    return size;
}
