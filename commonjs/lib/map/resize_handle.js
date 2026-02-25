// Add vertical resize handle to the map

function addMapResizeHandle() {
    var mapbox = document.getElementById('mapbox');
    if (!mapbox) return;

    // Set initial height if not already set
    if (!mapbox.style.height) {
        mapbox.style.height = '400px';
    }
    mapbox.style.position = 'relative';

    // Create resize handle
    var resizeHandle = document.createElement('div');
    resizeHandle.id = 'map-resize-handle';
    resizeHandle.style.cssText =
        'position: absolute;' +
        'bottom: 0;' +
        'left: 50%;' +
        'transform: translateX(-50%);' +
        'width: 60px;' +
        'height: 10px;' +
        'background: rgba(255, 255, 255, 0.9);' +
        'border: 1px solid #ccc;' +
        'border-radius: 10px 10px 0 0;' +
        'cursor: ns-resize;' +
        'z-index: 1000;' +
        'box-shadow: 0 2px 4px rgba(0,0,0,0.2);';

    // Add visual indicator (three horizontal lines)
    resizeHandle.innerHTML =
        '<div style="' +
            'width: 30px;' +
            'height: 2px;' +
            'background: #999;' +
            'margin: 2px auto;' +
            'border-radius: 1px;' +
        '"></div>' +
        '<div style="' +
            'width: 30px;' +
            'height: 2px;' +
            'background: #999;' +
            'margin: 2px auto;' +
            'border-radius: 1px;' +
        '"></div>';

    mapbox.appendChild(resizeHandle);

    // Add resize functionality
    var isResizing = false;
    var startY = 0;
    var startHeight = 0;

    resizeHandle.addEventListener('mousedown', function(e) {
        isResizing = true;
        startY = e.clientY;
        startHeight = mapbox.offsetHeight;
        e.preventDefault();

        // Add visual feedback
        resizeHandle.style.background = 'rgba(200, 200, 255, 0.9)';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;

        var deltaY = e.clientY - startY;
        var newHeight = startHeight + deltaY;

        // Set minimum and maximum height
        var minHeight = 200;
        var maxHeight = window.innerHeight - 100;

        if (newHeight >= minHeight && newHeight <= maxHeight) {
            mapbox.style.height = newHeight + 'px';

            // Invalidate map size to redraw properly
            if (map && map.invalidateSize) {
                map.invalidateSize();
            }
        }
    });

    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            resizeHandle.style.background = 'rgba(255, 255, 255, 0.9)';
        }
    });

    // Touch support for mobile devices
    resizeHandle.addEventListener('touchstart', function(e) {
        isResizing = true;
        startY = e.touches[0].clientY;
        startHeight = mapbox.offsetHeight;
        e.preventDefault();
        resizeHandle.style.background = 'rgba(200, 200, 255, 0.9)';
    });

    document.addEventListener('touchmove', function(e) {
        if (!isResizing) return;

        var deltaY = e.touches[0].clientY - startY;
        var newHeight = startHeight + deltaY;

        var minHeight = 200;
        var maxHeight = window.innerHeight - 100;

        if (newHeight >= minHeight && newHeight <= maxHeight) {
            mapbox.style.height = newHeight + 'px';

            if (map && map.invalidateSize) {
                map.invalidateSize();
            }
        }
    });

    document.addEventListener('touchend', function() {
        if (isResizing) {
            isResizing = false;
            resizeHandle.style.background = 'rgba(255, 255, 255, 0.9)';
        }
    });
}
