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
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#000000',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Space align="center">
          <DashboardOutlined style={{ fontSize: '24px', color: 'white' }} />
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            Travel Booking Dashboard
          </Title>
        </Space>
        <Space align="center">
          <ClockCircleOutlined style={{ color: 'white' }} />
          <Text style={{ color: 'white' }}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Text>
        </Space>
      </Header>

      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Paragraph style={{ margin: 0, fontSize: '16px' }}>
              Real-time analytics and insights from your travel booking data
            </Paragraph>
          </Card>

          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card 
                title={
                  <Space>
                    <DashboardOutlined />
                    Analytics Dashboard
                  </Space>
                }
                style={{ height: '100%' }}
              >
                <Dashboard data={dashboardData} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card 
                title={
                  <Space>
                    <GlobalOutlined />
                    Global Booking Map
                  </Space>
                }
                extra={<Text type="secondary">Interactive view of destination locations</Text>}
                style={{ height: '600px' }}
                bodyStyle={{ height: 'calc(100% - 57px)', padding: 0 }}
              >
                <MapComponent data={mapData} />
              </Card>
            </Col>
          </Row>
        </Space>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#000000', color: 'white' }}>
        <Space split={<span style={{ color: '#666' }}>|</span>}>
          <Text style={{ color: 'white' }}>Powered by real-time Slack integration</Text>
          <Text style={{ color: 'white' }}>Auto-refreshes every 30 seconds</Text>
          <Text style={{ color: 'white' }}>Built with React & Google Maps</Text>
        </Space>
      </Footer>
    </Layout>
  );
}

export default App;
