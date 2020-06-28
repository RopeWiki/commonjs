// Utility functions only used in other parts of Common.js

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; path=/ ; " + expires;
}

function getCookie(cname, def) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) != -1)
            return c.substring(name.length, c.length);
    }
    if (typeof def != "undefined")
        return def;
    return "";
}

// Before picking a final URL from which to request a resource, see if a different server should be selected.
// This is needed because requesting a resource from a site with a particular name (e.g., www.ropewiki.com) while
// viewing a page from a site with a different name (e.g., ropewiki.com) will be considered a Cross-Origin Resource
// request and may be denied even if the two names are actually just aliases for the same site.  This could also be
// addressed by configuring the server to allow cross-origin requests from all known aliases of the same site.
function geturl(url) {
    // patch CORS for www.ropewiki.com
    var rw = "http://ropewiki.com";
    var wrw = "http://www.ropewiki.com";
    var local = window.location.href.toString();
    if (local.substr(0, wrw.length) == wrw)
        if (url.substr(0, rw.length) == rw)
            return wrw + url.substr(rw.length);
    return url;
}
