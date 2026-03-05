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

#### Access Control
- Edit button only appears for logged-in users
- Only trusted testers can access editing (checked via `isTrustedTester()`)
- Edit mode is toggled via pencil icon in top-left control

#### Edit Mode UI
When enabled:
- Yellow edit button (❌ to exit)
- Leaflet.Draw toolbar (add polyline, add marker, delete)
- Save button (💾) - only enabled when changes are made
- Cancel button (🚫) - discards changes and reloads

#### Saving
1. Converts all layers to KML format
2. Uses MediaWiki API (`mw.Api().upload()`)
3. Overwrites original KML file
4. Reloads page after successful save

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
- **Enabled**: polyline drawing, marker placement, deletion
- **Disabled**: polygon, circle, rectangle, circlemarker
- **Edit**: Individual layer editing via popup buttons (not toolbar button)

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
1. Click pencil icon to enter edit mode
2. Click track/marker to open popup
3. Use "Edit Track" button to modify geometry
4. Use "Change Name & Type" to modify properties
5. Click save when done (or cancel to discard)

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
