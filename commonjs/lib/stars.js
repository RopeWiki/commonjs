// Constants
var STARLIST = [
    SITE_BASE_URL + '/images/9/9d/GoldStar0.png',
    SITE_BASE_URL + '/images/8/86/GoldStar1.png',
    SITE_BASE_URL + '/images/f/fd/GoldStar2.png',
    SITE_BASE_URL + '/images/8/8d/GoldStar3.png',
    SITE_BASE_URL + '/images/4/41/GoldStar4.png'
];

function getStar(num, size) {
    var pre = '<img width="' + size + 'px" height="' + size + 'px" src="', pos = '"/>'
    return pre + STARLIST[4] + pos;
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
    //if (i!=4) line+='&zwj;';
}

function getStars(num, numRatings, size) {
    var line = '<span style="white-space: nowrap;">';
    for (var i = 0; i < 5; ++i) {
        line += '<img width="' + size + 'px" height="' + size + 'px" src="' + STARLIST[getStarFraction(num)] + '"/>';
        num -= 1;
    }
    if (numRatings > 0)
        line += '<span class="starsub">' + numRatings + '</span>';
    line += '</span>'
    return line;
}

function getStarsVote(num, unum, ratings, size) {
    var line = '<span class="starRate" style="white-space: nowrap;">';
    var text = ['Delete', 'Not worth doing', 'Worthwhile', 'Ok', 'Great', 'Among the best'];
    if (!document.getElementById('curuser'))
        for (var i = 0; i <= 5; ++i)
            text[i] = 'Log in to rate';
    for (var i = 1; i <= 5; ++i) {
        line += '<b id="' + i + '" class="starRate' + getStarFraction(num) + '" style="cursor:pointer" onclick="starVote(this)"><span class="starText starvText">' + text[i] + '</span></b>';
        num -= 1;
    }
    if (unum > 0)
        line += '<b id="0" class="starx starsub" style="color:red;cursor:pointer;" onclick="starVote(this)">X<span class="starText starvText">' + text[0] + '</span></b>';
    else if (ratings > 0)
        line += '<span class="starsub">' + ratings + '</span>';
    line += '</span>'
    return line;
}

function getStarsId(elem) {
    var tr = elem.parentNode;
    while (tr != null && tr.nodeName != 'TR')
        tr = tr.parentNode;
    if (tr == null)
        return null;
    var link = tr.getElementsByTagName('A')
    if (link && link[0])
        return link[0].innerHTML; //link.title;
    return null;
}

function starVote(elem) {
    var stars = elem.id;
    var id = getStarsId(elem);
    var euser = document.getElementById('curuser');

    if (stars && id && euser) {
        //alert(id+ " " + stars + "*");
        var user = euser.innerHTML;
        var fr = document.createElement("IFRAME");
        var target = 'Votes:' + id + '/' + user;
        if (stars == '0') {
            stars = "";
            user = "";
        }

        fr.src = SITE_BASE_URL + '/api.php?action=sfautoedit&form=Page_rating&target=' + target + '&query=Page_rating[Page]=' + id + '%26Page_rating[Rating]=' + stars + '%26Page_rating[User]=' + user;
        fr.style.display = "none";
        //alert(fr.src);
        document.body.appendChild(fr);

        // update
        var parent = elem.parentNode;
        while (parent != null && parent.className.indexOf('starv') < 0)
            parent = parent.parentNode;
        if (parent) {
            /*
            if (typeof parent.stars != "undefined")
              {
              // adjust values
              var ratings = parent.ratings;
              var rstars = parent.stars * ratings;
              var ustars = parent.ustars;
              if (rstars<0)
                  {
                  rstars = 0;
                  ratings  = 0;
                  }
              if (ustars>0 && rstars>0)
                  {
                  rstars -= ustars;
                  ratings -= 1;
                  }
              if (stars=="") stars=0;
              parent.ustars = stars;
              parent.ratings = ratings +1;
              parent.stars = (rstars+stars)/parent.ratings;
              }
            */
            parent.innerHTML = getStarsVote(stars, stars, -1, 16);
            parent.className = 'starv votedrow';
        }
    }
}

function loadStars() {
    var url = window.location.href.toString();
    var onlyuser = starrate || url.indexOf('onlyuser=') > 0 || url.indexOf('starratechk=') > 0;
    var starsv = document.getElementsByClassName('starv');

    for (var i = 0; i < starsv.length; i++) {
        var starsvstr;
        if (typeof starsv[i].starsvstr == "undefined")
            starsvstr = starsv[i].starsvstr = starsv[i].innerHTML;
        else
            starsvstr = starsv[i].starsvstr;
        var str = starsvstr.split('*');
        if (str.length < 2) continue;
        var stars = parseFloat(str[0]);
        var id = getStarsId(starsv[i]);
        if (id != null) {
            var ratings = -1;
            var ustars = -1;
            ustars = parseFloat(str[1]);
            var strp = str[1].split("#");
            if (strp.length > 1)
                ratings = parseInt(strp[1]);

            if (onlyuser && ustars > 0) {
                stars = ustars;
                ratings = 0;
            }
            if (starrate) {
                // vote stars
                starsv[i].innerHTML = getStarsVote(stars, ustars, ratings, 16);
                if (ustars > 0)
                    starsv[i].className = 'starv votedrow';
            } else {
                // display star rates
                var starDisplay = getStarDisplay(id, stars, ratings, 16);
                starsv[i].innerHTML = starDisplay.innerHTML;
                starsv[i].title = starDisplay.title;
                if (ustars > 0)
                    starsv[i].className = 'starv votedsub';
            }
        } else {
            // sample stars
            starsv[i].innerHTML = getStars(stars, 0, 16);
        }
    }
}

function getStarDisplay(location, stars, numRatings, size) {
    if (!stars) stars = 0;
    if (!numRatings) numRatings = 0;
    if (!size) size = 16;

    var starDisplay = {};

    starDisplay.innerHTML = '<a href="' + SITE_BASE_URL + '/List_ratings?location=' + location + '">' + getStars(stars, numRatings, size) + '</a>';
    starDisplay.title = stars.toFixed(1) + '*' + (numRatings <= 0 ? '' : ' (' + numRatings + ' ratings)');

    return starDisplay;
}

/*
function starRate(counter)
{
      if (counter>100)
         if (!confirm('The list has over 100 canyons, refreshing the list will be slow.\nIt may be faster to rate smaller areas separately or use filters to display only canyons that have never been rated (check [x]Filters and Star Rate: [x]0).\n\nAre you sure you want to proceed?'))
            return;

      // enable options
      var id = 'displayschk';
      toggleOption(id, true);
      elems = document.getElementsByClassName(id.split('chk').join('on'));
      for (var i = 0; i < elems.length; i++)
            toggleFilter(elems[i].id+'chk', true);
      // refresh page
      filtersearch();
}
*/
