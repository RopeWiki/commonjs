//google maps custom control to display the legend for the track data overlayed on the map

function initLegendControl() {

    var controlsDiv = document.createElement('DIV');
    controlsDiv.innerHTML =
        '<div id="legendbar"><label><input class="gmnoprint" id="legendchk" type="checkbox" onclick="toggleLegend()"><span id="legendlabel">Legend</span></label><br><div id="legend" class="notranslate"></div></div><div id="loadlinks"></div>';

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlsDiv);
    controlsDiv.style.maxHeight = "90%";
    controlsDiv.style.overflow = "auto";
    controlsDiv.style.zIndex = 999;
    controlsDiv.style.marginRight = "5px";
}