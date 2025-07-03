/*

These functions dynamically import JavaScript files when certain elements are present in the DOM.

// Example usage:
// initSmartImports({
//     'inline_waterflow_chart': '/MediaWiki:InlineWaterflowChart.js?action=raw&ctype=text/javascript',
//     'some_other_element': '/MediaWiki:SomeOtherScript.js?action=raw&ctype=text/javascript


*/

function initSmartImports(importMap) {
    (function () {
        var loaded = {};
        var observer = new MutationObserver(function (mutations) {
            for (var elementId in importMap) {
                if (importMap.hasOwnProperty(elementId)) {
                    if (!loaded[elementId] && document.getElementById(elementId)) {
                        console.log('[smart_imports] Loading script for #' + elementId + ': ' + importMap[elementId]);
                        mw.loader.load(importMap[elementId]);
                        loaded[elementId] = true;
                    }
                }
            }
            // Disconnect if all scripts are loaded
            var allLoaded = true;
            for (var id in importMap) {
                if (importMap.hasOwnProperty(id) && !loaded[id]) {
                    allLoaded = false;
                    break;
                }
            }
            if (allLoaded) {
                console.log('[smart_imports] All scripts loaded, disconnecting observer.');
                observer.disconnect();
            }
        });
        console.log('[smart_imports] Starting MutationObserver for smart imports.');
        observer.observe(document.body, { childList: true, subtree: true });
    })();
}

