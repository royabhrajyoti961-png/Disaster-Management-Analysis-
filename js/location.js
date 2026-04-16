// Live Location System with Google Maps
class LocationSystem {
    constructor() {
        this.map = null;
        this.marker = null;
        this.isSharing = false;
        this.locationInterval = null;
        this.currentLocation = null;
        this.init();
    }

    init() {
        console.log('🗺️ Initializing Location System...');
        this.loadGoogleMaps();
        this.bindEvents();
    }

    loadGoogleMaps() {
        // Add Google Maps script dynamically
        if (!document.querySelector('#google-maps-script')) {
            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
            
            // Global init function for Google Maps callback
            window.initMap = () => {
                console.log('✅ Google Maps loaded');
                this.initializeMap();
            };
        } else {
            this.initializeMap();
        }
    }

    initializeMap() {
        // Default center (New Delhi)
        const defaultCenter = { lat: 28.6139, lng: 77.2090 };
        
        const mapOptions = {
            zoom: 15,
            center: defaultCenter,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            styles: [
                {
                    "featureType": "administrative",
                    "elementType": "geometry",
                    "stylers": [{ "visibility": "off" }]
                },
                {
                    "featureType": "poi",
                    "stylers": [{ "visibility": "simplified" }]
                },
                {
                    "featureType": "road",
                    "elementType": "labels.icon",
                    "stylers": [{ "visibility": "off" }]
                },
                {
                    "featureType": "transit",
                    "stylers": [{ "visibility": "simplified" }]
                }
            ]
        };

        this.map = new google.maps.Map(document.getElementById('locationMap'), mapOptions);
        
        // Add custom marker
        this.marker = new google.maps.Marker({
            position: defaultCenter,
            map: this.map,
            title: 'Your Location',
            icon: {
                url: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="#e63946" stroke="white" stroke-width="3"/>
                        <circle cx="20" cy="20" r="8" fill="white"/>
                        <circle cx="20" cy="20" r="4" fill="#e63946"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20)
            },
            animation: google.maps.Animation.DROP
        });

        // Add circle for accuracy
        this.circle = new google.maps.Circle({
            map: this.map,
            radius: 0,
            fillColor: '#e63946',
            fillOpacity: 0.2,
            strokeColor: '#e63946',
            strokeOpacity: 0.8,
            strokeWeight: 2
        });

        console.log('✅ Map initialized');
    }

    bindEvents() {
        // Location control buttons
        document.getElementById('getLocationBtn').addEventListener('click', () => this.getCurrentLocation());
        document.getElementById('shareLocationBtn').addEventListener('click', () => this.startSharing());
        document.getElementById('stopSharingBtn').addEventListener('click', () => this.stopSharing());
        document.getElementById('refreshLocationBtn').addEventListener('click', () => this.refreshLocation());

        // Close sharing when page unloads
        window.addEventListener('beforeunload', () => {
            if (this.isSharing) {
                this.stopSharing();
            }
        });
    }

    async getCurrentLocation() {
        try {
            this.showLoadingState();
            
            const position = await new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation is not supported'));
                    return;
                }

                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            this.currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString()
            };

            this.updateMap(this.currentLocation);
            this.updateLocationDetails(this.currentLocation);
            this.enableSharing();
            this.showSuccessState();

            console.log('📍 Location acquired:', this.currentLocation);

        } catch (error) {
            console.error('❌ Location error:', error);
            this.showErrorState(error.message);
        }
    }

    updateMap(location) {
        if (!this.map) return;

        const latLng = new google.maps.LatLng(location.lat, location.lng);
        
        // Update marker position
        this.marker.setPosition(latLng);
        
        // Update circle for accuracy
        this.circle.setCenter(latLng);
        this.circle.setRadius(location.accuracy);
        
        // Center map on location
        this.map.setCenter(latLng);
        this.map.setZoom(16);

        // Add bounce animation
        this.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => {
            this.marker.setAnimation(null);
        }, 2000);
    }

    updateLocationDetails(location) {
        document.getElementById('latitudeValue').textContent = location.lat.toFixed(6);
        document.getElementById('longitudeValue').textContent = location.lng.toFixed(6);
        document.getElementById('accuracyValue').textContent = `${Math.round(location.accuracy)} meters`;
        document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
    }

    enableSharing() {
        document.getElementById('shareLocationBtn').disabled = false;
        document.getElementById('locationStatus').className = 'status-indicator ready';
        document.getElementById('locationStatusText').textContent = 'Location ready to share';
    }

    startSharing() {
        if (!this.currentLocation) return;

        this.isSharing = true;
        
        // Update UI
        document.getElementById('shareLocationBtn').disabled = true;
        document.getElementById('stopSharingBtn').disabled = false;
        document.getElementById('getLocationBtn').disabled = true;
        
        document.getElementById('locationStatus').className = 'status-indicator active';
        document.getElementById('locationStatusText').textContent = 'Sharing location with emergency contacts';

        // Start sharing interval
        this.locationInterval = setInterval(() => {
            this.shareLocationUpdate();
        }, 5000);

        // Show notification
        this.showNotification('Location sharing started', 'success');
        
        // Log the start of location sharing
        this.logLocationSharing('started');
    }

    stopSharing() {
        this.isSharing = false;
        
        // Update UI
        document.getElementById('shareLocationBtn').disabled = false;
        document.getElementById('stopSharingBtn').disabled = true;
        document.getElementById('getLocationBtn').disabled = false;
        
        document.getElementById('locationStatus').className = 'status-indicator';
        document.getElementById('locationStatusText').textContent = 'Location sharing stopped';

        // Clear interval
        if (this.locationInterval) {
            clearInterval(this.locationInterval);
            this.locationInterval = null;
        }

        // Show notification
        this.showNotification('Location sharing stopped', 'info');
        
        // Log the stop of location sharing
        this.logLocationSharing('stopped');
    }

    shareLocationUpdate() {
        if (!this.currentLocation) return;

        // Simulate sending to backend
        const locationData = {
            timestamp: new Date().toISOString(),
            location: this.currentLocation,
            type: 'LOCATION_UPDATE'
        };

        console.log('📍 Location shared:', locationData);
        
        // Update last updated time
        document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
        
        // In real app, send to backend:
        // window.safeCampusAPI.updateLocation(this.currentLocation);
    }

    refreshLocation() {
        if (this.isSharing) {
            this.getCurrentLocation();
        } else {
            this.showNotification('Get location first before refreshing', 'warning');
        }
    }

    showLoadingState() {
        document.getElementById('locationStatus').className = 'status-indicator loading';
        document.getElementById('locationStatusText').textContent = 'Getting your location...';
        document.getElementById('getLocationBtn').disabled = true;
        document.getElementById('getLocationBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
    }

    showSuccessState() {
        document.getElementById('getLocationBtn').disabled = false;
        document.getElementById('getLocationBtn').innerHTML = '<i class="fas fa-location-arrow"></i> Get My Location';
    }

    showErrorState(message) {
        document.getElementById('locationStatus').className = 'status-indicator error';
        document.getElementById('locationStatusText').textContent = `Error: ${message}`;
        document.getElementById('getLocationBtn').disabled = false;
        document.getElementById('getLocationBtn').innerHTML = '<i class="fas fa-location-arrow"></i> Get My Location';
        
        this.showNotification(`Location error: ${message}`, 'error');
    }

    showNotification(message, type = 'info') {
        if (window.safeCampusAPI && window.safeCampusAPI.showNotification) {
            window.safeCampusAPI.showNotification(message, type);
        } else {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    logLocationSharing(action) {
        const eventData = {
            type: `LOCATION_SHARING_${action.toUpperCase()}`,
            location: this.currentLocation,
            timestamp: new Date().toISOString()
        };
        
        console.log(`📍 Location Sharing ${action}:`, eventData);
    }
}

// Initialize location system
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Location System...');
    window.locationSystem = new LocationSystem();
});
