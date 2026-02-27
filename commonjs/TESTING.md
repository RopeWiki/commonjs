# Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with test credentials:
   ```
   MEDIAWIKI_SITE_URL=https://your-site-url.com
   MEDIAWIKI_USERNAME=your-username
   MEDIAWIKI_PASSWORD=your-password
   ```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests for a specific browser:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
```

Run a specific test file:
```bash
npx playwright test tests/test-kml-tracks.spec.js
```

## Test Files

- **test-js-errors.spec.js** - Checks for JavaScript console errors on pages (logged in/out)
- **test-kml-tracks.spec.js** - Verifies KML tracks load correctly on Leaflet maps
- **test-edit-button.spec.js** - Tests map editing functionality (edit button, toolbar, mode toggling)
- **test-marker-icons.spec.js** - Verifies markers use correct diamond icons

## Configuration

Test configuration is in `playwright.config.js`:
- Tests run on Chromium and Firefox browsers
- Test files are located in `tests/` directory
- Runs tests in parallel by default
