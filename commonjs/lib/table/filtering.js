
function getLocationParameters(loadLimit) {
    
    const locationParamters =
        '|%3FHas_coordinates' +
        '|%3FHas_summary' +
        '|%3FHas_banner_image_file' +
        '|%3FHas_location_class' +
        '|%3FHas_KML_file' +
        '|%3FRequires_permits' +
        '|%3FHas_info_regions' +
        '|%3FHas_info_major_region' + //need to do this as well because no way to know which is a major region
        '|%3FHas_rank_rating' + //weighted rating taking into consideration the number of votes
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
        '|%3FHas_vehicle_type' +
        '|%3FHas_shuttle_length' +
        '|%3FHas_best_season_parsed' + //remove this, included in 'has condition summary' 
        '|%3FHas_pageid' +

        '|limit=' + loadLimit;

    return locationParamters;
}

function filterMarkers(refreshTable) {
    if (typeof refreshTable === 'undefined') refreshTable = true;

    var filters = {};

    // append filters (if any)
    var mid, list, l, i;
    var filterschk = document.getElementById('filterschk');
    if (filterschk != null && filterschk.checked) {
        var chk = document.getElementsByClassName('filterchk');
        for (i = 0; i < chk.length; i++) {
            var attr = [];

            mid = chk[i].id;
            list = document.getElementsByClassName(mid + '_chk');

            var isDisabled = list[0].disabled;
            if (!isDisabled) {
                for (l = 0; l < list.length; l++)
                    if (list[l].checked) {
                        var value = list[l].id.substring(list[l].id.lastIndexOf('-') + 1);
                        attr.push(value);
                    }
            }
            filters[mid] = attr;
        }
    }

    for (i = 0; i < markers.length; ++i) {

        var marker = markers[i];
        var p = marker.locationData;
        if (!p) continue;

        var display = true;

        runFilter: {
            if (!filters || Object.keys(filters).length === 0) break runFilter; //no filters set, enable all

            //stars
            var stars = filters["star"];
            if (!!stars && stars.length > 0 && !(stars.includes(p.stars.toString())))
                display = false;

            //activity type
            var activityTypes = filters["loctype"];
            if (!!activityTypes && activityTypes.length > 0 && !(activityTypes.includes(p.activity)))
                display = false;

            //permits
            var permits = filters["permits"];
            if (!!permits && permits.length > 0 && !(permits.includes(p.permits)))
                display = false;

            //shuttle
            var shuttle = filters["shuttle"];
            if (!!shuttle && shuttle.length > 0) {
                if (!(shuttle.includes("No Shuttle") && shuttle.includes("Shuttle"))) { //if filter includes both, don't run check
                    if (shuttle.includes("No Shuttle") &&
                        (p.shuttleLength != undefined && (p.shuttleLength.value > 0 && p.shuttleLength.value !== 0.5))) //Luca sets it to 0.5 for optional shuttles
                        display = false;
                    if (shuttle.includes("Shuttle") && (p.shuttleLength == undefined || p.shuttleLength.value === 0))
                        display = false;
                }
            }

            //vehicle type
            var vehicle = filters["vehicle"];
            if (!!vehicle && vehicle.length > 0) {
                if (!(vehicle.includes("2wd") && vehicle.includes("4wd"))) { //if filter includes both, don't run check
                    if (vehicle.includes("2wd") && (p.vehicleType != undefined && p.vehicleType !== "Passenger"))
                        display = false;
                    if (vehicle.includes("4wd") && (p.vehicleType == undefined || p.vehicleType === "Passenger"))
                        display = false;
                }
            }

            //best season
            var bestSeason = filters["best_month"];
            if (!!bestSeason && bestSeason.length > 0) {
                if (!!(p.bestMonths)) {
                    var monthMatched = false;
                    for (var j = 0; j < bestSeason.length; ++j) {
                        if (p.bestMonths.includes(bestSeason[j])) {
                            monthMatched = true;
                            break;
                        }
                    }
                    if (!monthMatched) display = false;
                } else {
                    display = false;
                }
            }

            //technical rating ACA
            var technical = filters["technical"];
            if (!!technical && technical.length > 0 && !(technical.includes(p.technicalRating.technical)))
                display = false;

            var water = filters["water"];
            if (!!water && water.length > 0 && !(water.includes(p.technicalRating.water)))
                display = false;

            var time = filters["time"];
            if (!!time && time.length > 0 && !(time.includes(p.technicalRating.time)))
                display = false;

            var extraRisk = filters["extra_risk"];
            if (!!extraRisk && extraRisk.length > 0)
                if (!(extraRisk.includes(p.technicalRating.risk)) && !(extraRisk.includes('n/a') && !p.technicalRating.risk))
                    display = false;

            //technical rating French
            var vertical = filters["vertical"];
            if (!!vertical && vertical.length > 0 && !(vertical.includes(p.technicalRating.vertical)))
                display = false;

            var aquatic = filters["aquatic"];
            if (!!aquatic && aquatic.length > 0 && !(aquatic.includes(p.technicalRating.aquatic)))
                display = false;

            var commitment = filters["commitment"];
            if (!!commitment && commitment.length > 0 && !(commitment.includes(p.technicalRating.commitment)))
                display = false;
        }

        marker.isVisible = display;
        marker.setMap(display ? map : null);

        if (marker.closedMarker) marker.closedMarker.setMap(display ? map : null);
        if (marker.highlight) marker.highlight.setMap(display ? map : null);
    }

    if (refreshTable) updateTable();
}

function removeMarker(id) {
    var index = markers.map(function (marker) { return marker.locationData.id; }).indexOf(id);
    if (index >= 0) {
        var marker = markers[index];

        clearMarker(marker);

        markers.splice(index, 1);
        locationsTotalWithinArea--;
        searchWasRun = true;
        
        setLoadingInfoText();

        updateTable();

        updateUrlWithVisibleLocations();
    }
}

function clearMarker(marker) {
    if (marker.closedMarker) {
        marker.closedMarker.setMap(null);
        marker.closedMarker = null;
    }
    if (marker.highlight) {
        marker.highlight.setMap(null);
        marker.highlight = null;
    }

    marker.setMap(null);
    marker = null;
}


var maxTableRows = 100;

function updateTable() {

    var tableCurrentBody = document.getElementById("loctablebody");
    if (!tableCurrentBody) return;

    setTableHeaderSortIcons();

    markers.sort(predicateBy(sortProp, sortDirection));

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
        newRow.pageid = marker.locationData.pageid;

        numDisplayed++;

        if (numDisplayed >= maxTableRows) {
            var totalRows = countLocationsVisibleOnMap();

            if (totalRows > maxTableRows) {
                newRow = tableNewBody.insertRow(tableNewBody.rows.length);
                var innerHTML = "<td colspan=\"9\">&nbsp;&nbsp;Displaying " + maxTableRows + " of " + totalRows + " rows";

                innerHTML += '&nbsp;<input type="button" value="Show all" title="Show all table rows" onclick="showAllTableRows()" class="userlistbutton showmore"></td>';

                newRow.innerHTML = innerHTML;
            }

            break;
        }
    }
    
    //hide star rate checkbox if user isn't logged in
    if (!currentuser && !isUserStarRatingsTable())
        $("div#starrate")[0].style.display = "none";

    //add 'star rating info bar' table row if star rating is checked
    //if (starrate) {
    //    var starRatingInfoRow = tableNewBody.insertRow(0);
    //    var colSpan = 9;
    //    var rowText = isUserStarRatingsTable()
    //        ? starRatingsUser.toUpperCase() + "'S RATINGS ARE HIGHLIGHTED IN GREEN"
    //        : "YOUR RATINGS ARE HIGHLIGHTED IN GREEN, CLICK ON THE STARS TO ADD/CHANGE RATINGS, X TO DELETE";

    //    starRatingInfoRow.innerHTML = '<th colspan="' + colSpan + '" class="rwwarningbox" style="font-size:x-small">' + rowText + '</th>';
    //    starRatingInfoRow.className = 'schkon';
    //}

    //now replace the table with the new one
    tableCurrentBody.parentNode.replaceChild(tableNewBody, tableCurrentBody);
    
    //set checkboxes (these checkboxes no longer exist on page load, not until after the table is drawn)
    var myRatingsCheckbox = document.getElementsByClassName('schk');
    myRatingsCheckbox[0].firstChild.firstChild.checked = starrate;

    var frenchCheckbox = document.getElementsByClassName('fchk');
    frenchCheckbox[0].firstChild.firstChild.checked = french;

    var metricCheckbox = document.getElementsByClassName('uchk');
    metricCheckbox[0].firstChild.firstChild.checked = metric;

    updateRatingHighlights();

    setLoadingInfoText();

    scrollTableFirstRowToTop();
}

function showAllTableRows() {
    maxTableRows = 99999;
    updateTable();
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

        //set default sort
        setTableSortProperty(!isUserListTable() ? "rankRating" : "userDate");
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
            setTableSortProperty(this.id.substr(5)); //remove the 'sort-' at start of id;
        }
    }
}

function setTableSortProperty(newSortProp) {
    
    if (newSortProp === "technicalRating") {
        newSortProp += (!french ? ".combinedACA" : ".combinedFrench");
    }

    if (newSortProp === sortProp) {
        sortDirection *= -1;
    } else {
        var newSortDirection = 1; //otherwise set default sort order
        
        if (newSortProp === 'rankRating' ||
            newSortProp === 'totalRating' ||
            newSortProp === 'totalCounter' ||
            newSortProp === 'conditionDate') newSortDirection = -1; //if it's any of these, first sort by descending

        //if it's just changing from aca to french, don't change sort order
        if (!newSortProp.includes("technicalRating") || !sortProp.includes("technicalRating"))
            sortDirection = newSortDirection;

        sortProp = newSortProp;
    }
    
    updateTable();
}

function setTableHeaderSortIcons() {

    var iconId = !sortProp.includes("technicalRating") ? sortProp : "technicalRating"; //don't include the ".combinedACA" or ".combinedFrench"
    var sortIconId = "sort-" + iconId;

    var sortIcons = document.getElementsByClassName('rwSortIcon');
    for (var i = 0; i < sortIcons.length; i++) {
        var sortIcon = sortIcons[i];
        if (sortIcon.id === sortIconId) {
            sortIcon.style.backgroundImage = "url('" + (sortDirection > 0 ? SORT_ICON_UP : SORT_ICON_DOWN) + "')";
            sortIcon.style.opacity = "1.0";
        } else {
            sortIcon.style.backgroundImage = "url('" + SORT_ICON + "')";
            sortIcon.style.opacity = "";
        }
    }
}

function setOptionCheckboxes() {
    var chks = document.getElementsByClassName('optionchk');
    for (var i = 0; i < chks.length; i++) {
        var id = chks[i].id + 'chk';
        var checked = getCookie(id) !== "";
        chks[i].innerHTML = '<label style="white-space: nowrap;"><input id="' + id + '" class="optionschk submitoff" type="checkbox" onclick="toggle' + id + '(' + "'" + id + "'" + ')" ' + (checked ? 'checked' : '') + '>' + chks[i].innerHTML + '</label>';
        toggleOption(id, checked);
    }
}

function setFilterCheckboxes() {
    var url = window.location.href.toString();
    var i, id;

    var chks = document.getElementsByClassName('filterchk');
    
    for (i = 0; i < chks.length; i++) {
        var mid = chks[i].id + '_chk';
        var list = chks[i].innerHTML.split(',');
        var icons = document.getElementById(chks[i].id + 'icons');
        var str = "";
        // get value from url
        var param = urlget(url, chks[i].id + '=', '').split(',');
        for (var l = 0; l < list.length; ++l) {
            id = mid + '-' + list[l];

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
    
    chks = document.getElementsByClassName('filterchk-technical');
    for (i = 0; i < chks.length; i++) {
        id = chks[i].id;

        chks[i].outerHTML = '<span id=' + "'" + id + "'" + ' class="filterchk-technical" style="cursor:pointer;" onclick="toggleDisplayTechnicalFilters(' + "'" + id + "'" + ')">&#9660;</span>';
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

function scrollTableFirstRowToTop() {
    //because of the sticky header row in the table, resorting it will result in the top rows being offscreen if the table was scrolled down
    //scroll it back to the first row if it was offscreen

    var rows = document.getElementById('loctabledata').rows;
    if (!!rows && rows.length > 1) { //row[0] is the header row, see if there are any other rows
        var firstRow = rows[0];
        var rect = firstRow.getBoundingClientRect();
        if (rect.top < 0) {
            var offsetPosition = rect.top + window.pageYOffset - 22;
            window.scrollTo({
                top: offsetPosition,
                behavior: "instant"
            });
        }
    }
}
