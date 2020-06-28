function regsearch() {
    //console.log("locsearch");
    var regnameval = document.getElementById('regnameval');
    if (regnameval.value != "" && deftext(regnameval.value))
        return;

    var url = window.location.href;
    var url = url.split('#')[0].split('?')[0];
    var val = regnameval.value;
    if (val.length > 0)
        url += "?region=" + urlencode(val);
    setCookie('regnameval', urlencode(val));

    // disable buttons, wait cursor and navigate away
    var buttons = document.getElementsByClassName('submitoff');
    for (var i = 0; i < buttons.length; i++)
        buttons[i].disabled = true;

    document.body.style.cursor = 'wait';
    window.location.href = url;
}

function filtersearch(linkurl) {
    var url = window.location.href;
    if (typeof linkurl != "undefined")
        url = linkurl;
    var url = url.split('#')[0].split('?')[0];

    //console.log("fsearch");
    // clean url first
    var param = "";

    // append options
    var optionschks = document.getElementsByClassName('optionschk');
    if (optionschks != null)
        for (var i = 0; i < optionschks.length; i++)
            if (optionschks[i].checked)
                param = addparam(param, optionschks[i].id, 'on');

    // append filters (if any)
    var filterschk = document.getElementById('filterschk');
    if (filterschk != null && filterschk.checked) {
        var chks = document.getElementsByClassName('filtersel');
        for (var i = 0; i < chks.length; i++)
            if (chks[i].style.display != "none") {
                var mid = chks[i].id + 'flt';
                var list = chks[i].getElementsByClassName(mid);
                for (var l = 0; l < list.length; ++l) {
                    var x = list[l].selectedIndex;
                    var y = list[l].options;
                    param = addparam(param, chks[i].id, y[x].text);
                }
            }
        var chks = document.getElementsByClassName('filterchk');
        for (var i = 0; i < chks.length; i++) {
            var mid = chks[i].id + 'flt';
            var list = document.getElementsByClassName(mid);
            var attr = [];
            for (var l = 0; l < list.length; l++)
                if (list[l].checked)
                    attr.push(list[l].id.substring(list[l].id.lastIndexOf('_') + 1));
            param = addparam(param, chks[i].id, attr.join());
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
                    if (locnameval.substr(0, 6) != 'Coord:')
                        locdistval = "50mi"; // default
                //setCookie('locnameval', locnameval);
                //setCookie('locdistval', locdistval);
                //console.log("loc");
                url = SITE_BASE_URL + '/Location';
                param = addparam(param, 'locname', urlencode(locnameval));
                if (!deftext(locdistval))
                    param = addparam(param, 'locdist', urlencode(locdistval));
            }
        }
    //console.log(url);

    // append hidden parameters
    var optionsurl = document.getElementsByClassName('optionsurl');
    if (optionsurl != null)
        for (var i = 0; i < optionsurl.length; i++) {
            var val = optionsurl[i].innerHTML;
            if (val.length > 0)
                param = addparam(param, optionsurl[i].id, val);
        }

    // append sorting if any
    if (sortby)
        param = addparam(param, 'sortby', sortby);

    if (param != "") url += "?jform" + param;

    if (typeof linkurl != "undefined")
        return url;

    // disable buttons, wait cursor and navigate away
    var buttons = document.getElementsByClassName('submitoff');
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
