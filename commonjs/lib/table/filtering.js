
function getLocationParameters() {

    const loadLimit = 100;
    
    const locationParamters =
        '|%3FHas_coordinates' +
        '|%3FHas_star_rating' + //remove this, it is raw rating rounded to integer
        '|%3FHas_summary' +
        '|%3FHas_banner_image_file' +
        '|%3FHas_location_class' +
        '|%3FHas_KML_file' +
        '|%3FRequires_permits' +
        '|%3FLocated_in_region' + //remove this, included in 'has info major region'

        '|%3FHas_info_major_region' +
        '|%3FHas_total_rating' +
        '|%3FHas_total_counter' +
        '|%3FHas_info_typical_time' +
        '|%3FHas_length_of_hike' +
        '|%3FHas_length' +
        '|%3FHas_depth' +
        '|%3FHas_info_rappels' +
        '|%3FHas_longest_rappel' +
        '|%3FHas_info' +
        '|%3FHas_condition_summary' +
        '|%3FHas_best_season_parsed' + //remove this, included in 'has condition summary' 

        '|limit=' + loadLimit;

    return locationParamters;
}

function updateTable() {
    var i;

    var sortStarRankDesc = function (a, b) {
        if (!a.kmlitem) return 1;
        if (!b.kmlitem) return -1; //push null values to bottom

        var aStarRank = a.kmlitem.totalRating;
        if (!aStarRank) aStarRank = 0;
        var bStarRank = b.kmlitem.totalRating;
        if (!bStarRank) bStarRank = 0;

        if (aStarRank > bStarRank) return -1;
        if (aStarRank < bStarRank) return 1;
        return 0;
    }

    var sortStarRankAsc = function (a, b) {
        if (!a.kmlitem) return 1;
        if (!b.kmlitem) return -1; //push null values to bottom

        var aStarRank = a.kmlitem.totalRating;
        if (!aStarRank) aStarRank = 0;
        var bStarRank = b.kmlitem.totalRating;
        if (!bStarRank) bStarRank = 0;

        if (aStarRank > bStarRank) return 1;
        if (aStarRank < bStarRank) return -1;
        return 0;
    }

    markers.sort(sortStarRankDesc);

    const maxTableRows = 100;
    var numDisplayed = 0;

    var tableCurrentBody = document.getElementById("loctablebody");

    //delete all rows, keep header, replace with new rows:
    var tableNewBody = document.createElement('tbody');
    tableNewBody.id = 'loctablebody';
    
    for (i = 0; i < markers.length; ++i) {
        var marker = markers[i];

        if (marker.getMap() === null) continue;

        var html = assembleTableRow(marker.kmlitem);

        var newRow = tableNewBody.insertRow(tableNewBody.rows.length);
        newRow.className = "trow notranslate";
        newRow.innerHTML = html;

        numDisplayed++;
        if (numDisplayed >= maxTableRows) break;

    }

    tableCurrentBody.parentNode.replaceChild(tableNewBody, tableCurrentBody);
}

function setTableSortLinks() {

    var tableRef = document.getElementById("loctabledata");
    var tableNewHeader = document.createElement('thead');
    var headerRow = tableNewHeader.insertRow();
    headerRow.innerHTML = assembleTableHeaderRow();
    var tableNewBody = document.createElement('tbody');
    tableNewBody.id = 'loctablebody';

    while (tableRef.firstChild) {
        tableRef.removeChild(tableRef.firstChild);
    }
    tableRef.appendChild(tableNewHeader);
    tableRef.appendChild(tableNewBody);

    var chks = document.getElementsByClassName('rwSort');
    var sortbydiv = document.getElementById('sortby');
    if (sortbydiv)
        sortby = sortbydiv.innerHTML;
    for (var i = 0; i < chks.length; i++) {
        var img = "rwsortud.gif";
        if (chks[i].id == sortby)
            img = "rwsortdn.gif";
        if ('-' + chks[i].id == sortby)
            img = "rwsortup.gif";

        chks[i].className += " notranslate";
        chks[i].style.cssText += 'cursor: pointer; background-repeat: no-repeat; background-position: center right; padding-right:9px; padding-left:0px; background-image: url(https://sites.google.com/site/rwicons/' + img + ');';

        chks[i].onclick = function rwsort(event) {
            var offset = $(this).offset();
            var height = $(this).height();
            var top = offset.top;
            var center = top + height / 2;
            if (event.pageY < center) {
                psortby = '-' + this.id;
                nsortby = this.id;
            } else {
                psortby = this.id;
                nsortby = '-' + this.id;
            }
            // if select twice the same, invert sorting
            sortby = (sortby == psortby) ? nsortby : psortby;
            filtersearch();
        }
    }
}

function setOptionCheckboxes() {
    var url = window.location.href.toString();

    var chks = document.getElementsByClassName('optionchk');
    for (var i = 0; i < chks.length; i++) {
        var id = chks[i].id + 'chk';
        var checked = url.indexOf('&' + id) > 0;
        chks[i].innerHTML = '<label style="white-space: nowrap;"><input id="' + id + '" class="optionschk submitoff" type="checkbox" onclick="toggle' + id + '(' + "'" + id + "'" + ')" ' + (checked ? 'checked' : '') + '>' + chks[i].innerHTML + '</label>';
        toggleOption(id, checked);
    }
}

function setFilterCheckboxes() {
    var url = window.location.href.toString();

    var chks = document.getElementsByClassName('filterchk');
    for (var i = 0; i < chks.length; i++) {
        var mid = chks[i].id + '_chk';
        var list = chks[i].innerHTML.split(',');
        var icons = document.getElementById(chks[i].id + 'icons');
        var str = "";
        // get value from url
        var param = urlget(url, chks[i].id + '=', '').split(',');
        for (var l = 0; l < list.length; ++l) {
            var id = mid + '-' + list[l];

            // set checked if cookie or url said so
            var checked = getCookie(id) !== "";
            if (param.length > 0 && param[0] !== "") checked = param.indexOf(list[l]) >= 0;

            var title, text;
            if (icons) {
                title = icons.childNodes[l].title;
                text = icons.childNodes[l].innerHTML;
            } else {
                title = list[l];
                text = list[l];
            }

            str += ' ' + '<label title="' + title + '" onclick="toggleDisabledChk(' + "'" + id + "'" + ')"><input id="' + id + '" class="' + mid + '" style="" type="checkbox" ' + (checked ? 'checked' : '') + ' onclick="filterClicked(this)"/>' + text + '</label>';
        }
        chks[i].innerHTML = str;

        toggleDisabledChk(mid);
    }
}