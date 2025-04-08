
GeoXml.Label = function (pos, txt, cls, map, scale, index, color) {
    this.pos = pos;
    this.txt_ = txt;
    this.cls_ = cls;
    this.map_ = map;
    this.scale_ = scale;
    this.div_ = null;
    this.index_ = index;
    this.color_ = color;

    // Explicitly call setMap() on this overlay
    this.setMap(map);
}

GeoXml.Label.prototype = new google.maps.OverlayView();

GeoXml.Label.prototype.onAdd = function () {
    var div = document.createElement('DIV');
    div.innerHTML = this.txt_;
    var fs = 12 * this.scale_; if (fs < 8) fs = 8;
    div.py = fs / 2 + this.index_;
    div.px = -iconsize / 2 + this.index_; //(fs*this.txt_.length)/4;
    // Set the overlay's div_ property to this DIV
    //this.div_.style = this.style_;
    div.style.color = this.color_;
    div.style.fontSize = "10px";
    div.style.fontFamily = "Arial";
    div.style.fontWeight = "bold";
    div.style.position = "absolute";
    //div.style.background = "ff0000";
    //div.style.opacity = 0.5;
    //alert("ok2");

    this.div_ = div;
    var overlayProjection = this.getProjection();
    var position = overlayProjection.fromLatLngToDivPixel(this.pos);
    //  alert(this.pos);
    div.style.left = position.x - div.px + 'px';
    div.style.top = position.y - div.py + 'px';
    // We add an overlay to a map via one of the map's panes.
    var panes = this.getPanes();
    panes.floatPane.appendChild(div);
}

GeoXml.Label.prototype.getPosition = function () {
    return this.pos;
}

GeoXml.Label.prototype.draw = function () {
    var overlayProjection = this.getProjection();
    var position = overlayProjection.fromLatLngToDivPixel(this.pos);
    var div = this.div_;
    div.style.left = position.x - div.px + 'px';
    div.style.top = position.y - div.py + 'px';
}

GeoXml.Label.prototype.onRemove = function () {
    //console.log("label is being removed");
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
}

GeoXml.Label.prototype.hide = function () {
    if (this.div_) {
        this.div_.style.visibility = "hidden";
        //console.log("label is being hidden");
    }
}

GeoXml.Label.prototype.show = function () {
    if (this.div_) {
        this.div_.style.visibility = "visible";
    }
}

GeoXml.Label.prototype.toggle = function () {
    if (this.div_) {
        if (this.div_.style.visibility == "hidden") {
            this.show();
        }
        else {
            this.hide();
        }
    }
}

GeoXml.Label.prototype.toggleDOM = function () {
    if (this.getMap()) {
        this.setMap(null);
    }
    else {
        this.setMap(this.map_);
    }
}
