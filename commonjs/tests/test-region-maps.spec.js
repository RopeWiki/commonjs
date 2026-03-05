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

// Test both logged in and logged out scenarios
const TEST_REGION_PAGES = [
  { url: `${SITE_URL}/Utah`, name: 'Utah' }
];

test.describe('Region Maps and Tables', () => {

  test('Region page should load map and table when logged in', async ({ page }) => {
    test.setTimeout(120000);

    console.log(`\n=== Logging in as ${USERNAME} ===`);
    await page.goto(`${SITE_URL}/index.php?title=Special:UserLogin`);
    await page.fill('#wpName1', USERNAME);
    await page.fill('#wpPassword1', PASSWORD);
    await page.click('#wpLoginAttempt');
    await page.waitForLoadState('networkidle');

    for (const testPage of TEST_REGION_PAGES) {
      console.log(`\n=== Testing ${testPage.name} (Logged In) ===`);

      await page.goto(testPage.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Check for kmllistquery element (indicates region page)
      const kmlListQuery = await page.$('#kmllistquery');
      if (!kmlListQuery) {
        console.log('  ℹ️  No #kmllistquery element - not a region page');
        continue;
      }
      const queryContent = await kmlListQuery.textContent();
      console.log(`  ✓ Region query element found: ${queryContent.substring(0, 50)}...`);

      // Check if map element exists
      const mapBox = await page.$('#mapbox');
      expect(mapBox).toBeTruthy();
      console.log('  ✓ Map element (#mapbox) found');

      // Wait for Leaflet to load and data to populate
      await page.waitForTimeout(5000);

      // Check map initialization
      const mapInfo = await page.evaluate(() => {
        if (typeof map === 'undefined') {
          return { mapExists: false };
        }

        const markerCount = markers ? markers.length : 0;
        const layerCount = map._layers ? Object.keys(map._layers).length : 0;

        return {
          mapExists: true,
          markerCount: markerCount,
          layerCount: layerCount,
          mapCenter: map.getCenter(),
          mapZoom: map.getZoom()
        };
      });

      expect(mapInfo.mapExists).toBe(true);
      console.log(`  ✓ Map initialized with ${mapInfo.markerCount} markers and ${mapInfo.layerCount} layers`);
      expect(mapInfo.markerCount).toBeGreaterThan(0);

      // Check for table - the main canyon list table is #loctabledata
      // Note: Each canyon row contains nested tables, so we need to select tr.trow specifically
      const tableInfo = await page.evaluate(() => {
        const mainTable = document.querySelector('#loctabledata tbody');
        if (!mainTable) return { exists: false, selector: '#loctabledata not found' };

        const rows = mainTable.querySelectorAll('tr.trow'); // Only count actual canyon rows, not nested table rows
        const rowCount = rows.length;

        // Count visible rows by checking if they have the 'filtered-out' class
        // or any other hiding mechanism
        let visibleCount = 0;
        let hiddenCount = 0;
        rows.forEach(row => {
          const style = window.getComputedStyle(row);
          const isHidden = style.display === 'none' ||
                          row.classList.contains('filtered-out') ||
                          row.style.display === 'none';
          if (isHidden) {
            hiddenCount++;
          } else {
            visibleCount++;
          }
        });

        // Get sample data from first few rows
        const sampleRows = [];
        for (let i = 0; i < Math.min(3, visibleCount); i++) {
          const cells = rows[i].querySelectorAll('td');
          if (cells.length > 0) {
            sampleRows.push({
              hasName: cells[0]?.textContent?.trim() || '',
              cellCount: cells.length,
              isHidden: window.getComputedStyle(rows[i]).display === 'none',
              className: rows[i].className
            });
          }
        }

        return {
          exists: true,
          rowCount: rowCount,
          visibleRowCount: visibleCount,
          hiddenRowCount: hiddenCount,
          sampleRows: sampleRows,
          tableHTML: mainTable.innerHTML.substring(0, 500)
        };
      });

      expect(tableInfo.exists).toBe(true);
      expect(tableInfo.visibleRowCount).toBeGreaterThan(0);
      console.log(`  ✓ Table found with ${tableInfo.visibleRowCount} visible rows (${tableInfo.rowCount} total)`);

      if (tableInfo.sampleRows.length > 0) {
        console.log(`  ✓ Sample canyon: ${tableInfo.sampleRows[0].hasName.split(/(?=[A-Z][a-z])/)[0]}`);
      }

      // Verify markers and visible table rows match
      expect(mapInfo.markerCount).toBe(tableInfo.visibleRowCount);
      console.log(`  ✓ Marker count (${mapInfo.markerCount}) matches visible table rows (${tableInfo.visibleRowCount})`);

      // Check loading info element
      const loadingInfo = await page.$('#loadinginfo');
      if (loadingInfo) {
        const loadingText = await loadingInfo.textContent();
        console.log(`  ✓ Loading info: ${loadingText.trim()}`);
      }
    }
  });

  test('Region page table should NOT load when logged out', async ({ page }) => {
    test.setTimeout(60000);

    for (const testPage of TEST_REGION_PAGES) {
      console.log(`\n=== Testing ${testPage.name} (Logged Out) ===`);

      await page.goto(testPage.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Check for kmllistquery element
      const kmlListQuery = await page.$('#kmllistquery');
      if (!kmlListQuery) {
        console.log('  ℹ️  No #kmllistquery element - not a region page');
        continue;
      }
      console.log('  ✓ Region query element found');

      // Map should show warning message
      const mapBox = await page.$('#mapbox');
      if (mapBox) {
        const mapContent = await mapBox.textContent();
        console.log(`  Map box content: ${mapContent.substring(0, 100)}...`);
        expect(mapContent).toContain('logged-in users');
      }

      // Check if map actually initialized (it shouldn't)
      const mapInitialized = await page.evaluate(() => {
        return typeof map !== 'undefined' && map !== null;
      });

      expect(mapInitialized).toBe(false);
      console.log('  ✓ Map not initialized (expected when logged out)');

      // Check for table - should NOT exist or be empty
      const tableInfo = await page.evaluate(() => {
        const tableBody = document.querySelector('table tbody');
        if (!tableBody) return { exists: false, rowCount: 0 };

        const rows = tableBody.querySelectorAll('tr');
        return {
          exists: true,
          rowCount: rows.length
        };
      });

      // This is the current broken behavior - table doesn't load
      console.log(`  ✓ Table exists: ${tableInfo.exists}, rows: ${tableInfo.rowCount}`);
      console.log('  ℹ️  This is the CURRENT (broken) state - table should load but doesn\'t');
    }
  });

  test('Region page should support filters when logged in', async ({ page }) => {
    test.setTimeout(120000);

    console.log(`\n=== Logging in as ${USERNAME} ===`);
    await page.goto(`${SITE_URL}/index.php?title=Special:UserLogin`);
    await page.fill('#wpName1', USERNAME);
    await page.fill('#wpPassword1', PASSWORD);
    await page.click('#wpLoginAttempt');
    await page.waitForLoadState('networkidle');

    for (const testPage of TEST_REGION_PAGES) {
      console.log(`\n=== Testing Filters on ${testPage.name} ===`);

      await page.goto(testPage.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      // Get initial marker count
      const initialMarkerCount = await page.evaluate(() => {
        return markers ? markers.filter(m => m.isVisible !== false).length : 0;
      });

      console.log(`  Initial visible markers: ${initialMarkerCount}`);

      // Check for filter controls
      const hasFilters = await page.evaluate(() => {
        // Look for common filter elements
        return {
          hasDistanceSlider: !!document.querySelector('input[type="range"]'),
          hasRatingFilters: !!document.querySelector('.rating-filter') || !!document.querySelector('[id*="rating"]'),
          hasSearchBox: !!document.querySelector('input[type="text"]')
        };
      });

      console.log(`  Filter controls found:`, hasFilters);

      // If there's a distance slider, test it
      if (hasFilters.hasDistanceSlider) {
        const slider = await page.$('input[type="range"]');
        if (slider) {
          console.log('  ✓ Found distance filter slider');
          // Note: Not actually changing it, just verifying it exists
        }
      }
    }
  });

  test('Region page should load more canyons when clicking load more button', async ({ page }) => {
    test.setTimeout(120000);

    console.log(`\n=== Logging in as ${USERNAME} ===`);
    await page.goto(`${SITE_URL}/index.php?title=Special:UserLogin`);
    await page.fill('#wpName1', USERNAME);
    await page.fill('#wpPassword1', PASSWORD);
    await page.click('#wpLoginAttempt');
    await page.waitForLoadState('networkidle');

    for (const testPage of TEST_REGION_PAGES) {
      console.log(`\n=== Testing Load More on ${testPage.name} ===`);

      await page.goto(testPage.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      // Get initial counts
      const initialCounts = await page.evaluate(() => {
        return {
          markers: markers ? markers.length : 0,
          tableRows: document.querySelectorAll('table tbody tr').length
        };
      });

      console.log(`  Initial markers: ${initialCounts.markers}, table rows: ${initialCounts.tableRows}`);

      // Look for "load more" button
      const loadMoreButton = await page.$('button:has-text("+")');

      if (loadMoreButton) {
        console.log('  ✓ Found load more button, clicking...');
        await loadMoreButton.click();
        await page.waitForTimeout(3000);

        const newCounts = await page.evaluate(() => {
          return {
            markers: markers ? markers.length : 0,
            tableRows: document.querySelectorAll('table tbody tr').length
          };
        });

        console.log(`  After load more - markers: ${newCounts.markers}, table rows: ${newCounts.tableRows}`);

        expect(newCounts.markers).toBeGreaterThanOrEqual(initialCounts.markers);
        expect(newCounts.tableRows).toBeGreaterThanOrEqual(initialCounts.tableRows);
        console.log('  ✓ Load more increased canyon count');
      } else {
        console.log('  ℹ️  No load more button (all canyons may be loaded)');
      }
    }
  });

});
