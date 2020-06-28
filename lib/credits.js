// load credits
function loadcredits(pagename, mode, divid) {
    var div = document.getElementById(divid);
    if (!div) return;

    var size = 0;
    var lastuser;
    var users = [];

    var origurl = geturl(SITE_BASE_URL + "/api.php?format=json&action=query&prop=revisions&rvexcludeuser=BetaRobot&redirects=&continue=");
    switch (mode) {
        case 'P':
            origurl += "&rvprop=user|size&titles=" + pagename + "&rvlimit=max&rvdir=newer";
            break;
        case 'K':
            origurl += "&rvprop=user|comment&titles=File:" + pagename + ".kml&rvlimit=max&rvdir=newer";
            break;
        case 'J':
            //origurl += "&rvprop=user|comment&titles=File:"+pagename+" Banner.jpg&rvlimit=max&rvdir=newer"; // mediawiki bug! no longer working!!!
            origurl = SITE_BASE_URL + "/api.php?format=json&action=query&titles=File:" + pagename + " Banner.jpg&prop=imageinfo&iiprop=user|comment";
            break;
    }


    function getjs(data) {
        //var cont = data.continue;
        function finduser(user) {
            for (var i = 0; i < users.length; ++i)
                if (users[i].user == user)
                    return i;
            return -1;
        }

        var bqnlist = [];
        var bqnuser = "Barranquismo.net";
        var bqnelems = document.getElementsByClassName('barranquismonet');
        for (i = 0; i < bqnelems.length; ++i)
            bqnlist.push(bqnelems[i].innerHTML);

        var addid = 'addcredit';
        var addlist = [];
        var addelems = document.getElementsByClassName(addid);
        for (i = 0; i < addelems.length; ++i)
            addlist.push(addelems[i].innerHTML);
        /*
           var crvcont = null;
           if (data.continue!=null)
             $.each(data.continue, function(cont, rvcont) {
                     crvcont = rvcont;
                 });*/
        $.each(data.query.pages, function (i, item) {
            //alert(item.title);
            var rev = item.revisions;
            if (!rev)
                rev = item.imageinfo; // case 'J'
            if (rev != null && rev.length != null) {
                for (var i = 0; i < rev.length; ++i) {
                    // patch Barranquismo.net = BetaRobot2
                    if (bqnlist.length > 0 && rev[i].user == 'BetaRobot2')
                        rev[i].user = bqnuser;
                    if (addlist.length > 0 && rev[i].user == 'BetaRobot2')
                        rev[i].user = addid;
                    if (bqnlist.length == 0 && rev[i].user.search(bqnuser) >= 0)
                        continue;
                    if (mode == 'J' && rev[i].comment) // bla bla by Author => Author
                    {
                        var by = rev[i].comment.split(' by ');
                        if (by.length > 1) {
                            rev[i].user = by[1];
                            rev[i].comment = "";
                        }
                    }
                    if (rev[i].user.search("Robot") >= 0)
                        continue;

                    if (mode == 'J')
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
                //alert("continue: u="+users.length+" len:"+rev.length);
                $.getJSON(origurl + "&rvcontinue=" + data['continue'].rvcontinue, getjs);
                return;
            }

            // finished processing

            // write credits
            function credit(users, size) {
                if (users.length == 0)
                    return;

                for (var u = 0; u < users.length; ++u) {
                    //credits += '<a href=>'+users[u]+'</a>';
                    if (users[u].user == addid)
                        credits += addlist.join(" & ").split("(").join("[").split(")").join("]");
                    else if (users[u].user.indexOf('http') > 0) {
                        var userlink = users[u].user.split('http');
                        credits += userlink[0].link('http' + userlink[1]);
                    } else
                        credits += users[u].user.link(SITE_BASE_URL + "/User:" + users[u].user);
                    if (users[u].user == bqnuser)
                        credits += "[" + bqnlist.join(", ") + "]";
                    else if (size > 0)
                        credits += " (" + Math.round(users[u].size / size * 100) + "%)"; //" <span class='creditp'>("+psize(u)+"%)</span>";
                    if (u < users.length - 1)
                        credits += u < users.length - 2 ? ", " : " & ";
                }

                // final comment
                var comment = users[users.length - 1].comment;
                if (comment != null && comment.indexOf('[[File:') > 0) {
                    var pcomment;
                    //console.log("comment:"+comment);
                    if ((pcomment = comment.indexOf(': ')) > 0)
                        comment = comment.substr(pcomment + 2);
                    else
                        comment = "";
                }
                if (comment != null && comment != "")
                    credits += " (" + comment + ")";
            }


            var credits = "";
            // purge users
            if (size == 0)
                credit(users, size);
            else {
                // adjust for negative contributions (deletions)
                var usize = 0;
                for (var u = 0; u < users.length; ++u) {
                    if (users[u].size > 0)
                        usize += users[u].size;
                    if (users[u].size < 0)
                        users.splice(u--, 1);
                }

                var major = [], minor = [];
                for (var u = 0; u < users.length; ++u)
                    if (u == 0 || usize == 0 || users[u].size / usize > 5 / 100) // min 5% contrib
                        major.push(users[u]);
                    else
                        minor.push(users[u]);
                /*
                          points.sort(function(a, b){return a-b});
                */
                credit(major, major.length > 1 ? usize : 0);
                if (minor.length > 0) {
                    credits += " with minor contributions by "
                    credit(minor, 0);
                }
            }

            if (credits) {
                var div = document.getElementById(divid);
                if (div) div.innerHTML = credits;
            }
            //console.log(mode+":"+credits);
        });
    }

    $.getJSON(origurl, getjs);
}