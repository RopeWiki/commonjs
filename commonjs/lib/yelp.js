var mapTilesLoaded = true;

function updateYelpLocations() {
    if (!mapTilesLoaded) return;

    //calculate map center and radius
    var centerLat = map.getBounds().getCenter().lat().toFixed(4);
    var centerLng = map.getBounds().getCenter().lng().toFixed(4);

    var ne = map.getBounds().getNorthEast();
    var radius = (distance({ lat: ne.lat(), lng: ne.lng() }, { lat: centerLat, lng: centerLng }) / km2mi * 1000).toFixed(0);

    console.log(centerLat, ", ", centerLng, ", radius: ", radius);

    var yelpConnectUrl = LUCA_BASE_URL + '/yelp/api/search';

    $.getJSON(yelpConnectUrl + '?latitude=' + centerLat + '&longitude=' + centerLng + '&radius=' + radius,
        getyelplist
    );
}

function updateYelpPending() {
    mapTilesLoaded = true;
}

function getyelplist(data) {
    if (!data || !data.businesses) return;

    var list = [];
    
    $.each(data.businesses,
        function (i, item) {
            var url = item.url;
            var param = url.indexOf('?');
            if (param > 0) url = url.substring(0, param);

            var foodtype = item.categories[0].title;

            var description = item.rating + '&#9733; ' + item.review_count + ' reviews, ' + foodtype;

            var obj = {
                id: url,
                nameWithoutRegion: item.name,
                region: foodtype,
                noregionlink: true,
                thumbnail: item.image_url,
                rating: item.rating,
                description: description,
                infodescription: '<b class="nostranslate">' + item.name + '</b><br>' + description,
                location: {
                    lat: item.coordinates.latitude,
                    lng: item.coordinates.longitude
                },
                totalRating: item.rating,
                icon: SITE_BASE_URL + "/images/d/dd/Yelplogo.png"
            };
            
            list.push(obj);
        });

    loadlist(list);

    if (list.length > 0)
        mapTilesLoaded = false;
}

var yelpAlreadyShown = false;

function showYelpInfoPopup() {

    if (yelpAlreadyShown) return;

    yelpAlreadyShown = true;

    var name = 'modal-yelpInfoPopup';

    var modalHtml =
        '<p><font size="+2"><b>Ropewiki is now partnered with Yelp!</b> <img src="/images/d/dd/Yelplogo.png" alt="yelp logo"></font></p>' +
        '<hr>' +
        '<p>You will now see the top-rated Yelp restaurants on the Region pages. Find a coffee shop to meet before a canyon, or a great place to grab some food afterward!';
    if (!isMobileDevice()) modalHtml +=
        '<p>Moving or zooming the map will load a new group. You can even route to the locations and sort them in the table.' +
        '<p>Coming soon: Ability to filter restaurants based on food type (pizza, mexican, coffee shop, etc).';

    modalHtml +=
        '<p>For more information, see the <b><a rel="nofollow" class="external text" href="http://www.facebook.com/groups/ropewiki">Ropewiki Facebook group</a></b>.' +
        '<br>' +
        '<input type="button" value="Awesome!" onclick="closeYelpInfoPopup()" class="map-control dropdown selection">';

    createModal(name, modalHtml);
    openModal(name);
}

function closeYelpInfoPopup() {
    var modal = document.getElementById('modal-yelpInfoPopup');
    modal.style.display = "none";
}