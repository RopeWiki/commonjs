var starrate = getCookie("starrate");
if (window.location.href.toString().indexOf('starratechk=')>=0)
    starrate = true;
var labels = getCookie("labels");
var slideshowchk = getCookie("slideshowchk", "undefined");
if (slideshowchk=="undefined")// && $(window).width()<1200)
    slideshowchk = "on";
slideshowchk = slideshowchk!="";

function toggleUrlcheckbox(elem) {
    urlcheckbox = setparam(urlcheckbox, elem.id, elem.checked ? "on" : "off");
    setCookie("urlcheckbox", urlcheckbox, 360*10); // 10 years
    gtrans2 = 'x';
    loadTranslation();
}

function togglewchk(varname) {
    var varval = !eval(varname);
    setCookie(varname, varval ? "on" : "", 360*10); // 10 years
    document.body.style.cursor = 'wait';
    window.location.reload();
}


function toggleStarrate(force) {
    starrate = !starrate;
    setCookie("starrate", starrate ? "on" : "", 360*10); // 10 years
    if (starrate)
    {
        LoadStars();
    }
    else
    {
        document.body.style.cursor = 'wait';
        window.location.reload();
    }
    //google.maps.event.trigger(map,'resize');
}

function toggleLabels(force) {
    labels = !labels;
    setCookie("labels", labels ? "on" : "", 360*10); // 10 years
    document.body.style.cursor = 'wait';
    window.location.reload();
    //google.maps.event.trigger(map,'resize');
}

function toggleSlideshow(force)
{
    slideshowchk = !slideshowchk;
    if (typeof force != 'undefined')
        slideshowchk = force;
    setCookie("slideshowchk", slideshowchk ? "on" : "", 360*10); // 10 years
    var elems = document.getElementsByClassName('slideshow');
    for (var i = 0; i < elems.length; i++)
        elems[i].style.display = slideshowchk ? "" : "none";
    var elems = document.getElementsByClassName('slideshowschk');
    for (var i = 0; i < elems.length; i++)
        elems[i].checked = slideshowchk;
    if (!slideshowchk)
    {
        document.body.style.zIndex = 1;
        document.body.style.zoom = 1.0000001;
    }
    else
    {
        document.body.style.zIndex = 0;
        document.body.style.zoom = 1;
    }
}
