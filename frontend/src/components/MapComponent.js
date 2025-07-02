import React, { useCallback, useState, useEffect } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const mapOptions = {
  zoom: 2,
  center: { lat: 20, lng: 0 },
  mapTypeId: 'roadmap',
  mapId: '2cdb21a165df80febb776608', // Original Map ID with custom style from "flighty project"
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true
};

// Simple marker overlay that stays the same size regardless of zoom
const createSimpleMarker = (position, map, markerInfo) => {
  const marker = new window.google.maps.OverlayView();
  
  marker.position = position;
  marker.markerInfo = markerInfo;
  marker.div = null;
  
  marker.onAdd = function() {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.cursor = 'pointer';
    div.style.zIndex = '1000';
    div.style.transform = 'translate(-50%, -50%)'; // Center the marker
    
    div.innerHTML = `
      <div style="
        background: white;
        color: black;
        border: 2px solid black;
        border-radius: 6px;
        padding: 4px 8px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        min-width: 40px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        white-space: nowrap;
      ">
        ${markerInfo.iata}<br/>
        ${markerInfo.count}
      </div>
    `;
    
    this.div = div;
    this.getPanes().overlayMouseTarget.appendChild(div);
    
    // Add click handler for more info
    div.addEventListener('click', () => {
      console.log('Clicked marker:', markerInfo);
      // You can add info window functionality here if needed
    });
  };
  
  marker.draw = function() {
    if (!this.div) return;
    
    const overlayProjection = this.getProjection();
    const position = overlayProjection.fromLatLngToDivPixel(this.position);
    
    if (position) {
      this.div.style.left = position.x + 'px';
      this.div.style.top = position.y + 'px';
    }
  };
  
  marker.onRemove = function() {
    if (this.div && this.div.parentNode) {
      this.div.parentNode.removeChild(this.div);
      this.div = null;
    }
  };
  
  marker.setMap(map);
  return marker;
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

  // Update markers when data changes
  useEffect(() => {
    if (!map || !data) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    // Create new markers for current data
    const newMarkers = data.map(location => {
      // Handle both coordinate formats: coordinates array or lat/lng properties
      const lat = location.coordinates ? location.coordinates[0] : location.lat;
      const lng = location.coordinates ? location.coordinates[1] : location.lng;
      
      if (!lat || !lng) {
        console.warn('Missing coordinates for location:', location);
        return null;
      }
      
      const position = new window.google.maps.LatLng(lat, lng);
      
      return createSimpleMarker(position, map, {
        iata: location.iata,
        count: location.count,
        airport: location.airport,
        country: location.country,
        continent: location.continent
      });
    }).filter(marker => marker !== null); // Remove null markers

    setMarkers(newMarkers);

    // Only fit bounds on initial load (when we have markers but map is at default position)
    if (data.length > 0 && markers.length === 0) {
      const bounds = new window.google.maps.LatLngBounds();
      data.forEach(location => {
        const lat = location.coordinates ? location.coordinates[0] : location.lat;
        const lng = location.coordinates ? location.coordinates[1] : location.lng;
        
        if (lat && lng) {
          bounds.extend(new window.google.maps.LatLng(lat, lng));
        }
      });
      
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
        
        // Ensure minimum zoom level
        const listener = window.google.maps.event.addListener(map, 'bounds_changed', () => {
          if (map.getZoom() > 10) map.setZoom(10);
          window.google.maps.event.removeListener(listener);
        });
      }
    }
  }, [map, data, markers]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [markers]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const MapComponent = ({ data }) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            background: 'white',
            color: 'black'
          }}>
            Loading Google Maps...
          </div>
        );
      case Status.FAILURE:
        return (
          <div style={{
            padding: '20px',
            background: 'white',
            color: 'black',
            border: '1px solid #ccc'
          }}>
            <h3>Map Loading Error</h3>
            <p>Failed to load Google Maps. Please check your API key.</p>
          </div>
        );
      case Status.SUCCESS:
        return <Map data={data} />;
      default:
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            background: 'white',
            color: 'black'
          }}>
            Loading...
          </div>
        );
    }
  };
  
  if (!apiKey) {
    return (
      <div style={{
        padding: '20px',
        background: 'white',
        color: 'black',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}>
        <h3>Google Maps Integration</h3>
        <p>To enable the interactive map, please:</p>
        <ol>
          <li>Get a Google Maps API key from Google Maps Platform</li>
          <li>Create a .env file in the frontend directory</li>
          <li>Add: REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here</li>
          <li>Restart the development server</li>
        </ol>
        
        {data && data.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Current Booking Locations:</h4>
            <div>
              {data.map((location, index) => (
                <div key={`${location.iata}-${index}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '8px 0',
                  padding: '8px',
                  background: '#f5f5f5',
                  borderRadius: '4px'
                }}>
                  <span style={{
                    background: 'black',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    marginRight: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {location.count}
                  </span>
                  <div>
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
    );
  }
  
  return (
    <div style={{ width: '100%', height: '100%', background: 'white' }}>
      <Wrapper apiKey={apiKey} render={render} />
    </div>
  );
};

export default MapComponent; 