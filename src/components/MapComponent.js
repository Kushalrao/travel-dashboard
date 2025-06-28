import React, { useCallback, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const mapOptions = {
  zoom: 2,
  center: { lat: 20, lng: 0 },
  mapTypeId: 'roadmap',
  mapId: 'travelDataMap',
  styles: [
    // Water styling - deep blue for oceans
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#1e3a8a' }, { saturation: 20 }]
    },
    // Land/landscape styling - muted earth tones
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#f8fafc' }, { lightness: 10 }]
    },
    // Country borders - subtle but visible
    {
      featureType: 'administrative.country',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#cbd5e1' }, { weight: 1 }]
    },
    // Hide unnecessary labels for cleaner look
    {
      featureType: 'administrative.locality',
      elementType: 'labels',
      stylers: [{ visibility: 'simplified' }]
    },
    // Roads - minimal visibility
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#e2e8f0' }, { weight: 0.5 }]
    },
    // Road labels - hidden for cleaner map
    {
      featureType: 'road',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    // Points of interest - hidden to focus on travel data
    {
      featureType: 'poi',
      elementType: 'all',
      stylers: [{ visibility: 'off' }]
    },
    // Transit - hidden
    {
      featureType: 'transit',
      elementType: 'all',
      stylers: [{ visibility: 'off' }]
    },
    // Natural features - subtle
    {
      featureType: 'landscape.natural',
      elementType: 'geometry',
      stylers: [{ color: '#f1f5f9' }]
    },
    // Administrative areas - light borders
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#94a3b8' }, { weight: 0.8 }]
    }
  ]
};

const Map = ({ data }) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  const ref = useCallback((node) => {
    if (node !== null) {
      const newMap = new window.google.maps.Map(node, mapOptions);
      setMap(newMap);
    }
  }, []);

  // Create custom markers when map or data changes
  React.useEffect(() => {
    if (!map || !data || data.length === 0) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = data.map((location) => {
      // Create custom marker with booking count
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: `${location.airport} (${location.iata})\n${location.count} booking${location.count > 1 ? 's' : ''}`,
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
              <defs>
                <linearGradient id="markerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
                </filter>
              </defs>
              <circle cx="22" cy="22" r="20" fill="url(#markerGradient)" stroke="#fff" stroke-width="3" filter="url(#shadow)"/>
              <circle cx="22" cy="22" r="16" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
              <text x="22" y="28" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">
                ${location.count}
              </text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(44, 44),
          anchor: new window.google.maps.Point(22, 22)
        }
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">
              ✈️ ${location.airport}
            </h3>
            <p style="margin: 5px 0; color: #666;">
              <strong>IATA Code:</strong> ${location.iata}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Country:</strong> ${location.country}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Continent:</strong> ${location.continent}
            </p>
            <p style="margin: 5px 0; color: #FF6384; font-weight: bold;">
              📊 ${location.count} booking${location.count > 1 ? 's' : ''} today
            </p>
          </div>
        `
      });

      // Add click listener to show info window
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit map to show all markers if there are any
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      data.forEach(location => {
        bounds.extend({ lat: location.lat, lng: location.lng });
      });
      map.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 10) map.setZoom(10);
        window.google.maps.event.removeListener(listener);
      });
    }

  }, [map, data, markers]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const MapComponent = ({ data }) => {
  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="map-loading">
            <div className="spinner"></div>
            <p>Loading Google Maps...</p>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="map-error">
            <h3>⚠️ Map Loading Error</h3>
            <p>
              Failed to load Google Maps. Please check your internet connection 
              and ensure you have a valid Google Maps API key.
            </p>
            <p>
              <strong>For development:</strong> You can get a free API key from the 
              <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
                 target="_blank" rel="noopener noreferrer">
                Google Maps Platform
              </a>
            </p>
          </div>
        );
      case Status.SUCCESS:
        return <Map data={data} />;
      default:
        return <div>Loading map...</div>;
    }
  };

  // For development, we'll use a placeholder map if no API key is available
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return (
      <div className="map-placeholder">
        <div className="map-placeholder-content">
          <h3>🗺️ Google Maps Integration</h3>
          <p>To enable the interactive map, please:</p>
          <ol>
            <li>Get a Google Maps API key from <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" rel="noopener noreferrer">Google Maps Platform</a></li>
            <li>Create a <code>.env</code> file in the frontend directory</li>
            <li>Add: <code>REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here</code></li>
            <li>Restart the development server</li>
          </ol>
          
          {data && data.length > 0 && (
            <div className="booking-locations">
              <h4>📍 Current Booking Locations:</h4>
              <div className="locations-list">
                {data.map((location, index) => (
                  <div key={`${location.iata}-${index}`} className="location-item">
                    <span className="location-badge">{location.count}</span>
                    <div className="location-details">
                      <strong>{location.iata}</strong> - {location.airport}
                      <br />
                      <small>{location.country}, {location.continent}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <Wrapper apiKey={apiKey} render={render} />
    </div>
  );
};

export default MapComponent; 