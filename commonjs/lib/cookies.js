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

function initializeCookies() {
    var url = window.location.href.toString();
    // language quick setup
    if (url[url.length - 3] == "#") {
        setCookie("metric", "on", 360 * 10); // 10 years
        setCookie("french", "on", 360 * 10); // 10 years
        setCookie("country", "on", 360 * 10); // 10 years
        setCookie("googtrans", "/en/" + url.substr(url.length - 2), 360 * 10); // 10 years
    }
}

// freegeoip.net is down (parked domain) as of 2020-06-27
// default metric units for non US
// if (!getCookie("country"))
// {
//     var url ="http://freegeoip.net/json/";
//     $.getJSON(geturl(url), function( data ) {
//         if (data && data.country_code)
//         {
//             setCookie("country", "on", 360*10); // 10 years
//             console.log("country:"+data.country_code);
//             if (data.country_code!="US")
//             {
//                 setCookie("metric", "on", 360*10); // 10 years
//                 setCookie("french", "on", 360*10); // 10 years
//                 window.location.reload();
//             }
//         }
//     });
// }