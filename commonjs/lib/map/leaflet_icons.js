// The ropewiki canyon icons colored by star rating.
function canyonIcon(iconUrl) {
    iconSize = [24, 27];
    return L.icon({
        iconUrl: iconUrl,
        iconSize: iconSize,
        iconAnchor: [iconSize[0]/2, iconSize[1]],
        popupAnchor: [0, -40]
    })
}

// The classic kml "pin" icons.
function pinIcon(iconUrl) {
    iconSize = [40, 40];
    return L.icon({
        iconUrl: iconUrl,
        iconSize: iconSize,
        iconAnchor: [iconSize[0]/2, iconSize[1]],
        popupAnchor: [0, -40]
    })
}

// The icon placed over the top of a canyonIcon to indicate access issues.
function closedIcon(iconUrl) {
    iconSize = [25, 25];
    return L.icon({
        iconUrl: iconUrl,
        iconSize: iconSize,
        iconAnchor: [iconSize[0]/2, iconSize[1]],
        popupAnchor: [0, -40]
    })
}

// The pin icons used on the waterflow page
function waterFlowIcon(iconUrl) {
    iconSize = [13, 22];
    return L.icon({
        iconUrl: iconUrl,
        iconSize: iconSize,
        iconAnchor: [iconSize[0]/2, iconSize[1]],
        popupAnchor: [0, -40]
    })
}

// These are the diamon icons used by the KML library as generic point markers.
function KMLDiamond(iconUrl) {
    if (!iconUrl) {
        iconUrl = "/leaflet/images/open-diamond.png";
    }
    iconSize = [ 20, 20 ];
    return L.icon({
        iconUrl: iconUrl,
        iconSize: iconSize,
        iconAnchor: [ iconSize[0] / 2, iconSize[1] / 2 ],
        popupAnchor: [ 0, -10 ]
    });
}

