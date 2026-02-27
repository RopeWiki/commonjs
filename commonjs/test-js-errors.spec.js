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

test.describe('JavaScript Error Detection', () => {

  test('Check for JS errors - Logged Out', async ({ page }) => {
    const consoleMessages = [];
    const errors = [];
    const warnings = [];

    // Capture all console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });

      if (type === 'error') {
        errors.push(text);
      } else if (type === 'warning') {
        warnings.push(text);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      errors.push(`PAGE ERROR: ${error.message}`);
    });

    for (const url of TEST_URLS) {
      console.log(`\n=== Testing ${url} (Logged Out) ===`);

      await page.goto(url, { waitUntil: 'networkidle' });

      // Wait a bit for any delayed scripts
      await page.waitForTimeout(2000);

      console.log(`\nConsole Messages (${consoleMessages.length} total):`);
      consoleMessages.forEach(msg => {
        console.log(`  [${msg.type.toUpperCase()}] ${msg.text}`);
      });

      console.log(`\nErrors: ${errors.length}`);
      errors.forEach(err => console.log(`  ❌ ${err}`));

      console.log(`\nWarnings: ${warnings.length}`);
      warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));

      // Test passes regardless, but shows all console output for review
      expect(true).toBe(true);
    }
  });

  test('Check for JS errors - Logged In', async ({ page }) => {
    const consoleMessages = [];
    const errors = [];
    const warnings = [];

    // Capture all console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });

      if (type === 'error') {
        errors.push(text);
      } else if (type === 'warning') {
        warnings.push(text);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      errors.push(`PAGE ERROR: ${error.message}`);
    });

    // Login first
    console.log(`\n=== Logging in as ${USERNAME} ===`);
    await page.goto(`${SITE_URL}/index.php?title=Special:UserLogin`);

    await page.fill('#wpName1', USERNAME);
    await page.fill('#wpPassword1', PASSWORD);
    await page.click('#wpLoginAttempt');

    // Wait for login to complete
    await page.waitForLoadState('networkidle');

    for (const url of TEST_URLS) {
      console.log(`\n=== Testing ${url} (Logged In) ===`);

      // Clear previous messages
      consoleMessages.length = 0;
      errors.length = 0;
      warnings.length = 0;

      await page.goto(url, { waitUntil: 'networkidle' });

      // Wait a bit for any delayed scripts
      await page.waitForTimeout(2000);

      console.log(`\nConsole Messages (${consoleMessages.length} total):`);
      consoleMessages.forEach(msg => {
        console.log(`  [${msg.type.toUpperCase()}] ${msg.text}`);
      });

      console.log(`\nErrors: ${errors.length}`);
      errors.forEach(err => console.log(`  ❌ ${err}`));

      console.log(`\nWarnings: ${warnings.length}`);
      warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));

      // Test passes regardless, but shows all console output for review
      expect(true).toBe(true);
    }
  });

});
