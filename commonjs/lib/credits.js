// load credits
function loadcredits(pagename, mode, divid) {
    var div = document.getElementById(divid);
    if (!div) return;

    var size = 0;
    var users = [];

    //Modes:
    var modeCredits = "P";
    var modeKmlMap = "K";
    var modeBannerPhoto = "J";

    var origurl = geturl(SITE_BASE_URL + "/api.php?format=json&action=query&prop=revisions&redirects=&continue=");
    switch (mode) {
        case modeCredits:
            origurl += "&rvprop=user|size&titles=" + pagename + "&rvlimit=max&rvdir=newer";
            break;
        case modeKmlMap:
            origurl += "&rvprop=user|comment&titles=File:" + pagename + ".kml&rvlimit=max&rvdir=newer";
            break;
        case modeBannerPhoto:
            origurl = SITE_BASE_URL + "/api.php?format=json&action=query&titles=File:" + pagename + " Banner.jpg&prop=imageinfo&iiprop=user|comment";
            break;
    }

    function getjs(data) {

        function finduser(user) {
            for (var i = 0; i < users.length; ++i)
                if (users[i].user === user)
                    return i;
            return -1;
        }

        function isUserRobot(username) {
            return username.includes("Robot");
        }
        
        var bqnlist = [];
        var bqnuser = "Barranquismo.net";
        var bqnelems = document.getElementsByClassName('barranquismonet');
        for (var i = 0; i < bqnelems.length; ++i)
            bqnlist.push(bqnelems[i].innerHTML);

        var addid = 'addcredit';
        var addlist = [];
        var addelems = document.getElementsByClassName(addid);
        for (var i = 0; i < addelems.length; ++i)
            addlist.push(addelems[i].innerHTML);

        $.each(data.query.pages, function (i, item) {
            var rev = item.revisions;

            if (!rev)
                rev = item.imageinfo; // case 'J' banner photo

            if (rev != null && rev.length != null) {
                for (var i = 0; i < rev.length; ++i) {
                    var isRobot = isUserRobot(rev[i].user);

                    // patch Barranquismo.net = BetaRobot2
                    if (bqnlist.length > 0 && isRobot)
                        rev[i].user = bqnuser;
                    if (addlist.length > 0 && isRobot)
                        rev[i].user = addid;
                    if (bqnlist.length === 0 && rev[i].user.search(bqnuser) >= 0)
                        continue;

                    if (mode === modeBannerPhoto && rev[i].comment) { // bla bla by Author => Author
                        var by = rev[i].comment.split(' by ');
                        if (by.length > 1) {
                            rev[i].user = by[1];
                            rev[i].comment = "";
                        }
                    }

                    if (mode === modeBannerPhoto) //banner photo
                        users.splice(0, users.length);

                    var u = finduser(rev[i].user);
                    if (u < 0) {
                        users.push({user: rev[i].user, size: 0});
                        u = users.length - 1;
                    }
                    if (rev[i].size != null) {
                        users[u].size += rev[i].size - size;
                        size = rev[i].size;
                    }
                    if (rev[i].comment != null)
                        users[u].comment = rev[i].comment;
                }
            }

            if (typeof data['continue'] != "undefined") {
                $.getJSON(origurl + "&rvcontinue=" + data['continue'].rvcontinue, getjs);
                return;
            }

            // finished processing

            var credits = "";

            // write credits
            function credit(users, size) {
                if (users.length === 0)
                    return;

                for (var u = 0; u < users.length; ++u) {
                    if (users[u].user === addid)
                        credits += addlist.join(" & ").split("(").join("[").split(")").join("]");
                    else if (users[u].user.indexOf('http') > 0) {
                        var userlink = users[u].user.split('http');
                        credits += userlink[0].link('http' + userlink[1]);
                    } else
                        credits += users[u].user.link(SITE_BASE_URL + "/User:" + users[u].user);
                    if (users[u].user === bqnuser)
                        credits += " [" + bqnlist.join(", ") + "]";
                    else if (size > 0) {
                        var percent = Math.round(users[u].size / size * 100) + "%";

                        if (users[u].size / usize < 5 / 100) //initial contribution, but minor
                            percent = "creator";
                        
                        credits += " (" + percent + ")";
                    }
                    if (u < users.length - 1)
                        credits += u < users.length - 2 ? ", " : " & ";
                }

                // final comment
                var comment = users[users.length - 1].comment;
                if (comment != null && comment.indexOf('[[File:') > 0) {
                    var pcomment;

                    if ((pcomment = comment.indexOf(': ')) > 0)
                        comment = comment.substr(pcomment + 2);
                    else
                        comment = "";
                }
                if (comment != null && comment !== "")
                    credits += " (" + comment + ")";
            }

            // purge users
            if (size === 0)
            {
                credit(users, size);
            }
            else
            {
                // adjust for negative contributions (deletions)
                var usize = 0;
                for (var u = 0; u < users.length; ++u) {
                    if (isUserRobot(users[u].user))
                        continue;
                    
                    //assume that negative contributions are not a user merely deleting text, but changing a lot of words
                    //we can't track actual words changed without a very expensive search for diffs between eash revision
                    //instead, all we have to go on is the total size of the page. So give them the benefit of the doubt
                    //for a negative contribution size and add this to the total change size
                    if (users[u].size < 0)
                        //users.splice(u--, 1); //<- i.e., don't splice them out
                        users[u].size = -users[u].size;

                    if (users[u].size > 0)
                        usize += users[u].size;
                }

                var major = [], minor = [];
                for (var u = 0; u < users.length; ++u) {
                    if (isUserRobot(users[u].user)) continue;

                    if (u === 0 || usize === 0 || users[u].size / usize > 5 / 100) // min 5% contrib
                        major.push(users[u]);
                    else
                        minor.push(users[u]);
                }

                credit(major, major.length > 1 ? usize : 0);

                if (minor.length > 0) {
                    credits += " with minor contributions by ";
                    credit(minor, 0);
                }
            }

            if (credits) {
                var div = document.getElementById(divid);
                if (div) div.innerHTML = credits;
            }
        });
    }

    $.getJSON(origurl, getjs);
}
