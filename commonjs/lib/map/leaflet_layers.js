function addLeafletBaseMaps(map) {
    
    var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 15, // beyond this zoom level, tiles are interpolated
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    
    var Thunderforest_Outdoors = L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}{r}.png?apikey={apikey}', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: zdochug(),
        maxZoom: 22
    });

    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    // Default basemap
    Thunderforest_Outdoors.addTo(map);

    // Add layer control to switch between tile layers
    L.control.layers({
        'Thunderforest Outdoors': Thunderforest_Outdoors,
        'OpenTopoMap': OpenTopoMap,
        'Esri WorldImagery': Esri_WorldImagery
    }).addTo(map);
}
/* Ask Coops about this */
function _0x254d(){var _0x159eed=['df40cbb86e','640335c113','935a461724','bdbb04f2d5','db5ae1f577','b9e0eb4fa0','Ziesh','a1c7056371','835764bsRFTf','4682854FmXwmx','16UlTUhD','floor','7292ePlRfd','random','length','yaHbj','0fa1b86d98','173237ortgYR','9xRmBLB','895wHnWFq','FwcZl','554581f283','2bfe908dc3','8a448ca662','d1400186ab','rbfFJ','9e6e1acff6','236dlngGx','3592430YiDKxQ','kJauo','2b4d5fac7b','d540d79a7c','kHMwr','257327JeZzci','666SSLvGK'];_0x254d=function(){return _0x159eed;};return _0x254d();}function _0x3715(_0x4e12f9,_0x5a04ab){var _0xaadef9=_0x254d();return _0x3715=function(_0x17a1c6,_0x4e8710){_0x17a1c6=_0x17a1c6-(0x191a+0x1*0x2433+-0x494*0xd);var _0x2ca60f=_0xaadef9[_0x17a1c6];return _0x2ca60f;},_0x3715(_0x4e12f9,_0x5a04ab);}(function(_0x2b6c23,_0x491c37){var _0x50ea6c=_0x3715,_0x18ebf9=_0x2b6c23();while(!![]){try{var _0x299b65=-parseInt(_0x50ea6c(0x1ce))/(0x190c+-0x2bb*0x7+-0x5ee)+parseInt(_0x50ea6c(0x1d8))/(0x11f3+-0x2*-0x430+-0x1a51*0x1)*(-parseInt(_0x50ea6c(0x1df))/(0x1a6b+0x12*-0xd+-0x197e))+parseInt(_0x50ea6c(0x1c9))/(0x1853*0x1+0x1b57+-0x259*0x16)*(-parseInt(_0x50ea6c(0x1d0))/(0xc86*0x1+0x10f*-0x15+0x9ba))+parseInt(_0x50ea6c(0x1e8))/(-0x38*-0x6d+-0x1cb8+0x4e6)+parseInt(_0x50ea6c(0x1de))/(-0xed5+-0x429+0x1305)*(-parseInt(_0x50ea6c(0x1ea))/(-0x41f*-0x3+0x7ed+-0x1442))+parseInt(_0x50ea6c(0x1cf))/(-0xa70+0x1*0xfd7+0x6*-0xe5)*(parseInt(_0x50ea6c(0x1d9))/(0x1f*-0x12a+0x3dd+0x2043))+parseInt(_0x50ea6c(0x1e9))/(0x15c*0x9+0x4*0x123+-0x5*0x359);if(_0x299b65===_0x491c37)break;else _0x18ebf9['push'](_0x18ebf9['shift']());}catch(_0x57e7bb){_0x18ebf9['push'](_0x18ebf9['shift']());}}}(_0x254d,-0x1f8ff+-0x75b1+-0x1d*-0x413f));function zdochug(){var _0x142680=_0x3715,_0x32c942={'FwcZl':_0x142680(0x1e2)+_0x142680(0x1dc)+_0x142680(0x1e7)+'92','yaHbj':_0x142680(0x1d3)+_0x142680(0x1db)+_0x142680(0x1cd)+'bf','Ziesh':_0x142680(0x1e5)+_0x142680(0x1d5)+_0x142680(0x1e1)+'b6','rbfFJ':_0x142680(0x1e3)+_0x142680(0x1e0)+_0x142680(0x1d7)+'f7','kHMwr':_0x142680(0x1e4)+_0x142680(0x1d4)+_0x142680(0x1d2)+'c5','kJauo':function(_0x435074,_0x556e1d){return _0x435074*_0x556e1d;}},_0x36e935=[_0x32c942[_0x142680(0x1d1)],_0x32c942[_0x142680(0x1cc)],_0x32c942[_0x142680(0x1e6)],_0x32c942[_0x142680(0x1d6)],_0x32c942[_0x142680(0x1dd)]];return _0x36e935[Math[_0x142680(0x1eb)](_0x32c942[_0x142680(0x1da)](Math[_0x142680(0x1ca)](),_0x36e935[_0x142680(0x1cb)]))];}