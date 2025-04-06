//google maps custom control to display the legend for the track data overlayed on the map

function initLegendControl() {

    //var legendBox = document.createElement('div');
    //legendBox.innerHTML =
    //    '<div id="legendbar" class="map-control legend">' +
    //        '<label>' +
    //            '<input class="gmnoprint" id="legendchk" type="checkbox">' +
    //            '<span id="legendlabel">Legend</span>' +
    //        '</label><br>' +
    //        '<div id="legend" class="notranslate"></div>' +
    //    '</div>';
    
    var legendBox = document.createElement("div");
    legendBox.id = "legendbar";
    legendBox.className = "controls legend";

    var span = document.createElement("span");
    span.role = "checkbox";
    span.id = "legendlabel";

    var chk = document.createElement("input");
    chk.setAttribute("type", "checkbox");
    chk.id = "legendchk";
    chk.className = "gmnoprint";

    var controlText = document.createElement("label");
    controlText.id = "legendlabel";
    controlText.setAttribute("for", chk.id);
    controlText.innerHTML = "Legend";

    var condenseButton = document.createElement("span");
    condenseButton.id = "legendCondense";
    condenseButton.className = "controls legend condense gmnoprint";
    condenseButton.style.display = "none";
    condenseButton.innerHTML = ">>";

    var legendContent = document.createElement("div");
    legendContent.id = "legend";
    legendContent.className = "notranslate";

    legendBox.appendChild(chk);
    legendBox.appendChild(controlText);
    legendBox.appendChild(condenseButton);
    legendBox.appendChild(legendContent);

    chk.addEventListener("change",
        function() {
            toggleLegend();
        });

    condenseButton.addEventListener("click",
        function() {
            toggleLegendWidth();
        });

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legendBox);

    try { //not supported in Internet Explorer
        legendSizeObserver = new ResizeObserver(legendSizeChanged).observe(legendBox);
    } catch (error) {
    }
}

var legendSizeObserver;

var showLegend;

function toggleLegend(force) {
    var legend = document.getElementById("legend");
    var label = document.getElementById("legendlabel");
    var mapsidebar = document.getElementById("mapsidebar");

    if (showLegend == null || force) {
        if (legend && mapsidebar) {
            legend.style.display = "block";
            legend.innerHTML = legend.innerHTML + mapsidebar.innerHTML;
            mapsidebar.innerHTML = "";
        }
        if (label && showLegend == null)
            showLegend = label.innerHTML;
    } else {
        if (legend) {
            legend.style.display = "none";
            legend.style.width = "auto";
        }
        legendInitialWidth = 0;
        legendCondensed = false;
        showLegend = null;
    }

    var chk = document.getElementById("legendchk");
    if (chk) {
        chk.checked = showLegend != null;
        if (!chk.checked) {
            legendInitialWidth = 0;
        }
    }
}

const condensedWidth = 90;
var legendInitialWidth = 0;

function legendSizeChanged() {
    var legend = document.getElementById("legend");
    var chk = document.getElementById("legendchk");
    var legendCondense = document.getElementById("legendCondense");
    
    if (!!legend && !!chk && !!legendCondense) {
        if (chk.checked) {
            var width = legend.offsetWidth;
            if (!legendCondensed) {
                legendInitialWidth = width;
                legendCondense.innerHTML = ">>";
            }

            if (legendInitialWidth > condensedWidth + 40) {
                legendCondense.style.display = "block";
            } else {
                legendCondense.style.display = "none";
            }
        } else {
            legendCondense.style.display = "none";
        }
    }
}

var legendCondensed = false;

function toggleLegendWidth() {
    var legend = document.getElementById("legend");
    var legendCondense = document.getElementById("legendCondense");

    if (!legend || !legendCondense) return;

    if (legendCondensed) {
        legend.style.width = legendInitialWidth + "px";
        legendCondense.innerHTML = ">>";
        legendCondensed = false;
    } else {
        legend.style.width = condensedWidth + "px";
        legendCondense.innerHTML = "<<";
        legendCondensed = true;
    }
}
