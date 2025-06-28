import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = ({ data }) => {
  if (!data) {
    return (
      <div className="dashboard">
        <div className="loading-placeholder">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data for top airports
  const airportsChartData = {
    labels: data.topAirports.map(airport => `${airport.iata} (${airport.country})`),
    datasets: [
      {
        label: 'Bookings',
        data: data.topAirports.map(airport => airport.count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
          '#4BC0C0',
          '#FF6384'
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  // Prepare chart data for continents
  const continentsChartData = {
    labels: data.continentData.map(continent => continent.continent),
    datasets: [
      {
        label: 'Bookings by Continent',
        data: data.continentData.map(continent => continent.count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384'
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Booking Statistics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Bookings by Continent',
      },
    },
  };

  return (
    <div className="dashboard">
      <div className="section-header">
        <h2>📊 Today's Booking Analytics</h2>
        <p>Real-time insights into travel bookings</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">✈️</div>
          <div className="metric-content">
            <h3>{data.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🏆</div>
          <div className="metric-content">
            <h3>{data.topAirports[0]?.iata || 'N/A'}</h3>
            <p>Top Airport</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🌍</div>
          <div className="metric-content">
            <h3>{data.topCountries[0]?.country || 'N/A'}</h3>
            <p>Top Country</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🗺️</div>
          <div className="metric-content">
            <h3>{data.continentData[0]?.continent || 'N/A'}</h3>
            <p>Top Continent</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Top Airports Chart */}
        {data.topAirports.length > 0 && (
          <div className="chart-container">
            <h3>🛬 Top Destination Airports</h3>
            <Bar data={airportsChartData} options={chartOptions} />
          </div>
        )}

        {/* Continents Chart */}
        {data.continentData.length > 0 && (
          <div className="chart-container">
            <h3>🌍 Bookings by Continent</h3>
            <Doughnut data={continentsChartData} options={doughnutOptions} />
          </div>
        )}
      </div>

      {/* Top Lists */}
      <div className="lists-section">
        {/* Top Countries */}
        <div className="list-container">
          <h3>🏆 Top Countries</h3>
          <div className="list">
            {data.topCountries.slice(0, 5).map((country, index) => (
              <div key={country.country} className="list-item">
                <span className="rank">#{index + 1}</span>
                <span className="name">{country.country}</span>
                <span className="count">{country.count}</span>
              </div>
            ))}
            {data.topCountries.length === 0 && (
              <p className="no-data">No bookings yet today</p>
            )}
          </div>
        </div>

        {/* Top Airports */}
        <div className="list-container">
          <h3>🛫 Top Airports</h3>
          <div className="list">
            {data.topAirports.slice(0, 5).map((airport, index) => (
              <div key={airport.iata} className="list-item">
                <span className="rank">#{index + 1}</span>
                <span className="name">
                  <strong>{airport.iata}</strong> - {airport.airport}
                </span>
                <span className="count">{airport.count}</span>
              </div>
            ))}
            {data.topAirports.length === 0 && (
              <p className="no-data">No bookings yet today</p>
            )}
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="dashboard-footer">
        <p>📅 Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Dashboard; 