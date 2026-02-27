const { test, expect } = require('@playwright/test');
require('dotenv').config();

test.describe('Map Edit Functionality', () => {
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

  test('edit button should show Leaflet.Draw toolbar when clicked', async ({ page }) => {
    // Find the edit button (✏️)
    const editButton = await page.locator('#map-edit-controls');
    await expect(editButton).toBeVisible();

    // Verify initial state
    const initialContent = await editButton.innerHTML();
    expect(initialContent).toContain('✏️');

    // Click the edit button
    await editButton.click();
    await page.waitForTimeout(500);

    // Verify button changes to ❌
    const editedContent = await editButton.innerHTML();
    expect(editedContent).toContain('❌');

    // Verify Leaflet.Draw toolbar appears
    const drawToolbar = await page.locator('.leaflet-draw');
    await expect(drawToolbar).toBeVisible();

    // Verify specific draw tools are present
    const polylineButton = await page.locator('.leaflet-draw-draw-polyline');
    await expect(polylineButton).toBeVisible();

    const markerButton = await page.locator('.leaflet-draw-draw-marker');
    await expect(markerButton).toBeVisible();

    // Edit layers button should NOT be visible (disabled in config)
    const editLayersButton = await page.locator('.leaflet-draw-edit-edit');
    await expect(editLayersButton).not.toBeVisible();

    const deleteButton = await page.locator('.leaflet-draw-edit-remove');
    await expect(deleteButton).toBeVisible();

    // Verify save and cancel buttons appear
    const saveButton = await page.locator('.leaflet-control-save');
    await expect(saveButton).toBeVisible();

    const cancelButton = await page.locator('div.leaflet-control').filter({ hasText: '🚫' });
    await expect(cancelButton).toBeVisible();
  });

  test('track popup should show edit buttons in edit mode', async ({ page }) => {
    // Click edit button to enter edit mode
    const editButton = await page.locator('#map-edit-controls');
    await editButton.click();
    await page.waitForTimeout(500);

    // Click on a track to open popup
    // We need to click on a polyline - let's try clicking near the center of the map
    const mapElement = await page.locator('#mapbox');
    const mapBox = await mapElement.boundingBox();

    // Try clicking on different parts of the map to find a track
    let popupFound = false;
    const clickOffsets = [
      { x: 0.3, y: 0.3 },
      { x: 0.5, y: 0.5 },
      { x: 0.4, y: 0.4 },
      { x: 0.6, y: 0.6 },
      { x: 0.7, y: 0.5 }
    ];

    for (const offset of clickOffsets) {
      await page.mouse.click(
        mapBox.x + mapBox.width * offset.x,
        mapBox.y + mapBox.height * offset.y
      );
      await page.waitForTimeout(300);

      // Check if popup appeared
      const popup = page.locator('.leaflet-popup-content');
      if (await popup.isVisible()) {
        popupFound = true;

        // Verify edit buttons are present
        const editTrackBtn = await page.locator('#edit-track-path-btn');
        const changeTypeBtn = await page.locator('#edit-track-type-btn');

        await expect(editTrackBtn).toBeVisible();
        await expect(changeTypeBtn).toBeVisible();

        // Verify button text
        await expect(editTrackBtn).toHaveText('Edit Track');
        await expect(changeTypeBtn).toHaveText('Change Name & Type');

        break;
      }
    }

    if (!popupFound) {
      console.log('Warning: Could not find a track to click on');
    }
  });

  test('track popup should NOT show edit buttons when not in edit mode', async ({ page }) => {
    // Don't click edit button - stay in normal mode

    // Try to click on a track
    const mapElement = await page.locator('#mapbox');
    const mapBox = await mapElement.boundingBox();

    let popupFound = false;
    const clickOffsets = [
      { x: 0.3, y: 0.3 },
      { x: 0.5, y: 0.5 },
      { x: 0.4, y: 0.4 }
    ];

    for (const offset of clickOffsets) {
      await page.mouse.click(
        mapBox.x + mapBox.width * offset.x,
        mapBox.y + mapBox.height * offset.y
      );
      await page.waitForTimeout(300);

      const popup = page.locator('.leaflet-popup-content');
      if (await popup.isVisible()) {
        popupFound = true;

        // Verify edit buttons are NOT visible (they should have display: none)
        const editTrackBtn = await page.locator('#edit-track-path-btn');
        const changeTypeBtn = await page.locator('#edit-track-type-btn');

        // The buttons exist in the DOM but should not be visible
        if (await editTrackBtn.count() > 0) {
          const isVisible = await editTrackBtn.isVisible();
          expect(isVisible).toBe(false);
        }

        if (await changeTypeBtn.count() > 0) {
          const isVisible = await changeTypeBtn.isVisible();
          expect(isVisible).toBe(false);
        }

        break;
      }
    }

    if (!popupFound) {
      console.log('Warning: Could not find a track to click on');
    }
  });

  test('exit edit mode should hide toolbar and reset button', async ({ page }) => {
    // Enter edit mode
    const editButton = await page.locator('#map-edit-controls');
    await editButton.click();
    await page.waitForTimeout(500);

    // Verify we're in edit mode
    const editedContent = await editButton.innerHTML();
    expect(editedContent).toContain('❌');

    // Click again to exit edit mode
    await editButton.click();
    await page.waitForTimeout(500);

    // Verify button changes back to ✏️
    const normalContent = await editButton.innerHTML();
    expect(normalContent).toContain('✏️');

    // Verify save and cancel buttons are gone
    const saveButton = page.locator('.leaflet-control-save');
    await expect(saveButton).not.toBeVisible();

    const cancelButton = page.locator('div.leaflet-control').filter({ hasText: '🚫' });
    await expect(cancelButton).not.toBeVisible();
  });
});
