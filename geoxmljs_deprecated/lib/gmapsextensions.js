
google.maps.Polyline.prototype.getBounds = function () {
    if (typeof this.bounds != "undefined") { return this.bounds; }
    else { return (this.computeBounds()); }
};

google.maps.Polyline.prototype.getPosition = function () {
    var p = this.getPath();
    return (p.getAt(Math.round(p.getLength() / 2)));
};
google.maps.Polyline.prototype.computeBounds = function () {
    var bounds = new google.maps.LatLngBounds();
    var p = this.getPath();
    for (var i = 0; i < p.getLength(); i++) {
        var v = p.getAt(i);
        if (v) {
            bounds.extend(v);
        }
    }

    this.bounds = bounds;
    return bounds;
};

google.maps.Polyline.prototype.ismouseover = function (latLng) {
    return this.getBounds().contains(latLng) && google.maps.geometry.poly.isLocationOnEdge(latLng, this, map.tolerance ? map.tolerance : null); // tolerance not working?
}

google.maps.Polygon.prototype.ismouseover = function (latLng) {
    return false;
}

google.maps.Marker.prototype.ismouseover = function (latLng) {
    return false; //this.getBounds().contains(latLng);
}

/*
GTileLayerOverlay.prototype.getBounds = function(){return this.bounds; };

GTileLayer.prototype.getBounds = function(){
  return this.bounds;
  }; 
*/

google.maps.Polygon.prototype.getPosition = function () { return (this.getBounds().getCenter()); };
google.maps.Polygon.prototype.computeBounds = function () {
    var bounds = new google.maps.LatLngBounds();
    var p = this.getPaths();
    for (var a = 0; a < p.getLength(); a++) {
        var s = p.getAt(a);
        for (var i = 0; i < s.getLength(); i++) {
            var v = s.getAt(i);
            if (v) {
                bounds.extend(v);
            }
        }
    }
    this.bounds = bounds;
    return bounds;
};
google.maps.Polygon.prototype.getBounds = function () {
    if (typeof this.bounds != "undefined") { return this.bounds; }
    else { return (this.computeBounds()); }
};
google.maps.Polygon.prototype.getCenter = function () {
    return (this.getBounds().getCenter());
};
