function urldecode(str)
{
    return decodeURIComponent(decodeHtmlCharCodes(str)).split("+").join(" ");
}

function decodeHtmlCharCodes(str) {
    return str.replace(/(&#(\d+);)/g, function (match, capture, charCode) {
        return String.fromCharCode(charCode);
    });
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

function escapequotes(str) {
    return !!str
        ? urlencode(str).split("'").join("\'").split('"').join('\"')
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

function getUrlParam(key, defaultValue) {
    var uri = new URL(window.location.href);
    var value = uri.searchParams.get(key);

    if (!value) value = defaultValue;

    return value;
}

function setUrlParam(url, key, value) {
    var uri = new URL(url);
    uri.searchParams.set(key, value);
    return uri.toString();
}

function getLocalUrl(url) {
    if (!url) url = window.location.href.toString();

    var protocolDelimiter = '://';

    var index = url.indexOf(protocolDelimiter);
    var protocol = url.substring(0, index);
    var endIndex = url.indexOf('/', index + protocolDelimiter.length + 1);
    var baseurl = url.substring(index + protocolDelimiter.length, endIndex);

    return {
        protocol: protocol,
        baseurl: baseurl,
        siteurl: protocol + protocolDelimiter + baseurl,
        link: url.substring(endIndex)
    }
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
    
    // patch for sitename mismatch ('ropewiki.com' vs other ropewiki site)
    //var urlParams = getLocalUrl(urldecode(url));
    //var local = getLocalUrl();
    //if (urlParams.baseurl.indexOf('ropewiki') >= 0 && urlParams.protocol !== local.protocol) { //reassemble with correct site url
    //    var baseurl = urlParams.baseurl.indexOf('luca') < 0
    //        ? local.siteurl
    //        : LUCA_BASE_URL;
    //    url = baseurl + urlParams.link;
    //}
    var hostnameIndex = url.indexOf(LUCA_HOSTNAME_PROD);
    if (hostnameIndex >= 0 && LUCA_HOSTNAME_PROD !== LUCA_HOSTNAME) {
        url = LUCA_BASE_URL + url.substr(hostnameIndex + LUCA_HOSTNAME_PROD.length);
    }

    // patch CORS for alternate site names
    if (url.substr(0, SITE_BASE_URL.length) === SITE_BASE_URL) {
        // The url is pointing to the base site; let's see if we're viewing a page through an alternate site name.
        var localUrl = window.location.href.toString();
        var checkAlternateName = function (alternateName) {
            if (localUrl.substr(0, alternateName.length) === alternateName) {
                return alternateName + url.substr(SITE_BASE_URL.length);
            }
        }
        SITE_ALTERNATE_NAMES.forEach(checkAlternateName);
    }
    return url;
}

function getKmlFileWithoutCache(url) {
    //if it is a ropewiki.com file, add a timestamp to the end of the url to bypass the cache
    //for other urls (such as wikiloc), do not do this because it is not needed and causes a lengthy delay in downloading the file
    var isropewiki = getdomain(url).includes(SITE_HOSTNAME);

    if (isropewiki) url = getUrlWithoutCache(url);

    return url;
}

function getUrlWithoutCache(url) {
    
    var newUrl = geturl(url);

    //add timestamp to end of url to bypass the cache
    newUrl = setUrlParam(newUrl, 'ts', new Date().getTime());
    
    return newUrl.toString();
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


// if we need to find the absolute path to an image (or .kml file), the pattern that mediawiki uses to create the filepath is this:
// stackoverflow.com/questions/2813294/how-does-mediawiki-calculate-the-file-path-to-an-image
// "File location is determined by $wgLocalFileRepo which by default depends on $wgUploadDirectory and $wgHashedUploadDirectory. 
// If hashing is enabled, /x/xy will be appended to the path, where xy are the first two characters of the md5 hash of the filename."
// The filename that Mediawiki uses to create the hash uses underscores for spaces
// (i.e., 'Big Falls (SoCal) Banner.jpg' is 'Big_Falls_(SoCal)_Banner.jpg')
function MD5hash(e) {
    function h(a, b) {
        var c = a & 1073741824;
        var d = b & 1073741824;
        var e = a & 2147483648;
        var f = b & 2147483648;
        var g = (a & 1073741823) + (b & 1073741823);
        return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f;
    }

    function k(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & c | ~b & d, e), g));
        return h(a << f | a >>> 32 - f, b);
    }

    function l(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & d | c & ~d, e), g));
        return h(a << f | a >>> 32 - f, b);
    }

    function m(a, b, d, c, e, f, g) {
        a = h(a, h(h(b ^ d ^ c, e), g));
        return h(a << f | a >>> 32 - f, b);
    }

    function n(a, b, d, c, e, f, g) {
        a = h(a, h(h(d ^ (b | ~c), e), g));
        return h(a << f | a >>> 32 - f, b);
    }

    function p(a) {
        var b = "",
            d,
            c;
        for (c = 0; 3 >= c; c++) d = a >>> 8 * c & 255, d = "0" + d.toString(16), b += d.substr(d.length - 2, 2);
        return b;
    }
    var f = [],
        q, r, s, t, a, b, c, d;
    e = function (a) {
        a = a.replace(/\r\n/g, "\n");
        for (var b = "", d = 0; d < a.length; d++) {
            var c = a.charCodeAt(d);
            128 > c ? b += String.fromCharCode(c) : (127 < c && 2048 > c ? b += String.fromCharCode(c >> 6 | 192) : (b += String.fromCharCode(c >> 12 | 224), b += String.fromCharCode(c >> 6 & 63 | 128)), b += String.fromCharCode(c & 63 | 128))
        }
        return b;
    }(e);
    f = function (b) {
        var a, c = b.length;
        a = c + 8;
        for (var d = 16 * ((a - a % 64) / 64 + 1), e = Array(d - 1), f = 0, g = 0; g < c;) a = (g - g % 4) / 4, f = g % 4 * 8, e[a] |= b.charCodeAt(g) << f, g++;
        a = (g - g % 4) / 4;
        e[a] |= 128 << g % 4 * 8;
        e[d - 2] = c << 3;
        e[d - 1] = c >>> 29;
        return e;
    }(e);
    a = 1732584193;
    b = 4023233417;
    c = 2562383102;
    d = 271733878;
    for (e = 0; e < f.length; e += 16) q = a, r = b, s = c, t = d, a = k(a, b, c, d, f[e + 0], 7, 3614090360), d = k(d, a, b, c, f[e + 1], 12, 3905402710), c = k(c, d, a, b, f[e + 2], 17, 606105819), b = k(b, c, d, a, f[e + 3], 22, 3250441966), a = k(a, b, c, d, f[e + 4], 7, 4118548399), d = k(d, a, b, c, f[e + 5], 12, 1200080426), c = k(c, d, a, b, f[e + 6], 17, 2821735955), b = k(b, c, d, a, f[e + 7], 22, 4249261313), a = k(a, b, c, d, f[e + 8], 7, 1770035416), d = k(d, a, b, c, f[e + 9], 12, 2336552879), c = k(c, d, a, b, f[e + 10], 17, 4294925233), b = k(b, c, d, a, f[e + 11], 22, 2304563134), a = k(a, b, c, d, f[e + 12], 7, 1804603682), d = k(d, a, b, c, f[e + 13], 12, 4254626195), c = k(c, d, a, b, f[e + 14], 17, 2792965006), b = k(b, c, d, a, f[e + 15], 22, 1236535329), a = l(a, b, c, d, f[e + 1], 5, 4129170786), d = l(d, a, b, c, f[e + 6], 9, 3225465664), c = l(c, d, a, b, f[e + 11], 14, 643717713), b = l(b, c, d, a, f[e + 0], 20, 3921069994), a = l(a, b, c, d, f[e + 5], 5, 3593408605), d = l(d, a, b, c, f[e + 10], 9, 38016083), c = l(c, d, a, b, f[e + 15], 14, 3634488961), b = l(b, c, d, a, f[e + 4], 20, 3889429448), a = l(a, b, c, d, f[e + 9], 5, 568446438), d = l(d, a, b, c, f[e + 14], 9, 3275163606), c = l(c, d, a, b, f[e + 3], 14, 4107603335), b = l(b, c, d, a, f[e + 8], 20, 1163531501), a = l(a, b, c, d, f[e + 13], 5, 2850285829), d = l(d, a, b, c, f[e + 2], 9, 4243563512), c = l(c, d, a, b, f[e + 7], 14, 1735328473), b = l(b, c, d, a, f[e + 12], 20, 2368359562), a = m(a, b, c, d, f[e + 5], 4, 4294588738), d = m(d, a, b, c, f[e + 8], 11, 2272392833), c = m(c, d, a, b, f[e + 11], 16, 1839030562), b = m(b, c, d, a, f[e + 14], 23, 4259657740), a = m(a, b, c, d, f[e + 1], 4, 2763975236), d = m(d, a, b, c, f[e + 4], 11, 1272893353), c = m(c, d, a, b, f[e + 7], 16, 4139469664), b = m(b, c, d, a, f[e + 10], 23, 3200236656), a = m(a, b, c, d, f[e + 13], 4, 681279174), d = m(d, a, b, c, f[e + 0], 11, 3936430074), c = m(c, d, a, b, f[e + 3], 16, 3572445317), b = m(b, c, d, a, f[e + 6], 23, 76029189), a = m(a, b, c, d, f[e + 9], 4, 3654602809), d = m(d, a, b, c, f[e + 12], 11, 3873151461), c = m(c, d, a, b, f[e + 15], 16, 530742520), b = m(b, c, d, a, f[e + 2], 23, 3299628645), a = n(a, b, c, d, f[e + 0], 6, 4096336452), d = n(d, a, b, c, f[e + 7], 10, 1126891415), c = n(c, d, a, b, f[e + 14], 15, 2878612391), b = n(b, c, d, a, f[e + 5], 21, 4237533241), a = n(a, b, c, d, f[e + 12], 6, 1700485571), d = n(d, a, b, c, f[e + 3], 10, 2399980690), c = n(c, d, a, b, f[e + 10], 15, 4293915773), b = n(b, c, d, a, f[e + 1], 21, 2240044497), a = n(a, b, c, d, f[e + 8], 6, 1873313359), d = n(d, a, b, c, f[e + 15], 10, 4264355552), c = n(c, d, a, b, f[e + 6], 15, 2734768916), b = n(b, c, d, a, f[e + 13], 21, 1309151649), a = n(a, b, c, d, f[e + 4], 6, 4149444226), d = n(d, a, b, c, f[e + 11], 10, 3174756917), c = n(c, d, a, b, f[e + 2], 15, 718787259), b = n(b, c, d, a, f[e + 9], 21, 3951481745), a = h(a, q), b = h(b, r), c = h(c, s), d = h(d, t);
    return (p(a) + p(b) + p(c) + p(d)).toLowerCase();
};