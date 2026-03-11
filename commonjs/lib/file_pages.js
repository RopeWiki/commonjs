// File page-specific functionality

function initializeFilePageFeatures() {
    // Check if we're on a File: namespace page (namespace 6)
    if (mw.config.get('wgNamespaceNumber') !== 6) {
        return; // Early exit if not a File: page
    }

    // Get the page name (e.g., "File:Something.kml")
    var pageName = mw.config.get('wgPageName');

    // Check if this is a KML file
    if (!pageName || !pageName.toLowerCase().endsWith('.kml')) {
        return; // Only process .kml files
    }

    // Insert a mapbox div and kmlfilep div on the page
    addKMLMapToFilePage(pageName);
}

function addKMLMapToFilePage(pageName) {
    // Find a good location to insert the map
    var fileInfoBox = document.querySelector('.mw-filepage-resolutioninfo');
    var fileHistoryHeading = document.getElementById('filehistory');

    // Get the file URL - extract filename from page name
    var fileName = pageName.replace('File:', '').replace(/_/g, ' ');

    // Try to get the actual file URL from the page's full image link
    var fileUrl = null;
    var fullImageLink = document.querySelector('.fullImageLink a, .fullMedia a');
    if (fullImageLink && fullImageLink.href) {
        fileUrl = fullImageLink.href;
    } else {
        // Fallback: construct URL using Special:FilePath
        fileUrl = SITE_BASE_URL + '/wiki/Special:FilePath/' + encodeURIComponent(fileName);
    }

    // Create the kmlfilep div (hidden, used by map initialization)
    var kmlFileDiv = document.createElement('div');
    kmlFileDiv.id = 'kmlfilep';
    kmlFileDiv.style.display = 'none';
    kmlFileDiv.innerHTML = fileUrl;

    // Create the mapbox container
    var mapContainer = document.createElement('div');
    mapContainer.id = 'mapbox';
    mapContainer.style.width = '100%';
    mapContainer.style.maxWidth = '800px';
    mapContainer.style.height = '300px';
    mapContainer.style.marginTop = '20px';
    mapContainer.style.marginBottom = '20px';
    mapContainer.style.border = '1px solid #ccc';

    // Create a heading for the map section
    var mapHeading = document.createElement('h2');
    mapHeading.textContent = 'Track Preview';
    mapHeading.style.marginTop = '30px';

    // Insert the divs after file info or at a sensible location
    if (fileInfoBox) {
        // Insert after the file info box
        var parent = fileInfoBox.parentElement;
        parent.insertBefore(kmlFileDiv, fileInfoBox.nextSibling);
        parent.insertBefore(mapHeading, kmlFileDiv.nextSibling);
        parent.insertBefore(mapContainer, mapHeading.nextSibling);
    } else if (fileHistoryHeading) {
        // Insert before file history
        var parent = fileHistoryHeading.parentElement;
        parent.insertBefore(kmlFileDiv, fileHistoryHeading);
        parent.insertBefore(mapHeading, fileHistoryHeading);
        parent.insertBefore(mapContainer, fileHistoryHeading);
    } else {
        // Fallback: append to main content area
        var content = document.getElementById('mw-content-text');
        if (content) {
            content.appendChild(kmlFileDiv);
            content.appendChild(mapHeading);
            content.appendChild(mapContainer);
        }
    }

    console.log('KML map preview added to File: page with URL:', fileUrl);
}
