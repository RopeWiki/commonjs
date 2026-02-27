const { test, expect } = require('@playwright/test');
require('dotenv').config();

const SITE_URL = process.env.MEDIAWIKI_SITE_URL;
const USERNAME = process.env.MEDIAWIKI_USERNAME;
const PASSWORD = process.env.MEDIAWIKI_PASSWORD;

if (!SITE_URL || !USERNAME || !PASSWORD) {
  console.error('ERROR: Required environment variables not set:');
  console.error('  - MEDIAWIKI_SITE_URL');
  console.error('  - MEDIAWIKI_USERNAME');
  console.error('  - MEDIAWIKI_PASSWORD');
  process.exit(1);
}

const TEST_PAGES = [
  'Lower_Fulton_Creek'
];

const TEST_URLS = TEST_PAGES.map(page => `${SITE_URL}/${page}`);

test.describe('KML Track Loading', () => {

  test('KML tracks should load on Leaflet map when logged in', async ({ page }) => {
    test.setTimeout(120000);
    // Login first
    console.log(`\n=== Logging in as ${USERNAME} ===`);
    await page.goto(`${SITE_URL}/index.php?title=Special:UserLogin`);

    await page.fill('#wpName1', USERNAME);
    await page.fill('#wpPassword1', PASSWORD);
    await page.click('#wpLoginAttempt');

    // Wait for login to complete
    await page.waitForLoadState('networkidle');

    for (const url of TEST_URLS) {
      console.log(`\n=== Testing ${url} ===`);

      await page.goto(url, { waitUntil: 'networkidle' });

      // Wait a bit for the map to initialize
      await page.waitForTimeout(1000);

      // Check if map element exists
      const mapBox = await page.$('#mapbox');
      if (!mapBox) {
        console.log('  ℹ️  No map found on this page (element #mapbox not present)');
        continue;
      }
      console.log('  ✓ Map element (#mapbox) found');

      // Check if kmlfilep element exists
      const kmlFileP = await page.$('#kmlfilep');
      if (!kmlFileP) {
        console.log('  ℹ️  No KML file element (#kmlfilep) found on this page');
        continue;
      }

      const kmlUrl = await kmlFileP.textContent();
      console.log(`  ✓ KML file element found with URL: ${kmlUrl}`);

      // Wait for Leaflet to be loaded
      const leafletLoaded = await page.evaluate(() => {
        return typeof L !== 'undefined' && typeof L.KML !== 'undefined';
      });

      if (!leafletLoaded) {
        console.log('  ❌ Leaflet or L.KML not loaded');
        expect(leafletLoaded).toBe(true);
        continue;
      }
      console.log('  ✓ Leaflet and L.KML loaded');

      // Wait for KML tracks to be added to the map
      await page.waitForTimeout(3000); // Give time for KML to load

      const trackInfo = await page.evaluate(() => {
        if (typeof map === 'undefined') {
          return { mapExists: false };
        }

        let layerCount = 0;
        let hasKMLLayer = false;
        const polylines = [];
        const markers = [];

        // Recursively inspect KML sublayers
        function inspectLayers(layers) {
          if (!layers) return;

          Object.keys(layers).forEach(function(key) {
            const sublayer = layers[key];

            if (sublayer instanceof L.Polyline && !(sublayer instanceof L.Polygon)) {
              polylines.push({
                name: sublayer.options.name,
                color: sublayer.options.color,
                pointCount: sublayer.getLatLngs().length
              });
            } else if (sublayer instanceof L.Marker) {
              markers.push({
                name: sublayer.options.name,
                latLng: sublayer.getLatLng()
              });
            }

            if (sublayer._layers) {
              inspectLayers(sublayer._layers);
            }
          });
        }

        map.eachLayer(function(layer) {
          layerCount++;
          if (layer instanceof L.KML) {
            hasKMLLayer = true;
            inspectLayers(layer._layers);
          }
        });

        return {
          mapExists: true,
          layerCount: layerCount,
          hasKMLLayer: hasKMLLayer,
          polylines: polylines,
          markers: markers,
          legendContent: document.getElementById('legend-contents')?.innerHTML || ''
        };
      });

      console.log(`  Map exists: ${trackInfo.mapExists}`);
      console.log(`  Total layers: ${trackInfo.layerCount}`);
      console.log(`  Has KML layer: ${trackInfo.hasKMLLayer}`);

      if (trackInfo.mapExists) {
        expect(trackInfo.layerCount).toBeGreaterThan(0);
        expect(trackInfo.hasKMLLayer).toBe(true);
        console.log('  ✓ KML layer found on map');

        // Verify specific tracks for Lower Fulton Creek
        console.log(`\n  Found ${trackInfo.polylines.length} polylines:`);
        trackInfo.polylines.forEach(p => {
          console.log(`    - ${p.name} (${p.color}, ${p.pointCount} points)`);
        });

        console.log(`\n  Found ${trackInfo.markers.length} markers:`);
        trackInfo.markers.forEach(m => {
          console.log(`    - ${m.name}`);
        });

        // Verify expected tracks exist
        const expectedTracks = [
          { name: 'Lower Fulton Descent', color: '#FF0000' },
          { name: 'Lower Fulton Approach', color: '#00CD00' },
          { name: 'Fulton Approach', color: '#00CD00' },
          { name: 'Fulton Descent', color: '#FF0000' },
          { name: 'Fulton Exit', color: '#A200FF' },
          { name: 'Shortcut', color: '#00CD00' },
          { name: 'Middle Fulton', color: '#0000FF' },
          { name: 'Private Property Line', color: '#F0F000' },
          { name: 'Royal Exit', color: '#A200FF' }
        ];

        const expectedMarkers = [
          'Upper Fulton Parking',
          'End Pavement - do NOT park here',
          'Power Line Parking Area',
          'Lower Fulton Parking'
        ];

        // Verify we have exactly the expected number of tracks and markers
        expect(trackInfo.polylines.length).toBe(expectedTracks.length);
        expect(trackInfo.markers.length).toBe(expectedMarkers.length);
        console.log(`  ✓ Track count matches: ${expectedTracks.length}`);
        console.log(`  ✓ Marker count matches: ${expectedMarkers.length}`);

        expectedTracks.forEach(expected => {
          const found = trackInfo.polylines.find(p => p.name === expected.name && p.color === expected.color);
          expect(found).toBeDefined();
          console.log(`  ✓ Found expected track: ${expected.name}`);
        });

        expectedMarkers.forEach(expected => {
          const found = trackInfo.markers.find(m => m.name === expected);
          expect(found).toBeDefined();
          console.log(`  ✓ Found expected marker: ${expected}`);
        });

        // Check for any unexpected tracks
        trackInfo.polylines.forEach(actual => {
          const expected = expectedTracks.find(e => e.name === actual.name && e.color === actual.color);
          if (!expected) {
            console.log(`  ❌ UNEXPECTED TRACK: ${actual.name} (${actual.color})`);
          }
          expect(expected).toBeDefined();
        });

        // Check for any unexpected markers
        trackInfo.markers.forEach(actual => {
          const expected = expectedMarkers.find(e => e === actual.name);
          if (!expected) {
            console.log(`  ❌ UNEXPECTED MARKER: ${actual.name}`);
          }
          expect(expected).toBeDefined();
        });

        // Verify legend was populated
        expect(trackInfo.legendContent).toContain('Lower Fulton Descent');
        expect(trackInfo.legendContent).toContain('km');
        console.log('  ✓ Legend populated with track names and distances');

      } else {
        console.log('  ❌ Map variable not found');
        expect(trackInfo.mapExists).toBe(true);
      }
    }
  });

});
