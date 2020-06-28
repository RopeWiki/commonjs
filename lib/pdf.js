function pdfselect(elem) {
    var url = "", file = "";

    var count = 15;
    var base = RWServerUrl + "/rwr?";
    var pdf = document.getElementById('idcredits');
    if (!pdf) return;
    var id = pdf.innerHTML;
    if (!id || id == "") return;
    id = urldecode(id).split(' ').join('_');
    var opts = "";
    var opt = elem.value;
    if (opt == "P")
        file = id + ".pdf", url = base + "filename=" + file + "&pdfx=" + id + "&ext=.rw", opts = "summary=off";
    else if (opt == "PM")
        file = id + "_MAP.pdf", url = base + "filename=" + file + "&pdfx=Map?pagename=" + id + "&ext=.rw", opts = "summary=off";
    else if (opt == "KM")
        file = id + ".kml", url = $('#kmlfilep').html(), count = 1; //url = $('a:contains("Extract KML")').href()
    else if (opt == "GM")
        file = id + ".gpx", url = $('#kmlfilep').html().split("gpx%3Doff").join("gpx%3Don"), count = 1; //url = $('a:contains("Extract KML")').href()
    else if (opt == "ZPM")
        file = id + ".zip", url = base + "filename=" + file + "&zipx=" + id + "&ext=.rw", opts = "bslinks=off&trlinks=off&summary=off";
    else if (opt == "ZALL")
        file = id + "+.zip", url = base + "filename=" + file + "&zipx=" + id + "&ext=.rw", opts = "bslinks=on&summary=off";
    else if (opt == "S")
        url = "http://ropewiki.com/PDFDownload?pagename=" + id + "&ext=.rw";

    url = rwlink(url, opts);
    if (url == "")
        return;

    elem.value = "";
    elem.blur();

    var on = true, oncount = 0;
    setCookie("rwfilename", "");
    var interval = setInterval(function () {
        on = !on;
        oncount++;
        $('#ptext').css("opacity", on ? "1.0" : "0.5");
        if (getCookie("rwfilename", "") != "" || oncount > count) {
            // finished
            clearInterval(interval);
            $('#ptext').css("display", "none");
        }
    }, 1000);

    $('#ptext').css("display", "inline");
    window.location.href = url;
}
