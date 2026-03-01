
function setCookie(cname, cvalue, exdays) {
    if (!exdays) exdays = 360 * 10; // 10 years
    
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; path=/; SameSite=Lax; " + expires;
}

function getCookie(cname, def) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(name) !== -1)
            return c.substring(name.length, c.length);
    }
    if (typeof def != "undefined")
        return def;
    return "";
}

function initializeCookies() {

     //set default units (metric / french techincal rating) for users connecting for first time, if outside of US
     if (!getCookie("country"))
     {
         //freegeoip.net is down (parked domain) as of 2020-06-27
         //ipstack.com is the replacement, has free API key for up to 10,000 requests per month
         var url = PROTOCOL + "freegeoip.net/json/";

         //$.getJSON(geturl(url), function( data ) {
         //    if (data && data.country_code)
         //    {
         //        setCookie("country", "on", 360*10);
         //        console.log("country:"+data.country_code);
         //        if (data.country_code!="US")
         //        {
         //            setCookie("metric", "on", 360*10);
         //            setCookie("french", "on", 360*10);
         //            window.location.reload();
         //        }
         //    }
         //});
     }

    var url = window.location.href.toString();
    // language quick setup
    if (url[url.length - 3] === "#") {
        setCookie("metric", "on");
        setCookie("french", "on");
        setCookie("country", "on");
        setCookie("googtrans", "/en/" + url.substr(url.length - 2));
    }
}
