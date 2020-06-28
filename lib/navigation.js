// Between-page navigation

// TODO: Verify this description
// If we arrived at this page without any URL parameters but we do have a regnameval cookie and we're trying to view a
// Beta or Conditions page, reload the page appending the regnameval cookie value to the `region` URL parameter
function checkregname() {
    var url = window.location.href.toString().split('?');
    var regnameval = urldecode(getCookie("regnameval"));
    if (url.length < 2 && regnameval != "") {
        // reload page
        var urlp = url[0].split('/');
        var last = urlp[urlp.length - 1];
        if (last == 'Beta' || last == 'Conditions' || last == 'conditions.html')
            window.location.href = url + '?region=' + urlencode(regnameval);
    }
}
checkregname();
