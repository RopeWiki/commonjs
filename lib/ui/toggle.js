function toggleFilterSel(elem, checked) {
    /*
    var elem = document.getElementById(id);
    if (!elem)
      return null;
    */

    var x = elem.selectedIndex;
    var y = elem.options;
    if (checked == null)
        checked = y[x].text;

    elem.value = checked;

    for (var l = 0; l < y.length; ++l)
        if (y[l].text != "") {
            var text = y[l].text;
            var chks = document.getElementsByClassName(elem.id + text);
            for (var i = 0; i < chks.length; i++)
                chks[i].style.display = text == checked ? "" : "none";
        }

    setCookie(elem.id, checked);
    return checked;
}

function toggleFilter(id, checked) {
    if (checked == null)
        checked = document.getElementById(id).checked;
    document.getElementById(id).checked = checked;
    if (checked)
        setCookie(id, "on");
    else
        setCookie(id, "");
    return checked;
}

function toggleOption(id, forcechecked) {
    checked = toggleFilter(id, forcechecked);
    //console.log("id:"+id+" checked:"+checked);
    elems = document.getElementsByClassName(id.split('chk').join('on'));
    for (var i = 0; i < elems.length; i++)
        elems[i].style.display = checked ? "" : "none";
    elems = document.getElementsByClassName(id.split('chk').join('off'));
    for (var i = 0; i < elems.length; i++)
        elems[i].style.display = checked ? "none" : "";
    return checked;
}

function togglelocsearchchk(id) {
    toggleOption(id);
}

function togglefilterschk(id) {
    if (!toggleOption(id)) {
        // refresh page
        filtersearch();
    }
}

function toggledisplayschk(id) {
    if (!toggleOption(id)) {
        // disable all options
        elems = document.getElementsByClassName(id.split('chk').join('on'));
        for (var i = 0; i < elems.length; i++)
            toggleFilter(elems[i].id + 'chk', false);
        // refresh page
        filtersearch();
    }
}

function togglenomapchk(id) {
    // refresh page
    filtersearch();
}

function togglefulltablechk(id) {
    // refresh page
    filtersearch();
}

/*
function togglestarratechk(id)
{
     // refresh page
    //filtersearch();
    LoadStars();
}

function togglefrenchchk(id)
{
     // refresh page
    filtersearch();
}
*/
