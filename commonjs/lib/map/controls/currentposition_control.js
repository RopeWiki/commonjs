// google maps custom control to display current position
// https://www.codemag.com/Article/2011031/Using-Geolocation-and-Google-Maps

function initCurrentPositionControl() {
    if (PROTOCOL !== HTTPS || !navigator.geolocation) return;

    createCurrentPositionButton();
}

function createCurrentPositionButton() {
    var currentPositionControl = document.createElement('div');
    currentPositionControl.className = 'controls currentposition-control gmnoprint';
    currentPositionControl.id = 'currentPositionCustom';
    currentPositionControl.innerHTML =
        '<div title = "My Location">' +
        '<i class="material-icons">&#xe55c;</i>' +
        '</div>';

    map.controls[google.maps.ControlPosition.LEFT_TOP].push(currentPositionControl);

    currentPositionControl.onclick = function() {
        toggleCurrentPosition();
    };
}

var curposShowing = false, curposZoomed = false;
var curposMarker, corposCompassMarker, curposWatchId, curposOriginalBounds;
var curposCoords, curposCompassHeading;

function userMarkerAnchorPt() {
     return new google.maps.Point(12, 12);
}

var currentPositionOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function toggleCurrentPosition(force) {

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

        if (navigator.geolocation) {
            if (curposMarker === undefined || curposMarker === null) {
                navigator.geolocation.getCurrentPosition(initializeCurrentPosition, handleCurrentPositionError, currentPositionOptions);

                updateUserCompassMarker();
            }
        }

        startCompass();
    }
    else {
        navigator.geolocation.clearWatch(curposWatchId);

        window.removeEventListener("deviceorientation", compassHandler, true);
        window.removeEventListener("deviceorientationabsolute", compassHandler, true);

        var button = document.getElementById('currentPositionCustom');

        if (!!button) {
            if (button.classList.contains("enabled")) {
                button.classList.remove("enabled");
            }
        }

        if (curposMarker !== undefined && curposMarker !== null) {
            curposMarker.setMap(null);
            curposMarker = null;
        }

        if (corposCompassMarker !== undefined && corposCompassMarker !== null) {
            corposCompassMarker.setMap(null);
            corposCompassMarker = null;
        }

        if (!!curposOriginalBounds) {
            map.fitBounds(curposOriginalBounds); //set back to original
            map.panToBounds(curposOriginalBounds);
        }
    }
}

function handleCurrentPositionError() {
    toggleCurrentPosition(false);
}

function initializeCurrentPosition(position) {

    var button = document.getElementById('currentPositionCustom');

    button.classList.add("enabled");

    curposCoords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    
    if (!curposMarker) {
        curposMarker = new google.maps.Marker({
            position: curposCoords,
            map: map,
            icon: {
                url: CURRENT_POSITION_ICON,
                anchor: userMarkerAnchorPt()
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
        handleCurrentPositionError,
        currentPositionOptions);
}

function updateUserCompassMarker() {
    
    if (!curposCompassHeading || !curposCoords
        || map.getZoom() < 12
            ) { //don't display
        if (!!corposCompassMarker) {
            corposCompassMarker.setMap(null);
            corposCompassMarker = null;
        }
        return;
    }

    var compassPointer = {
        path: "M 7 2 L 12 -4 L 17 2 L 12 0 L 7 2 z", //chevron shape, edit here: https://yqnn.github.io/svg-path-editor/
        strokeColor: "#00F",
        fillColor: "#007fff",
        fillOpacity: 1,
        anchor: userMarkerAnchorPt(),
        rotation: curposCompassHeading
    };

    if (!corposCompassMarker) {
        corposCompassMarker = new google.maps.Marker({
            map: map,
            icon: compassPointer
        });
    }
    
    corposCompassMarker.setIcon(compassPointer);
    corposCompassMarker.setPosition(curposCoords);
}

function startCompass() {
    if (isIOS()) {
        DeviceOrientationEvent.requestPermission()
            .then(function(response) {
                if (response === "granted") {
                    window.addEventListener("deviceorientation", compassHandler, true);
                }
            });
    } else {
        window.addEventListener("deviceorientationabsolute", compassHandler, true);
    }
}

function compassHandler(e) {
    curposCompassHeading = (e.webkitCompassHeading + window.orientation) || Math.abs(e.alpha - 360);

    updateUserCompassMarker();
}
