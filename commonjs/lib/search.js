function regsearch() {
    var regnameval = document.getElementById('regnameval');
    if (regnameval.value !== "" && deftext(regnameval.value))
        return;

    var url = window.location.href;
    url = url.split('#')[0].split('?')[0];
    var val = regnameval.value;
    if (val.length > 0)
        url += "?region=" + urlencode(val);
    setCookie('regnameval', urlencode(val));

    // disable buttons, wait cursor and navigate away
    var buttons = document.getElementsByClassName("submitoff");
    for (var i = 0; i < buttons.length; i++)
        buttons[i].disabled = true;

    document.body.style.cursor = 'wait';
    window.location.href = url;
}

function locsearch() {
    //console.log("locsearch");
    var locnameval = document.getElementById('locnameval');
    if (locnameval != null && deftext(locnameval.value))
        return;

    filtersearch();
}

function filtersearch() {
    var url = window.location.href;

    url = url.split('#')[0].split('?')[0];

    // clean url first
    var param = "", i;

    // append options
    var optionschks = document.getElementsByClassName('optionschk');
    if (optionschks != null)
        for (i = 0; i < optionschks.length; i++)
            if (optionschks[i].checked)
                param = addparam(param, optionschks[i].id, 'on');

    // append filters (if any)
    var mid, list, l;
    var filterschk = document.getElementById('filterschk');
    if (filterschk != null && filterschk.checked) {
        var sel = document.getElementsByClassName('filtersel');
        for (i = 0; i < sel.length; i++)
            if (sel[i].style.display !== "none") {
                mid = sel[i].id + 'flt';
                list = sel[i].getElementsByClassName(mid);
                for (l = 0; l < list.length; ++l) {
                    var x = list[l].selectedIndex;
                    var y = list[l].options;
                    param = addparam(param, sel[i].id, y[x].text);
                }
            }

        var chk = document.getElementsByClassName('filterchk');
        for (i = 0; i < chk.length; i++) {
            mid = chk[i].id + 'flt';
            list = document.getElementsByClassName(mid);
            var attr = [];
            for (l = 0; l < list.length; l++)
                if (list[l].checked)
                    attr.push(list[l].id.substring(list[l].id.lastIndexOf('_') + 1));
            param = addparam(param, chk[i].id, attr.join());
        }
    }

    // append location (if any)
    var locsearchchk = document.getElementById('locsearchchk');
    if (typeof linkurl == "undefined")
        if (locsearchchk != null && locsearchchk.checked) {
            var locnameval = document.getElementById('locnameval').value;
            if (!deftext(locnameval)) {
                var locdistval = document.getElementById('locdistval').value;
                if (deftext(locdistval))
                    if (locnameval.substr(0, 6) !== 'Coord:')
                        locdistval = "50mi"; // default
                url = SITE_BASE_URL + '/Location';
                param = addparam(param, 'locname', urlencode(locnameval));
                if (!deftext(locdistval))
                    param = addparam(param, 'locdist', urlencode(locdistval));
            }
        }

    // append hidden parameters
    var optionsurl = document.getElementsByClassName('optionsurl');
    if (optionsurl != null)
        for (i = 0; i < optionsurl.length; i++) {
            var val = optionsurl[i].innerHTML;
            if (val.length > 0)
                param = addparam(param, optionsurl[i].id, val);
        }

    // append sorting if any
    if (sortby) param = addparam(param, 'sortby', sortby);

    if (param !== "") url += "?jform" + param;
    
    // disable buttons, wait cursor and navigate away
    var buttons = document.getElementsByClassName('submitoff');
    for (i = 0; i < buttons.length; i++)
        buttons[i].disabled = true;

    document.body.style.cursor = 'wait';
    window.location.href = url;
}
