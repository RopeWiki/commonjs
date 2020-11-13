function pictureget(linklist) {
    if (linklist.length == 0)
        return;

    var url = geturl(linklist.shift());
    console.log("getpic " + url);

    $.getJSON(url, function (data) {
        var poilist = [];
        var list = data.list; //data.split('/cgi-progs/staMeta?station_id=');
        for (var i = 0; i < list.length; ++i) {
            var col = list[i].split(',');
            var node = document.createElement("LI");
            node.className = "gallerybox";
            var content = '<div class="thumbinner" style="width:154px"><a href="' + col[0] + '" target="_blank"><img src="' + col[4] + '" style="width:150px;height:150px;"></a><div class="thumbcaption"><div>' + pinicon(col[0], piciconlist[col[9]]) + ' <b>' + col[6] + '</b></div><div>' + col[8] + '</div><div>' + col[1] + '</div></div></div>';
            node.innerHTML = content;
            node.sortdate = col[5];
            node.locid = col[0];
            //piclist.appendChild(node);
            var elems = piclist.getElementsByTagName("LI");
            var pos = 0;
            for (pos = 0; pos < elems.length && elems[pos].sortdate >= node.sortdate; ++pos) ;
            if (pos == elems.length)
                piclist.appendChild(node);
            else
                piclist.insertBefore(node, elems[pos]);
            var loc = {lat: parseFloat(col[2].toString()), lng: parseFloat(col[3].toString())};
            poilist.push({
                id: col[0],
                location: loc,
                zindex: 100 - i,
                icon: piciconlist[col[9]],
                thumbnail: col[4],
                description: '',
                infodescription: col[6] + ' ' + col[8],
                infocontent: content
            });
        }

        if (map != null)
            loadlist(poilist);

        // limit max 250 pics
        var locids = [];
        var elems = piclist.getElementsByTagName("LI");
        for (var pos = 250; pos < elems.length; ++pos) {
            locids.push(elems[pos].locid);
            piclist.removeChild(elems[pos]);
        }
        for (var i = 0; i < markers.length; ++i)
            if (locids.indexOf(markers[i].name) >= 0)
                markers[i].setMap(null);
    }).error(function () {
        ++picloadingerr;
        console.log("picerror " + url);
    })
        .always(function () {
            var msg = "";
            if (linklist.length > 0)
                msg += picloadingmsg + Math.round((picloadingn - linklist.length) * 100.0 / picloadingn) + '%';
            if (picloadingerr > 0)
                msg += ' <span style="color:red">' + picloadingerr + ' ERRORS!</span>';
            picloading.innerHTML = msg;
            pictureget(linklist);
        });
}

function pictureinit() {
    piclist = document.getElementById('picture-list');
    var picrect = document.getElementById('picture-rect');
    if (!picrect || !piclist)
        return;

    picloading = document.createElement("DIV");
    picloading.innerHTML = picloadingmsg;
    piclist.parentNode.insertBefore(picloading, piclist);

    piciconlist["Instagram.com"] = SITE_BASE_URL + "/images/c/c0/InstaIcon.png";
    piciconlist["Facebook.com"] = SITE_BASE_URL + "/images/0/03/FacebIcon.png";
    piciconlist["Flickr.com"] = SITE_BASE_URL + "/images/f/f7/FlickIcon.png";
    piciconlist["Panoramio.com"] = SITE_BASE_URL + "/images/a/a4/PanorIcon.png";

    var local = window.location.href.toString().indexOf('debug=local') >= 0; // || url.indexOf('http')<0;
    var preurl = local ? SITE_BASE_URL + "/rwr?pictures=" : LUCA_BASE_URL + "/rwr?pictures=";
    var url = preurl + picrect.innerHTML;

    //console.log(url);
    $.getJSON(geturl(url),
        function(data) {
            //alert( "Load was performed." );
            //console.log("load performed");

            // load sites
            var list = data.list; //data.split('/cgi-progs/staMeta?station_id=');
            picloadingerr = 0;
            picloadingn = list.length;
            for (t = 0; t < 3; ++t) {
                setTimeout(function() {
                        pictureget(list);
                    },
                    t * 500);
            }
            pictureget(list);
        }).error(function() {
        picloading.innerHTML = '<div style="color:red">ERROR!</div>';
    });
}
