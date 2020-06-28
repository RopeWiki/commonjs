function inputkey(event, submitfunc) {
    if (event.which == 13)
        submitfunc();
    //console.log("key:"+event.which+":");
}

function inputfocus(elem) {
    elem.style.color = 'black';
    //console.log(":"+elem.value[0]+":"+elem.value.charCodeAt(0));
    if (deftext(elem.value)) {
        elem.value = '';
        //console.log("reset:"+elem.value+":");
    }
}

function nearbyselect(elem) {
    var a = elem.parentNode.getElementsByTagName('A')[0];
    var href = a.href;
    var e = href.indexOf(locdist);
    var url = href.substring(0, e) + locdist + elem.value;
    document.body.style.cursor = 'wait';
    window.location.href = url;
}

function setfield(id) {
    var list = $('#setfieldtarget input');
    if (list.length > 0 && id)
        list[0].value = id.innerHTML;

}
