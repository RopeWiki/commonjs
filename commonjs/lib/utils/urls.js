function urldecode(str)
{
    return decodeURIComponent(str).split("+").join(" ");
}

function urlencode(str)
{
    return encodeURIComponent(str);
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

function addUrlParam(param, id, val) {

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

function getUrlParam(param, id, def) {
    var idstr = '&' + id + '=';
    return urlget(param, idstr, def);
}

function setUrlParam(param, id, val) {

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
