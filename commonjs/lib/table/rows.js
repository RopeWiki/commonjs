﻿// this draws the table rows of the canyon locations used in the region and search pages
// previously, we relied on Mediawiki drawing the table and displaying it to the user. However,
// this had the limitation of only being able to show on the table what was calculated through the 
// mediawiki templates.if the user wanted to filter on canyons, a new request to ropewiki.com and a 
// new pageload would have to happen, with all the associated data transfer.
// Now, the table drawing is done locally, and the data for any downloaded canyons are kept in the memory,
// so filtering can be instantaneous, and also a lesser amount of data is transferred over the network,
// just the specs specific to a canyon location, and all the surrounding html is generated locally

function assembleTableHeaderRow() {
    var header = !isUserListTable()
        ? getStandardTableHeaderRow()
        : getUserListTableHeaderRow();

    return '<tr>' + header + '</tr>';
}

function assembleTableRow(item) {
    var row = !isUserListTable()
        ? getStandardTableRow(item)
        : getUserListTableRow(item);
    
    return '<tr class="trow notranslate">' + row + '</tr>';
}

function getStandardTableHeaderRow() {
    var showingMyRatings = (!isUserStarRatingsTable() || starRatingsUser === currentUser);

    const Header =
        '<th class="rwHdr">' +
            '<div class="gmnoprint toption locateicon">↓ Click on icon to locate on map</div>' +
            '<span class="rwText">Location Name</span>' +
            '<span id="sort-id" title="Sort by name of location" class="rwSortIcon gmnoprint notranslate"></span>' +
            '<span id="sort-region" title="Sort by name of region" class="rwSortIcon gmnoprint notranslate"></span>' +
        '</th>' +
        '<th class="rwHdr">' +
        '<div id="starrate" class="schk gmnoprint toption notranslate" title="Show star ratings ' + (showingMyRatings ? "you" : "they") +' have given"><label><input class="gmnoprint" type="checkbox" onclick="toggleStarrate()">' + (showingMyRatings ? "My" : "Their") +' ratings</label></div>' +
            '<span id="sort-rankRating" title="Sort by combined Quality & Popularity formula" class="rwSortIcon gmnoprint notranslate"></span>' +
            '<span class="rwText"><a href="/StarRank" title="Star ratings">Quality</a></span>' +
            '<span id="sort-totalRating" title="Sort by raw user rating" class="rwSortIcon gmnoprint notranslate"></span>' +
            '<span id="sort-totalCounter" title="Sort by number of ratings" class="rwSortIcon gmnoprint notranslate"></span>' +
        '</th>' +
        '<th class="rwHdr">' +
            '<div class="fchk gmnoprint toption notranslate" title="Use French grading system"><label><input class="gmnoprint" type="checkbox" onclick="toggleFrench()">French</label></div>' +
            '<span class="rwText"><a href="/Rating" title="Difficulty rating">Difficulty</a></span>' +
            '<span id="sort-technicalRating" title="Sort by technical difficulty" class="rwSortIcon gmnoprint notranslate"></span>' +
        '</th>' +
        '<th class="rwHdr">' +
            '<div class="uchk gmnoprint toption notranslate" title="Show metric units"><label><input class="gmnoprint" type="checkbox" onclick="toggleMetric()">Metric</label></div>' +
            '<span class="rwText ctranslate">Raps</span>' +
            '<span id="sort-rappelsNum" title="Sort by number of rappels" class="rwSortIcon gmnoprint notranslate"></span>' +
            '<span id="sort-longestRappel" title="Sort by highest rappel" class="rwSortIcon gmnoprint notranslate"></span>' +
        '</th>' +
        '<th class="rwHdr">' +
            '<span class="rwText ctranslate">Overall</span>' +
            '<span id="sort-averageTime" title="Sort by overall time" class="rwSortIcon gmnoprint notranslate"></span>' +
            '<span id="sort-hikeLength" title="Sort by overall length" class="rwSortIcon gmnoprint notranslate"></span>' +
        '</th>' +
        '<th class="rwHdr">' +
            '<span class="rwTextNoSort"><a href="/Extra_info" title="Extra info">Info</a></span>' +
        '</th>' +
        '<th class="rwHdr">' +
            '<span class="rwText"><a href="/Conditions_info" title="Conditions info">Conditions</a></span>' +
            '<span id="sort-conditionDate" title="Sort by date of condition report" class="rwSortIcon gmnoprint notranslate"></span>' +
        '</th>';

    return Header;
}

function getStandardTableRow(item) {
    const Location =
        '<td><table><tbody>' +
            '<tr>' +
                '<td rowspan="2" class="pinmap" id="[LocationNameFull]"><img src="[Star Icon png]" id="[LocationNameFull]" class="pinicon" title="Show location on map" style="cursor:pointer;vertical-align:middle" onclick="centerMapOnMarkerById(this.id)"></td>' +
                '<td class="loc">[PermitStatusIcon]<a href="[LocationNameLink]" title="[LocationName]" target="_blank">[LocationName]</a></td>' +
            '</tr>' +
            '<tr>' +
                '<td class="reg"><strong>[RegionLink]</strong> [ParentRegionLinks]</td>' +
            '</tr>' +
        '</tbody></table></td>';

    const Stars =
        '<td class="[StarsClassname]" title="[StarsTitle]">[StarsIcons]</td >';

    const TechnicalRating =
        '<td class="uaca">[Technical Rating]</td>';
    
    const Raps =
        '<td class="urap">[Rap display]</td>';

    const Overall =
        '<td>[Overall display]</td>';
    
    const Info =
        '<td class="itable">[InfoSummary]</td>';
    
    const Conditions =
        '<td class="ctable">[ConditionsSummary]</td>';
    
    var location = Location
        .replace(/\[LocationName]/g, !!item.nameWithoutRegion ? item.nameWithoutRegion : item.id)
        .replace(/\[LocationNameFull]/g, item.id)
        .replace(/\[LocationNameLink]/g, linkify(item.id))
        .replace(/\[Star Icon png]/, item.icon)
        .replace(/\[PermitStatusIcon]/, getTablePermitStatusIcon(item.permits))
        .replace(/\[RegionLink]/g, getTableRegionLink(item))
        .replace(/\[ParentRegionLinks]/, getTableParentRegionLinks(item.parentRegions));

    var starDisplay = getUserStarDisplay(item.id, item.totalRating, item.userStars, item.totalCounter, 16);
    var quality = Stars
        .replace(/\[StarsTitle]/, starDisplay.title)
        .replace(/\[StarsIcons]/, starDisplay.innerHTML)
        .replace(/\[StarsClassname]/, starDisplay.className);

    var technicalRating = TechnicalRating
        .replace(/\[Technical Rating]/, getTableTechnicalRating(item.technicalRating));

    var raps = Raps
        .replace(/\[Rap display]/, getTableRaps(item.rappels, item.longestRappel));

    var overall = Overall
        .replace(/\[Overall display]/, getOverallDisplay(item.typicalTime, item.hikeLength));

    var info = Info
        .replace(/\[InfoSummary]/, getTableInfoSummaryDisplay(item.infoSummary));

    var conditions = Conditions
        .replace(/\[ConditionsSummary]/, getTableConditionDisplay(item.conditionSummary));
    
    var html =
        location +
        quality +
        technicalRating +
        raps +
        overall +
        info +
        conditions;

    return html;
}

function addNewItemsToTable(rwresults) {
    var tableCurrentBody = document.getElementById("loctablebody");
    if (!tableCurrentBody) return;

    for (var i = 0; i < rwresults.length; ++i) {
        var item = rwresults[i];

        var html = assembleTableRow(item);

        var newRow = tableCurrentBody.insertRow(tableCurrentBody.rows.length);
        newRow.className = "trow notranslate";
        newRow.innerHTML = html;
        newRow.pageid = item.pageid;
    }

    filterMarkers();
}

function getTablePermitStatusIcon(permitStatus) {
    var img = "";

    if (!!permitStatus) {
        var iconUrl = "", tooltipText = "";

        switch (permitStatus) {
        case "Yes":
            iconUrl = ICON_PERMIT_YES;
            tooltipText = "Permit required";
            break;
        case "Restricted":
            iconUrl = ICON_RESTRICTED;
            tooltipText = "Access is restricted";
            break;
        case "Closed":
            iconUrl = ICON_CLOSED;
            tooltipText = "Closed to entry";
            break;
        }

        if (iconUrl !== "")
            img = '<img src="' + iconUrl + '" class="permiticon" title="' + tooltipText + '">';
    }

    return img;
}

function getTableRegionLink(item) {
    if (!item.region) return "no region specified";

    if (item.noregionlink) return item.region;

    var regionDisplayName = item.regionWithoutParents;
    if (regionDisplayName === "Western Juan Castro Blanco Parque Nacional") regionDisplayName = "Western JCP NP"; //special case for extremely long region name

    return '<a href="/[RegionLink]" title="[RegionFull]">[Region]</a>'
        .replace(/\[Region]/g, regionDisplayName)
        .replace(/\[RegionFull]/g, item.region)
        .replace(/\[RegionLink]/, linkify(item.region));
}

function getTableParentRegionLinks(regions) {

    if (!regions || regions.length === 0) return "";

    const ParentRegionLink = '<a href="/[ParentRegionLink]" title="[ParentRegion]">[ParentRegion]</a>';

    var parentRegionLinks = [];
    
    for (var i = 0; i < regions.length; ++i) {
        var parentRegionDisplayName = regions[i];
        parentRegionDisplayName = parentRegionDisplayName.replace("National Park", "NP"); //special case for long region names
        var link = ParentRegionLink
            .replace(/\[ParentRegion]/g, parentRegionDisplayName)
            .replace(/\[ParentRegionLink]/, linkify(regions[i]));
        parentRegionLinks.push(link);
    }

    return ("(" + parentRegionLinks.join("/") + ")");
}

function getTableTechnicalRating(rating) {
    var tableRatingDisplay = "";

    if (!rating) return tableRatingDisplay;

    var tableRating = !french
        ? rating.combinedACA
        : rating.combinedFrench;

    if (tableRating !== undefined) {
        var italicize = (!french && rating.convertedACA) || (french && rating.convertedFrench);
        if (italicize) tableRating = "<i>" + tableRating + "</i>";

        tableRatingDisplay = tableRating;
    }

    return tableRatingDisplay;
}

function getTableRaps(rapSummary, longestRap) {

    var hasSummary = (!!rapSummary);
    var hasLongest = (!!longestRap);
    
    var rapSummaryDisplay = '<span class="tablestat rap-num">' +
        ((hasSummary) ? rapSummary : "") +
        ((hasSummary && hasLongest) ? "," : "&nbsp;") +
        '</span>';

    var longestRapDisplay = '<span class="tablestat rap-longest uft">' +
        ((hasLongest) ? '\u21A8' + getTableValueUnit(longestRap) : "&nbsp;") +
        '</span>';

    return '<div class="tablestat dual-stat">' + rapSummaryDisplay + longestRapDisplay + '</div>';
}

function getOverallDisplay(time, length) {
    
    var hasTime = (!!time);
    var hasLength = (!!length);

    var timeDisplay = '<span class="tablestat overall-time utime">' +
        ((hasTime) ? time : "") +
        ((hasTime && hasLength) ? "," : "&nbsp;") +
        '</span>';

    var lengthDisplay = '<span class="tablestat overall-length umi">' +
        ((hasLength) ? getTableValueUnit(length) : "&nbsp;") +
        '</span>';

    return '<div class="tablestat dual-stat">' + timeDisplay + lengthDisplay + '</div>';
}

function getTableInfoSummaryDisplay(summary) {
    if (summary == undefined || !summary) return "";

    //remove superfluous icon clutter. just show 4wd or shuttle
    var newSummary = "";
    if (summary.includes('id="vxH"')) newSummary += '<hr id="vxH">';
    if (summary.includes('id="vx4"')) newSummary += '<hr id="vx4">';
    if (summary.includes('id="vxc"')) newSummary += '<hr id="vxc">';
    if (summary.includes('id="vxw"')) newSummary += '<hr id="vxw">';
    //var div = document.createElement('div'); <-this is if we also want to show best season info
    //div.innerHTML = summary;
    //var season = div.getElementsByClassName('monthv');
    //if (season[0]) {
    //    season[0].title = "Best season: " + season[0].title;
    //    newSummary += season[0].outerHTML;
    //}
    summary = newSummary;

    //add tooltips to icons
    summary = summary.replace('id="vxx"', 'id="vxx" title="Precise coordinates unknown"');
    summary = summary.replace('id="vxi"', 'id="vxi" title="Detailed info on Ropewiki"');
    summary = summary.replace('id="vxn"', 'id="vxn" title="Detailed info on an external beta site"');
    summary = summary.replace('id="vxm"', 'id="vxm" title="KML map on Ropewiki"');
    summary = summary.replace('id="vxe"', 'id="vxe" title="KML map on an external beta site"');
    summary = summary.replace('id="vxs"', 'id="vxs" title="Has a sketch"');
    summary = summary.replace('id="vxd"', 'id="vxd" title="Has a PDF"');
    summary = summary.replace('id="vxp"', 'id="vxp" title="Has main photo"');
    summary = summary.replace('id="vx2"', 'id="vx2" title="Passable with normal car"');
    summary = summary.replace('id="vxH"', 'id="vxH" title="Requires High Clearance vehicle"');
    summary = summary.replace('id="vx4"', 'id="vx4" title="Requires 4wd vehicle"');
    summary = summary.replace('id="vxc"', 'id="vxc" title="Requires a shuttle"');
    summary = summary.replace('id="vxw"', 'id="vxw" title="Requires a watercraft"');

    //need to parse out the best season and assemble the data into the visual table. then insert it back into the string
    //example: <hr id="vxi"><hr id="vxe"><hr id="vxp"><hr id="vx2"><div class="monthv" title="Apr-Jun">..., .XX, X.., ...</div>

    var endIndex = summary.lastIndexOf("</div");
    if (endIndex < 0) return summary;

    var startIndex = summary.lastIndexOf(">", endIndex - 1) + 1;
    var bestSeason = summary.substring(startIndex, endIndex);

    //convert best season to table
    var bestSeasonTable = '<table class="wikitable bst mbst nostranslate"><tbody><tr>';

    for (var i = 0; i < bestSeason.length; ++i) {
        switch (bestSeason[i]) {
            case " ":
                break;
            case ",":
                bestSeasonTable += '<td class="bss"></td>';
                break;
            case ".":
                bestSeasonTable += '<td></td>';
                break;
            case "x":
                bestSeasonTable += '<td class="bsy"></td>';
                break;
            case "X":
                bestSeasonTable += '<td class="bsg"></td>';
                break;
        }
    }
    bestSeasonTable += '</tr></tbody></table>';

    summary = summary.substring(0, startIndex - 1) + ' style="display:block;">' + bestSeasonTable + summary.substr(endIndex);

    return summary;
}

function getTableConditionDisplay(summary) {
    if (summary == undefined || !summary) return "";

    //remove superfluous icon clutter. just show smiley face and extra precautions
    var div = document.createElement('div');
    div.innerHTML = summary;
    var icons = div.getElementsByClassName('cicons');
    for (var i = 0; i < icons.length; ++i) {
        if (icons[i].nodeName !== "SPAN") continue;

        var iconsSummary = icons[i].innerHTML;

        var newSummary = "";
        var index = 0;

        index = iconsSummary.indexOf('id="cs');
        if (index >= 0) newSummary += '<hr class="cicons" ' + iconsSummary.substr(index, 8) + '>';

        index = iconsSummary.indexOf('id="cd');
        if (index >= 0) newSummary += '<hr class="cicons" ' + iconsSummary.substr(index, 8) + '>';

        icons[i].innerHTML = newSummary;
    }
    summary = div.innerHTML;

    //add tooltips to icons
    var quality = getConditionIcon(summary, "cs");
    if (quality !== null) summary = summary.replace('id="' + quality + '"', 'id="' + quality + '" title="' + condQuality[quality] + '"');

    var waterflow = getConditionIcon(summary, "cwa");
    if (waterflow !== null) summary = summary.replace('id="' + waterflow + '"', 'id="' + waterflow + '" title="' + condWaterflow[waterflow] + '"');

    var wetsuit = getConditionIcon(summary, "ct");
    if (wetsuit !== null) summary = summary.replace('id="' + wetsuit + '"', 'id="' + wetsuit + '" title="' + condWetsuit[wetsuit] + '"');

    var dangers = getConditionIcon(summary, "cd");
    if (dangers !== null) summary = summary.replace('id="' + dangers + '"', 'id="' + dangers + '" title="' + condDangers[dangers] + '"');

    //linkify the most recent link. the rest of the html is already prepared
    //example: [[Conditions:Cabin Creek-20190923143634|'''22 Sep 2019''']] 

    const regex = /\[\[(.*?)\]\]/; //matches the pattern: [[ match ]]
    var wikiLink = regex.exec(summary);

    if (wikiLink != null) {
        var conditions = wikiLink[1].split("|");
        var conditionsStr = '<a href="/' + linkify(conditions[0]) + '" title="'+ conditions[0] +'"><b class="table condition-date">'+ conditions[1].replace(/'/g, "") +'</b></a>';
        summary = summary.replace(wikiLink[0], conditionsStr);
    }
    
    return summary;
}

function getTableValueUnit(entry) {
    if (!entry || !(entry.unit)) return "";

    if (entry.unit === 'ft' || entry.unit === 'm') return ftStr(entry.value);
    if (entry.unit === 'mi' || entry.unit === 'km') return miStr(entry.value);

    return entry.value.toString() + entry.unit.toString();
}

function getConditionIcon(entry, condType) {
    var match = 'id="' + condType;
    var index = entry.indexOf(match);
    if (index < 0) return null;

    index += match.length;

    return condType + entry.substring(index, entry.indexOf('"', index + 1));
}
