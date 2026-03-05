# Maps JavaScript Documentation

This document describes the map system implementation in RopeWiki's Common.js.

## Overview

The map system uses **Leaflet** (not Google Maps) and is only initialized for logged-in users. Maps are rendered in elements with `id="mapbox"`.

## File Structure

### Core Files

- **`leaflet.js`** - Main map initialization and setup
- **`leaflet_kml.js`** - KML file parser and renderer (based on leaflet-kml library)
- **`leaflet_edit.js`** - Full KML editing system with Leaflet.Draw
- **`leaflet_icons.js`** - Marker icon definitions
- **`leaflet_layers.js`** - Layer control and base maps
- **`leaflet_transfers.js`** - Data transfer utilities
- **`icon_urls.js`** - Icon URL constants

## KML System

### KML Loading

KML files are parsed using a custom parser in `leaflet_kml.js` that supports:
- Placemarks (markers and tracks)
- Folders
- Ground overlays
- Styles and StyleMaps
- MultiGeometry elements

### KML Editing

The editing system (`leaflet_edit.js`) provides:

#### Features
- Edit existing track paths (move/add/delete points)
- Change track names, types, and colors
- Add new tracks with type selection
- Add/move/rename markers
- Delete tracks and markers
- Save changes back to MediaWiki

#### Track Types
Standard track types with colors:
- **Approach**: `#00CD00` (green)
- **Descent**: `#FF0000` (red)
- **Exit**: `#A200FF` (purple)
- **Alternate**: `#0000FF` (blue)
- **Shortcut**: `#00CD00` (green)
- **Private Property**: `#F0F000` (yellow)
- **Other**: `#808080` (gray)

#### Ghost Layers
To improve clickability of thin tracks, the system uses "ghost layers":
- Each visible track (2-3px wide) has a transparent companion layer (15px wide)
- Ghost layers handle all interactions (clicks, popups)
- Visible layers are non-interactive
- Ghost layers are excluded from legend and KML export
- When editing properties, both layers are synchronized
- Improves clickability by ~7.5x while maintaining visual appearance

#### Access Control
- Edit button only appears for logged-in users
- Only trusted testers can access editing (checked via `isTrustedTester()`)
- Edit mode is toggled via pencil icon in top-left control

#### Edit Mode UI
When enabled:
- Edit button (✏️) is hidden - cannot exit except by saving or cancelling
- Leaflet.Draw toolbar (add polyline, add marker)
- Save button (💾) - only enabled when changes are made
- Cancel button (🚫) - discards changes and reloads
- Delete functionality moved to individual item popups (no toolbar delete button)

#### Saving
1. Converts all layers to KML format
2. Uses MediaWiki API (`mw.Api().upload()`)
3. Overwrites original KML file
4. Reloads page with cache-busting parameter (`?_kmlrefresh=<timestamp>`)
5. KML loading detects parameter and bypasses cache to show fresh data

#### Cache Busting
After saving changes, the system prevents stale cached KML from being displayed:
- Page URL gets `?_kmlrefresh=<timestamp>` parameter appended
- KML loading function detects this parameter
- Adds same timestamp to KML fetch URL as `?_=<timestamp>`
- Forces browser to fetch fresh KML file instead of cached version

### Layer Event Handlers

Tracks and markers get event handlers for:
- `edit` - triggered when geometry changes
- `dragend` - triggered when markers are moved
- `popupopen` - shows edit buttons when in edit mode

### Data Flow

```
KML File → Parse → L.KML layers → Extract to editableGroup
                                         ↓
                                   Add ghost layers
                                         ↓
                                   Setup popups/events
                                         ↓
                                   User edits
                                         ↓
                                   layersToKML()
                                         ↓
                                   Upload via mw.Api()
```

## Global Variables

Map-related globals (defined in `global_variables.js`):
- `map` - Leaflet map instance
- `markers` - Marker collection
- `gxml` - KML data storage

## Leaflet.Draw Integration

The editing system uses Leaflet.Draw with custom configuration:
- **Enabled**: polyline drawing, marker placement
- **Disabled**: polygon, circle, rectangle, circlemarker, toolbar delete button
- **Edit**: Individual layer editing via popup buttons (not toolbar button)
- **Delete**: Via popup buttons with confirmation dialog (not toolbar)

## Important Implementation Details

### Interactive Layers
- Visible track layers have `interactive: false`
- Ghost layers have `interactive: true`
- This prevents the thin visible layer from blocking clicks to the ghost layer

### KML Export
When exporting edited maps:
- Skip ghost layers (identified by `layer._visibleLayer` property)
- Generate KML styles for each unique color
- Preserve track names, descriptions, and coordinates
- Use proper KML color format (AABBGGRR, not RGB)

### Legend Display
- Only show visible layers (skip ghost layers)
- Calculate and display track lengths in km
- Use track color for legend icon

### Editing Workflow

#### Entering Edit Mode
1. Click pencil icon (✏️) to enter edit mode
2. Edit button disappears (only exit is save or cancel)

#### Drawing New Features
1. Use toolbar to draw polyline or add marker
2. Feature appears immediately with default properties (red "Descent" track or "New Marker")
3. Dialog opens to customize name/type while feature remains visible
4. Feature updates with selected properties

#### Editing Existing Features
1. Click track/marker to open popup
2. Available buttons in popup:
   - **Edit Track/Marker**: Enable geometry editing (move points, drag marker)
   - **Change Name & Type**: Open dialog to modify properties
   - **Delete**: Remove the feature (with confirmation)

#### Exiting Edit Mode
1. **Save** (💾): Uploads changes to MediaWiki and reloads with fresh KML
2. **Cancel** (🚫): Discards all changes and reloads page

## ECMAScript 5 Compatibility

All code must be valid ES5 (no arrow functions, const/let, template strings, etc.) as MediaWiki environment doesn't support modern JavaScript.

## Dependencies

- Leaflet library (loaded from CDN)
- Leaflet.Draw (for editing)
- jQuery (for AJAX calls)
- MediaWiki API (`mw.Api()`)

## Testing

Test files in `/tests`:
- `test-kml-tracks.spec.js` - KML track functionality
- `test-marker-icons.spec.js` - Marker icon display
- `test-region-maps.spec.js` - Regional map features
