//google maps custom control to show or hide tracks shown on region pages

function initShowTracksControl() {
    return '<label id="showKmlCheckbox" class="controls show-kml-checkbox"><input class="gmnoprint" id="routeschk" type="checkbox" onclick="toggleRoutes()">Show&nbsp;track&nbsp;data</label>';
}