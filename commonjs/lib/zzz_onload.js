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

/* The upgrade to MW 1.27.1 brings with it a new version of jQuery.
   It takes control of the load & DOMContentLoaded events, which cause
   unpredictable behavior in various browsers when we try to override/append
   to it. So the logic below is no longer gated by the window.onload event.
   I haven't found an issue with this yet.
*/

if (isIOS())
    $(window).scrollTop(0); //iOS doesn't start at the top after sizing from '@media only screen' query in the .css

// loadSkin();  // custom skins - ever used?
loadMapInterface();
loadUserInterface(document);  // pdf links, reference photos, credits
loadFormInterface();  // user options (metric etc)

// translation stuff
loadTranslation();
setInterval(function () { loadTranslation(); }, 2000);
var script = document.createElement("script");
script.type = "text/javascript";
script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
document.body.appendChild(script);
