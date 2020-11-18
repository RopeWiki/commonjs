
// Section for managing and animating weather radar layers

function addWeatherControl(controlDiv) {
    // Set CSS for the control border.
    var controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    //controlUI.style.marginBottom = "22px";
    controlUI.style.marginTop = "9px";
    controlUI.style.marginRight = "10px";
    controlUI.style.textAlign = "center";
    controlUI.title = "Click to display weather";

    // Set CSS for the control interior.
    var controlText = document.createElement("div");
    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "16px";
    controlText.style.lineHeight = "38px";
    controlText.style.paddingLeft = "5px";
    controlText.style.paddingRight = "5px";
    controlText.innerHTML = "Weather";
    controlUI.appendChild(controlText);

    controlUI.addEventListener("click", function () {
        showRadarLayer();
    });

    controlDiv.appendChild(controlUI);
}

// turn on/off weather radar

var radarInterval;
var radarTimesNexrad = ['900913-m50m', '900913-m45m', '900913-m40m', '900913-m35m', '900913-m30m', '900913-m25m', '900913-m20m', '900913-m15m', '900913-m10m', '900913-m05m', '900913'];

var showing;
function showRadarLayer() {

    if (!showing) {
        showing = 'true';
        zoomOutThenStartAnimation();
    } else {
        clearInterval(radarInterval);
        var len = radarTimesNexrad.length;
        for (var i = 0; i < len; i++) {
            map.overlayMapTypes.pop();
        }
        showing = null;
        weatherLayersLoaded = null;
    }
}

var radarTimes2;
function showRadarLayer2() {
    if (!showing) {
        $.getJSON('https://api.rainviewer.com/public/maps.json', function (data) {
            radarTimes2 = data;
        });

        //this layer isn't so bad for worldwide. Not the same as doppler radar, but shows precipitation
        tileRainViewer = new google.maps.ImageMapType({
            getTileUrl: function (p, z) {
                if (!radarTimes2) return "";
                var timeStamp = radarTimes2[radarTimes2.length - 1];
                return "https://tilecache.rainviewer.com/v2/radar/" + timeStamp + "/256" +
                    "/" + z +
                    "/" + slippyClip(p.x, z) +
                    "/" + slippyClip(p.y, z) +
                    "/1/1_1.png";
            },
            tileSize: new google.maps.Size(256, 256),
            opacity: 0.60,
            name: 'NEXRAD',
            isPng: true
        });
        map.overlayMapTypes.push(tileRainViewer);
        showing = 'true';

        zoomOut();
    } else {
        map.overlayMapTypes.pop();
        showing = null;
    }
}

var weatherLayersLoaded;
function loadWeatherLayers() {
    if (weatherLayersLoaded) return;

    var len = radarTimesNexrad.length;
    for (var i = 0; i < len; i++) {
        console.log(radarTimesNexrad[i]);

        var radarLayer = new google.maps.ImageMapType({
            getTileUrl: Function("tile",
                "zoom",
                "console.log('tile load: '+ tile +', ' + zoom); return 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-" +
                radarTimesNexrad[i] + "' + '/' + zoom + '/' + tile.x + '/' + tile.y + '.png';"),
            tileSize: new google.maps.Size(256, 256),
            opacity: 0.00,
            name: radarTimesNexrad[i],
            isPng: true
        });

        map.overlayMapTypes.push(radarLayer);
    }
    weatherLayersLoaded = true;
}

// animate the Weather Radar
var radarStep = 0;
function animateNextLayer() {
    var layer = radarStep;
    var startIndex = 0;
    var len = radarTimesNexrad.length;
    if (map.overlayMapTypes.length > len) {
        startIndex++; //increase by 1 because relief layer is current part of map and is in position '0'
    }
    if (layer + 1 <= len) { //layer will keep incrementing beyond len, as it is equal to radarStep, but we want to pause on the current time layer
        
        var previousLayer = layer - 1;
        if (previousLayer < 0)
            previousLayer = len - 1;

        map.overlayMapTypes.getAt(previousLayer + startIndex).setOpacity(0.00);

        map.overlayMapTypes.getAt(layer + startIndex).setOpacity(0.60);
    }

    radarStep++;
    if (radarStep > 17) { //pause at the current time for a few steps
        radarStep = 0;
    }
}

function zoomOutThenStartAnimation() {
    if (map.getZoom() > 8) {
        map.setZoom(map.getZoom() - 1);
        setTimeout(zoomOutThenStartAnimation, 200);
    } else {
        loadWeatherLayers();

        radarStep = radarTimesNexrad.length - 1;
        animateNextLayer();
        radarInterval = setInterval(animateNextLayer, 500);
    }
}