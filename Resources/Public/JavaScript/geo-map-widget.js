import Notification from '@typo3/backend/notification.js';
import {lll} from '@typo3/core/lit-helper.js';

class GeoMapWidget {
    constructor(element) {
        this.element = element;
        this.latFieldName = element.dataset.latitudeField;
        this.lonFieldName = element.dataset.longitudeField;
        this.addressTemplate = element.dataset.addressTemplate;
        this.form = element.closest('form');

        this.configureMarkerIcon(element.dataset.markerIconBase);

        this.latInput = this.findInput(this.latFieldName);
        this.lonInput = this.findInput(this.lonFieldName);

        this.mapElement = element.querySelector('.askgeo-map');
        this.geocodeButton = element.querySelector('.askgeo-geocode-button');

        this.initWhenReady();
    }

    initWhenReady() {
        if (this.latInput.dataset.formengineInputInitialized) {
            this.createMap();
            this.bindGeocodeButton();
            return;
        }
        const check = () => {
            if (this.latInput.dataset.formengineInputInitialized) {
                this.createMap();
                this.bindGeocodeButton();
            } else {
                requestAnimationFrame(check);
            }
        };
        requestAnimationFrame(check);
    }

    configureMarkerIcon(iconBase) {
        if (!iconBase) {
            return;
        }
        L.Icon.Default.mergeOptions({
            iconUrl: iconBase + 'marker-icon.png',
            iconRetinaUrl: iconBase + 'marker-icon-2x.png',
            shadowUrl: iconBase + 'marker-shadow.png',
        });
    }

    findInput(fieldName) {
        return this.form.querySelector(`[data-formengine-input-name*="[${fieldName}]"]`);
    }

    createMap() {
        const lat = parseFloat(this.latInput.value);
        const lon = parseFloat(this.lonInput.value);
        const hasCoordinates = !isNaN(lat) && !isNaN(lon);

        // show world map if no coordinates are set
        const center = hasCoordinates ? [lat, lon] : [20, 0];
        const zoom = hasCoordinates ? 18 : 2;

        this.map = L.map(this.mapElement).setView(center, zoom);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19,
        }).addTo(this.map);

        // wait for container to have its size
        this.observeResize();

        if (hasCoordinates) {
            this.setOrMoveMarker(lat, lon);
        }
    }

    observeResize() {
        const observer = new ResizeObserver(() => {
            if (this.mapElement.offsetWidth > 0 && this.mapElement.offsetHeight > 0) {
                this.map.invalidateSize();
            }
        });
        observer.observe(this.mapElement);
    }

    bindGeocodeButton() {
        if (!this.geocodeButton) {
            return;
        }
        this.geocodeButton.addEventListener('click', () => this.handleGeocodeClick());
    }

    extractFieldNamesFromTemplate(template) {
        const matches = template.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
        return matches.map((match) => match.slice(1, -1));
    }

    buildAddressFromTemplate(template) {
        const fieldNames = this.extractFieldNamesFromTemplate(template);
        let address = template;

        for (const fieldName of fieldNames) {
            const input = this.findInput(fieldName);
            const value = input ? input.value : '';
            address = address.replace(`{${fieldName}}`, value);
        }

        return address.trim();
    }

    async handleGeocodeClick() {
        const address = this.buildAddressFromTemplate(this.addressTemplate);

        if (!address) {
            Notification.warning(lll('askgeo.error.emptyAddress'));
            return;
        }

        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;

        let response;
        try {
            response = await fetch(url, {headers: {Accept: 'application/json'}});
        } catch (error) {
            Notification.error(lll('askgeo.error.network'));
            return;
        }

        if (!response.ok) {
            Notification.error(lll('askgeo.error.failed'), String(response.status));
            return;
        }

        const results = await response.json();
        if (!results.length) {
            Notification.info(lll('askgeo.error.notFound'), address);
            return;
        }

        const lat = parseFloat(results[0].lat);
        const lon = parseFloat(results[0].lon);

        this.latInput.value = lat.toFixed(6);
        this.lonInput.value = lon.toFixed(6);
        this.latInput.dispatchEvent(new Event('change', {bubbles: true}));
        this.lonInput.dispatchEvent(new Event('change', {bubbles: true}));

        this.map.setView([lat, lon], 18);
        this.setOrMoveMarker(lat, lon);

        Notification.success(lll('askgeo.success.geocoding'));

    }

    setOrMoveMarker(lat, lon) {
        if (this.marker) {
            this.marker.setLatLng([lat, lon]);
            return;
        }
        this.marker = L.marker([lat, lon], {draggable: true}).addTo(this.map);
        this.marker.on('dragend', () => {
            const position = this.marker.getLatLng();
            this.latInput.value = position.lat.toFixed(6);
            this.lonInput.value = position.lng.toFixed(6);
            this.latInput.dispatchEvent(new Event('change', {bubbles: true}));
            this.lonInput.dispatchEvent(new Event('change', {bubbles: true}));

            Notification.success(lll('askgeo.success.marker_moved'));

        });
    }
}

function initialize() {
    document.querySelectorAll('.askgeo-widget').forEach((element) => {
        new GeoMapWidget(element);
    });
}

export default {initialize};