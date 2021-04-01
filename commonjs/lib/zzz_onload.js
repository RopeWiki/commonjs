// Run these actions upon load (after all the functions have been defined)

// required for CSS for small screens
$('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0">');

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
};
