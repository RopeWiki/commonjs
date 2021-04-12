
function togglelocsearchchk(id) {
    toggleOption(id);
}

function togglefilterschk(id) {
    toggleOption(id);
    filterMarkers();
}

function toggleOption(id, forcechecked) {
    var elems, i;
    var checked = toggleFilter(id, forcechecked);

    elems = document.getElementsByClassName(id.split('chk').join('on'));
    for (i = 0; i < elems.length; i++)
        elems[i].style.display = checked ? "" : "none";

    elems = document.getElementsByClassName(id.split('chk').join('off'));
    for (i = 0; i < elems.length; i++)
        elems[i].style.display = !checked ? "" : "none";

    if (id ==="filterschk" && checked) { //expand the aca/french filters
        toggleDisplayTechnicalFilters("filterdisplay-aca", true);
        toggleDisplayTechnicalFilters("filterdisplay-french", true);
    }

    return checked;
}

function filterClicked(e) {
    //stop the event from propogating to the "Label" parent and calling the function a second time
    if (e && e.stopPropagation)
        e.stopPropagation();
    else
        window.event.cancelBubble = true;

    toggleFilter(e.id);
    filterMarkers();
}

function toggleFilter(id, checked) {
    var checkbox = document.getElementById(id);

    if (checked == null)
        checked = checkbox.checked;
    else
        checkbox.checked = checked;

    setCookie(id, (checked ? "on" : ""));

    toggleDisabledChk(id);
    
    return checked;
}

function toggleDisabledChk(id) {
    var i;
    var elems = document.getElementsByClassName(id.split('-')[0]);

    var isDisabled = elems.length > 0 && elems[0].disabled;
    if (isDisabled) { //they were all disabled and now one was checked, so enable and uncheck them
        for (i = 0; i < elems.length; i++) {
            elems[i].disabled = false;
            elems[i].checked = false;
        }
    } else {
        //see if any are checked
        var anyIsChecked = false;
        for (i = 0; i < elems.length; i++)
            if (elems[i].checked) {
                anyIsChecked = true;
                break;
            }

        if (!anyIsChecked) { //disable them all and set to 'checked' because user isn't using them to filter
            for (i = 0; i < elems.length; i++) {
                elems[i].checked = true;
                elems[i].disabled = true;
            }
        }
    }
}

function toggleDisplayTechnicalFilters(id, toggled) {
    var span = document.getElementById(id);

    if (toggled === undefined)
        toggled = span.innerHTML !== String.fromCharCode('9660');

    span.innerHTML = toggled ? '&#9660;' : '&#9658;';

    var type = id.split('-')[1];

    var elems = document.getElementsByClassName("filterson " + type);
    for (var i = 0; i < elems.length; i++)
        elems[i].style.display = toggled ? "" : "none";
}
