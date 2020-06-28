
/* Autoload of favicons (class="favicon") */
function getDomainFaviconURL(linkurl) {
    var domain = linkurl.match(/(\w+):\/\/([^/:]+)(:\d*)?([^# ]*)/);
    domain = RegExp.$2;
    var img = new Image();
    var faviconurl = "http://" + domain + "/favicon.ico";
    //img.src = faviconurl;
    //console.log("href:"+faviconurl+"?");
    //if (img.width>0 && img.height>0);
    //  return faviconurl;
    //console.log("href:"+faviconurl+" NO!");
    //var faviconurl = "http://www.google.com/s2/u/0/favicons?domain=http://"+domain;
    //var faviconurl = "http://g.etfv.co/http://"+domain;
    //var faviconurl = "http://getfavicon.appspot.com/http://"+domain;
    //"http://grabicon.com/"+domain
    //"http://getfavicon.appspot.com/http:"+domain
    var faviconurl = 'http://www.google.com/s2/favicons?domain=' + domain;
    return faviconurl;
}

//var favlinks = [];
function openfavlinks() {
    var str = "";
    var favlinks = document.getElementsByClassName('favlinks');
    for (i = 0; i < favlinks.length; ++i) {
        var href = favlinks[i].getElementsByTagName('A')[0].href;
        str += '<hr><h2>From <a href="' + href + '">' + href + '</a>:</h2><iframe src="' + href + '" frameborder="0" width="100%" min-height="3000px" style="font-size:smaller;"></iframe>';
    }

    var div = document.getElementById("allfavlinks");
    if (!div) {
        div = document.createElement("DIV");
        div.id = "allfavlinks";
        var body = document.getElementById("content");
        if (body == null) body = document.body;
        body.appendChild(div);
    }

    if (div) div.innerHTML = str;
}

//tabs
//$( "#tabs" ).tabs();
//favicons
//  var links = $$(selectors + ' a');
//favlinks = [];
var domains = document.getElementsByClassName('favicon');
for (var i = 0; i < domains.length; i++)
{
    var links = domains[i].getElementsByTagName('A');
    {
        var link = links[0];
        var href = link.href; //link.attributes['href'].value;
        var fvcurl = getDomainFaviconURL(href);
        var img = '<img width="32px" height="32px" style="vertical-align:middle;margin-left:0px;margin-top:0px;width:32px;height:32px" src="'+fvcurl+'"/>';
        link.innerHTML = img+'<span style="vertical-align: middle;"> '+link.innerHTML+'</span>';
        //favlinks.push({href:href, img:img, domain:fvcurl});
    }
}
var fav = document.getElementById('favlinks');
if (fav)
    fav.innerHTML = '<a href="javascript:openfavlinks();">'+fav.innerHTML+'</a>';
//'<a href="javascript:window.open('+"'"+'http://www.hp.com'+"'"+','+"'"+'_blank'+"'"+');window.open('+"'"+'http://www.google.com'+"'"+','+"'"+'_blank'+"'"+');alert();">'+fav.innerHTML+'</a>'
var fav = document.getElementById('allfavlinks');
if (fav)
    openfavlinks();
