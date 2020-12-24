
function getTotalLocations() {
    var bounds = searchmaprectangle.bounds;
    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();

    var urlCount = SITE_BASE_URL +
        '/index.php?action=raw&templates=expand&ctype=text/x-wiki' +
        '&title=Template:RegionCountArea' +
        '&bounds=' + urlencode(sw.lat().toFixed(3) + "," + sw.lng().toFixed(3) + "," + ne.lat().toFixed(3) + "," + ne.lng().toFixed(3));

    $.get(geturl(urlCount), function (data) {
        var loctotal = document.getElementById("loctotal");
        if (loctotal) loctotal.innerHTML = data;
    });
}

function getLocationParameters() {
    
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
    
    markers.sort(predicateBy(sortProp, sortDirection));

    const maxTableRows = 100;
    var numDisplayed = 0;

    var tableCurrentBody = document.getElementById("loctablebody");

    //delete all rows, keep header, replace with new rows:
    var tableNewBody = document.createElement('tbody');
    tableNewBody.id = 'loctablebody';
    
    for (var i = 0; i < markers.length; ++i) {
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

var sortby = "";
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
            //var offset = $(this).offset();
            //var height = $(this).height();
            //var top = offset.top;
            //var center = top + height / 2;

            //var psortby, nsortby;
            //if (event.pageY < center) {
            //    psortby = '-' + this.id;
            //    nsortby = this.id;
            //} else {
            //    psortby = this.id;
            //    nsortby = '-' + this.id;
            //}
            //// if select twice the same, invert sorting
            //sortby = (sortby === psortby) ? nsortby : psortby;
            ////filtersearch();

            var newSortProp = this.id.substr(5); //remove the 'sort-' at start of id
            if (newSortProp === sortProp) sortDirection *= -1;
            sortProp = newSortProp;
            updateTable();
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

// **** table sorting functions
var sortProp = "";
var sortDirection = 1;

function predicateBy(prop, direction) {
    return function (a, b) {
        if (!a.kmlitem) return 1 * direction;
        if (!b.kmlitem) return -1 * direction; //push null values to bottom

        var aEntry = a.kmlitem[prop];
        if (!aEntry) aEntry = 0;
        var bEntry = b.kmlitem[prop];
        if (!bEntry) bEntry = 0;

        if (aEntry > bEntry) {
            return 1 * direction;
        } else if (aEntry < bEntry) {
            return -1 * direction;
        }
        return 0;
    }
}

//name

//region

//star rating and popularity

//star rating

//popularity

//technical rating

//average time

//hike length

//descent length

//descent depth

//raps count

//raps max height

//condition date
