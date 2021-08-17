

var dragging = false;

function initResizeControl() {

    var mw = $("#mapbox").width();
    var dw = $(window).width() - mw;
    if (dw < 200 || //mapbox and right sidebar are not side-by-side
        mw < 330)  //mapbox too small to show resize control, overlaps 'Search Map' button
        return; //hide the resize control, likely mobile device
    
    var resizeControl = document.createElement('div');
    resizeControl.id = 'dragbar';
    resizeControl.className = 'controls dragcontrol gmnoprint';
    resizeControl.title = 'Drag to resize map';
    resizeControl.innerHTML = '=';

    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(resizeControl);

    google.maps.event.addDomListener(resizeControl,
        'mousedown', function() {
            var ghostbar = createGhostbar();

            $(document).mousemove(function(e) {
                ghostbar.css("top", e.pageY + 2);
            });
        });

    google.maps.event.addDomListener(resizeControl,
        'touchstart', function (e) {
            var ghostbar = createGhostbar();

            $(document).bind('touchmove', function (e) {
                var y = (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]).pageY;
                ghostbar.css("top", y + 2);
            });

            e.preventDefault();
        });

    $(document).mouseup(function (e) {
        if (dragging) {
            finalizeGhostbar(e.pageY);

            $(document).unbind('mousemove');
        }
    });

    $(document).on("touchend", function (e) {
        if (dragging) {
            var ypos = (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]).pageY;
            finalizeGhostbar(ypos);

            $(document).unbind('touchmove');
        }
    });
}

function createGhostbar() {
    dragging = true;
    var mapbox = $('#mapbox');
    var ghostbar = $('<div>',
        {
            id: 'ghostbar',
            css: {
                width: mapbox.outerWidth(),
                top: mapbox.offset().top,
                left: mapbox.offset().left
            }
        }).appendTo('body');

    return ghostbar;
}

function finalizeGhostbar(ypos) {
    var mapbox = $('#mapbox');
    mapbox.css("height", ypos + 2 - mapbox.offset().top);
    $('#ghostbar').remove();
    dragging = false;
}