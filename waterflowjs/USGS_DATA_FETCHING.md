# USGS Data Fetching Documentation

## Overview

The waterflow.js system fetches real-time stream gauge data from the USGS (United States Geological Survey) Water Services API. This document describes how the data fetching works, the API structure, and how the data is processed and displayed.

## USGS Water Services API

### Base URL
```
https://waterservices.usgs.gov/nwis/
```

### Endpoints Used

The system uses two different endpoints depending on the data resolution needed:

1. **Instantaneous Values (iv)**: Real-time data, updated frequently
   - Used for: Current day data (`today=true`)
   - Update frequency: Every 15-60 minutes
   - URL format: `https://waterservices.usgs.gov/nwis/iv/?format=json&bBox=...`

2. **Daily Values (dv)**: Historical daily averages
   - Used for: Historical dates
   - Update frequency: Once per day
   - URL format: `https://waterservices.usgs.gov/nwis/dv/?format=json&bBox=...`

### Request Parameters

#### Geographic Bounding Box
```javascript
// Bounding box format: [west, south, east, north]
// Example from code:
var usgsrect = [rnd(boxrect[1]), rnd(boxrect[0]), rnd(boxrect[3]), rnd(boxrect[2])];
```

The bounding box is extracted from the page's KML data (`#kmlrect` element) and defines the geographic area to search for gauges.

#### Parameter Codes
```
parameterCd=00060,00065,00010
```

- `00060`: Discharge (cubic feet per second - CFS)
- `00065`: Gage height (feet)
- `00010`: Temperature (Celsius)

#### Date Ranges

**For Current Day (Instantaneous Values):**
```javascript
// No date parameters - returns latest data
dates = "";
```

**For Historical Data (3-day average):**
```javascript
// Fetches 3 days: day before, target day, day after
var ddate = new Date(date);
var start = new Date(), end = new Date();
start.setTime(ddate.getTime() - dayms);
end.setTime(ddate.getTime() + dayms);
dates = "&startDT=" + sdate + "&endDT=" + edate;
```

**For Historical Archive (5 years):**
```javascript
// Used when date ends with 'A' (wfallusgs mode)
var numdays = 5 * 365;
dates = "&startDT=" + sdate + "&endDT=" + edate;
```

### Complete Request Example

```
https://waterservices.usgs.gov/nwis/iv/?format=json&bBox=-119.24,36.19,-118.34,36.91&parameterCd=00060,00065,00010
```

This fetches:
- Real-time instantaneous values
- For all gauges within the bounding box
- Returning discharge, gage height, and temperature data

## Response Structure

### API Response Format

```javascript
{
  "value": {
    "timeSeries": [
      {
        "sourceInfo": {
          "siteCode": [{ "value": "10259540" }],
          "siteName": "WHITEWATER R A WHITEWATER CA",
          "geoLocation": {
            "geogLocation": {
              "latitude": 33.9361111,
              "longitude": -116.6297222
            }
          }
        },
        "variable": {
          "variableCode": [{ "value": "00060" }]  // Discharge
        },
        "values": [
          {
            "value": [
              {
                "value": "1.5",
                "dateTime": "2024-01-15T12:00:00.000-08:00"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Processing Flow

1. **Receive Response**
   ```javascript
   $.getJSON(url, function(data) {
     var ts = data.value.timeSeries;
     // ts.length = number of time series returned
   ```

2. **Process Each Time Series**
   ```javascript
   for (var i = 0; i < ts.length; ++i) {
     var siteid = "USGS:" + ts[i].sourceInfo.siteCode[0].value;
     var sitename = ts[i].sourceInfo.siteName;
     var lat = ts[i].sourceInfo.geoLocation.geogLocation.latitude;
     var lng = ts[i].sourceInfo.geoLocation.geogLocation.longitude;
   ```

3. **Add New Sites**
   ```javascript
   if (returnSiteByID(siteid) == null) {
     addsite(siteid, sitename, lat, lng, "", "cfs/ft/C,600,500", usgsurl, -1);
   }
   ```

4. **Extract Values by Variable Code**
   ```javascript
   if (ts[i].variable.variableCode[0].value == "00065") {
     sitelist[s].G = best3 ? v3.join('|') : v;  // Gage height
   } else if (ts[i].variable.variableCode[0].value == "00010") {
     sitelist[s].T = best3 ? v3.join('|') : v;  // Temperature
   } else {
     sitelist[s].Q = best3 ? v3.join('|') : v;  // Discharge
   }
   ```

## Data Processing Features

### 3-Day Averaging (Best3)

To smooth out data fluctuations, the system calculates a 3-day average:

```javascript
// Calculates values for:
// v3[0] = target day
// v3[1] = day before
// v3[2] = day after
// Then averages them for more stable readings
```

This helps avoid sudden spikes or drops that might not be representative of actual conditions.

### Site Information Structure

Each site is stored with the following information:

```javascript
{
  id: "USGS:10259540",
  name: "WHITEWATER R AT WHITEWATER CA",
  loc: { lat: 33.9361111, lng: -116.6297222 },
  units: ["cfs", "ft", "C"],
  urls: [
    "https://waterdata.usgs.gov/monitoring-location/%id/#parameterCode=00060",
    "https://nwis.waterdata.usgs.gov/nwis/uv/?format=img_stats&site_no=%id&...",
    "https://waterdata.usgs.gov/nwis/dv/?format=img_stats&site_no=%id&..."
  ],
  dist: 12.3,  // Distance in miles from center point
  counter: -1,  // Countdown for data loading
  icon: 0,      // Map icon index
  status: "%DATA%"  // Current flow status
}
```

### URL Templates

The system stores multiple URL templates for each site:

1. **Index 0**: Current data page (always used for table links)
2. **Index 1**: 7-day graph (instantaneous values)
3. **Index 2**: 30-day graph (daily values)
4. **Index 3**: 1-year graph (daily values)

URLs use placeholders that are replaced dynamically:
- `%id` - Site ID number
- `%YYYY1`, `%MM1`, `%DD1` - Start date components
- `%YYYY2`, `%MM2`, `%DD2` - End date components

## Loading States and UI Updates

### Loading Indicator

A loading row is added to the table while USGS data is being fetched:

```javascript
var loadingRow = document.createElement("TR");
loadingRow.id = "usgs-loading-row";
loadingRow.innerHTML = '<td colspan="..." style="...">
  <img src=".../loading.gif"/> Loading USGS gauge data...
</td>';
table.appendChild(loadingRow);
```

This row is removed when data loads successfully or on error.

### Error Handling

```javascript
.fail(function(jqxhr, textStatus, error) {
  console.error("USGS fetch failed: " + textStatus + ", " + error);
  // Update loading row with error message
  loadingRow.innerHTML = '<td>Failed to load USGS gauge data...</td>';
})
```

### Countdown System

Each site has a counter that tracks how many date requests are pending:

```javascript
site.counter = datesid.length;  // Initially set to number of dates to fetch
// Decremented each time a date completes:
datecountdown(siteid, -1);
// When counter reaches 0, site is fully processed
```

## Data Display and Conversion

### Unit Conversion

**Discharge (Q):**
```javascript
var m3_to_cfs = 35.3146662127;
if (site.units[0] != 'cfs')
  Q = Q * m3_to_cfs;  // Convert m³/s to cfs
if (metric)
  Q = Q / m3_to_cfs;  // Convert back if user wants metric
```

**Gage Height (G):**
```javascript
var m_to_ft = 3.28084;
if (site.units[1] != 'ft')
  G = G * m_to_ft;    // Convert meters to feet
if (metric)
  G = G / m_to_ft;    // Convert back if user wants metric
```

**Temperature (T):**
```javascript
if (site.units[2] != 'F')
  T = T * 9 / 5 + 32;  // Convert Celsius to Fahrenheit
if (metric)
  T = (T - 32) * 5 / 9;  // Convert back if user wants metric
```

### Display Format

Values are displayed with appropriate precision and units:

```javascript
// Example output: "125.5cfs 3.2ft 45°F"
str = Q + (metric ? 'm3s' : 'cfs') + ' ' +
      G + (metric ? 'm' : 'ft') + ' ' +
      T + "°" + (metric ? 'C' : 'F');
```

## Map Integration

### Marker Creation

Sites are added to the map with the following data structure:

```javascript
list.push({
  id: siteName,                    // Popup title
  location: { lat: ..., lng: ... }, // Coordinates
  zindex: site.icon,                // Marker layer order
  icon: wficonlist[site.icon],      // Icon URL
  description: statuslabel + statusloading  // Popup body
});
```

### Icon System

Icons are selected based on data quality:
- `icon = 0`: No data / loading
- `icon = 1`: Disabled / no current flow
- `icon = 2`: Data available but poor match
- `icon = 3`: Good data match with predictions

### Status Updates

Markers are updated after data loads:

```javascript
function updatemarkers() {
  for (var i = 0; i < markers.length; ++i) {
    var site = returnSiteByID(marker.locationData.id);
    if (site) {
      marker.setIcon(waterFlowIcon(wficonlist[site.icon]));
      marker.bindTooltip(...replace(statusloading, site.status));
      marker.bindPopup(...replace(statusloading, site.status));
    }
  }
}
```

## Debug Modes

### URL Parameters

Enable various debug modes by adding parameters to the URL:

- `?debug=log` - Verbose console logging
- `?debug=test` - Test mode (no USGS fetch)
- `?debug=nousgs` - Disable USGS entirely
- `?debug=allusgs` - Fetch 5 years of data
- `?debug=local` - Use localhost server
- `?debug=noth` - Single-threaded downloads
- `?watershed=on` - Enable watershed calculations

### Console Output

With `debug=log` enabled, you'll see:

```
=== Waterflow starting ===
Settings: watershed=false log=true test=false nousgs=false local=false
Download threads: 4
Location: 33.9361111,-116.6297222 bbox=[-119.24,36.19,-118.34,36.91]
Dates to fetch: 2024-01-15, 2024-01-14, 2024-01-13
USGS fetch: date=2024-01-15 today=true mode=instantaneous
USGS response: 15 time series received
USGS adding site: USGS:10259540 (WHITEWATER R AT WHITEWATER CA)
Adding value: USGS:10259540 date=2024-01-15 Q=1.5 G=3.2
USGS processed: 5 sites with data
USGS complete: all dates fetched
```

## Performance Considerations

### Parallel Fetching

The system fetches multiple dates in parallel:

```javascript
for (var i = 0; i < datesid.length; ++i) {
  if (i == 0)
    usgsgetval(datesid[i], true, true)   // Today: instantaneous
  else
    usgsgetval(datesid[i], false, false) // Past: daily values
}
```

### Throttling

Download threads can be configured (default: 4):
```javascript
var downloadth = 4;  // Number of parallel requests
```

### Caching

Browser caching is managed via timestamps:
```javascript
var stamp = new Date().getTime();
url = url.replace("%stamp", stamp);
```

This prevents stale cached data while allowing reasonable cache lifetimes.

## Common Issues and Solutions

### Issue: No gauges found
**Cause**: Bounding box too small or no active gauges in area
**Solution**: Check `#kmlrect` element has valid coordinates

### Issue: Data shows as "loading" indefinitely
**Cause**: API request failed or site counter not decremented
**Solution**: Check browser console for API errors, verify network connectivity

### Issue: Values seem wrong
**Cause**: Unit conversion issue or wrong parameter code
**Solution**: Verify `site.units` array matches expected units

### Issue: Map markers don't update
**Cause**: `updatemarkers()` not called or markers array empty
**Solution**: Ensure `loadRWResultsListIntoMap(list)` is called first

## References

- [USGS Water Services Documentation](https://waterservices.usgs.gov/rest/)
- [USGS Parameter Codes](https://help.waterdata.usgs.gov/codes-and-parameters/parameters)
- [USGS Site Service](https://waterservices.usgs.gov/rest/Site-Service.html)
