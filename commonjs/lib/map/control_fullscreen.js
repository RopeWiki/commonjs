
function initFullscreenControl() {
    var fullscreenControl = document.createElement('DIV');
    fullscreenControl.className = 'controls fullscreen-control';
    fullscreenControl.id = 'fullscreenCustom';
    fullscreenControl.innerHTML =
        '<button title = "Toggle Fullscreen">' +
        '<div class="fullscreen-control-icon fullscreen-control-top-left"></div>' +
        '<div class="fullscreen-control-icon fullscreen-control-top-right"></div>' +
        '<div class="fullscreen-control-icon fullscreen-control-bottom-left"></div>' +
        '<div class="fullscreen-control-icon fullscreen-control-bottom-right"></div>' +
        '</button>';
    fullscreenControl.style.marginLeft = "10px";
    fullscreenControl.style.marginRight = "10px";
    fullscreenControl.style.marginTop = "0px";

    map.controls[google.maps.ControlPosition.LEFT_TOP].push(fullscreenControl);

    var elementToSendFullscreen = map.getDiv().firstChild;

    fullscreenControl.onclick = function () {
        if (iOS()) { //functionality is different in iOS. Needs to use our toggleFullScreen code. 
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
        if (isFullscreen(elementToSendFullscreen)) {
            fullscreenControl.classList.add("is-fullscreen");
        } else {
            fullscreenControl.classList.remove("is-fullscreen");
        }
    };
}

function isFullscreen(element) {
    return (
        (document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement) == element
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

