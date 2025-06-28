require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load IATA airport data
let airportData = {};
try {
  const airports = JSON.parse(fs.readFileSync('iata-airports.json', 'utf8'));
  airports.forEach(airport => {
    airportData[airport.iata] = airport;
  });
  console.log(`Loaded ${Object.keys(airportData).length} airports`);
} catch (error) {
  console.error('Error loading airport data:', error);
}

// In-memory data storage (resets daily)
let dailyData = {
  totalBookings: 0,
  airportCounts: {},
  countryCounts: {},
  continentCounts: {},
  bookings: [],
  lastUpdated: new Date().toISOString()
};

// Function to reset daily data
function resetDailyData() {
  dailyData = {
    totalBookings: 0,
    airportCounts: {},
    countryCounts: {},
    continentCounts: {},
    bookings: [],
    lastUpdated: new Date().toISOString()
  };
  console.log('Daily data reset at midnight');
}

// Schedule daily reset at midnight
cron.schedule('0 0 * * *', resetDailyData);

// Function to process a booking
function processBooking(booking) {
  const { booking_id, arrival, date, status } = booking;
  
  // Only process confirmed bookings from today
  if (status !== 'confirmed') return false;
  
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);
  
  if (bookingDate.getTime() !== today.getTime()) return false;
  
  // Look up airport data
  const airportInfo = airportData[arrival.airport];
  if (!airportInfo) {
    console.log(`Unknown airport code: ${arrival.airport}`);
    return false;
  }
  
  // Update counters
  dailyData.totalBookings++;
  dailyData.airportCounts[arrival.airport] = (dailyData.airportCounts[arrival.airport] || 0) + 1;
  dailyData.countryCounts[airportInfo.country] = (dailyData.countryCounts[airportInfo.country] || 0) + 1;
  dailyData.continentCounts[airportInfo.continent] = (dailyData.continentCounts[airportInfo.continent] || 0) + 1;
  
  // Store booking with location info
  dailyData.bookings.push({
    booking_id,
    airport: arrival.airport,
    airportName: airportInfo.airport,
    country: airportInfo.country,
    continent: airportInfo.continent,
    lat: airportInfo.lat,
    lng: airportInfo.lng,
    date,
    status
  });
  
  dailyData.lastUpdated = new Date().toISOString();
  return true;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', airportsLoaded: Object.keys(airportData).length });
});

// Dashboard data endpoint
app.get('/api/dashboard', (req, res) => {
  const topAirports = Object.entries(dailyData.airportCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([iata, count]) => ({
      iata,
      airport: airportData[iata]?.airport || 'Unknown',
      country: airportData[iata]?.country || 'Unknown',
      count
    }));
    
  const topCountries = Object.entries(dailyData.countryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }));
    
  const continentData = Object.entries(dailyData.continentCounts)
    .map(([continent, count]) => ({ continent, count }));

  res.json({
    totalBookings: dailyData.totalBookings,
    topAirports,
    topCountries,
    continentData,
    lastUpdated: dailyData.lastUpdated
  });
});

// Map data endpoint
app.get('/api/map', (req, res) => {
  const mapData = Object.entries(dailyData.airportCounts).map(([iata, count]) => {
    const airport = airportData[iata];
    return {
      iata,
      airport: airport.airport,
      country: airport.country,
      continent: airport.continent,
      lat: airport.lat,
      lng: airport.lng,
      count
    };
  });
  
  res.json(mapData);
});

// Test endpoint to simulate booking data
app.post('/api/test-booking', (req, res) => {
  const booking = req.body;
  const processed = processBooking(booking);
  res.json({ processed, booking });
});

// Slack webhook endpoint for processing booking messages
app.post('/api/slack-webhook', (req, res) => {
  try {
    console.log('Received Slack webhook:', req.body);
    
    // Extract message text from Slack payload
    const messageText = req.body.text || '';
    
    // Try to parse JSON from message text
    let bookingData;
    try {
      // Remove any markdown formatting and extract JSON
      const jsonMatch = messageText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        bookingData = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, treat the whole message as potential JSON
        bookingData = JSON.parse(messageText);
      }
    } catch (parseError) {
      console.log('Message is not valid JSON, ignoring:', messageText);
      return res.json({ 
        status: 'ignored', 
        reason: 'Invalid JSON format',
        message: 'Please send booking data in JSON format'
      });
    }
    
    // Validate booking data structure
    if (!bookingData.booking_id || !bookingData.arrival?.airport || !bookingData.date || !bookingData.status) {
      console.log('Invalid booking data structure:', bookingData);
      return res.json({ 
        status: 'error', 
        reason: 'Missing required fields',
        required: ['booking_id', 'arrival.airport', 'date', 'status'],
        received: bookingData
      });
    }
    
    // Process the booking
    const processed = processBooking(bookingData);
    
    if (processed) {
      console.log(`✅ Processed booking: ${bookingData.booking_id} → ${bookingData.arrival.airport}`);
      
      // Send confirmation back to Slack
      const airportInfo = airportData[bookingData.arrival.airport];
      const confirmationMessage = {
        text: `✅ Booking processed successfully!`,
        attachments: [{
          color: 'good',
          fields: [
            { title: 'Booking ID', value: bookingData.booking_id, short: true },
            { title: 'Destination', value: `${bookingData.arrival.airport} - ${airportInfo?.airport}`, short: true },
            { title: 'Country', value: airportInfo?.country, short: true },
            { title: 'Date', value: bookingData.date, short: true }
          ],
          footer: `Total bookings today: ${dailyData.totalBookings}`
        }]
      };
      
      res.json({ 
        status: 'processed', 
        booking: bookingData,
        totalBookings: dailyData.totalBookings,
        response: confirmationMessage
      });
    } else {
      console.log(`❌ Booking not processed: ${bookingData.booking_id}`);
      res.json({ 
        status: 'not_processed', 
        booking: bookingData,
        reason: 'Booking must be confirmed status and from today'
      });
    }
    
  } catch (error) {
    console.error('Error processing Slack webhook:', error);
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      message: 'Internal server error processing booking'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Loaded ${Object.keys(airportData).length} airports`);
}); 