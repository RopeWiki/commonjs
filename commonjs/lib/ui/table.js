// this draws the table rows of the canyon locations used in the region and search pages
// previously, we relied on Mediawiki drawing the table and displaying it to the user. However,
// this had the limitation of only being able to show on the table what was calculated through the 
// mediawiki templates.if the user wanted to filter on canyons, a new request to ropewiki.com and a 
// new pageload would have to happen, with all the associated data transfer.
// Now, the table drawing is done locally, and the data for any downloaded canyons are kept in the memory,
// so filtering can be instantaneous, and also a lesser amount of data is transferred over the network,
// just the specs specific to a canyon location, and all the surrounding html is generated locally

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
        '<td class="umi">[Descent length][Descent depth]</td>';
    
    const Raps =
        '<td class="urap">[Rap count] [Rap highest]</td>';
    
    const Info =
        '<td class="itable">[Info list of 4 icons][Best Season table]</td>';
    
    const Conditions =
        '<td class="ctable"><span class="notranslate"><a href="/\[Condition link]" title="[Condition link]"><b>[Condition date]</b></a> ' +
        '<span class="cicons">[Conditions icons array]</span></span><br><span class="conditionsnippet"></span></td>';

    var location = Location
        .replace(/\[LocationName]/g, item.id)
        .replace(/\[LocationNameLink]/g, linkify(item.id))
        .replace(/\[Star Icon png]/, item.icon)
        .replace(/\[Region]/g, item.region)
        .replace(/\[RegionLink]/, linkify(item.region))
        .replace(/\[ParentRegionLinks]/, getParentRegionLinks(item.parentRegions));

    var starDisplay = getStarDisplay(item.id, item.rankRating, item.totalCounter, 16);
    var quality = Stars
        .replace(/\[StarsTitle]/, starDisplay.title)
        .replace(/\[StarsIcons]/, starDisplay.innerHTML);

    var technicalRating = TechnicalRating
        .replace(/\[Technical Rating]/, item.technicalRating);

    var time = Time
        .replace(/\[Time]/, item.typicalTime);

    var hikeLength = HikeLength
        .replace(/\[Hike]/, item.hikeLength);

    var descent = Descent
        .replace(/\[Descent length]/, item.descentLength)
        .replace(/\[Descent depth]/, item.descentDepth);

    var raps = Raps
        .replace(/\[Rap count]/, item.rappels)
        .replace(/\[Rap highest]/, item.longestRappel);

    var info = Info
        .replace(/\[Info list of 4 icons]/, item.infoSummary)
        .replace(/\[Best Season table]/, item.bestMonths);

    var conditions = Conditions
        //.replace(/\[Condition link]/g, item.LocationName)
        //.replace(/\[Condition date]/, item.LocationName)
        .replace(/\[Conditions icons array]/, item.conditionSummary);

    var html =
        '<tr class="trow notranslate">' +
        location +
        quality +
        //technicalRating +
        //time +
        //hikeLength +
        //descent +
        //raps +
        //info +
        //conditions +
        '</tr>';

    return html;
}

function addNewItemsToTable(list) {

    var tablelist = $(".loctable .loctabledata");
    if (tablelist.length !== 1) return;
    
    var tableRef = document.getElementById('.starv.uaca.utime.umi.umi.urap.itable.ctable').getElementsByTagName('tbody')[0];

    for (var i = 0; i < list.length; ++i) {
        var item = list[i];

        var html = assembleTableRow(item);

        var newRow = tableRef.insertRow(tableRef.rows.length);
        newRow.className = "trow notranslate";
        newRow.innerHTML = html;
    }

    ////delete all rows, keep header, replace with new rows:
    //var new_tbody = document.createElement('tbody');
    //populate_with_new_rows(new_tbody);
    //old_tbody.parentNode.replaceChild(new_tbody, old_tbody)
    //If you don't want to delete the header: $("#table_of_items tbody tr").remove();
}

function getParentRegionLinks(regions) {

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