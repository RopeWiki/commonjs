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

jQuery(document).ready(function () {

    if (isIOS())
        $(window).scrollTop(0); //iOS doesn't start at the top after sizing from '@media only screen' query in the .css

    // loadSkin();  // custom skins - ever used?
    initializeLeafletMap();
    loadUserInterface(document);  // pdf links, reference photos, credits
    loadFormInterface();  // user options (metric etc)

    // translation stuff
    loadTranslation();
    setInterval(function () { loadTranslation(); }, 2000);
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);

});
