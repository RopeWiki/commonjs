
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
        '|%3FHas_star_rating' + //this is raw rating rounded to integer, used for the icon selector. 4-5-5.0 = 5, 4.0-4.5 = 4, the rest rounded
        '|%3FHas_summary' +
        '|%3FHas_banner_image_file' +
        '|%3FHas_location_class' +
        '|%3FHas_KML_file' +
        '|%3FRequires_permits' +
        '|%3FLocated_in_region' + //remove this, included in 'has info major region'

        '|%3FHas_info_major_region' +
        '|%3FHas_total_rating' +
        '|%3FHas_total_counter' +
        '|%3FHas_rank_rating' + //weighted rating taking into consideration the number of votes
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

    var tableCurrentBody = document.getElementById("loctablebody");
    if (!tableCurrentBody) return;

    markers.sort(predicateBy(sortProp, sortDirection));

    const maxTableRows = 100;
    var numDisplayed = 0;
    
    //delete all rows, keep header, replace with new rows:
    var tableNewBody = document.createElement('tbody');
    tableNewBody.id = 'loctablebody';
    
    for (var i = 0; i < markers.length; ++i) {
        var marker = markers[i];

        if (!marker.isVisible) continue;

        var html = assembleTableRow(marker.locationData);

        var newRow = tableNewBody.insertRow(tableNewBody.rows.length);
        newRow.className = "trow notranslate";
        newRow.innerHTML = html;

        numDisplayed++;
        if (numDisplayed >= maxTableRows) break;
    }

    tableCurrentBody.parentNode.replaceChild(tableNewBody, tableCurrentBody);


    //set checkboxes
    var metricCheckbox = document.getElementsByClassName('uchk');
    metricCheckbox[0].firstChild.firstChild.checked = metric;

    var frenchCheckbox = document.getElementsByClassName('fchk');
    frenchCheckbox[0].firstChild.firstChild.checked = french;
}

var sortby = "";
function setTableSortLinks() {
    var tableDiv = document.getElementById("loctable");
    if (!tableDiv) return; //no table in the document

    var tableRef = document.getElementById("loctabledata");
    if (!tableRef) { //has table div but no table, create new
        tableRef = document.createElement("table");
        tableRef.id = "loctabledata";
        tableRef.className = "wikitable loctabledata colgroup";
        tableDiv.appendChild(tableRef);
    }

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

    var sortIcons = document.getElementsByClassName('rwSortIcon');

    for (var i = 0; i < sortIcons.length; i++) {

        sortIcons[i].className += " notranslate";
        
        sortIcons[i].onclick = function () {

            var sortIcons = document.getElementsByClassName('rwSortIcon');
            for (var i = 0; i < sortIcons.length; i++) {
                sortIcons[i].style.backgroundImage = "url('" + SORT_ICON + "')";
                sortIcons[i].style.opacity = "";
            }

            var newSortProp = this.id.substr(5); //remove the 'sort-' at start of id
            if (newSortProp === sortProp) {
                sortDirection *= -1;
            } else {
                sortDirection = 1;
                sortProp = newSortProp;

                if (sortProp === 'rankRating' ||
                    sortProp === 'totalRating' ||
                    sortProp === 'totalCounter' ||
                    sortProp === 'conditionDate') sortDirection = -1; //if it's any of these, first sort by descending
            }

            var thisIcon = document.getElementById(this.id);
            thisIcon.style.backgroundImage = "url('" + (sortDirection > 0 ? SORT_ICON_UP : SORT_ICON_DOWN) + "')";
            thisIcon.style.opacity = "1.0";

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

// table sorting function
var sortProp = "";
var sortDirection = 1;

function predicateBy(propString, direction) {
    return function (a, b) {

        function getTestValue(item) {
            if (!item.locationData) return undefined;
            var entry = item.locationData;

            var prop, props = propString.split('.'); //allow retrieving of nested properties

            var i, candidate;
            for (i = 0; i < props.length; i++) {
                prop = props[i];

                candidate = entry[prop];
                if (candidate !== undefined) {
                    entry = candidate;
                } else {
                    break;
                }
            }
            if (candidate === undefined || candidate == null) return undefined;
            if (candidate.value !== undefined) candidate = candidate.value; //if the item is a unit/value pair, use that value
            return candidate;
        }

        var aEntry = getTestValue(a);
        var bEntry = getTestValue(b);

        if (aEntry == undefined) return 1; //push undefined values to bottom;
        if (bEntry == undefined) return -1; //push undefined values to bottom;

        if (aEntry > bEntry) {
            return 1 * direction;
        } else if (aEntry < bEntry) {
            return -1 * direction;
        }
        return 0;
    }
}
