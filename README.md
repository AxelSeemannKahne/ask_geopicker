# ASK GeoPicker

A TYPO3 extension that provides an interactive Leaflet map widget. Coordinates can be set by dragging the marker on the map or by geocoding from other address fields.

**Requirements:** TYPO3 ^13.4

---

## Installation

```bash
composer require ask/ask_geopicker
```

---

## Usage in TCA

The widget is registered as `renderType` `askGeoMapWidget` inside a TCA column definition. It does **not** store any data itself — instead it reads and writes the values of two other fields on the same table (`latitudeField` / `longitudeField`).

```php
'geoMapWidget' => [
    'label' => 'Map',
    'config' => [
        'type'            => 'user',
        'renderType'      => 'askGeoMapWidget',
        'latitudeField'   => 'latitude',
        'longitudeField'  => 'longitude',
        'addressTemplate' => '{street}, {postal_code} {city}',
    ],
],
```

Then add the field to the desired `types` entry:

```php
'showitem' => '... latitude, longitude, geoMapWidget, ...',
```

> The `latitude` and `longitude` fields must still be defined in TCA themselves (e.g. as `input` fields with `eval = 'double2'`). The widget is purely a visual interface on top of them.

---

## Configuration options

| Option            | Default     | Description                                                                                                  |
|-------------------|-------------|--------------------------------------------------------------------------------------------------------------|
| `latitudeField`   | `latitude`  | Name of the TCA field that stores the latitude value.                                                        |
| `longitudeField`  | `longitude` | Name of the TCA field that stores the longitude value.                                                       |
| `addressTemplate` |             | Template for the geocoding feature (see below). If omitted, no geocode button is rendered.                   |

---

## addressTemplate — geocoding from address fields

When `addressTemplate` is set, a **"Find address on map"** button appears above the map. Clicking it reads the referenced fields from the current form, assembles them into an address string, and queries coordinates via **Nominatim (OpenStreetMap)**.

Placeholders in curly braces refer to other TCA field names on the same record:

```
'{street}, {postal_code} {city}'
→ reads the fields `street`, `postal_code`, and `city` from the current form
```

After a successful geocode, `latitudeField` and `longitudeField` are updated automatically and the map is centred on the result.

---

## How it works

- The map is rendered using **Leaflet**; tiles are served by **CartoDB Voyager**.
- When a record is opened, existing coordinates are shown as a draggable marker.
- The marker can be **repositioned by drag-and-drop** — the coordinate fields update automatically.
- Without coordinates the map shows a world view (zoom level 2).

---

## Content Security Policy

The extension automatically registers the required CSP rules for the TYPO3 backend:

| Directive    | Allowed origin                                   |
|--------------|--------------------------------------------------|
| `img-src`    | `https://*.basemaps.cartocdn.com` (map tiles)    |
| `connect-src`| `https://nominatim.openstreetmap.org` (geocoding)|

No manual CSP configuration is needed.