var userStarRatingsLoaded = false;

function LoadStarRatings() {
    if (!userStarRatingsLoaded) {
        userStarRatingsLoaded = true;

        var user;
        if (isUserStarRatingsTable())
            user = starRatingsUser;
        else {
            if (!!currentuser) user = currentuser;
        }

        if (user) {
            $.getJSON(geturl(SITE_BASE_URL +
                    '/api.php?action=ask&format=json' +
                    '&query=' +
                    urlencode('[[Has page rating::+]][[Has page rating user::' + user + ']]') +
                    '|?Has_page_rating|mainlabel=-' +
                    '|limit=' +
                    2000), //load all ratings the user has made
                function(data) {
                    setUserStarRatings(data);
                });
        }
    }
}

function getStarFraction(num) {
    if (num >= 0.875)
        return 4;
    else if (num >= 0.625)
        return 3;
    else if (num >= 0.375)
        return 2;
    else if (num >= 0.125)
        return 1;
    else
        return 0;
}

var starRatingsUser, isUserStarRatingsTableVar;

function isUserStarRatingsTable() {
    if (isUserStarRatingsTableVar === undefined) {
        var url = new URL(window.location.href.toString());
        starRatingsUser = url.searchParams.get("onlyuser");

        if (starRatingsUser) {
            isUserStarRatingsTableVar = true;
            starrate = true; //set checked by default
        } else
            isUserStarRatingsTableVar = false;
    }

    return isUserStarRatingsTableVar;
}

function getStars(num, numRatings, size, includeNumRatings) {
    var line = '<span class="tablestars">';

    if (!includeNumRatings) //bump right to account for lack of numRatings text
        line += "&nbsp;";

    for (var i = 0; i < 5; ++i) {
        line += '<img width="' + size + 'px" height="' + size + 'px" src="' + STARLIST[getStarFraction(num)] + '"/>';
        num -= 1;
    }

    if (includeNumRatings && numRatings > 0)
        line += '<span class="starsub">' + numRatings + '</span>';

    line += '</span>';
    return line;
}

function getStarsVote(num, unum, ratings) {
    var line = '<span class="tablestars starRate">';
    var text = ['Delete', 'Not worth doing', 'Worthwhile', 'Ok', 'Great', 'Among the best'];
    var i;

    if (!currentuser)
        for (i = 0; i <= 5; ++i)
            text[i] = 'Log in to rate';

    for (i = 1; i <= 5; ++i) {
        line += '<b id="' + i + '" class="starRate' + getStarFraction(num) + '" style="cursor:pointer" onclick="starVote(this)"><span class="starText starvText">' + text[i] + '</span></b>';
        num -= 1;
    }

    if (unum > 0)
        line += '<b id="0" class="starx starsub" style="color:red;cursor:pointer;" onclick="starVote(this)">X<span class="starText starvText">' + text[0] + '</span></b>';
    else if (ratings > 0)
        line += '<span class="starsub">' + ratings + '</span>';

    line += '</span>';

    return line;
}

function getStarsId(elem) {
    var tr = elem.parentNode;
    while (tr != null && tr.nodeName !== 'TR')
        tr = tr.parentNode;
    if (tr == null)
        return null;
    var link = tr.getElementsByTagName('A');
    if (link && link[0])
        return link[0].innerHTML; //link.title;
    return null;
}

function starVote(elem) {
    var stars = elem.id;
    var id = getStarsId(elem);
    
    if (stars && id && !!currentuser) {
        //alert(id+ " " + stars + "*");
        var user = currentuser;
        var fr = document.createElement("IFRAME");
        var target = 'Votes:' + id + '/' + user;
        if (stars === '0') {
            stars = "";
            user = "";
        }

        fr.src = SITE_BASE_URL + '/api.php?action=sfautoedit&form=Page_rating&target=' + target + '&query=Page_rating[Page]=' + id + '%26Page_rating[Rating]=' + stars + '%26Page_rating[User]=' + user;
        fr.style.display = "none";

        document.body.appendChild(fr);

        // update
        var parent = elem.parentNode;
        while (parent != null && parent.className.indexOf('starv') < 0)
            parent = parent.parentNode;
        if (parent) {
            parent.innerHTML = getStarsVote(stars, stars, -1, 16);
            parent.className = 'starv votedrow';
        }

        //update marker value
        var marker = markers.filter(function (x) { return x.name === id; })[0];

        if (marker != undefined)
            marker.locationData.userStars = stars;

        updateTable();
    }
}

var userStarRatings = [];

function setUserStarRatings(data) {
    $.each(data.query.results,
        function (pagename, item) {
            var startIndex = pagename.indexOf(':');
            var endIndex = pagename.indexOf('/');
            if (startIndex < 0 || endIndex < 0) return;
            var name = pagename.substring(startIndex + 1, endIndex);
            var stars = item.printouts["Has page rating"][0];

            var newRating = { name: name, stars: stars };
            var index = userStarRatings.findIndex(function(x) { return x.location === name; });
            index === -1 ? userStarRatings.push(newRating) : userStarRatings[index] = newRating;

            var marker = markers.filter(function (x) { return x.name === name; })[0];

            if (marker != undefined)
                marker.locationData.userStars = stars;
        });

    updateTable();
}

function getUserStarDisplay(location, stars, ustars, numRatings, size) {

    if (starrate &&
        (!isUserStarRatingsTable() || (isUserStarRatingsTable() && !!currentuser && starRatingsUser === currentuser)))
    {
        return getUsersStarswithVotingDisplay(stars, ustars, numRatings);
    }
    else
    {
        return getGeneralStarsDisplay(location, stars, ustars, numRatings, size);
    }
}

function getUsersStarswithVotingDisplay(stars, ustars, numRatings) {
    if (!stars) stars = 0;
    if (!ustars) ustars = 0;
    else stars = ustars;
    if (!numRatings) numRatings = 0;

    var starDisplay = {}, i;

    var line = '<span class="starRate" style="white-space: nowrap;">';
    var text = ['Delete', 'Not worth doing', 'Worthwhile', 'Ok', 'Great', 'Among the best'];
    
    if (!currentuser)
        for (i = 0; i <= 5; ++i)
            text[i] = 'Log in to rate';

    for (i = 1; i <= 5; ++i) {
        line += '<b id="' + i + '" class="starRate' + getStarFraction(stars) + '" style="cursor:pointer" onclick="starVote(this)"><span class="starText starvText">' + text[i] + '</span></b>';
        stars -= 1;
        }

    if (ustars > 0)
        line += '<b id="0" class="starx starsub" style="color:red;cursor:pointer;" onclick="starVote(this)">X<span class="starText starvText">' + text[0] + '</span></b>';
    else if (numRatings > 0)
        line += '<span class="starsub">' + numRatings + '</span>';

    line += '</span>';

    starDisplay.title = "";
    starDisplay.innerHTML = line;
    starDisplay.className = "starv";
    if (ustars > 0)
        starDisplay.className += ' votedrow';

    return starDisplay;
}

function getGeneralStarsDisplay(location, stars, ustars, numRatings, size) {
    if (!stars) stars = 0;
    if (!ustars) ustars = 0;
    if (!numRatings) numRatings = 0;
    if (!size) size = 16;

    var starDisplay = {};

    var showUsersRatings = isUserStarRatingsTable() && starrate && ustars > 0;

    if (showUsersRatings) stars = ustars;

    var starsHTML = getStars(stars, numRatings, size, !showUsersRatings);

    if (!showUsersRatings) //wrap in a link to the ratings page
        starsHTML = '<a href="' + SITE_BASE_URL + '/List_ratings?location=' + location + '">' + starsHTML + '</a>';

    starDisplay.innerHTML = starsHTML;

    starDisplay.title = !showUsersRatings
        ? stars.toFixed(1) + '*' + (numRatings <= 0 ? '' : ' (' + numRatings + ' ratings)')
        : "They rated this " + stars.toFixed(0) + " stars";
    
    starDisplay.className = "starv";
    if (ustars > 0) starDisplay.className += ' votedsub';
    if (showUsersRatings) starDisplay.className += ' votedrow';

    return starDisplay;
}


var conditionReportsUser, isUserConditionReportsTableVar;

function isUserConditionReportsTable() {
    if (isUserConditionReportsTableVar === undefined) {
        var url = new URL(window.location.href.toString());
        conditionReportsUser = url.searchParams.get("onlycuser");

        if (conditionReportsUser) {
            isUserConditionReportsTableVar = true;
        } else
            isUserConditionReportsTableVar = false;
    }

    return isUserConditionReportsTableVar;
}
