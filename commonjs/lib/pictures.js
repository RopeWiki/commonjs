
var piciconlist = [];
var picloadingmsg = "<img height=12 src='" + SITE_BASE_URL + "/extensions/SemanticForms/skins/loading.gif'/> Loading... ";
var piclist, picloading, picloadingerr, picloadingn;

function pictureinit() {
    piclist = document.getElementById('picture-list');
    var picrect = document.getElementById('picture-rect');
    if (!picrect || !piclist)
        return;

    picloading = document.createElement("div");
    piclist.parentNode.insertBefore(picloading, piclist);

    var picsort = document.createElement("div");
    picsort.innerHTML =
        '<br>Sort by:<br>' +
        '<input type="radio" id="sortdist" name="sortpics" value="Distance" onclick="updatePictureGrid();" checked>&nbsp;<label for="sortdist">Distance (from original location)</label><br>' +
        '<input type="radio" id="sortdate" name="sortpics" value="Date"onclick="updatePictureGrid();" >&nbsp;<label for="sortdate">Date (newest first)</label><br>' +
        '<br>';
    piclist.parentNode.insertBefore(picsort, piclist);

    piciconlist["Flickr.com"] = FLICKR_ICON;

    //this code is for when it called the Luca server:
    //var local = window.location.href.toString().indexOf('debug=local') >= 0; // || url.indexOf('http')<0;
    //var preurl = local ? SITE_BASE_URL + "/rwr?pictures=" : LUCA_BASE_URL + "/rwr?pictures=";
    //var url = preurl + picrect.innerHTML;

    var kmlrect = document.getElementById("kmlrect");
    var coords = kmlrect.innerHTML.split(',');

    clearLocationsUpdateTableCallback = updatePictureGrid;

    searchMapBoundsChangedCallback = function (_checkCountOnly, bounds) {

        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();

        var coords = [];
        coords.push(sw.lat().toFixed(3));
        coords.push(sw.lng().toFixed(3));
        coords.push(ne.lat().toFixed(3));
        coords.push(ne.lng().toFixed(3));
        
        runFlickrSearch(coords);
    }

    runFlickrSearch(coords);
}

var flickrPage = 0;

function runFlickrSearch(coords) {

    picloading.innerHTML = picloadingmsg;

    //Flickr
    //coords have to be lng/lat for Flicker instead of lat/lng, so reorder
    var bbox = coords[1] + "," + coords[0] + "," + coords[3] + "," + coords[2];
    
    var FLICKR_API_KEY = "4cf233b7707befcb3da28c6f23a8ccef";
    var urlFlickr = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&nojsoncallback=1&api_key=' + FLICKR_API_KEY + '&bbox=' + bbox + '&extras=geo,date_upload,date_taken,url_q,description,owner_name';
    urlFlickr += '&page=' + ++flickrPage;

    $.getJSON(urlFlickr, callbackFlickr).error(function (error) {
        picloading.innerHTML = '<div style="color:red">ERROR!</div>';
    });

    var latlng = document.getElementById("kmlmarker").innerHTML.split(',');
    var mainloc = { lat: parseFloat(latlng[0]), lng: parseFloat(latlng[1]) };

    function callbackFlickr(results) {
        if (results && results.stat === "ok") {
            var list = [];
            for (var i = 0; i < results.photos.photo.length; i++) {
                var photo = results.photos.photo[i];

                var linkUrl = 'https://www.flickr.com/photos/' + photo.owner + '/' + photo.id;

                var loc = { lat: parseFloat(photo.latitude), lng: parseFloat(photo.longitude) };
                var dist = Math.round(distance(loc, mainloc) * 10) / 10;

                var date = photo.datetakenunknown === "0"
                    ? photo.datetaken.substring(0, 10)
                    : new Date(Number(photo.dateupload) * 1000).toISOString().substring(0, 10); //this is in unix time
                
                var entry = {
                    id: linkUrl, //link to fullsize photo
                    loc: loc,
                    owner: photo.ownername,
                    thumb: photo.url_q, //thumb src
                    date: date,
                    title: photo.title,
                    dist: dist,
                    text: photo.description._content,
                    icon: piciconlist["Flickr.com"]
                };

                list.push(entry);
            }

            loadPictureList(list);

            var pages = results.photos.pages;
            if (flickrPage < pages) {
                runFlickrSearch(coords);
            } else flickrPage = 0;
        }
    }

    //below this line calls out to Luca server for retrieving photo urls:
    
    //$.getJSON(geturl(url),
    //    function(data) {
    //        //alert( "Load was performed." );
    //        //console.log("load performed");

    //        // load sites
    //        var list = data.list; //data.split('/cgi-progs/staMeta?station_id=');
    //        picloadingerr = 0;
    //        picloadingn = list.length;
    //        for (var t = 0; t < 3; ++t) {
    //            setTimeout(function() {
    //                    pictureget(list);
    //                },
    //                t * 500);
    //        }
    //        pictureget(list);
    //    }).error(function() {
    //    picloading.innerHTML = '<div style="color:red">ERROR!</div>';
    //});
}


function loadPictureList(list) {

    var poilist = [];

    var i;
    for (i = 0; i < list.length; ++i) {
        var entry = list[i];
        
        if (markerAlreadyExists(entry.id)) continue;

        var content = //Note: can't use the MultimediaViewer box here because images are inserted after page is loaded from Ropewiki
            '<div class="thumbinner" style="width:154px">' +
                '<a href="' + entry.id + '" target="_blank">' + '<img src="' + entry.thumb + '" class="nearestpics-thumb">' + '</a>' +
                '<div class="thumbcaption">' +
                    '<div>' + pinicon(entry.id, entry.icon) + ' <b>' + entry.title + '</b></div>' +
                    '<div>' + entry.text + '</div>' +
                    '<div><b>' + entry.date + ' ~' + entry.dist + 'mi</b></div>' +
                    '<div>' + entry.owner + '</div>' +
                '</div>' +
            '</div>';

        poilist.push({
            id: entry.id,
            location: entry.loc,
            zindex: 0 - i,
            icon:
            {
                url: entry.icon,
                scaledSize: new google.maps.Size(16, 16), // scaled size
                anchor: new google.maps.Point(8, 23) // anchor
            },
            thumbnail: entry.thumb,
            description: '',
            infodescription: '<b>' + entry.title + '</b><br>' + entry.text, //tooltip
            infocontent: content,

            //piclist specific
            owner: entry.owner,
            date: entry.date,
            dist: entry.dist,
            title: entry.title,
            text: entry.text
        });
    }

    if (map != null)
        loadlist(poilist);

    updatePictureGrid();
}

function updatePictureGrid() {

    picloading.innerHTML = markers.length + " pictures loaded";

    //clear all items
    piclist.innerHTML = '';

    //sort list
    if (document.getElementById('sortdist').checked) markers.sort(predicateBy("dist", 1));
    if (document.getElementById('sortdate').checked) markers.sort(predicateBy("date", -1));

    //draw new items
    for (var i = 0; i < markers.length; ++i) {
        var entry = markers[i].locationData;

        var node = document.createElement("LI");
        node.className = "gallerybox nearestpics";
        
        node.innerHTML = entry.infocontent;

        piclist.appendChild(node);
    }
}

//this function is only used for calling Luca server adn getting pictures
//function pictureget(linklist) {
//    if (linklist.length === 0)
//        return;

//    var url = geturl(linklist.shift());
//    console.log("getpic " + url);

//    $.getJSON(url,
//            function (data) {
//                var list = data.list; //data.split('/cgi-progs/staMeta?station_id=');
//                loadPictureList(list);
//            })
//        .error(function () {
//            ++picloadingerr;
//            console.log("picerror " + url);
//        })
//        .always(function () {
//            var msg = "";
//            if (linklist.length > 0)
//                msg += picloadingmsg + Math.round((picloadingn - linklist.length) * 100.0 / picloadingn) + '%';
//            if (picloadingerr > 0)
//                msg += ' <span style="color:red">' + picloadingerr + ' ERRORS!</span>';
//            picloading.innerHTML = msg;
//            pictureget(linklist);
//        });
//}


//Google Maps photos is disabled because it costs too much 
//(3.2c per geo - location request plus another 0.7c to get the url for each returned photo)
//to re-enable, the following parameter would need to be added to where the map script is loaded on map_init.js:
// '&libraries=places'

////Google Places code:
//var request = {
//    location: new google.maps.LatLng(coords[0], coords[1]),
//    radius: '3000',
//    //type: ['restaurant']
//};

//var service = new google.maps.places.PlacesService(map);
////service.nearbySearch(request, callbackGP);

//const ignoreTypes = [
//    'restaurant',
//    'food',
//    'lodging',
//    'church',
//    'store',
//    'bar',
//    'political',
//    'school',
//    'health',
//    'moving_company',
//];

//function callbackGP(results, status) {
//    if (status === google.maps.places.PlacesServiceStatus.OK) {
//        var list = [];
//        for (var i = 0; i < results.length; i++) {
//            var result = results[i];
//            if (!result.photos ||
//                result.types.some(function (r) { return ignoreTypes.includes(r); })) continue;
//            for (var j = 0; j < result.photos.length; j++) {
//                var photo = result.photos[j];

//                var entry = [];
//                entry.push(result.name); //0 a href 
//                entry.push(capitalizeFirstLetter(result.types[0].replaceAll('_', ' '))); //1 second subname (location?)
//                entry.push(result.geometry.location.lat()); //2 lat
//                entry.push(result.geometry.location.lng()); //3 lng
//                entry.push(photo.getUrl()); //4 img src
//                entry.push(''); //5 date (not available)
//                entry.push(result.name); //6 name (again?)
//                entry.push(result.icon); //7 -not used-
//                entry.push(result.vicinity); //8 subname (location?)
//                entry.push("Panoramio.com"); //9 piciconlist

//                list.push(entry.join(','));
//            }
//        }

//        loadPictureList(list);
//    }
//}