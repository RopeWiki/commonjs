
function togglelocsearchchk(id) {
    toggleOption(id);
}

function togglefilterschk(id) {
    if (!toggleOption(id)) {
        // refresh page
        //filtersearch();
    }
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

    return checked;
}

function stopBubble(e) {
    if (e && e.stopPropagation)
        e.stopPropagation();
    else
        window.event.cancelBubble = true;

    toggleFilter(e.id);
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
    var elem = document.getElementById(id);
    var elems = document.getElementsByClassName(id.split('-')[0]);

    var isDisabled = !!elem && elem.disabled;
    if (isDisabled
    ) { //they were all disabled and now one was checked, which will set that to 'unchecked', but set it back to checked, enable and uncheck the others
        for (i = 0; i < elems.length; i++) {
            elems[i].disabled = false;
            elems[i].checked = false;
        }
        //elem.checked = true;
    } else {
        //see if any are checked
        var anyIsChecked = false;
        for (i = 0; i < elems.length; i++)
            if (elems[i].checked) {
                anyIsChecked = true;
                break;
            }

        if (!anyIsChecked) { //disable them
            for (i = 0; i < elems.length; i++) {
                elems[i].checked = true;
                elems[i].disabled = true;
            }
        }
    }
}