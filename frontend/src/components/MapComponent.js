import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const mapOptions = {
  zoom: 2,
  center: { lat: 20, lng: 0 },
  mapTypeId: 'roadmap',
  mapId: '2cdb21a165df80febb776608', // NEW Map ID with custom style from "flighty project"
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true
};

const Map = ({ data }) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [animationQueue, setAnimationQueue] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef(null);
  const eventSourceRef = useRef(null);

  const ref = useCallback((node) => {
    if (node !== null) {
      try {
        console.log('🗺️ Creating Google Map with options:', mapOptions);
        console.log('🆔 Using Map ID:', mapOptions.mapId);
        console.log('📍 Map center:', mapOptions.center);
        console.log('🔍 Map zoom:', mapOptions.zoom);
        
        const newMap = new window.google.maps.Map(node, mapOptions);
        console.log('✅ Map instance created successfully');
        
        // Add comprehensive event listeners
        newMap.addListener('idle', () => {
          console.log('🎯 Map idle event - Map loaded successfully with mapId:', mapOptions.mapId);
          console.log('🎨 Map type:', newMap.getMapTypeId());
          console.log('🔍 Current zoom:', newMap.getZoom());
          console.log('📍 Current center:', newMap.getCenter().toJSON());
        });
        
        newMap.addListener('tilesloaded', () => {
          console.log('🖼️ Map tiles loaded successfully');
        });
        
        newMap.addListener('error', (error) => {
          console.error('❌ Map error occurred:', error);
        });
        
        // Check if the map style is applied
        newMap.addListener('projection_changed', () => {
          console.log('🔄 Map projection changed - checking style application');
        });
        
        // Test map ID validity (Following Gemini's debugging advice)
        if (mapOptions.mapId) {
          console.log('🔍 Testing Map ID validity...');
          console.log('🆔 Map ID being used:', mapOptions.mapId);
          console.log('📏 Map ID length:', mapOptions.mapId.length);
          console.log('🔤 Map ID format check:', /^[a-f0-9]+$/.test(mapOptions.mapId));
          
          // The map will automatically try to load the style associated with this ID
          setTimeout(() => {
            console.log('⏰ 3 seconds after map creation - checking if custom style applied');
            console.log('🎨 Current map type ID:', newMap.getMapTypeId());
            
            // Additional checks for style application
            try {
              const mapDiv = newMap.getDiv();
              console.log('🖼️ Map container classes:', mapDiv.className);
              console.log('🎯 Map zoom level:', newMap.getZoom());
              
              // Check if we can detect any custom styling
              const tiles = mapDiv.querySelectorAll('img[src*="maps.googleapis.com"]');
              console.log('🗺️ Number of map tiles loaded:', tiles.length);
              
              if (tiles.length > 0) {
                const firstTile = tiles[0];
                console.log('🔗 Sample tile URL:', firstTile.src.substring(0, 100) + '...');
                
                // Check if the tile URL contains our Map ID
                if (firstTile.src.includes(mapOptions.mapId)) {
                  console.log('✅ Map ID found in tile URLs - style should be applied!');
                } else {
                  console.log('❌ Map ID NOT found in tile URLs - style may not be applied');
                  console.log('🔍 Expected Map ID:', mapOptions.mapId);
                }
              }
              
            } catch (error) {
              console.log('⚠️ Could not inspect map tiles:', error.message);
            }
            
          }, 3000);
          
          // Also check at 10 seconds for propagation delays
          setTimeout(() => {
            console.log('⏰ 10 seconds check - verifying style propagation');
            const tiles = newMap.getDiv().querySelectorAll('img[src*="maps.googleapis.com"]');
            if (tiles.length > 0) {
              const hasMapId = Array.from(tiles).some(tile => tile.src.includes(mapOptions.mapId));
              console.log('🔄 Map ID in tiles after 10s:', hasMapId ? '✅ Found' : '❌ Not found');
            }
          }, 10000);
        }
        
        setMap(newMap);
      } catch (error) {
        console.error('❌ Error creating map:', error);
        console.error('📋 Error details:', error.message);
        console.error('📊 Map options that caused error:', mapOptions);
      }
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
              ${location.airport}
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
            <p style="margin: 5px 0; color: #667eea; font-weight: bold;">
              ${location.count} booking${location.count > 1 ? 's' : ''} today
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

  // Set up Server-Sent Events connection for real-time bookings
  useEffect(() => {
    if (!map) return;

    const API_BASE = process.env.NODE_ENV === 'production' 
      ? 'https://travel-dashboard-gold.vercel.app' 
      : 'http://localhost:3000';

    console.log('🔌 Setting up SSE connection to:', `${API_BASE}/api/events`);
    
    const eventSource = new EventSource(`${API_BASE}/api/events`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ SSE connection opened');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 SSE message received:', data);

        if (data.type === 'new_booking') {
          console.log('🎯 New booking animation queued:', data.booking);
          setAnimationQueue(prev => [...prev, data.booking]);
        }
      } catch (error) {
        console.error('❌ Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
    };

    return () => {
      console.log('🔌 Closing SSE connection');
      eventSource.close();
    };
  }, [map]);

  // Process animation queue
  useEffect(() => {
    if (!map || isAnimating || animationQueue.length === 0) return;

    const processNextAnimation = async () => {
      setIsAnimating(true);
      const booking = animationQueue[0];
      
      console.log('🎬 Starting animation for booking:', booking.id);
      
      try {
        // Get current map state
        const currentCenter = map.getCenter();
        const currentZoom = map.getZoom();
        
        // Step 1: Zoom to country (2 seconds)
        console.log('🔍 Step 1: Zooming to booking location...');
        map.panTo({ lat: booking.coordinates[0], lng: booking.coordinates[1] });
        map.setZoom(6);
        
        await new Promise(resolve => {
          animationTimeoutRef.current = setTimeout(resolve, 2000);
        });
        
        // Step 2: Create pulsing marker for new booking (1-2 seconds)
        console.log('💓 Step 2: Creating pulse animation...');
        const pulseMarker = new window.google.maps.Marker({
          position: { lat: booking.coordinates[0], lng: booking.coordinates[1] },
          map: map,
          icon: {
            url: `data:image/svg+xml,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
                <defs>
                  <radialGradient id="pulseGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
                    <stop offset="70%" style="stop-color:#ff8e8e;stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:#ffb3b3;stop-opacity:0.3" />
                  </radialGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="30" cy="30" r="25" fill="url(#pulseGradient)" filter="url(#glow)">
                  <animate attributeName="r" values="20;30;20" dur="1s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="30" cy="30" r="15" fill="#ff4757" stroke="#fff" stroke-width="2"/>
                <text x="30" y="36" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">
                  NEW
                </text>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(60, 60),
            anchor: new window.google.maps.Point(30, 30)
          },
          title: `New Booking: ${booking.airportName} (${booking.airport})`
        });
        
        await new Promise(resolve => {
          animationTimeoutRef.current = setTimeout(resolve, 1500);
        });
        
        // Step 3: Zoom back out (2 seconds)
        console.log('🔍 Step 3: Zooming back out...');
        pulseMarker.setMap(null); // Remove pulse marker
        
        map.panTo(currentCenter);
        map.setZoom(currentZoom);
        
        await new Promise(resolve => {
          animationTimeoutRef.current = setTimeout(resolve, 2000);
        });
        
        console.log('✅ Animation completed for booking:', booking.id);
        
      } catch (error) {
        console.error('❌ Animation error:', error);
      }
      
      // Remove processed booking from queue
      setAnimationQueue(prev => prev.slice(1));
      setIsAnimating(false);
    };

    processNextAnimation();
  }, [map, animationQueue, isAnimating]);

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const MapComponent = ({ data }) => {
  // Debug environment variables (Following Gemini's systematic approach)
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  console.log('🔑 API Key exists:', !!apiKey);
  console.log('🔑 API Key length:', apiKey ? apiKey.length : 0);
  console.log('🔑 API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
  console.log('📊 Map data received:', data ? data.length : 0, 'locations');
  
  // Verify API key format (Google Maps API keys are typically 39 characters starting with "AIza")
  if (apiKey) {
    console.log('🔍 API Key format validation:');
    console.log('  - Starts with "AIza":', apiKey.startsWith('AIza') ? '✅' : '❌');
    console.log('  - Correct length (39 chars):', apiKey.length === 39 ? '✅' : '❌ (actual: ' + apiKey.length + ')');
    console.log('  - Contains only valid chars:', /^[A-Za-z0-9_-]+$/.test(apiKey) ? '✅' : '❌');
    console.log('🏗️ IMPORTANT: Ensure this API key is from your "flighty project" in Google Cloud Console');
  }

  // Add global error monitoring for Google Maps (Following Gemini's debugging advice)
  React.useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args.some(arg => typeof arg === 'string' && (
          arg.includes('Google Maps') || 
          arg.includes('maps.googleapis.com') ||
          arg.includes('mapId') ||
          arg.includes('style')
        ))) {
        console.log('🚨 GOOGLE MAPS ERROR DETECTED:', ...args);
      }
      originalError.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);

  const render = (status) => {
    console.log('🗺️ Map render status:', status);
    
    switch (status) {
      case Status.LOADING:
        console.log('🔄 Google Maps is loading...');
        return (
          <div className="map-loading">
            <div className="spinner"></div>
            <p>Loading Google Maps...</p>
          </div>
        );
      case Status.FAILURE:
        console.error('❌ Google Maps failed to load');
        return (
          <div className="map-error">
            <h3>Map Loading Error</h3>
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
        console.log('✅ Google Maps loaded successfully, creating Map component');
        return <Map data={data} />;
      default:
        console.log('⏳ Map status unknown:', status);
        return <div>Loading map...</div>;
    }
  };
  
  if (!apiKey) {
    console.error('❌ No Google Maps API key found in environment');
    return (
      <div className="map-placeholder">
        <div className="map-placeholder-content">
          <h3>Google Maps Integration</h3>
          <p>To enable the interactive map, please:</p>
          <ol>
            <li>Get a Google Maps API key from <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" rel="noopener noreferrer">Google Maps Platform</a></li>
            <li>Create a <code>.env</code> file in the frontend directory</li>
            <li>Add: <code>REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here</code></li>
            <li>Restart the development server</li>
          </ol>
          
          {data && data.length > 0 && (
            <div className="booking-locations">
              <h4>Current Booking Locations:</h4>
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

  console.log('🚀 Initializing Google Maps with API key and Map ID: 2cdb21a165df80febb776608');
  
  return (
    <div className="map-container">
      <Wrapper apiKey={apiKey} render={render} />
    </div>
  );
};

export default MapComponent; 