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

// Custom HTML Marker Overlay for reliable airplane icons
const createAirplaneMarker = (position, map, bookingInfo) => {
  const marker = new window.google.maps.OverlayView();
  
  marker.position = position;
  marker.bookingInfo = bookingInfo;
  marker.div = null;
  
  marker.onAdd = function() {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.cursor = 'pointer';
    div.style.zIndex = '1000';
    div.innerHTML = `
      <div style="
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: bounce 1s ease-in-out infinite alternate, pulse 2s ease-in-out infinite;
        transform-origin: center;
      ">
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(45deg, #FF4444, #FF6666);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(255, 68, 68, 0.4);
          border: 3px solid white;
        ">
          <div style="
            font-size: 20px;
            transform: rotate(45deg);
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          ">✈️</div>
        </div>
      </div>
      <style>
        @keyframes bounce {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-10px) scale(1.1); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 4px 15px rgba(255, 68, 68, 0.4); }
          50% { box-shadow: 0 6px 25px rgba(255, 68, 68, 0.8); }
        }
      </style>
    `;
    
    this.div = div;
    this.getPanes().overlayMouseTarget.appendChild(div);
    
    // Add click handler
    div.addEventListener('click', () => {
      console.log('🎯 Clicked airplane marker:', bookingInfo);
    });
  };
  
  marker.draw = function() {
    if (!this.div) return;
    
    const overlayProjection = this.getProjection();
    const position = overlayProjection.fromLatLngToDivPixel(this.position);
    
    if (position) {
      this.div.style.left = (position.x - 30) + 'px'; // Center the 60px wide marker
      this.div.style.top = (position.y - 30) + 'px';  // Center the 60px tall marker
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
  const [animationQueue, setAnimationQueue] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef(null);
  const tileCacheRef = useRef(new Set());

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

  // Utility function to wait for tiles to load
  const waitForTilesLoaded = useCallback((targetZoom, targetLocation, timeout = 8000) => {
    return new Promise((resolve) => {
      console.log(`🗺️ Waiting for tiles to load at zoom ${targetZoom}...`);
      
      let tilesLoadedListener;
      let timeoutId;
      
      const cleanup = () => {
        if (tilesLoadedListener) {
          window.google.maps.event.removeListener(tilesLoadedListener);
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
      
      // Set up tiles loaded listener
      tilesLoadedListener = map.addListener('tilesloaded', () => {
        console.log('✅ Tiles loaded successfully');
        cleanup();
        resolve(true);
      });
      
      // Fallback timeout
      timeoutId = setTimeout(() => {
        console.log('⏰ Tile loading timeout, proceeding anyway');
        cleanup();
        resolve(false);
      }, timeout);
      
      // Trigger the zoom/pan that will load tiles
      if (targetLocation) {
        map.panTo(targetLocation);
      }
      if (targetZoom) {
        map.setZoom(targetZoom);
      }
    });
  }, [map]);

  // Pre-cache tiles for queued bookings
  const preCacheTiles = useCallback(async (bookings) => {
    if (!map || bookings.length === 0) return;
    
    console.log(`🔄 Pre-caching tiles for ${bookings.length} upcoming bookings...`);
    
    for (const booking of bookings.slice(0, 3)) { // Cache first 3 in queue
      const cacheKey = `${booking.coordinates[0]}_${booking.coordinates[1]}_8`;
      
      if (!tileCacheRef.current.has(cacheKey)) {
        console.log(`📦 Pre-caching tiles for ${booking.airport}...`);
        
        // Briefly zoom to location to cache tiles (invisible to user)
        const currentZoom = map.getZoom();
        const currentCenter = map.getCenter();
        
        // Quick invisible cache (very fast zoom)
        map.setZoom(8);
        map.panTo({ lat: booking.coordinates[0], lng: booking.coordinates[1] });
        
        // Wait a moment for tiles to start loading
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Restore original view
        map.setZoom(currentZoom);
        map.panTo(currentCenter);
        
        tileCacheRef.current.add(cacheKey);
        console.log(`✅ Cached tiles for ${booking.airport}`);
        
        // Small delay between cache operations
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }, [map]);

  // Pre-cache tiles when animation queue changes
  useEffect(() => {
    if (!isAnimating && animationQueue.length > 1) {
      // Pre-cache tiles for upcoming bookings while current animation runs
      preCacheTiles(animationQueue.slice(1));
    }
  }, [animationQueue, isAnimating, preCacheTiles]);

  // Set up polling for real-time bookings
  useEffect(() => {
    if (!map) return;

    const API_BASE = process.env.NODE_ENV === 'production' 
      ? 'https://travel-dashboard-gold.vercel.app' 
      : 'http://localhost:3000';

    console.log('🔄 Setting up polling for recent bookings from:', `${API_BASE}/api/recent-bookings`);
    
    let processedBookingIds = new Set();
    
    const pollForBookings = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/recent-bookings`);
        const data = await response.json();
        
        // Process only new bookings that haven't been animated yet
        data.bookings.forEach(booking => {
          if (!processedBookingIds.has(booking.id)) {
            console.log('🎯 New booking detected for animation:', booking.id);
            setAnimationQueue(prev => [...prev, booking]);
            processedBookingIds.add(booking.id);
          }
        });
        
        // Clean up old processed IDs (keep last 50)
        if (processedBookingIds.size > 50) {
          const idsArray = Array.from(processedBookingIds);
          processedBookingIds = new Set(idsArray.slice(-30));
        }
        
      } catch (error) {
        console.error('❌ Error polling for bookings:', error);
      }
    };

    // Initial poll
    pollForBookings();
    
    // Poll every 3 seconds
    const pollInterval = setInterval(pollForBookings, 3000);

    return () => {
      console.log('🔄 Stopping booking polls');
      clearInterval(pollInterval);
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
        
        console.log('🎬 Animation starting for:', {
          bookingId: booking.id,
          airport: booking.airport,
          coordinates: booking.coordinates,
          currentZoom,
          currentCenter: currentCenter.toJSON()
        });
        
        // Step 1: Smooth zoom to booking location with tile loading
        console.log('🔍 Step 1: Zooming to booking location and waiting for tiles...');
        
        const targetLocation = { lat: booking.coordinates[0], lng: booking.coordinates[1] };
        
        // Wait for tiles to load at target location and zoom level
        const tilesLoaded = await waitForTilesLoaded(8, targetLocation);
        
        if (tilesLoaded) {
          console.log('✅ Tiles loaded, location is ready for animation');
        } else {
          console.log('⚠️ Proceeding with animation despite tile loading timeout');
        }
        
        // Small delay to ensure smooth visual transition
        await new Promise(resolve => {
          animationTimeoutRef.current = setTimeout(resolve, 1000);
        });
        
        // Step 2: Create custom airplane marker (3 seconds)
        console.log('✈️ Step 2: Creating airplane marker animation...');
        
        // Create custom airplane marker using HTML overlay
        const airplaneMarker = createAirplaneMarker(
          new window.google.maps.LatLng(booking.coordinates[0], booking.coordinates[1]),
          map,
          {
            bookingId: booking.id,
            airport: booking.airport,
            airportName: booking.airportName,
            country: booking.country
          }
        );
        
        console.log('🎯 Airplane marker created and should be visible!');
        
        await new Promise(resolve => {
          animationTimeoutRef.current = setTimeout(resolve, 3000); // Let airplane be visible for 3 seconds
        });
        
        // Step 3: Smooth zoom back to overview
        console.log('🔍 Step 3: Zooming back to overview and waiting for tiles...');
        
        // Clean up airplane marker
        airplaneMarker.setMap(null);
        
        // Wait for tiles to load back at overview level
        const overviewTilesLoaded = await waitForTilesLoaded(currentZoom, currentCenter);
        
        if (overviewTilesLoaded) {
          console.log('✅ Overview tiles loaded, animation complete');
        } else {
          console.log('⚠️ Overview tiles timeout, but animation complete');
        }
        
        // Final delay to ensure smooth transition
        await new Promise(resolve => {
          animationTimeoutRef.current = setTimeout(resolve, 1000);
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
  }, [map, animationQueue, isAnimating, waitForTilesLoaded]);

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