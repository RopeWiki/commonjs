

var dragging = false;

function initResizeControl() {

    var mw = $("#mapbox").width();
    var dw = $(window).width() - mw;
    if (dw < 50 || mw < 500)
        return; //mobile device
    
    var resizeControl = document.createElement('div');
    resizeControl.id = 'dragbar';
    resizeControl.className = 'controls dragcontrol';
    resizeControl.title = 'Drag to resize map';
    resizeControl.innerHTML = '=';

    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(resizeControl);

    google.maps.event.addDomListener(resizeControl,
        'mousedown', function () {

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

        $(document).mousemove(function (e) {
            ghostbar.css("top", e.pageY + 2);
        });
    });

    $(document).mouseup(function(e) {
        if (dragging) {
            var mapbox = $('#mapbox');
            mapbox.css("height", e.pageY + 2 - mapbox.offset().top);
            $('#ghostbar').remove();
            $(document).unbind('mousemove');
            dragging = false;
        }
    });
}