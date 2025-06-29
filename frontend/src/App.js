import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Typography, Space, Spin, Alert, Button, Card, Row, Col } from 'antd';
import { DashboardOutlined, GlobalOutlined, ReloadOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Dashboard from './components/Dashboard';
import MapComponent from './components/MapComponent';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:3000';

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch dashboard data
      const dashboardResponse = await fetch(`${API_BASE_URL}/api/dashboard`);
      if (!dashboardResponse.ok) {
        throw new Error(`Dashboard API error: ${dashboardResponse.status}`);
      }
      const dashboardResult = await dashboardResponse.json();
      
      // Fetch map data
      const mapResponse = await fetch(`${API_BASE_URL}/api/map`);
      if (!mapResponse.ok) {
        throw new Error(`Map API error: ${mapResponse.status}`);
      }
      const mapResult = await mapResponse.json();
      
      setDashboardData(dashboardResult);
      setMapData(mapResult);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Space direction="vertical" align="center" size="large">
          <Spin size="large" />
          <Title level={2}>Loading Travel Dashboard...</Title>
          <Text type="secondary">Fetching real-time booking data</Text>
        </Space>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', padding: '50px' }}>
        <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card style={{ maxWidth: 600, width: '100%' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Alert
                message="Connection Error"
                description={
                  <Space direction="vertical">
                    <Text>Unable to connect to the backend server:</Text>
                    <Text code>{error}</Text>
                    <Text type="secondary">Make sure the backend server is running on port 3000</Text>
                  </Space>
                }
                type="error"
                showIcon
              />
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={fetchData}
                size="large"
                block
              >
                Retry Connection
              </Button>
            </Space>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Left Panel - Dashboard Data */}
      <div className="dashboard-left-panel">
        <div style={{ padding: '24px' }}>
          {/* Last Updated Info */}
          <div style={{ 
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <Space align="center">
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              <Text strong>Last updated: {lastUpdate.toLocaleTimeString()}</Text>
            </Space>
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              size="small"
            />
          </div>

          {/* Dashboard Analytics */}
          <Card 
            style={{ 
              height: 'calc(100vh - 120px)',
              overflow: 'auto'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <Dashboard data={dashboardData} />
          </Card>
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="dashboard-right-panel">
        <MapComponent data={mapData} />
      </div>
    </div>
  );
}

export default App;
