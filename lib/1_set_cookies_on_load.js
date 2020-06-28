// language quick setup
if  (url[url.length-3]=="#") {
    setCookie("metric", "on", 360 * 10); // 10 years
    setCookie("french", "on", 360 * 10); // 10 years
    setCookie("country", "on", 360 * 10); // 10 years
    setCookie("googtrans", "/en/" + url.substr(url.length - 2), 360 * 10); // 10 years
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
