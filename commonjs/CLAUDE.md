# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository builds MediaWiki:Common.js for ropewiki.com. The build process concatenates all JavaScript files from the `lib/` directory into a single minified file that gets deployed to the MediaWiki site.

## Build System

Build the project:
```bash
npm run build
# or directly:
node build.js
```

The build process:
- Recursively reads all `.js` files from `lib/`
- Concatenates them using UglifyJS (with beautification enabled, compression/mangling disabled)
- Outputs to `out/Common.min.js`
- Note: Compression is intentionally disabled as it breaks functionality on ropewiki.com

## Deployment

Upload built file to MediaWiki:
```bash
./upload.py
```

Requires environment variables:
- `MEDIAWIKI_SITE_URL`
- `MEDIAWIKI_USERNAME`
- `MEDIAWIKI_PASSWORD`

Requires `mwclient` Python package.

## Code Architecture

### File Loading Order

Files are loaded alphabetically by the build system. Two special files control execution order:

- `lib/111_top.js` - Executes first (maintenance banner)
- `lib/zzz_onload.js` - Executes last (initialization and jQuery ready handlers)

### Core Systems

**Global Variables** (`lib/global_variables.js`):
- Cookie-based user preferences (metric, french, labels, etc.)
- MediaWiki configuration values (currentUser, pageName)
- Map-related globals (map, markers, gxml, etc.)
- Constants for unit conversion (km2mi, m2ft, etc.)
- Condition descriptions for canyoneering (quality, waterflow, wetsuit, dangers)

**Constants** (`lib/constants.js`):
- Auto-configures based on hostname (production vs dev vs local)
- Sets SITE_BASE_URL, LUCA_BASE_URL (RWServer backend)
- Contains OpenWeather API key

**Smart Imports** (`lib/smart_imports.js`):
- Dynamically loads JavaScript files when specific DOM elements appear
- Uses MutationObserver to watch for element presence
- Example: Loads InlineWaterflowChart.js when `#inline_waterflow_chart` element exists
- Configured in `lib/zzz_onload.js`

**Map System** (`lib/map/`):
- Uses Leaflet (not Google Maps) loaded from CDN
- `leaflet.js` - Core initialization (only for logged-in users)
- `leaflet_icons.js`, `leaflet_kml.js`, `leaflet_layers.js`, `leaflet_transfers.js` - Supporting modules
- Map element must have `id="mapbox"` to initialize

**UI Components** (`lib/ui/`):
- `fav.js` - Favorite/bookmark functionality
- `inlineweather.js` - Weather widget integration
- `modal.js` - Modal dialog system
- `toggle.js` - Toggle controls
- `ui.js` - General UI utilities

**Utilities** (`lib/utils/`):
- `compression.js` - Data compression utilities
- `urls.js` - URL manipulation helpers

### Key Features

- **Collapsible Lists** (`collapsible_lists.js`) - Expandable/collapsible content
- **Directions** (`directions.js`) - Route/directions integration
- **Translation** (`translation.js`) - Google Translate integration
- **Search** (`search.js`) - Enhanced search with typeahead
- **WikiEditor Customization** (`wikieditor_customization.js`) - Custom editor toolbar
- **Pictures** (`pictures.js`) - Image gallery/management
- **PDF** (`pdf.js`) - PDF generation/handling
- **Stars** (`stars.js`) - Rating system
- **Credits** (`credits.js`) - Attribution system
- **Table** (`table/`) - Data table filtering and user list management
- **Android** (`android.js`) - Android app integration
- **Geo** (`geo.js`) - Geolocation utilities

## Development Notes

- All JavaScript is vanilla JS or jQuery (MediaWiki environment)
- No modern build tools (webpack, babel, etc.) - just concatenation
- Code must work in MediaWiki context with `mw` global object
- TypeScript definitions for jQuery and Google Maps are available for development
- code need to be valid ECMAScript 5