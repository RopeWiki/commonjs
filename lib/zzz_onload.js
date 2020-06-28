// Run these actions upon load (after all the functions have been defined)

initializeCookies();
initializeGlobalVariables();
addPopOutLinkSupport();
addUACAStyle();
checkregname();

// required for CSS for small screens
//$('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=0.6,">');
// fix for firefox bug and a autozoomin chrome bug on android as well as improved readibility in iphone
//console.log("started");
$('head').prepend('<meta name="viewport" content="width=320, initial-scale=1.0">');

loadSkin();

adjustFaviconElements();

addHashChangeListener();
initBasicEditor();
initToolbarCustomization();

//console.log("A");
window.onload = function() {
    loadmapScript();
};
