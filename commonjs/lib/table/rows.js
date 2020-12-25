﻿// this draws the table rows of the canyon locations used in the region and search pages
// previously, we relied on Mediawiki drawing the table and displaying it to the user. However,
// this had the limitation of only being able to show on the table what was calculated through the 
// mediawiki templates.if the user wanted to filter on canyons, a new request to ropewiki.com and a 
// new pageload would have to happen, with all the associated data transfer.
// Now, the table drawing is done locally, and the data for any downloaded canyons are kept in the memory,
// so filtering can be instantaneous, and also a lesser amount of data is transferred over the network,
// just the specs specific to a canyon location, and all the surrounding html is generated locally

function assembleTableHeaderRow() {
    
    const Header =
        '<tr>' +
            '<th class="rwHdr">' +
                '<div class="gmnoprint toption locateicon"">↓ Click on icon to locate on map</div>' +
                '<span class="rwText">Location</span>' +
                '<span id="sort-id" title="Sort by name" class="rwSortIcon gmnoprint notranslate"></span>' +
                '<span id="sort-region" title="Sort by region" class="rwSortIcon gmnoprint notranslate"></span>' +
            '</th>' +
            '<th class="rwHdr">' +
                '<div id="starrate" class="schk gmnoprint toption notranslate"><label><input class="gmnoprint" type="checkbox" onclick="toggleStarrate()">My stars</label></div>' +
                '<span id="sort-rankRating" title="Sort by quality and popularity" class="rwSortIcon gmnoprint notranslate"></span>' +
                '<span class="rwText"><a href="/StarRank" title="StarRank">Quality</a></span>' +
                '<span id="sort-totalRating" title="Sort by quality" class="rwSortIcon gmnoprint notranslate"></span>' +
                '<span id="sort-totalCounter" title="Sort by popularity" class="rwSortIcon gmnoprint notranslate"></span>' +
            '</th>' +
        '<th class="rwHdr">' +
                '<div class="fchk gmnoprint toption notranslate""><label><input class="gmnoprint" type="checkbox" onclick="toggleFrench()">French rating</label></div>' +
                '<span class="rwText"><a href="/Rating" title="Rating">Rating</a></span>' +
                '<span id="sort-technicalRating.combinedACA" title="Sort by rating" class="rwSortIcon gmnoprint notranslate"></span>' +
            '</th>' +
            '<th class="rwHdr">' +
                '<span class="rwText ctranslate">Time</span>' +
                '<span id="sort-averageTime" title="Sort by average typical time" class="rwSortIcon gmnoprint notranslate"></span>' +
            '</th>' +
            '<th class="rwHdr">' +
                '<div class="uchk gmnoprint toption notranslate""><label><input class="gmnoprint" type="checkbox" onclick="toggleMetric()">Metric</label></div>' +
                '<span class="rwText ctranslate">Hike</span>' +
                '<span id="sort-hikeLength" title="Sort by length of hike" class="rwSortIcon gmnoprint notranslate"></span>' +
            '</th>' +
            '<th class="rwHdr">' +
                '<span class="rwText ctranslate">Descent</span>' +
                '<span id="sort-descentLength" title="Sort by length" class="rwSortIcon gmnoprint notranslate"></span>' +
                '<span id="sort-descentDepth" title="Sort by depth" class="rwSortIcon gmnoprint notranslate"></span>' +
            '</th>' +
            '<th class="rwHdr">' +
                '<span class="rwText ctranslate">Raps</span>' +
                '<span id="sort-rappelsNum" title="Sort by number of rappels" class="rwSortIcon gmnoprint notranslate"></span>' +
                '<span id="sort-longestRappel" title="Sort by longest rappel" class="rwSortIcon gmnoprint notranslate"></span>' +
            '</th>' +
            '<th class="rwHdr">' +
                '<span class="rwTextNoSort"><a href="/Extra_info" title="Extra info">Info</a></span>' +
            '</th>' +
            '<th class="rwHdr">' +
                '<span class="rwText"><a href="/Conditions_info" title="Conditions info">Conditions</a></span>' +
                '<span id="sort-conditionDate" title="Sort by condition report date" class="rwSortIcon gmnoprint notranslate"></span>' +
            '</th>' + 
        '</tr>';

    return Header;
}

function assembleTableRow(item) {

    const Location =
        '<td><table><tbody><tr><td rowspan="2" class="pinmap" id="[LocationName]">' +
        '<img src="[Star Icon png]" id="[LocationName]" class="pinicon" title="Show location on map" style="cursor:pointer;vertical-align:middle" onclick="pinmap(this.id)"></td>' +
        '<td class="loc"><a href="/[LocationNameLink]" title="[LocationName]">[LocationName]</a></td></tr>' +
        '<tr><td class="reg"><strong><a href="/[RegionLink]" title="[Region]">[Region]</a></strong> [ParentRegionLinks]' +
        '</td></tr></tbody></table></td>';

    const Stars =
        '<td class="starv" title="[StarsTitle]">[StarsIcons]</td >';

    const TechnicalRating =
        '<td class="uaca">[Technical Rating]</td>';
    
    const Time =
        '<td class="utime">[Time]</td>';
    
    const HikeLength =
        '<td class="umi">[Hike]</td>';
    
    const Descent =
        '<td class="umi">[Descent display]</td>';
    
    const Raps =
        '<td class="urap">[Rap display]</td>';
    
    const Info =
        '<td class="itable">[InfoSummary]</td>';
    
    const Conditions =
        '<td class="ctable">[ConditionsSummary]</td>';

    var location = Location
        .replace(/\[LocationName]/g, item.id)
        .replace(/\[LocationNameLink]/g, linkify(item.id))
        .replace(/\[Star Icon png]/, item.icon)
        .replace(/\[Region]/g, item.region)
        .replace(/\[RegionLink]/, linkify(item.region))
        .replace(/\[ParentRegionLinks]/, getTableParentRegionLinks(item.parentRegions));

    var starDisplay = getStarDisplay(item.id, item.totalRating, item.totalCounter, 16);
    var quality = Stars
        .replace(/\[StarsTitle]/, starDisplay.title)
        .replace(/\[StarsIcons]/, starDisplay.innerHTML);

    var technicalRating = TechnicalRating
        .replace(/\[Technical Rating]/, getTableTechnicalRating(item.technicalRating));

    var time = Time
        .replace(/\[Time]/, !!item.typicalTime ? item.typicalTime : "");

    var hikeLength = HikeLength
        .replace(/\[Hike]/, getTableValueUnit(item.hikeLength));

    var descent = Descent
        .replace(/\[Descent display]/, getDescentDisplay(item.descentLength, item.descentDepth));

    var raps = Raps
        .replace(/\[Rap display]/, getTableRaps(item.rappels, item.longestRappel));

    var info = Info
        .replace(/\[InfoSummary]/, getTableInfoSummaryDisplay(item.infoSummary));

    var conditions = Conditions
        .replace(/\[ConditionsSummary]/, getTableConditionDisplay(item.conditionSummary));

    var html =
        '<tr class="trow notranslate">' +
        location +
        quality +
        technicalRating +
        time +
        hikeLength +
        descent +
        raps +
        info +
        conditions +
        '</tr>';

    return html;
}

function addNewItemsToTable(list) {

    var tableCurrentBody = document.getElementById("loctablebody");

    for (var i = 0; i < list.length; ++i) {
        var item = list[i];

        var html = assembleTableRow(item);

        var newRow = tableCurrentBody.insertRow(tableCurrentBody.rows.length);
        newRow.className = "trow notranslate";
        newRow.innerHTML = html;
    }

    updateTable();
}

function getTableParentRegionLinks(regions) {

    if (!regions || regions.length === 0) return "";

    const ParentRegionLink = '<a href="/[ParentRegionLink]" title="[ParentRegion]">[ParentRegion]</a>';

    var parentRegionLinks = [];
    
    for (var i = 0; i < regions.length; ++i) {
        var link = ParentRegionLink
            .replace(/\[ParentRegion]/g, regions[i])
            .replace(/\[ParentRegionLink]/, linkify(regions[i]));
        parentRegionLinks.push(link);
    }

    return ("(" + parentRegionLinks.join("/") + ")");
}

function getTableTechnicalRating(rating) {
    return !french
        ? rating.combinedACA
        : rating.combinedFrench;
}

function getTableRaps(rapSummary, longestRap) {
    var rapDisplay = "";

    if (!!rapSummary) rapDisplay = rapSummary;

    if (!!longestRap && longestRap.value > 0) {
        if (rapDisplay.trim()) rapDisplay += ", ";
        rapDisplay += '\u21A8' + getTableValueUnit(longestRap);
    }

    return rapDisplay;
}

function getDescentDisplay(length, depth) {
    var descentDisplay = "";

    if (!!length) descentDisplay = '\u27F7' + getTableValueUnit(length);

    if (!!depth) {
        if (descentDisplay.trim()) descentDisplay += ", ";
        descentDisplay += '\u2193' + getTableValueUnit(depth);
    }

    return descentDisplay;
}

function getTableInfoSummaryDisplay(summary) {
    if (!summary) return "";

    //need to parse out the best season and assemble the data into the visual table. then insert it back into the string
    //example: <hr id="vxi"><hr id="vxe"><hr id="vxp"><hr id="vx2"><div class="monthv" title="Apr-Jun">..., .XX, X.., ...</div>

    var endIndex = summary.lastIndexOf("</div");
    if (endIndex < 0) return summary;

    var startIndex = summary.lastIndexOf(">", endIndex - 1) + 1;
    var bestSeason = summary.substring(startIndex, endIndex);

    //convert to table
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
    if (!summary) return "";

    //just need to linkify the most recent link. the rest of the html is already prepared
    //example: [[Conditions:Cabin Creek-20190923143634|'''22 Sep 2019''']] 

    const regex = /\[\[(.*?)\]\]/; //matches the pattern: [[ match ]]
    var wikiLink = regex.exec(summary);

    if (wikiLink != null) {
        var conditions = wikiLink[1].split("|");
        var conditionsStr = '<a href="/' + linkify(conditions[0]) + '" title="'+ conditions[0] +'"><b>'+ conditions[1].replace(/'/g, "") +'</b></a>';
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
