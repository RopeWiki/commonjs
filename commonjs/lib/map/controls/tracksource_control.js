//google maps custom control to select the source of the track data overlayed on the map

function initTrackSourceControl(selection) {

    var domains = [];
    var text = '<div class = "dropDownOptionsDiv" id="myddOptsDiv">';
    for (var i = 0; i < selection.length; ++i) {
        var style = "";
        var link = selection[i];
        if (noextraction(link))
            style = "color:red;";
        var counter = 0;
        var domain = getdomain(link);
        domains.push(domain);
        for (var d = 0; d < domains.length; ++d)
            if (domains[d] == domain)
                ++counter;
        if (counter > 1)
            domain += "#" + counter;
        text += '<div class="dropDownItemDiv" onClick="loadSource(\'' + link + '\',\'' + domain + '\')" style="' + style + '">' + domain + '</div>';
    }

    var big = document.getElementsByTagName('BIG');
    if (big && big.length > 0 && selection.length > 1) {
        var link = urlencode(big[0].innerHTML);
        text += '<div class="dropDownItemDiv" onClick="loadSource(\'' + link + '\',\'ALL COMBINED\')" style="font-weight:bold">ALL COMBINED</div>';
    }

    text += "</div>";
    var name = getdomain(selection[0]);
    text +=
        '<div class="dropDownControl" onclick="(document.getElementById(\'myddOptsDiv\').style.display == \'block\') ? document.getElementById(\'myddOptsDiv\').style.display = \'none\' : document.getElementById(\'myddOptsDiv\').style.display = \'block\';"><span id="myddOptsText">' +
        name +
        '</span><img class="dropDownArrow" src="https://maps.gstatic.com/mapfiles/arrow-down.png"/></div>';

    lastlinks.push(filelink = selection[0]);

    var sourceDiv = document.createElement("DIV");
    sourceDiv.className = "dropDownControlDiv";
    sourceDiv.style.zIndex = 1000;
    sourceDiv.innerHTML = text;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(sourceDiv);

    if (selection.length < 2)
        sourceDiv.style.display = "none";
}