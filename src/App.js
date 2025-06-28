import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import MapComponent from './components/MapComponent';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, mapResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/dashboard`),
        axios.get(`${API_BASE_URL}/map`)
      ]);
      
      setDashboardData(dashboardResponse.data);
      setMapData(mapResponse.data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Make sure the backend server is running on port 3000.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !dashboardData) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading travel dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>⚠️ Connection Error</h2>
          <p>{error}</p>
          <button onClick={fetchData} className="retry-btn">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌍 Travel Booking Dashboard</h1>
        <div className="header-info">
          <span className="total-bookings">
            📊 {dashboardData?.totalBookings || 0} bookings today
          </span>
          <span className="last-updated">
            🕒 Last updated: {lastUpdated}
          </span>
          <button onClick={fetchData} className="refresh-btn" disabled={loading}>
            {loading ? '🔄' : '↻'} Refresh
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="dashboard-grid">
          <div className="dashboard-section">
            <Dashboard data={dashboardData} />
          </div>
          
          <div className="map-section">
            <div className="section-header">
              <h2>🗺️ Booking Locations</h2>
              <p>Live map showing booking destinations with counts</p>
            </div>
            <MapComponent data={mapData} />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Real-time travel booking analytics • Data refreshes every 30 seconds</p>
      </footer>
    </div>
  );
}

export default App; 