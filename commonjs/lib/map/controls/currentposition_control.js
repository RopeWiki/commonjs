// google maps custom control to display current position
// https://www.codemag.com/Article/2011031/Using-Geolocation-and-Google-Maps

function initCurrentPositionControl() {
    if ((PROTOCOL !== HTTPS && SITE_HOSTNAME !== 'localhost:8080') || !navigator.geolocation) return;

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
var curposCoords, curposCompassHeading, curposMagneticDeclination;
var compassMinZoom = 12;

function curposMarkerAnchorPt() { //if this isn't a function we get a compile error 'google. not found'
     return new google.maps.Point(12, 12);
}

var curposOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function curposToggle(force) {

    //first click:  show position. if position is outside of the current map scale, zoom out map to include it
    //second click: zoom in and scroll to current position, unless already zoomed in enough and showing -- in which case go to third click
    //third click:  hide position and reset original zoom

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
        var inView = map.getBounds().contains(curposMarker.position);
        var zoomedOut = map.getZoom() < compassMinZoom;

        if (!inView || zoomedOut) {
            map.panTo(curposMarker.position);
            if (zoomedOut)
                map.setZoom(compassMinZoom); //zoom in enough to show the compass

            return;
        }

        //already in view and zoomed in, so proceed with hiding the cursor
        curposShowing = curposZoomed = false;
    }

    if (curposShowing) {
        if (!curposCompassMarker) {
            curposInitializeCompass();
        }

        if (!curposMarker) {
            navigator.geolocation.getCurrentPosition(curposInitialize, curposHandleError, curposOptions);

            curposUpdateCompassMarker();
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
            map.fitBounds(curposOriginalBounds, 0); //set back to original
            map.panToBounds(curposOriginalBounds);
        }
    }
}

function curposInitialize(position) {

    var button = document.getElementById('currentPositionCustom');

    button.classList.add("enabled");

    curposCoords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    curposGetMagneticDeclination(position.coords.latitude, position.coords.longitude);
    
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

        map.fitBounds(newBounds, 0);
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
        || map.getZoom() < compassMinZoom
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

    if (!!curposMagneticDeclination) curposCompassHeading += curposMagneticDeclination;

    curposUpdateCompassMarker();
}

function curposHandleError() {
    curposToggle(false);
}

function curposGetMagneticDeclination(lat, lon) {

    if (!!curposMagneticDeclination) return;
    
    var url = "https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination?lat1=" + lat + "&lon1=" + lon + "&key=zNEw7&resultFormat=json"; //api key is on their website for use by everyone

    $.getJSON(geturl(url),
        function(data) {
            if (data) {
                curposMagneticDeclination = data.result[0].declination;
            };
        });
}