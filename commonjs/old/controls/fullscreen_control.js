//google maps custom control to toggle fullscreen

function initFullscreenControl() {
    var fullscreenControl = document.createElement('div');
    fullscreenControl.className = 'controls fullscreen-control gmnoprint';
    fullscreenControl.id = 'fullscreenCustom';
    fullscreenControl.innerHTML =
        '<div title = "Toggle Fullscreen">' +
            '<div class="controls fullscreen-control icon top-left"></div>' +
            '<div class="controls fullscreen-control icon top-right"></div>' +
            '<div class="controls fullscreen-control icon bottom-left"></div>' +
            '<div class="controls fullscreen-control icon bottom-right"></div>' +
        '</div>';

    map.controls[google.maps.ControlPosition.TOP_LEFT].insertAt(0, fullscreenControl);

    var elementToSendFullscreen = map.getDiv().firstChild;

    fullscreenControl.onclick = function () {
        if (isIOS()) { //functionality is different in iOS. Needs to use our toggleFullScreen code.

            adjustControlsForFullscreen(fullscreenControl, !toggleFS);
            toggleFullScreen();
            return;
        }

        if (isFullscreen(elementToSendFullscreen)) {
            exitFullscreen();
        } else {
            requestFullscreen(elementToSendFullscreen);
        }
    };

    document.onwebkitfullscreenchange = document.onmsfullscreenchange = document.onmozfullscreenchange = document.onfullscreenchange = function () {
        adjustControlsForFullscreen(fullscreenControl, isFullscreen(elementToSendFullscreen));
    };
}

function isFullscreen(element) {
    return (
        (document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement) === element
    );
}

function requestFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.msRequestFullScreen) {
        element.msRequestFullScreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

function adjustControlsForFullscreen(fullscreenControl, isFullscreen) {
    if (isFullscreen)
        fullscreenControl.classList.add("is-fullscreen");
    else
        fullscreenControl.classList.remove("is-fullscreen");

    var dragbar = document.getElementById("dragbar");
    if (!!dragbar) dragbar.style.display = isFullscreen ? 'none' : 'block';

    map.set('gestureHandling', isFullscreen ? 'greedy' : 'cooperative');
}

var FULLSCREEN_HASH = '#fullscreen';

//function addHashChangeListener() {
//    $(window).on('hashchange',
//        function () {
//            if (toggleFS != null)
//                if (window.location.href.toString().indexOf(FULLSCREEN_HASH) < 0)
//                    toggleFullScreen();
//        });
//}

function toggleFullScreen(force) {
    var ide = document.getElementById("mapbox");
    if (!ide) return;

    var list, i;
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

            if (window.location.href.toString().indexOf(FULLSCREEN_HASH) < 0)
                window.location.href += FULLSCREEN_HASH;

            list = document.body.childNodes;
            for (i = 0; i < list.length; ++i)
                if (list[i].tagName === 'DIV') {
                    list[i].normal_display = list[i].style.display;
                    list[i].style.display = "none";
                }
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
        document.body.insertBefore(ide, document.body.firstChild);
        window.scrollTo(0, 0);
    } else {
        $(ide).hide();
        var fs = toggleFS;
        ide.style.cssText = fs.cssText;
        ide.className = fs.className;
        fs.parent.insertBefore(ide, fs.next);

        list = document.body.childNodes;
        for (i = 0; i < list.length; ++i)
            if (list[i].normal_display !== undefined)
                list[i].style.display = list[i].normal_display;
        window.scrollTo(fs.sx, fs.sy);
        toggleFS = null;
    }

    mapcover();
    $(ide).show();
    centermap();
}

function mapcover() {
    var mw = $("#mapbox").width();
    var dw = $(window).width() - mw;
    if (!toggleFS && (dw < 50 || mw < 500))
        $("#mapcover").css({ display: "block" });
    else
        $("#mapcover").css({ display: "none" });
}
