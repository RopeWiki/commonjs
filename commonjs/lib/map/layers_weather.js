
// Section for managing and animating weather radar layers

var radarInterval;
var radarTimes;
var radarTimesNexrad = ['900913-m50m', '900913-m45m', '900913-m40m', '900913-m35m', '900913-m30m', '900913-m25m', '900913-m20m', '900913-m15m', '900913-m10m', '900913-m05m', '900913'];
var weatherGetTileUrl;

// turn on/off weather radar
function displayWeatherLayer(showing) {
    var i;

    var showNexrad = isUSAorCanada();

    if (showing) {

        radarTimes = [];

        if (showNexrad) {
            for (i = 0; i < radarTimesNexrad.length; i++) {
                radarTimes[i] = radarTimesNexrad[i];
            }

        } else {
            $.getJSON('https://api.rainviewer.com/public/maps.json', function (data) {
                radarTimes = data;
            });
        }

        SetWeatherLayerType(showNexrad);

        zoomOutThenStartAnimation();
    } else {
        clearInterval(radarInterval);
        var len = radarTimesNexrad.length;
        for (i = 0; i < len; i++) {
            map.overlayMapTypes.pop();
        }
        weatherLayersLoaded = null;
    }
}

function toggleWeatherLayerStatic() {
    if (!showing) {

        var radarLayer = new google.maps.ImageMapType({
            getTileUrl: Function("tile", "zoom", url),
            tileSize: new google.maps.Size(256, 256),
            opacity: 0.00,
            name: radarTimes[i],
            isPng: true
        });

        map.overlayMapTypes.push(radarLayer);
        showing = 'true';

        zoomOut();
    } else {
        map.overlayMapTypes.pop();
        showing = null;
    }
}

function SetWeatherLayerType(showNexrad) {
    if (showNexrad) {
        //iowa state nexrad weather radar
        weatherGetTileUrl =
            "return 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-[time]/' + zoom + '/' + tile.x + '/' + tile.y + '.png';";
    } else {
        //this layer isn't so bad for worldwide. Not as good as the doppler radar, but shows precipitation
        weatherGetTileUrl =
            "return 'https://tilecache.rainviewer.com/v2/radar/[time]/256/' + zoom + '/' + tile.x + '/' + tile.y + '/1/1_1.png';";
    }
}

var weatherLayersLoaded;
function loadWeatherLayers() {
    if (weatherLayersLoaded) return;
    
    var len = radarTimes.length;
    for (var i = 0; i < len; i++) {
        var url = weatherGetTileUrl.replace("[time]", radarTimes[i]);
        var radarLayer = new google.maps.ImageMapType({
            getTileUrl: Function("tile", "zoom", url),
            tileSize: new google.maps.Size(256, 256),
            opacity: 0.00,
            name: radarTimes[i],
            isPng: true
        });

        map.overlayMapTypes.push(radarLayer);
    }

    radarStep = radarTimes.length - 1; //set to 'current time' layer

    weatherLayersLoaded = true;
}

// animate the Weather Radar
var radarStep = 0;
function animateNextLayer() {
    var len = radarTimes.length;
    if (len === 0) return;

    if (!weatherLayersLoaded)
        loadWeatherLayers();

    var layer = radarStep;
    var startIndex = 0;
    if (map.overlayMapTypes.length > len) {
        startIndex++; //increase by 1 because relief layer is current part of map and is in position '0'
    }
    if (layer + 1 <= len) { //layer will keep incrementing beyond len, as it is equal to radarStep, but we want to pause on the 'current time' layer
        
        var previousLayer = layer - 1;
        if (previousLayer < 0)
            previousLayer = len - 1;

        map.overlayMapTypes.getAt(previousLayer + startIndex).setOpacity(0.00);

        map.overlayMapTypes.getAt(layer + startIndex).setOpacity(0.60);
    }

    radarStep++;
    if (radarStep > len + 6) { //pause at the current time for a few steps
        radarStep = 0;
    }
}

function zoomOutThenStartAnimation() {
    if (map.getZoom() > 8) {
        map.setZoom(map.getZoom() - 1);
        setTimeout(zoomOutThenStartAnimation, 200);
    } else {
        animateNextLayer();
        radarInterval = setInterval(animateNextLayer, 500);
    }
}
