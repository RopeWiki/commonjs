function urldecode(str)
{
    return decodeURIComponent(str).split("+").join(" ");
}

function urlencode(str)
{
    return encodeURIComponent(str);
}

function linkify(str) {
    return !!str
        ? str.split(" ").join("_")
        : str;
}

function urlget(url, idstr, defstr) {
    var str = defstr;
    var pos = url.indexOf(idstr);
    if (pos >= 0) {
        pos += idstr.length;
        var posend = url.indexOf("&", pos);
        if (posend > 0)
            str = url.substring(pos, posend);
        else
            str = url.substring(pos);
        str = urldecode(str);
    }
    return str;
}

function addUrlParam(param, id, val) {

    var pid = "&" + id + "=";
    var i = param.indexOf(pid);
    if (i < 0)
        param += pid + val;
    else {
        var a = param.substr(0, i);
        var b = param.substr(i + pid.length);
        param = a + pid + val;
        if (b !== val) {
            if (b.length > 0 && b[0] !== "&")
                param += ",";
            param += b;
        }
    }

    return param;
}

function getUrlParam(param, id, def) {
    var idstr = "&" + id + "=";
    return urlget(param, idstr, def);
}

function setUrlParam(param, id, val) {

    var pid = "&" + id + "=";
    var i = param.indexOf(pid);
    if (i >= 0) {
        var b = "";
        var a = param.substr(0, i);
        var l = param.indexOf("&", i + 1);
        if (l >= 0)
            b = param.substr(l);
        param = a + b;
    }
    param += pid + val;
    return param;
}

/**
 * Adjust the hostname of a URL if applicable.
 *
 * Before picking a final URL from which to request a resource, see if a different server should be selected.  This is
 * needed because requesting a resource from a site with a particular name (e.g., www.ropewiki.com) while viewing a page
 * from a site with a different name (e.g., ropewiki.com) will be considered a Cross-Origin Resource request and may be
 * denied even if the two names are actually just aliases for the same site.  This could also be addressed by
 * configuring the server to allow cross-origin requests from all known aliases of the same site.
 *
 * @param {string} url: URL of desired resource.
 *
 * @return {string} Adjusted URL for desired resource.
 */

function geturl(url) {
    // patch CORS for alternate site names
    var local = window.location.href.toString();
    if (url.substr(0, SITE_BASE_URL.length) === SITE_BASE_URL) {
        // The url is pointing to the base site; let's see if we're viewing a page through an alternate site name.
        var checkAlternateName = function (alternateName) {
            if (local.substr(0, alternateName.length) === alternateName) {
                return alternateName + url.substr(SITE_BASE_URL.length);
            }
        }
        SITE_ALTERNATE_NAMES.forEach(checkAlternateName);
    }
    return url;
}

function getdomain(link) {
    var base = link.split('http');
    if (link.length <= 0)
        return link;
    var domain = base[base.length - 1].split('/');
    if (domain.length <= 2)
        return link;
    return domain[2];
}

function aref(url, label, title, attribs) {
    if (typeof title == "undefined")
        title = "";
    if (typeof attribs == "undefined")
        attribs = "";
    return '<A href="' + url + '" title="' + title + '" ' + attribs + '>' + label + '</A>';
}

function deftext(str) {
    return str == null || str === '' || str[0] === '&' || str[0] === ' ' || str.charCodeAt(0) === 160;
}
