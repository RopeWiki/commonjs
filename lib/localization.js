function toggleMetric(force) {
    metric = !metric;
    setCookie("metric", metric ? "on" : "", 360*10); // 10 years
    document.body.style.cursor = 'wait';
    window.location.reload();
    //google.maps.event.trigger(map,'resize');
}

function toggleFrench(force) {
    french = !french;
    setCookie("french", french ? "on" : "", 360*10); // 10 years
    document.body.style.cursor = 'wait';
    window.location.reload();
    //google.maps.event.trigger(map,'resize');
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
