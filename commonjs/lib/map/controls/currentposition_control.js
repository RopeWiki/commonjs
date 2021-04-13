//google maps custom control to display current position

function initCurrentPositionControl() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(createCurrentPositionButton);
}

function createCurrentPositionButton() {
    var currentPositionControl = document.createElement('div');
    currentPositionControl.className = 'controls currentposition-control';
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

var showingcurrentposition = false;
var userMarker, id;

function toggleCurrentPosition() {

    showingcurrentposition = !showingcurrentposition;

    var button = document.getElementById('currentPositionCustom');

    if (showingcurrentposition) {

        if (navigator.geolocation) {
            if (userMarker === undefined || userMarker === null) {
                navigator.geolocation.getCurrentPosition(initializeCurrentPosition);
            }

            id = navigator.geolocation.watchPosition(updateCurrentPosition);

            button.classList.add("enabled");
        }
    } else {
        navigator.geolocation.clearWatch(id);
        
        if (button.classList.contains("enabled")) {
            button.classList.remove("enabled");
        }

        if (userMarker !== undefined && userMarker !== null) {
            userMarker.setMap(null);
            userMarker = null;
        }
    }
}

function initializeCurrentPosition(position) {

    var currentPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    if (!userMarker) {
        userMarker = new google.maps.Marker({
            position: currentPos,
            map: map,
            icon: {
                url: CURRENT_POSITION_ICON,
                anchor: new google.maps.Point(12, 12)
            }
        });

        var newBounds = new google.maps.LatLngBounds(boundslist.getSouthWest(), boundslist.getNorthEast());
        newBounds.extend(currentPos);

        map.fitBounds(newBounds);
        map.panToBounds(newBounds);
    }
}

function updateCurrentPosition(position) {
    userMarker.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
}