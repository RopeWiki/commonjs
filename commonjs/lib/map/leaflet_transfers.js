function setHeadingTextForRegion() {
    // called by setHeadingText() in ui.js - not sure why it lives in map.js
    console.log("fake setHeadingTextForRegion();")
}

var loadLimit = 100;
var loadOffset = 0;
var locationsTotalWithinArea;
var locationsLoadedWithinArea = 0;


function queryResultToParsedList(data) {
    var list = [];
    $.each(data.query.results,
        function(i, item) {
            var v;
            var obj = { id: item.fulltext };
            v = item.printouts["Has coordinates"];
            if (v && v.length > 0) {
                obj.location = { lat: v[0].lat, lng: v[0].lon };

                // ratings & icon
                v = item.printouts["Has rank rating"]; //rating weighted by count (popularity), used for sorting only
                obj.rankRating = (v && v.length > 0) ? v[0] : 0;
                v = item.printouts["Has total rating"]; //weighted rating with users and conditions, used to select icon
                obj.totalRating = (v && v.length > 0) ? v[0] : 0;
                //apply formula -- raw rating rounded to integer, used for the icon selector.
                // 4-5-5.0 = 5, 4.0-4.5 = 4, the rest rounded down to nearest int
                obj.stars = obj.totalRating >= 4.5
                    ? 5
                    : Math.floor(obj.totalRating);
                v = item.printouts["Has total counter"];
                if (v && v.length > 0)
                    obj.totalCounter = v[0];
                //obj.rankRating = calculateRankRating(obj);
                v = item.printouts["Has location class"];
                if (v && v.length > 0) {
                    obj.activity = v[0];
                    obj.icon = KML_ICON_LIST[Number(obj.stars) + Number(obj.activity) * 6];
                }

                // numeric icons
                if (kmlsummary)
                    if (obj.id[0] === '#') {
                        var num = obj.id.slice(1).split(' ')[0];
                        obj.icon = 'https://sites.google.com/site/rwicons/bg' + obj.stars + '_' + num + '.png';
                    }

                v = item.printouts["Has summary"];
                if (v && v.length > 0) {
                    obj.description = v[0];
                }
                obj.technicalRating = parseTechnicalRating(obj.description);
                v = item.printouts["Has banner image file"];
                if (v && v.length > 0)
                    obj.thumbnail = geturl(v[0]);
                v = item.printouts["Has KML file"];
                if (v && v.length > 0)
                    obj.kmlfile = getKmlFileWithoutCache(v[0]);
                v = item.printouts["Has info regions"];
                if (v && v.length > 0) {
                    obj.regionList = v[0].split(/[;/]+/); //split on both ; and /
                    obj.region = obj.regionList[obj.regionList.length - 1];
                    obj.regionWithoutParents = parseNameWithoutRegion(obj.region, obj); //such as 'Front Range (Colorado)'
                    obj.nameWithoutRegion = parseNameWithoutRegion(obj.id, obj);
                }
                v = item.printouts["Has info major region"];
                if (v && v.length > 0) {
                    obj.parentRegions = parseMajorRegion(v[0]);
                }
                v = item.printouts["Requires permits"];
                if (v && v.length > 0) {
                    obj.permits = v[0];
                    if (obj.permits === "No") obj.permits = "None";
                }
                v = item.printouts["Has best season parsed"];
                if (v && v.length > 0)
                    obj.bestMonths = parseBestMonths(v[0].fulltext);
                v = item.printouts["Has info typical time"];
                if (v && v.length > 0) {
                    obj.typicalTime = v[0];
                    obj.averageTime = parseTypicalTime(obj.typicalTime);
                }
                v = item.printouts["Has length of hike"];
                if (v && v.length > 0)
                    obj.hikeLength = v[0];
                v = item.printouts["Has length"];
                if (v && v.length > 0)
                    obj.descentLength = v[0];
                v = item.printouts["Has depth"];
                if (v && v.length > 0)
                    obj.descentDepth = v[0];
                v = item.printouts["Has info rappels"];
                if (v && v.length > 0) {
                    obj.rappels = v[0];
                    if (obj.rappels === "r") obj.rappels = "?r"; //ropewiki doesn't handle 'unknown' values for rappels correctly and sends just 'r'
                }
                v = item.printouts["Has longest rappel"];
                if (v && v.length > 0) {
                    obj.longestRappel = v[0];
                    if (obj.longestRappel.value === 0 && obj.rappels === undefined) { //ropewiki sets 0 rap height if it's non-technical canyon, so need to match with 0r
                        obj.rappels = "0r";
                    }
                }
                obj.rappelsNum = parseRappels(obj.rappels);
                v = item.printouts["Has info"];
                if (v && v.length > 0)
                    obj.infoSummary = v[0];
                v = item.printouts["Has condition summary"];
                if (v && v.length > 0) {
                    obj.conditionSummary = v[0];
                    obj.conditionDate = parseConditionDate(obj.conditionSummary);
                }

                v = item.printouts["Has vehicle type"];
                if (v && v.length > 0) {
                    obj.vehicleType = v[0];
                }
                v = item.printouts["Has shuttle length"];
                if (v && v.length > 0) {
                    obj.shuttleLength = v[0];
                }

                v = item.printouts["Has pageid"];
                if (v && v.length > 0) {
                    obj.pageid = v[0];
                }

                if (userStarRatings != undefined) {
                    var index = userStarRatings.findIndex(function (x) { return x.name === obj.id; });
                    if (index >= 0) obj.userStars = userStarRatings[index].stars;
                }

                list.push(obj);
            }
        });
    return list;
}


function parseTechnicalRating(description) {
    //examples:
    // "4.6*  4C4 III R (<i>v5a7&nbsp;III</i>) 5h-8h 5.5mi 5r 90ft"
    // "4.9*  <i>3C1&nbsp;IV</i>  (v3a4 III) 6h-13.5h  30r 98ft 2cars"
    // "4.9*  2A <i>IV</i> X (v3a4 III) 6h-13.5h  30r 98ft 2cars" <-note that only the ACA time is italicized; we don't italizice individual components right now

    //ACA
    const technical = ["1", "2", "3", "4"];
    const water = ["A", "B", "C", "C1", "C2", "C3", "C4"];
    const time = ["I", "II", "III", "IV", "V", "VI"];
    const risk = ["PG", "R", "R-", "X", "XX"];

    //French
    const vertical = ["v1", "v2", "v3", "v4", "v5", "v6", "v7"];
    const aquatic = ["a1", "a2", "a3", "a4", "a5", "a6", "a7"];
    const commitment = ["I", "II", "III", "IV", "V", "VI"];

    var technicalRating = {};

    if (!description) description = "";
    description = description.replace(/&nbsp;/g, ' ');
    var entries = description.split(/ +/); //regex for multiple spaces combine to single space
    for (var i = 0; i < entries.length; ++i) {
        testEntry: {
            var test = entries[i];
            if (test.includes("*")) break testEntry; //star rating

            if (test.includes("h") || test.includes("d") ||
                test.includes("r") ||
                test.includes("f") || test.includes("m") ||
                test.includes("c")) {
                entries.length = 0; //we're finished, now were into other fields
                break testEntry;
            }

            if (test.startsWith('(')) {
                test = test.substr(1);
            }

            var isConverted = false;
            if (test.startsWith('<i>')) {
                isConverted = true;
                test = test.substr(3);
            }

            if (test.endsWith(')')) {
                test = test.substr(0, test.length - 1);
            }
            if (test.endsWith('</i>')) {
                test = test.substr(0, test.length - 4);
            }

            var j;
            if (technicalRating["technical"] == null) {
                for (j = 0; j < technical.length; ++j) {
                    if (test.startsWith(technical[j])) {
                        technicalRating["technical"] = technical[j];
                        test = test.substr(technical[j].length);

                        technicalRating["convertedACA"] = isConverted;
                        
                        break; //break only the 'for j' loop, need to test 'water' using same entry
                    }
                }
            }

            if (technicalRating["water"] == null)
                for (j = 0; j < water.length; ++j) {
                    if (test === water[j]) {
                        technicalRating["water"] = water[j];
                        break testEntry;
                    }
                }

            if (technicalRating["time"] == null) {
                for (j = 0; j < time.length; ++j) {
                    if (test === time[j]) {
                        technicalRating["time"] = time[j];
                        break testEntry;
                    }
                }
            }

            if (technicalRating["risk"] == null)
                for (j = 0; j < risk.length; ++j) {
                    if (test === risk[j]) {
                        technicalRating["risk"] = risk[j];
                        break testEntry;
                    }
                }

            if (technicalRating["vertical"] == null) {
                for (j = 0; j < vertical.length; ++j) {
                    if (test.startsWith(vertical[j])) {
                        technicalRating["vertical"] = vertical[j];
                        test = test.substr(vertical[j].length);
                        technicalRating["convertedFrench"] = isConverted;
                        break; //break only the 'for j' loop, need to test 'water' using same entry
                    }
                }
            }

            if (technicalRating["aquatic"] == null)
                for (j = 0; j < aquatic.length; ++j) {
                    if (test.includes(aquatic[j])) {
                        technicalRating["aquatic"] = aquatic[j];
                        break testEntry;
                    }
                }

            if (technicalRating["commitment"] == null) {
                for (j = 0; j < commitment.length; ++j) {
                    if (test === commitment[j]) {
                        technicalRating["commitment"] = commitment[j];
                        break testEntry;
                    }
                }
            }
        }
    }

    var combinedACA =
        (!!technicalRating.technical ? technicalRating.technical : "") + (!!technicalRating.water ? technicalRating.water : "") +
        " " + (!!technicalRating.time ? technicalRating.time : "") +
        ((!!technicalRating.risk) ? " " + technicalRating.risk : "");
    if (combinedACA.trim().length > 0) technicalRating.combinedACA = combinedACA;

    var combinedFrench =
        (!!technicalRating.vertical ? technicalRating.vertical : "") + (!!technicalRating.aquatic ? technicalRating.aquatic : "") +
        " " + (!!technicalRating.commitment ? technicalRating.commitment : "");
    if (combinedFrench.trim().length > 0) technicalRating.combinedFrench = combinedFrench;
    
    return technicalRating;
}


function parseNameWithoutRegion(name, item) {
    //remove the region if it's in the table row as it is redundant
    var start, end = 0;

    while (true) {
        start = name.indexOf(' (', end + 1);
        end = name.indexOf(')', start);
        if (start < 0 || end < 0) break;

        //split and reassemble with any items that are not in the region list
        var newParenthetical = "";
        var extractedRegions = name.substring(start + 2, end).split(',').map(function (item) { return item.trim(); });
        for (var i = 0; i < extractedRegions.length; ++i) {
            if (!item.regionList.includes(extractedRegions[i]) &&
                !item.regionList.includes(extractedRegions[i] + " National Park")) { //special case, i.e. Death Valley because it's such a long name
                if (!!newParenthetical) newParenthetical += ', ';
                newParenthetical += extractedRegions[i]; //not a region so add it
            }
        }
        if (newParenthetical !== "") newParenthetical = ' (' + newParenthetical + ')';
        name = name.substring(0, start) + newParenthetical + name.substring(end + 1);
        end = end + newParenthetical.length - (end - start + 1); //adjust for new length of parenthetical
    }

    return name;
}


function parseMajorRegion(majorRegion) {
    const regex = /\|(.*?)\]\]]*/g; //matches the pattern: | match ]]  ex: [[Sierra National Forest]] ([[:California|California]])
    
    var regions = [];
    var match = regex.exec(majorRegion);
    while (match != null) {
        regions.push(match[1]);
        match = regex.exec(majorRegion);
    }

    return regions;
}


function parseBestMonths(bestSeasonRaw) {
    var parsed = bestSeasonRaw.replace(/,/g, '');
    //example: "Season=Spring to Fall, BEST Apr,May,Oct,Nov"  returns "...,xXX,xxx,xXX" where the months are Dec(12) through Nov
    //because format of 'parsed' is dec to nov, move dec to the end of the string so that the months line up 1 to 12 (-1)
    parsed = parsed.substr(1) + parsed.substr(0, 1);
    var locationBestMonths = [];
    for (var month = 0; month < 12; ++month) {
        var test = parsed.substr(month, 1);
        if (test === "X" || test === "x") locationBestMonths.push(months[month]);
    }

    return locationBestMonths;
}


function parseTypicalTime(typicalTime) {
    //examples: 1h, 2-4h, 4 days, 14h - 2 days, 1-2 days
    if (typicalTime === undefined || typicalTime == null) return typicalTime;

    function getHours(time) {
        var hours, units = undefined;
        var hIndex = time.indexOf("h");
        var dIndex = time.indexOf("d");
        if (hIndex > 0) {
            hours = Number(time.substr(0, hIndex));
            units = "h";
        }
        else if (dIndex > 0) {
            hours = Number(time.substr(0, dIndex));
            units = "d";
        } else
            hours = Number(time);

        return { hours: hours, units: units };
    }

    var times = typicalTime.split("-");
    var shortestTime = getHours(times[0]);

    if (times.length === 1) {
        if (shortestTime.units === undefined) return undefined;
        if (shortestTime.units === "d") {
            shortestTime.hours *= 24;
            shortestTime.units = "h";
        }
        return shortestTime.hours;
    } else {
        var longestTime = getHours(times[1]);
        if (shortestTime.units === undefined) shortestTime.units = longestTime.units;
        if (shortestTime.units === undefined || longestTime.units === undefined) return undefined;

        if (shortestTime.units === "d") {
            shortestTime.hours *= 24;
            shortestTime.units = "h";
        }
        if (longestTime.units === "d") {
            longestTime.hours *= 24;
            longestTime.units = "h";
        }

        var avgTime = (shortestTime.hours + longestTime.hours) / 2;

        return avgTime;
    }
}

function parseRappels(rappels) {
    //example: 8-15r + 2j
    if (!rappels) return rappels;

    var index = rappels.indexOf("r");
    var index2 = rappels.indexOf("-");
    if (index2 > 0 && index2 < index) index = index2;

    if (index < 0) return 999; //unknown, could be anything
    var rapNumRaw = rappels.substring(0, index);
    var rapNum = Number(rapNumRaw);

    if (rapNum === "NaN") return 999;

    return rapNum;
}


function parseConditionDate(conditionsSummary) {
    if (conditionsSummary == undefined) return undefined;

    const regex = /'''(.*?)'''/g; //matches the pattern: ''' match '''

    var date = regex.exec(conditionsSummary);
    return date.length > 1
        ? new Date(date[1]).getTime() / 1000
        : undefined;
}

// what?
function nonamespace(label) {
    return label.replace("Events:", "");
}


var searchMapRectangle;
function setLoadingInfoText() { //called at the end of updateTable()
    var loadingInfo = document.getElementById("loadinginfo");
    if (!loadingInfo) return;

    setHeadingTextForRegion();
    
    updateUrlWithVisibleLocations();
    
    if (loadingInfo.innerHTML.includes("Error")) return;

    if (locationsTotalWithinArea === undefined) {
        loadingInfo.innerHTML = "Please wait, loading from server...";
        return;
    }

    locationsLoadedWithinArea =
        searchMapRectangle !== undefined //set this before possibly proceeding to loadingFinished() in the next line
        ? countLocationsWithinSearchArea()
        //: Math.min(loadOffset, locationsTotalWithinArea);
        //: countLocationsVisibleOnMap();
        : markers.length;

    var moreToLoad = locationsLoadedWithinArea < locationsTotalWithinArea;
    if (searchMapRectangle === undefined && searchWasRun) moreToLoad = false;

    if (loadOffset >= locationsTotalWithinArea || !moreToLoad) {
        loadingFinished();

        if (!moreToLoad) return;
    }

    setLoadMoreButton();
    
    var info = "Loaded ";

    var totalLoaded = markers.length;

    info += locationsLoadedWithinArea + " of ";

    info += locationsTotalWithinArea + " locations in this " + getRegionOrSearchAreaText() + " (highest rated locations are loaded first)";

    if (locationsLoadedWithinArea !== totalLoaded) info += ". " + totalLoaded + " total locations loaded";

    var filterInfo = getFilteringInfo();
    if (filterInfo) info += "." + filterInfo;

    loadingInfo.innerHTML = info;
}



var originalUrl;
var maxSpecified = 95; 
function updateUrlWithVisibleLocations() {

    var tableCurrentBody = document.getElementById("loctablebody");
    if (!tableCurrentBody) return;

    if (!originalUrl) originalUrl = window.location.href;

    var currentUrl = window.location.href;

    var totalLoaded = markers.length;
    var setOriginalUrl = !searchWasRun && countLocationsVisibleOnMap() === totalLoaded;

    var url;
    if (setOriginalUrl) {
        url = originalUrl;
    } else {
        url = '/Location?query=specified';

        var visibleLocations = [];
        var i;

        //this will pick the items from the top of the sorted table first
        for (i = 0; i < tableCurrentBody.rows.length; i++) {
            visibleLocations.push(tableCurrentBody.rows[i].pageid);
        }

        if (visibleLocations.length > 10) { //encode the url to save space
            //start by calculating differences between the entries
            visibleLocations.sort(function (a, b) { return a - b; });
            var visibleLocationsDiffs = [];
            var current = 0;
            for (i = 0; i < visibleLocations.length && i < maxSpecified; i++) {
                visibleLocationsDiffs.push(visibleLocations[i] - current);
                current = visibleLocations[i];
            }

            var bufDiffs = FastIntegerCompression.compress(visibleLocationsDiffs);

            var urlEnc = btoa(String.fromCharCode.apply(null, new Uint8Array(bufDiffs)));

            url += '&pagesEnc=' + urlEnc;
        }
        else 
            url += '&pages=' + visibleLocations.join(',');
    }

    if (url === currentUrl) return;

    if (currentUrl === originalUrl) {
        window.history.pushState(null, '', url);
        mapSpecifiedListChanged = true;
    }
    else if (url !== originalUrl)
        window.history.replaceState(null, '', url);
    else {
        window.history.back();
        mapSpecifiedListChanged = null;
    }
}

function countLocationsVisibleOnMap() {
    var locationsDisplayed = 0;
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].isVisible) locationsDisplayed++;
    }
    return locationsDisplayed;
}

function setHeadingTextForRegion() {

    var firstHeadingText = "";

    if (isUserListTable()) {
        firstHeadingText = listUser + "'s " + listName + ' list';
        document.title = listName; // set browser tab title
    }
    else if (isUserStarRatingsTable()) {
        firstHeadingText = starRatingsUser + "'s ratings";
        document.title = firstHeadingText; // set browser tab title
    }
    else if (isUserConditionReportsTable()) {
        firstHeadingText = conditionReportsUser + "'s condition reports";
        document.title = firstHeadingText; // set browser tab title
        firstHeadingText += "<br><span class='conditionreport-user-info'>Note: This is a table of all the locations" +
            " this user has submitted condition reports for. Each row in the table will show the date of the most recent" +
            " condition report for that location, which is not necessarily the same report as the user made, if there" +
            " has been a more recent condition report added. To see the user's condition report(s) for a location," +
            " click on the date of the most recent recent condition report in the table, and find their condition report(s)" +
            " in the page that subsequently loads.</span>";
    }
    else if (isMapPage()) {
        var url = new URL(window.location.href.toString());
        var pagename = url.searchParams.get("pagename");

        if (pagename) {
            firstHeadingText = urldecode(pagename).replaceAll("_", " ") + " Map";
            document.title = firstHeadingText;
        }
    }
    else {
        if (searchWasRun //don't change heading unless custom search rectangle was run
            || isSpecifiedListTable())
        {
            var subRegions = {};
            var parentRegions = {};

            for (var i = 0; i < markers.length; i++) {
                var marker = markers[i];
                if (!marker.isVisible) continue;

                var sub = marker.locationData.region;
                var parentRgn = marker.locationData.parentRegions;
                var parent = parentRgn && parentRgn.length !== 0
                    ? parentRgn[0]
                    : null;

                if (sub == undefined && parent == undefined) continue;

                if (parent === null) { //the subregion is actually the parent in this case
                    parent = sub;
                    sub = null;
                }

                if (sub !== null) {
                    if (subRegions[sub] === undefined) {
                        subRegions[sub] = 0;
                    }
                    subRegions[sub] = subRegions[sub] + 1;
                }

                if (parent !== null) {
                    if (parentRegions[parent] === undefined) {
                        parentRegions[parent] = 0;
                    }
                    parentRegions[parent] = parentRegions[parent] + 1;
                }

            }

            var regionsToSort = Object.keys(parentRegions).length > 1 || Object.keys(subRegions).length === 0
                ? parentRegions
                : subRegions;

            // Create items array
            var regions = Object.keys(regionsToSort).map(function (key) {
                return [key, regionsToSort[key]];
            });

            // Sort the array based on the second element
            regions.sort(function (first, second) {
                return second[1] - first[1];
            });

            if (regions.length > 0)
                firstHeadingText = regions[0][0];

            if (regions.length > 1)
                firstHeadingText += ", " + regions[1][0];

            if (regions.length > 2)
                firstHeadingText += ", and others";
        }

        var title = firstHeadingText.replace(', and others', '...');
        if (!!title)
            document.title = title;
    }

    if (firstHeadingText !== "") {
        var heading = document.getElementById("firstHeading");
        heading.children[heading.children.length - 1].innerHTML = firstHeadingText;
    }
}


function isMapPage() {
    return mw.config.get("wgPageName") === "Map";
}


// What?
var isSpecifiedListTable = function () { return false; }

var searchWasRun = false;

function isUSAorCanada() {
    var embeddedMapType;
    var kmlType = document.getElementById("kmltype");
    if (kmlType != null) {
        var mapSet = kmlType.innerHTML.split('@');
        embeddedMapType = mapSet[0];
    }

    var pageName = mw.config.get("wgPageName");
    var parentRegionEnable = ($("[title='United States']").length > 0 || $("[title='Canada']").length > 0) && pageName !== 'North_America';

    return (embeddedMapType === "topo"
        || pageName === "United_States" || pageName === "Canada" || pageName === "Pacific_Northwest" //region pages
        || parentRegionEnable); //sub-region under US or Canada        
}

var searchMapLoader;

function hideSearchMapLoader() {
    isLoading = false;
    if (!searchMapLoader) return;

    searchMapLoader.style.display = "none";
}


function loadMoreLocations(checkCountOnly, numberToLoad) {
    
    // displaySearchMapLoader();

    if (locationsQuery === '[[specified]]') {
        setSpecifiedLocationsQuery();
    }

    if (locationsTotalWithinArea === undefined) //need to query for the total
    {
        var urlCount = SITE_BASE_URL +
            '/index.php?action=raw&templates=expand&ctype=text/x-wiki' +
            '&title=Template:RegionCountArea' +
            '&query=' + urlencode('[[Category:Canyons]][[Has coordinates::+]]' + locationsQuery);

        $.get(geturl(urlCount), function (data) {
            if (data !== undefined) {
                locationsTotalWithinArea = Number(data);
                loadMoreLocations(checkCountOnly); //self callback
            }
        });

        return;
    }

    //only call to load more locations if we haven't already loaded all available locations in the search box
    if (searchMapRectangle !== undefined) {
        locationsLoadedWithinArea = countLocationsWithinSearchArea();

        if (!searchWasRun)
            loadOffset = 0;

        var moreToLoad = locationsLoadedWithinArea < locationsTotalWithinArea;
        if (!!checkCountOnly || !moreToLoad) {
            hideSearchMapLoader();
            loadOffset = locationsLoadedWithinArea;
            setLoadingInfoText();
            return;
        }

        searchWasRun = true;
    }

    if (!!checkCountOnly) {
        hideSearchMapLoader();
        setLoadingInfoText();
        return;
    }

    var limit = getUrlParam('limit');
    if (!!limit) {
        loadLimit = Number(limit);
        if (loadLimit > 1000) loadLimit = 1000;
    }

    if (!numberToLoad) numberToLoad = loadLimit;

    //load location data
    var urlQuery = SITE_BASE_URL + '/api.php?action=ask&format=json' +
        '&query=' + urlencode('[[Category:Canyons]][[Has coordinates::+]]' + locationsQuery) + getLocationParameters(numberToLoad) +
        "|order=descending,ascending|sort=Has rank rating,Has name" +
        "|offset=" + loadOffset;

    $.getJSON(geturl(urlQuery),
        function (data) {
            if (data.error) {
                var loadingInfo = document.getElementById("loadinginfo");
                loadingInfo.innerHTML = '<div class="rwwarningbox"><b>Error communicating with Ropewiki server</b></div>';
                hideSearchMapLoader();
                return;
            }

            var fitBounds = searchMapRectangle === undefined;
            loadResultsIntoMap(data, fitBounds);  // was loadlist() - heavy-weight path
            
            //load user list - custom dates and comments
            if (isUserListTable()) {
                //general comment
                $.getJSON(geturl(SITE_BASE_URL + '/api.php?action=ask&format=json' +
                        '&query=' + urlencode('[[Lists:' + listUser + '/List:' + listName + ']]') +
                        '|?Has comment=|mainlabel=-'),
                    function (data) {
                        setUserListGeneralComment(data);
                    });
                //individual list entries
                $.getJSON(geturl(SITE_BASE_URL + '/api.php?action=ask&format=json' +
                        '&query=' + urlencode('[[Has user::' + listUser + ']][[Has list::~' + listName + '*]][[Has location::+]]') +
                        '|?Has location|?Has tentative date|?Has comment' +
                        '|limit=' + 500),
                    function (data) {
                        setUserListInfo(data);
                    });
            }
        });

    LoadStarRatings();
    
    loadOffset += numberToLoad;
}


function loadingFinished() {

    // loaded all available locations

    var loadmore = document.getElementById("loadmore");
    loadmore.innerHTML = "";

    if (isNaN(locationsLoadedWithinArea)) return; //page is first loading -- return

    var info;
    switch (locationsLoadedWithinArea) {
        case 0:
            info = "There are no locations within this " + getRegionOrSearchAreaText();
            break;
        case 1:
            info = "Loaded the single location in this " + getRegionOrSearchAreaText();
            break;
        case 2:
            info = "Loaded both locations in this " + getRegionOrSearchAreaText();
            break;
        default:
            info = "Loaded all " + locationsLoadedWithinArea + " locations in this " + getRegionOrSearchAreaText();
            break;
    }

    var totalLoaded = markers.length;
    if (locationsLoadedWithinArea !== totalLoaded) info += ". (" + totalLoaded + " total locations loaded)";

    if (searchMapRectangle === undefined && searchWasRun) //search map was used but is now cancelled
        info = "Loaded " + totalLoaded + " total location" + (totalLoaded !== 1 ? "s" : "");

    var filterInfo = getFilteringInfo(); 
    if (filterInfo) info += "." + filterInfo;
    
    var loadingInfo = document.getElementById("loadinginfo");
    loadingInfo.innerHTML = info;
}


function getRegionOrSearchAreaText() {
    return (!isUserListTable()
            && !isUserStarRatingsTable()
            && !isUserConditionReportsTable()
            && (!isSpecifiedListTable() || searchWasRun)
            || !!searchMapRectangle)
        ? searchMapRectangle === undefined ? "region" : "search area"
        : "list";
}

function getFilteringInfo() {
    var filterInfo = "";

    var filterschk = document.getElementById('filterschk');
    if (filterschk != null && filterschk.checked) {
        filterInfo = " Filters match ";
        var locationsDisplayed = countLocationsVisibleOnMap();

        var totalLoaded = markers.length;

        if (totalLoaded === locationsDisplayed)
            filterInfo += (locationsDisplayed !== 1) ? "all " + totalLoaded : "the one";
        else
            switch (locationsDisplayed) {
            case 0:
                filterInfo += "no";
                break;
            case 1:
                filterInfo += "a single";
                break;
            default:
                filterInfo += locationsDisplayed;
                break;

            }

        filterInfo += " location" + (locationsDisplayed !== 1 ? "s" : "") + ".";
    }
    return filterInfo;
}



function setLoadMoreButton() {

    var remaining = locationsTotalWithinArea - locationsLoadedWithinArea;
    
    var loadmore = document.getElementById("loadmore");

    var loadAlot = 500;
    if (loadLimit > loadAlot) loadAlot = loadLimit;
    
    //if it's less than twice the load number to load all of them, then just load all of them
    if (remaining >= loadAlot * 2) {
        loadmore.innerHTML = '<button title="Load ' + loadAlot + ' more" onclick="loadMoreLocations(false, ' + loadAlot + ')">+' + loadAlot + '</button> ';
    } else {
        loadmore.innerHTML = '<button title="Load remaining" onclick="loadMoreLocations(false, ' + loadAlot * 2 + ')">All</button> ';
    }

    if (remaining > loadLimit * 2 && loadLimit < loadAlot) { //also add the '+' button
        loadmore.innerHTML = '<button title="Load ' + loadLimit + ' more" onclick="loadMoreLocations(false, ' + loadLimit + ')">+</button> ' + loadmore.innerHTML;
    }
}


function loadResultsIntoMap(data, fitbounds) {
    var rwresults = queryResultToParsedList(data);  // was getrwlist

    loadRWResultsListIntoMap(rwresults, fitbounds);

    hideSearchMapLoader();
}

function markerAlreadyExists(id)
{
    var alreadyExists = false;
    for (var j = 0; j < markers.length; ++j) {
        if (markers[j].name === id) {
            alreadyExists = true;
            break;
        }
    }
    return alreadyExists;
}



function updateRatingHighlights() {

    if (userStarRatings == undefined) return;

    var ratinglist = userStarRatings.map(function(item) { return item.name; });

    if (starrate)
        addhighlight(ratinglist, MARKER_USERRATED_HIGHLIGHT, true);
    else {
        removehighlight(ratinglist, MARKER_USERRATED_HIGHLIGHT);

        //add yellow userlist highlights back
        updateUserlistHighlights();
    }
}

function removehighlight(idlist, style) {
    var i;
    for (i = 0; i < markers.length; ++i)
        if (idlist.includes(markers[i].name)) {
            var marker = markers[i];

            if (!marker.highlight || marker.highlight._icon.currentSrc !== style)
                continue;

            marker.highlight.setMap(null);
            marker.highlight = null;
        }
}

//what kmladdlist do?
function updateUserlistHighlights() {

    var kmladdlist = document.getElementById("kmladdlist");
    if (kmladdlist) {
        var addlist = kmladdlist.innerHTML.split(';');
        if (addlist.length > 0)
            addhighlight(addlist, MARKER_USERLIST_HIGHLIGHT);
    }
}


function pinicon(id, icon) {
    if (!icon) icon = PINMAP_ICON;

    return '<img src="' + icon + '" id="' + id + '" class="pinicon" title="Show location on map" style="cursor:pointer;vertical-align:middle" onclick=\'pinmap(this.id)\'/>';
}