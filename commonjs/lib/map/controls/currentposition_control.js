// google maps custom control to display current position
// https://www.codemag.com/Article/2011031/Using-Geolocation-and-Google-Maps

function initCurrentPositionControl() {
    if (PROTOCOL !== HTTPS || !navigator.geolocation) return;

    curposCreateButton();
}

function curposCreateButton() {
    var currentPositionControl = document.createElement('div');
    currentPositionControl.className = 'controls currentposition-control gmnoprint';
    currentPositionControl.id = 'currentPositionCustom';
    currentPositionControl.innerHTML =
        '<div title = "My Location">' +
        '<i class="material-icons">&#xe55c;</i>' +
        '</div>';

    map.controls[google.maps.ControlPosition.LEFT_TOP].push(currentPositionControl);

    currentPositionControl.onclick = function() {
        curposToggle();
    };
}

var curposShowing = false, curposZoomed = false;
var curposMarker, curposCompassMarker, curposWatchId, curposOriginalBounds;
var curposCoords, curposCompassHeading;

function curposMarkerAnchorPt() { //if this isn't a function we get a compile error 'google. not found'
     return new google.maps.Point(12, 12);
}

var curposOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function curposToggle(force) {

    if (!!force) curposShowing = force;
    else {
        if (!curposShowing)
            curposShowing = true;
        else if (!curposZoomed)
            curposZoomed = true;
        else
            curposShowing = curposZoomed = false;
    }

    if (curposZoomed && !!curposMarker) {
        map.panTo(curposMarker.position);
        map.setZoom(12);
        return;
    }

    if (curposShowing) {
        if (!curposMarker) {
            navigator.geolocation.getCurrentPosition(curposInitialize, curposHandleError, curposOptions);

            curposUpdateCompassMarker();
        }

        if (!curposCompassMarker) {
            curposInitializeCompass();
        }
    }
    else {
        navigator.geolocation.clearWatch(curposWatchId);

        window.removeEventListener("deviceorientation", curposCompassHandler, true);
        window.removeEventListener("deviceorientationabsolute", curposCompassHandler, true);

        var button = document.getElementById('currentPositionCustom');

        if (!!button) {
            if (button.classList.contains("enabled")) {
                button.classList.remove("enabled");
            }
        }

        if (!!curposMarker) {
            curposMarker.setMap(null);
            curposMarker = null;
        }

        if (!!curposCompassMarker) {
            curposCompassMarker.setMap(null);
            curposCompassMarker = null;
        }

        if (!!curposOriginalBounds) {
            map.fitBounds(curposOriginalBounds); //set back to original
            map.panToBounds(curposOriginalBounds);
        }
    }
}

function curposInitialize(position) {

    var button = document.getElementById('currentPositionCustom');

    button.classList.add("enabled");

    curposCoords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    
    if (!curposMarker) {
        curposMarker = new google.maps.Marker({
            position: curposCoords,
            map: map,
            icon: {
                url: CURRENT_POSITION_ICON,
                anchor: curposMarkerAnchorPt()
            }
        });
        
        curposOriginalBounds = map.getBounds();
        var newBounds = map.getBounds();
        newBounds.extend(curposCoords);

        map.fitBounds(newBounds);
        map.panToBounds(newBounds);
    }

    curposWatchId = navigator.geolocation.watchPosition(
        function (position) {
            curposCoords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            curposMarker.setPosition(curposCoords);
        },
        curposHandleError,
        curposOptions);
}

function curposInitializeCompass() {
    if (isIOS()) {
        DeviceOrientationEvent.requestPermission()
            .then(function (response) {
                if (response === "granted") {
                    window.addEventListener("deviceorientation", curposCompassHandler, true);
                }
            });
    } else {
        window.addEventListener("deviceorientationabsolute", curposCompassHandler, true);
    }
}

function curposUpdateCompassMarker() {
    
    if (!curposCompassHeading || !curposCoords
        || map.getZoom() < 12
            ) { //don't display
        if (!!curposCompassMarker) {
            curposCompassMarker.setMap(null);
            curposCompassMarker = null;
        }
        return;
    }

    var compassPointer = {
        path: "M 7 2 L 12 -4 L 17 2 L 12 0 L 7 2 z", //chevron shape, edit here: https://yqnn.github.io/svg-path-editor/
        strokeColor: "#00F",
        fillColor: "#007fff",
        fillOpacity: 1,
        anchor: curposMarkerAnchorPt(),
        rotation: curposCompassHeading
    };

    if (!curposCompassMarker) {
        curposCompassMarker = new google.maps.Marker({
            map: map,
            icon: compassPointer
        });
    }
    
    curposCompassMarker.setIcon(compassPointer);
    curposCompassMarker.setPosition(curposCoords);
}

function curposCompassHandler(e) {
    curposCompassHeading = (e.webkitCompassHeading + window.orientation) || Math.abs(e.alpha - 360);

    curposUpdateCompassMarker();
}

function curposHandleError() {
    curposToggle(false);
}
