function pdfselect(elem) {
    var url = "", file = "";

    var count = 15;
    var base = LUCA_BASE_URL + "/rwr?";
    var pdf = document.getElementById('idcredits');
    if (!pdf) return;

    var id = pdf.innerHTML;
    if (!id || id == "") return;

    id = urldecode(id).split(' ').join('_');
    var opts = "";
    var opt = elem.value;

    if (opt == "PDF")
        file = id + ".pdf", url = base + "filename=" + file + "&pdfx=" + id + "&ext=.rw", opts = "summary=off";
    else if (opt == "KML")
        file = id + ".kml", url = $('#kmlfilep').html(), count = 1;
    else if (opt == "GPX")
        url = SITE_BASE_URL + "/kml_to_gpx.php?url=" + $('#kmlfilep').html(), count = 1;

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
