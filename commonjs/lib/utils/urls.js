function urldecode(str)
{
    return decodeURIComponent(str).split("+").join(" ");
}

function urlencode(str)
{
    return encodeURIComponent(str);
}

function urlAdjustSiteBase(str) {
    if (SITE_HOSTNAME === "ropewiki.com") return str;
    return str.replace("ropewiki.com", SITE_HOSTNAME);

    //certain queries call into semantic mediawiki to get links, such as the kml file list. 
    //This template uses the {{filepath:}} magic word to return links, which hardcodes 'ropewiki.com' and will cause a CORS exception
    //if trying to load the templates when running in localhost or similar.
}

function urlget(url, idstr, defstr) {
    var str = defstr;
    var pos = url.indexOf(idstr);
    if (pos >= 0) {
        pos += idstr.length;
        var posend = url.indexOf('&', pos);
        if (posend > 0)
            str = url.substring(pos, posend);
        else
            str = url.substring(pos);
        str = urldecode(str);
    }
    return str;
}

function addparam(param, id, val) {

    var pid = '&' + id + '=';
    var i = param.indexOf(pid);
    if (i < 0)
        param += pid + val;
    else {
        var a = param.substr(0, i);
        var b = param.substr(i + pid.length);
        param = a + pid + val;
        if (b != val) {
            if (b.length > 0 && b[0] != '&')
                param += ',';
            param += b;
        }
    }

    return param;
}

function getparam(param, id, def) {
    var idstr = '&' + id + '=';
    return urlget(param, idstr, def);
}

function setparam(param, id, val) {

    var pid = '&' + id + '=';
    var i = param.indexOf(pid);
    if (i >= 0) {
        var b = "";
        var a = param.substr(0, i);
        var l = param.indexOf('&', i + 1);
        if (l >= 0)
            b = param.substr(l);
        param = a + b;
    }
    param += pid + val;
    return param;
}
