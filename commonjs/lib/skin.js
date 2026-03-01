
function loadSkin() {
    var toption = document.getElementsByClassName('toption');
    for (var i = 0; i < toption.length; ++i)
        toption[i].style.display = "block";

    var skinconfig = urldecode(getCookie("skinconfig"));
    //var url = window.location.href.toString();
    //skinconfig = urlget(url, 'skinconfig', "");
    var elem = document.getElementById('skinconfig');
    if (elem != null) {
        skinconfig = urldecode(elem.innerHTML);
        setCookie('skinconfig', urlencode(skinconfig));
    }

    //var skinconfig2 = urldecode(getCookie("skinconfig"));

    if (skinconfig != "") {
        var str = skinconfig.split(',');
        skinuser = str[0];

        // patch for session!!!
        if ((elem = document.getElementById('skinuser')) != null)
            if (elem.innerHTML == "" && skinuser != "") {
                // reload
                var str = window.location.href;
                if (str.indexOf('?') >= 0)
                    str += '&';
                else
                    str += '?';
                document.body.style.display = "none";
                window.location.href = str + 'skinuser=' + encodeURIComponent(skinuser);
            }

        // color
        if (str.length > 1 && str[1] != "") {
            //document.body.style.backgroundColor = str[1];
            if ((elem = document.body) != null) {
                elem.style.backgroundColor = str[1];
            }
            if ((elem = document.getElementById('mw-page-base')) != null) {
                elem.style.backgroundColor = str[1];
                elem.style.backgroundImage = "none";
            }
        }

        // logo
        if (str.length > 2 && str[2] != "") {
            var str2 = str[2].split('|');
            if ((elem = document.getElementById('p-logo')) != null)
                elem.innerHTML = '<a href="' + escapeHtml(str2[0]) + '"><img src="' + escapeHtml(str2[1]) + '"/></a>';
        }

        // links
        for (var n = 3; n < str.length; ++n) {
            var navdiv = "";
            var str2 = str[n].split('*');
            var base = str2[0].split('|');
            for (var i = 1; i < str2.length; ++i) {
                var line = str2[i].split('|');
                navdiv += '<li id="n-' + i + '"><a href="' + escapeHtml(line[0]) + '">' + escapeHtml(line[1]) + '</a></li>';
            }
            if ((elem = document.getElementById(base[0])) != null)
                if (navdiv != "")
                    elem.innerHTML = '<h3>' + escapeHtml(base[1]) + '</h3><div class="body"><ul>' + navdiv + '</ul></div>';
                else
                    elem.innerHTML = "";
        }
    }
}
