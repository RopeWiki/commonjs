function toggleMetric() {
    metric = !metric;
    setCookie("metric", metric ? "on" : "", 360*10); // 10 years

    setMetricFields();

    loadInlineWeather(weather);
}

function toggleFrench() {
    french = !french;
    setCookie("french", french ? "on" : "", 360 * 10); // 10 years

    setTableSortProperty("technicalRating"); //might have to resort table when changing aca/french rating
}

function setMetricFields() {
    
    convertUnitElements(document);

    var graph = document.getElementById('elevationgraph');
    if (graph !== undefined && graph !== null) {
        drawElevationGraph();
    }

    //update table
    updateTable();
}

function convertUnitElements(element) {
    var i, texts;

    texts = element.getElementsByClassName('uft');
    for (i = 0; i < texts.length; i++)
        texts[i].innerHTML = uconv(texts[i].innerHTML, ftStr);

    texts = element.getElementsByClassName('uft-round');
    for (i = 0; i < texts.length; i++)
        texts[i].innerHTML = uconv(texts[i].innerHTML, ftStrRound);

    texts = element.getElementsByClassName('umi');
    for (i = 0; i < texts.length; i++)
        texts[i].innerHTML = uconv(texts[i].innerHTML, miStr);

    texts = element.getElementsByClassName('umi-ex'); //extended miles, may have text other than the miles
    for (i = 0; i < texts.length; i++)
        texts[i].innerHTML = uconv(texts[i].innerHTML, miExStr);

    texts = element.getElementsByClassName('urap');
    for (i = 0; i < texts.length; i++)
        texts[i].innerHTML = uconv(texts[i].innerHTML, rap);
}

function adjustHtmlStringForMetric(txt) {

    var wrapper = document.createElement('div');
    wrapper.innerHTML = txt;

    convertUnitElements(wrapper);

    return wrapper.innerHTML;
}

// See uconv below
function ftStrRound(feet, space) {
    return ftStr(feet, space, true);
}

// See uconv below
function ftStr(feet, space, round) {
    if (typeof feet == "undefined" || feet === null) return ""; //empty

    feet = feet.toString().trim();
    if (!feet) return ""; //whitespace

    if (feet.includes("mi") || (feet.includes("km"))) return miStr(feet, space); //already converted to mi or km

    feet = feet.replace(",", "");

    var wasMetric = feet.includes("m");

    feet = parseFloat(feet);

    if (isNaN(feet)) return "";

    if (metric && !wasMetric) //convert to metric
        feet /= m2ft;

    if (!metric && wasMetric) //convert to imperial
        feet *= m2ft;

    if (!metric) //round to nearest 5 feet
        feet = Math.round(feet / 5) * 5;

    var feetStr = !round ? feet.toFixed(0) : feet.toPrecision(2);

    return Number(feetStr) + (space ? "&nbsp;" : "") + (metric ? "m" : "ft");
}

// See uconv below
function miStr(miles, space) {
    if (typeof miles == "undefined" || miles === null) return ""; //empty 

    miles = miles.toString().trim();
    if (!miles) return ""; //whitespace

    if (miles.includes("ft") || (miles.includes("m") && !miles.includes("mi") && !miles.includes("km"))) return ftStr(miles, space); //already converted to ft or m

    miles = miles.replace(",", "");

    var wasMetric = miles.includes("km");

    miles = parseFloat(miles);

    if (isNaN(miles)) return "";

    if (metric && !wasMetric) //convert to metric
        miles /= km2mi;

    if (!metric && wasMetric) //convert to imperial
        miles *= km2mi;

    if (miles < 0.2) // very short distance, display feet or m instead
        return ftStr(metric ? miles * 1000 + "m" : miles * 5280 + "ft", space);

    var decimalPos = (miles >= 1) ? 2 : (miles > 0) ? 1 : 0;

    return Number(miles.toPrecision(decimalPos)) + (space ? "&nbsp;" : "") + (metric ? "km" : "mi");
}

// See uconv below
function miExStr(milesEx) { //locate the mi string within and convert it, leaving surrounding text as-is
    if (typeof milesEx == "undefined" || milesEx === null) return ""; //empty 

    milesEx = milesEx.toString().trim();
    if (!milesEx) return ""; //whitespace

    var converted = "";
    var cursor = 0;

    const regex = /([\d.]+)\s*(min|miles|mile|mi|kilometers|kilometer|km)/g; //finds floating point or numbers

    var matches;
    while ((matches = regex.exec(milesEx)) !== null) {
        if (matches === undefined) break;

        var match = matches[0];
        var units = matches[2];
        if (units === "min") continue;
        var convertedMatch = miStr(match);

        converted += milesEx.substr(cursor, matches.index) + convertedMatch;

        cursor = regex.lastIndex;
    }
    converted += milesEx.substr(cursor);

    return converted;
}

// called by uconv below
function rap(raps, space) {
    if (!raps || !raps.trim()) return ""; //empty or whitespace

    if (isNaN(raps)) return raps; //already formatted

    return raps + (space ? "&nbsp;" : "") + "r"; //it's a number, add the 'r' at the end
}

/**
 * Convert a value to a human-readable string with units according to locale based on `metric` global variable
 *
 * @see  ft, mi functions above
 *
 * @param {string}                               str String representation of a distance, possibly followed by up-down
 *                                                   arrow (unicode 2195) and then a height in feet, sometimes with a
 *                                                   non-breaking space (e.g., "2.7", "1.5&nbsp;\u21951000")
 * @param {function(float value, bool hasSpace)} cnv Conversion function accepting (float value, bool hasSpace) and
 *                                                   returning a string representation of the appropriately-rounded
 *                                                   value followed by units
 *
 * @return {string} Human-readable string with units according to locale (e.g., "2.7mi",
 *                  "1.5&nbsp;mi \u21951000&nbsp;ft")
 */
function uconv(str, cnv) {
    if (str == null || str == "")
        return "";

    var sep = "\u2195";
    var vstr = str.split(sep);

    vstr[0] = cnv(vstr[0], str.indexOf('&nbsp;') > 0);

    if (vstr.length > 1)
        vstr[1] = ftStr(vstr[1], str.indexOf('&nbsp;') > 0);

    return vstr.join(" " + sep);
}

function acaconv(str, more) {
    var end = str.indexOf(')');
    if (end < 0)
        return str;
    var start = str.indexOf('*') + 1;
    while (start < end && !(str.charAt(start) >= '1' && str.charAt(start) <= '4'))
        ++start;
    if (start >= 3 && str.substr(start - 3, 3) === '<i>')
        start -= 3;
    var rating = str.substr(start, end - start).split('(');
    if (rating.length < 2)
        return str;
    var val = rating[french ? 1 : 0].trim();
    if (more)
        val += ' (' + rating[french ? 0 : 1].trim() + ')';
    return str.substr(0, start) + val + str.substr(end + 1);
}

function addUACAStyle() {
    var sheet = document.createElement('style');
    sheet.id = 'french';
    sheet.innerHTML = french ? " .uaca0 { display: none ; }" : " .uaca1 { display: none ; }";
    if (document.body) document.body.appendChild(sheet);
}
