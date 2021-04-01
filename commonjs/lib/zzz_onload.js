// Run these actions upon load (after all the functions have been defined)

initializeCookies();
initializeGlobalVariables();
addPopOutLinkSupport();
addUACAStyle();

// required for CSS for small screens
$('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0">');

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
