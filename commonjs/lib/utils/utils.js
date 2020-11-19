/**
 * Adjust the hostname of a URL if applicable.
 *
 * Before picking a final URL from which to request a resource, see if a different server should be selected.  This is
 * needed because requesting a resource from a site with a particular name (e.g., www.ropewiki.com) while viewing a page
 * from a site with a different name (e.g., ropewiki.com) will be considered a Cross-Origin Resource request and may be
 * denied even if the two names are actually just aliases for the same site.  This could also be addressed by
 * configuring the server to allow cross-origin requests from all known aliases of the same site.
 *
 * @param {string} url: URL of desired resource.
 *
 * @return {string} Adjusted URL for desired resource.
 */

function geturl(url) {
    // patch CORS for alternate site names
    var local = window.location.href.toString();
    if (url.substr(0, SITE_BASE_URL.length) === SITE_BASE_URL) {
        // The url is pointing to the base site; let's see if we're viewing a page through an alternate site name.
        var checkAlternateName = function(alternateName) {
            if (local.substr(0, alternateName.length) === alternateName) {
                return alternateName + url.substr(SITE_BASE_URL.length);
            }
        }
        SITE_ALTERNATE_NAMES.forEach(checkAlternateName);
    }
    return url;
}

function getdomain(link) {
    var base = link.split('http');
    if (link.length <= 0)
        return link;
    var domain = base[base.length - 1].split('/');
    if (domain.length <= 2)
        return link;
    return domain[2];
}

function aref(url, label, title, attribs) {
    if (typeof title == "undefined")
        title = "";
    if (typeof attribs == "undefined")
        attribs = "";
    return '<A href="' + url + '" title="' + title + '" ' + attribs + '>' + label + '</A>';
}

function popupwin(url, width, height) {
    if (typeof width == "undefined")
        width = 600;
    if (typeof height == "undefined")
        height = 500;
    if (url.substr(0, 4) == 'java')
        return url;
    if (url.indexOf('ropewiki') >= 0)
        url += (url.indexOf('?') >= 0 ? '&' : '?') + 'action=render';
    return 'javascript:popupwindow(\'' + url + '\',' + width + ',' + height + ');';
}

function popupwindow(url, width, height) {
    window.open(url,
        '_blank',
        'width=' + width + ',height=' + height + ',scrollbars=yes,menubar=yes,resizable=yes,toolbar=yes');
    /*
      function wloaded()
      {
        alert("onload");
      }

      var u = window.open( 'http://cdec.water.ca.gov:80/histPlot/chartviewer', '_blank', 'width='+width+',height='+height+',scrollbars=yes,menubar=yes,resizable=yes,toolbar=yes');
      var w = window.open( '', '_blank', 'width='+width+',height='+height+',scrollbars=yes,menubar=yes,resizable=yes,toolbar=yes');
      console.log("win:"+w);
      w.onload = wloaded;

      var div = document.getElementById("popupwindow");
      if (div) div.innerHTML = '<iframe src="'+'http://cdec.water.ca.gov:80/histPlot/chartviewer'+'" width="100%" height="100%"></iframe>';
      //w.document.write('<html><body><iframe src="'+url+'" width="100%" height="100%"></iframe></body></html>');
      $( w ).load(function() {
          alert("load");
          //w.location.reload();
      });

      w.location.replace( url );
      w.location.reload(true);
    */
}

function findtag(children, tag, f) {
    function findlist(children, tag) {
        var list = [];
        for (var i = 0; i < children.length; ++i) {
            var item = children[i];
            if (item.nodeName == tag)
                list.push(item);
            else
                list = list.concat(findlist(item.childNodes, tag));
        }
        return list;
    }

    var list = findlist(children, tag);
    for (var i = 0; i < list.length; ++i)
        f(list[i]);
}

function deftext(str) {
    return str == null || str == '' || str[0] == '&' || str[0] == ' ' || str.charCodeAt(0) == 160;
}