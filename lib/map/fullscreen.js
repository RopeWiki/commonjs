var FULLSCREEN_HASH = '#fullscreen';

function addHashChangeListener() {
    $(window).on('hashchange',
        function() {
            if (toggleFS != null)
                if (window.location.href.toString().indexOf(FULLSCREEN_HASH) < 0)
                    toggleFullScreen();
        });
}

function backFullScreen() {
    window.history.back();
}

function toggleFullScreen(force) {
    var idchk = "fullscreenchk";
    var ide = document.getElementById("mapbox");
    if (!ide) return;

    if (toggleFS == null || force) {
        if (toggleFS == null) {
            toggleFS = {
                parent: ide.parentNode,
                next: ide.nextSibling,
                cssText: ide.style.cssText,
                className: ide.className,
                sx: window.pageXOffset,
                sy: window.pageYOffset
            };
            window.location.href = window.location.href.toString() + FULLSCREEN_HASH;
            var list = document.body.childNodes;
            for (var i = 0; i < list.length; ++i)
                if (list[i].tagName == 'DIV') {
                    list[i].normal_display = list[i].style.display;
                    list[i].style.display = "none";
                }
            //$(".goog-te-banner-frame").hide();
        }
        $(ide).hide();
        ide.className = "";
        $(ide).css({
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999999,
            width: '100%',
            height: '100%'
        });
        //var w = $(window).width()-3;
        //var h = $(window).height()-3;
        //$(ide).width(w).height(h);
        document.body.insertBefore(ide, document.body.firstChild);
        window.scrollTo(0, 0);
    } else {
        $(ide).hide();
        var fs = toggleFS;
        ide.style.cssText = fs.cssText;
        ide.className = fs.className;
        fs.parent.insertBefore(ide, fs.next);
        //$(".goog-te-banner-frame").show();
        var list = document.body.childNodes;
        for (var i = 0; i < list.length; ++i)
            if (typeof list[i].normal_display != "undefined")
                list[i].style.display = list[i].normal_display;
        window.scrollTo(fs.sx, fs.sy);
        toggleFS = null;
    }

    chk = document.getElementById(idchk);
    
    chk.onclick = toggleFS == null ? toggleFullScreen : backFullScreen;
    mapcover();
    $(ide).show();
    centermap();
}
