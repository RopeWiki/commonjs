const { test, expect } = require('@playwright/test');
require('dotenv').config();

test.describe('Marker Icons', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${process.env.MEDIAWIKI_SITE_URL}/index.php?title=Special:UserLogin`);
    await page.fill('input[name="wpName"]', process.env.MEDIAWIKI_USERNAME);
    await page.fill('input[name="wpPassword"]', process.env.MEDIAWIKI_PASSWORD);
    await page.click('button[name="wploginattempt"]');
    await page.waitForLoadState('networkidle');

    // Navigate to test page
    await page.goto(`${process.env.MEDIAWIKI_SITE_URL}/Lower_Fulton_Creek`);
    await page.waitForLoadState('networkidle');

    // Wait for map to load
    await page.waitForSelector('#mapbox', { timeout: 10000 });
    await page.waitForTimeout(2000); // Give map time to fully initialize
  });

  test('existing markers from KML should use diamond icon', async ({ page }) => {
    // Get marker icon information
    const markerInfo = await page.evaluate(() => {
      if (typeof map === 'undefined' || typeof editableGroup === 'undefined') {
        return { error: 'Map or editableGroup not found' };
      }

      const markers = [];
      editableGroup.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
          const icon = layer.options.icon;
          markers.push({
            name: layer.options._kmlName || layer.options.name,
            iconUrl: icon && icon.options ? icon.options.iconUrl : 'default',
            iconSize: icon && icon.options ? icon.options.iconSize : null
          });
        }
      });

      return { markers };
    });

    console.log('Existing markers:', markerInfo.markers);

    // Verify we have markers
    expect(markerInfo.markers.length).toBeGreaterThan(0);

    // Check each marker has diamond icon
    markerInfo.markers.forEach(marker => {
      console.log(`Checking marker: ${marker.name}`);
      console.log(`  Icon URL: ${marker.iconUrl}`);
      console.log(`  Icon size: ${marker.iconSize}`);

      // Should use diamond icon, not default leaflet marker
      expect(marker.iconUrl).toContain('open-diamond.png');
      expect(marker.iconUrl).not.toContain('marker-icon.png');

      // Check icon size
      expect(marker.iconSize).toEqual([20, 20]);
    });
  });

  test('newly created markers should use diamond icon', async ({ page }) => {
    // Enter edit mode
    const editButton = await page.locator('#map-edit-controls');
    await editButton.click();
    await page.waitForTimeout(500);

    // Get the marker draw button
    const markerDrawButton = await page.locator('.leaflet-draw-draw-marker');
    await expect(markerDrawButton).toBeVisible();

    // Click to start drawing a marker
    await markerDrawButton.click();
    await page.waitForTimeout(300);

    // Click on the map to place a marker
    const mapElement = await page.locator('#mapbox');
    const mapBox = await mapElement.boundingBox();
    await page.mouse.click(
      mapBox.x + mapBox.width * 0.5,
      mapBox.y + mapBox.height * 0.5
    );
    await page.waitForTimeout(300);

    // Fill in the marker name dialog
    const nameInput = await page.locator('input[type="text"]').last();
    await nameInput.fill('Test Marker');

    // Click OK
    const okButton = await page.locator('button').filter({ hasText: 'OK' });
    await okButton.click();
    await page.waitForTimeout(500);

    // Check the newly created marker's icon
    const newMarkerInfo = await page.evaluate(() => {
      if (typeof editableGroup === 'undefined') {
        return { error: 'editableGroup not found' };
      }

      let testMarker = null;
      editableGroup.eachLayer(function(layer) {
        if (layer instanceof L.Marker &&
            (layer.options._kmlName === 'Test Marker' || layer.options.name === 'Test Marker')) {
          const icon = layer.options.icon;
          testMarker = {
            name: layer.options._kmlName || layer.options.name,
            iconUrl: icon && icon.options ? icon.options.iconUrl : 'default',
            iconSize: icon && icon.options ? icon.options.iconSize : null,
            hasIcon: !!icon
          };
        }
      });

      return { testMarker };
    });

    console.log('New marker info:', newMarkerInfo.testMarker);

    // Verify the marker was created
    expect(newMarkerInfo.testMarker).not.toBeNull();

    // Verify it has an icon
    expect(newMarkerInfo.testMarker.hasIcon).toBe(true);

    // Verify it uses diamond icon
    expect(newMarkerInfo.testMarker.iconUrl).toContain('open-diamond.png');
    expect(newMarkerInfo.testMarker.iconUrl).not.toContain('marker-icon.png');

    // Check icon size
    expect(newMarkerInfo.testMarker.iconSize).toEqual([20, 20]);
  });

  test('check what icon Leaflet.Draw is configured with', async ({ page }) => {
    // Enter edit mode
    const editButton = await page.locator('#map-edit-controls');
    await editButton.click();
    await page.waitForTimeout(500);

    // Check the draw control configuration
    const drawConfig = await page.evaluate(() => {
      if (typeof drawControl === 'undefined') {
        return { error: 'drawControl not found' };
      }

      const markerOptions = drawControl.options.draw.marker;

      return {
        hasMarker: !!markerOptions,
        markerIsBoolean: typeof markerOptions === 'boolean',
        hasIcon: markerOptions && markerOptions.icon ? true : false,
        iconUrl: markerOptions && markerOptions.icon && markerOptions.icon.options ?
                 markerOptions.icon.options.iconUrl : null,
        iconSize: markerOptions && markerOptions.icon && markerOptions.icon.options ?
                  markerOptions.icon.options.iconSize : null,
        markerOptions: markerOptions
      };
    });

    console.log('Draw control marker config:', drawConfig);

    // Verify marker draw is configured
    expect(drawConfig.hasMarker).toBe(true);
    expect(drawConfig.markerIsBoolean).toBe(false);

    // Verify it has a custom icon configured
    expect(drawConfig.hasIcon).toBe(true);

    // Verify the icon is the diamond
    expect(drawConfig.iconUrl).toContain('open-diamond.png');
    expect(drawConfig.iconSize).toEqual([20, 20]);
  });
});
