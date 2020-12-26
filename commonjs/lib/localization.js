function toggleMetric() {
    metric = !metric;
    setCookie("metric", metric ? "on" : "", 360*10); // 10 years

    setMetricFields();

    loadInlineWeather();
}

function setMetricFields() {

    //update fields in sidebar
    var texts = document.getElementsByClassName('uft');
    for (var i = 0; i < texts.length; i++)
        texts[i].innerHTML = uconv(texts[i].innerHTML, ftStr);
    texts = document.getElementsByClassName('umi');
    for (var i = 0; i < texts.length; i++)
        texts[i].innerHTML = uconv(texts[i].innerHTML, miStr);
    texts = document.getElementsByClassName('urap');
    for (var i = 0; i < texts.length; i++)
        texts[i].innerHTML = uconv(texts[i].innerHTML, rap);

    //update table
    updateTable();
}

function toggleFrench() {
    french = !french;
    setCookie("french", french ? "on" : "", 360*10); // 10 years

    updateTable();
}

function getLinkLang(node) {
    for (var i = 1; i < 3 && node; ++i) {
        node = node.previousSibling;
        if (node && node.nodeName == 'IMG') {
            var s, e;
            var src = node.src;
            if ((s = src.indexOf("Rwl_")) > 0 && (e = src.indexOf(".", s)) > 0)
                return src.substr(s + 4, e - s - 4);
        }
    }
    return null;
}
