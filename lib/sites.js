function sitelink(siteid, label, url) {
    if (typeof url == "undefined") {
        url = /*"\/index.php\/"+*/siteid;
        var site = findsite(siteid);
        if (site) {
            var id = siteid.split(":")[1];
            url = site.urls[0].replace("%id", id);
        }
    }
    if (url == "")
        return '<span style="color:#808080">' + label + '</span>';
    return aref(url, label, label, 'target="_blank"');
}

// site link
function findsite(id) {
    for (var c = 0; c < sites.length; c++)
        if (sites[c].id == id)
            return sites[c];
    return null;
}
