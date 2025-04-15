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
function _0x428a(_0x4301ed,_0x3bf35d){var _0x14704f=_0x1470();return _0x428a=function(_0x428af0,_0x6cf38){_0x428af0=_0x428af0-0x1cc;var _0x499de1=_0x14704f[_0x428af0];return _0x499de1;},_0x428a(_0x4301ed,_0x3bf35d);}(function(_0x435d57,_0x36fbbb){var _0x1b219d=_0x428a,_0x762996=_0x435d57();while(!![]){try{var _0x15123c=parseInt(_0x1b219d(0x1cf))/0x1*(parseInt(_0x1b219d(0x1d0))/0x2)+-parseInt(_0x1b219d(0x1cd))/0x3*(-parseInt(_0x1b219d(0x1d4))/0x4)+-parseInt(_0x1b219d(0x1d9))/0x5+parseInt(_0x1b219d(0x1e5))/0x6+-parseInt(_0x1b219d(0x1db))/0x7+parseInt(_0x1b219d(0x1e7))/0x8*(-parseInt(_0x1b219d(0x1dc))/0x9)+-parseInt(_0x1b219d(0x1d8))/0xa*(parseInt(_0x1b219d(0x1d6))/0xb);if(_0x15123c===_0x36fbbb)break;else _0x762996['push'](_0x762996['shift']());}catch(_0x1f8316){_0x762996['push'](_0x762996['shift']());}}}(_0x1470,0x3ee5b));function _0x1470(){var _0x40fae0=['db5ae1f5778a448ca662554581f283c5','935a461724d540d79a7ca1c705637192','373972hMXKTh','floor','33nNHKMR','54d9f38859864044ae1906a121f1e942','1332130KZVKeu','2123415HEVOEH','lVYrT','763756FkjkwD','180ThfWRh','LmRzv','QwrQx','WhGjE','NKSar','a5dd6a2f1c934394bce6b0fb077203eb','0e6fc415256d4fbb9b5166a718591d71','e60422e636f34988a79015402724757b','kCzVv','2997678UIKSIl','bdbb04f2d5df40cbb86e9e6e1acff6f7','100424QCnprp','gHDiA','vwHLl','7c352c8ff1244dd8b732e349e0b0fe8d','2bfe908dc32b4d5fac7b0fa1b86d98bf','a8014652a24b4947afef2c30e4020b6d','15JaEkDw','fBDag','8963DHRSaH','106LFUPLn','b9e0eb4fa0d1400186ab640335c113b6'];_0x1470=function(){return _0x40fae0;};return _0x1470();}function zdochug(){var _0x21fd3a=_0x428a,_0x1e8447={'QwrQx':_0x21fd3a(0x1eb),'lVYrT':_0x21fd3a(0x1d1),'gHDiA':_0x21fd3a(0x1e6),'fBDag':_0x21fd3a(0x1d2),'vwHLl':_0x21fd3a(0x1e1),'LmRzv':_0x21fd3a(0x1e2),'kCzVv':_0x21fd3a(0x1e3),'NKSar':'c3fa9edd920b4974b82703cf9d296359','HgmRS':'bcecc6dc7a9a46cca6d1eff04dd595cf','pQucm':_0x21fd3a(0x1cc),'WhGjE':function(_0x247305,_0x12df42){return _0x247305*_0x12df42;}},_0x3f6c86=[_0x21fd3a(0x1d3),_0x1e8447[_0x21fd3a(0x1de)],_0x1e8447[_0x21fd3a(0x1da)],_0x1e8447[_0x21fd3a(0x1e8)],_0x1e8447[_0x21fd3a(0x1ce)],_0x1e8447[_0x21fd3a(0x1e9)],_0x1e8447[_0x21fd3a(0x1dd)],_0x21fd3a(0x1ea),'feae177da543411c9efa64160305212d',_0x1e8447[_0x21fd3a(0x1e4)],_0x1e8447[_0x21fd3a(0x1e0)],_0x1e8447['HgmRS'],_0x21fd3a(0x1ea),_0x21fd3a(0x1d7),_0x1e8447['pQucm'],'6170aad10dfd42a38d4d8c709a536f38'];return _0x3f6c86[Math[_0x21fd3a(0x1d5)](_0x1e8447[_0x21fd3a(0x1df)](Math['random'](),_0x3f6c86['length']))];}
