
function isMobileDevice() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return isIOS() ||
        toMatch.some(function (toMatchItem) {
        return navigator.userAgent.match(toMatchItem);
    });
}

function isIOS() {
    const toMatch = [
        /iPhone/i,
        /iPad/i,
        /iPod/i
    ];

    return toMatch.some(function(toMatchItem) {
        return navigator.userAgent.match(toMatchItem);
    });
}
