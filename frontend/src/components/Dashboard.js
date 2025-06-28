import React from 'react';
import { Row, Col, Card, Statistic, List, Typography, Space, Spin } from 'antd';
import { 
  TrophyOutlined, 
  GlobalOutlined, 
  EnvironmentOutlined,
  RocketOutlined
} from '@ant-design/icons';
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

const { Text } = Typography;

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
      <Card style={{ textAlign: 'center', padding: '50px' }}>
        <Space direction="vertical" size="large">
          <Spin size="large" />
          <Text>Loading dashboard data...</Text>
        </Space>
      </Card>
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
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Bookings"
              value={data.totalBookings}
              prefix={<RocketOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Top Airport"
              value={data.topAirports[0]?.iata || 'N/A'}
              prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Top Country"
              value={data.topCountries[0]?.country || 'N/A'}
              prefix={<EnvironmentOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Top Continent"
              value={data.continentData[0]?.continent || 'N/A'}
              prefix={<GlobalOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[24, 24]}>
        {/* Top Airports Chart */}
        {data.topAirports.length > 0 && (
          <Col xs={24} lg={12}>
                          <Card title="Top Destination Airports" style={{ height: '400px' }}>
              <Bar data={airportsChartData} options={chartOptions} />
            </Card>
          </Col>
        )}

        {/* Continents Chart */}
        {data.continentData.length > 0 && (
          <Col xs={24} lg={12}>
                          <Card title="Bookings by Continent" style={{ height: '400px' }}>
              <Doughnut data={continentsChartData} options={doughnutOptions} />
            </Card>
          </Col>
        )}
      </Row>

      {/* Top Lists */}
      <Row gutter={[24, 24]}>
        {/* Top Countries */}
        <Col xs={24} md={12}>
                     <Card title="Top Countries">
            <List
              dataSource={data.topCountries.slice(0, 5)}
              locale={{ emptyText: 'No bookings yet today' }}
              renderItem={(country, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Text strong>#{index + 1}</Text>}
                    title={country.country}
                    description={`${country.count} booking${country.count !== 1 ? 's' : ''}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Top Airports */}
        <Col xs={24} md={12}>
                     <Card title="Top Airports">
            <List
              dataSource={data.topAirports.slice(0, 5)}
              locale={{ emptyText: 'No bookings yet today' }}
              renderItem={(airport, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Text strong>#{index + 1}</Text>}
                    title={<><Text strong>{airport.iata}</Text> - {airport.airport}</>}
                    description={`${airport.count} booking${airport.count !== 1 ? 's' : ''}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Last Updated */}
      <Card style={{ textAlign: 'center' }}>
                 <Text type="secondary">
           Last updated: {new Date(data.lastUpdated).toLocaleString()}
         </Text>
      </Card>
    </Space>
  );
};

export default Dashboard; 