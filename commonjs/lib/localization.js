function toggleMetric() {
    metric = !metric;
    setCookie("metric", metric ? "on" : "", 360*10); // 10 years

    setMetricFields();

    loadInlineWeather();
}

function setMetricFields() {
    var texts = document.getElementsByClassName('uft');
    for (var i = 0; i < texts.length; i++)
        texts[i].innerHTML = uconv(texts[i].innerHTML, ft);
    texts = document.getElementsByClassName('umi');
    for (var i = 0; i < texts.length; i++)
        texts[i].innerHTML = uconv(texts[i].innerHTML, mi);
    texts = document.getElementsByClassName('urap');
    for (var i = 0; i < texts.length; i++)
        texts[i].innerHTML = uconv(texts[i].innerHTML, rap);
}

function toggleFrench() {
    french = !french;
    setCookie("french", french ? "on" : "", 360*10); // 10 years
    document.body.style.cursor = 'wait';
    window.location.reload();
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
