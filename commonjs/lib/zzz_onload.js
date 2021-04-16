// Run these actions upon load (after all the functions have been defined)

// required for CSS for small screens
$('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
$('head').append('<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">'); //for current location icon

initializeCookies();
initializeGlobalVariables();
addPopOutLinkSupport();
addUACAStyle();

//first heading text
setHeadingText();

loadSkin();

adjustFaviconElements();

//addHashChangeListener();
initBasicEditor();
initToolbarCustomization();


window.onload = function() {
    loadmapScript();

    if (iOS())
        $(window).scrollTop(0); //iOS doesn't start at the top after sizing from '@media only screen' query in the .css
};
