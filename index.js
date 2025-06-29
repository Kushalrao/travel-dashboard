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
  // Try to load from JavaScript module first (more reliable for Vercel)
  airportData = require('./airports-data.js');
  console.log(`Loaded ${Object.keys(airportData).length} airports from JS module`);
} catch (error) {
  console.error('Error loading airport data from JS module:', error);
  // Fallback to JSON file
  try {
    const airports = JSON.parse(fs.readFileSync('iata-airports.json', 'utf8'));
    airports.forEach(airport => {
      airportData[airport.iata] = airport;
    });
    console.log(`Loaded ${Object.keys(airportData).length} airports from JSON fallback`);
  } catch (jsonError) {
    console.error('Error loading airport data from JSON:', jsonError);
    console.error('No airport data available - all lookups will fail');
  }
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
  
  console.log(`Processing booking: ${booking_id}, status: ${status}, date: ${date}`);
  
  // Only process confirmed bookings
  if (status !== 'confirmed') {
    console.log(`❌ Booking ${booking_id} rejected: status is ${status}, not confirmed`);
    return false;
  }
  
  // More flexible date validation - accept bookings from today or recent dates
  const bookingDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset times to compare dates only
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);
  
  console.log(`Date comparison: booking=${bookingDate.toISOString()}, today=${today.toISOString()}, yesterday=${yesterday.toISOString()}`);
  
  if (bookingDate.getTime() < yesterday.getTime() || bookingDate.getTime() > today.getTime()) {
    console.log(`❌ Booking ${booking_id} rejected: date ${date} is not from today or yesterday`);
    return false;
  }
  
  // Look up airport data
  console.log(`Looking up airport: ${arrival.airport}`);
  console.log(`Total airports loaded: ${Object.keys(airportData).length}`);
  console.log(`Sample airport codes: ${Object.keys(airportData).slice(0, 5).join(', ')}`);
  
  const airportInfo = airportData[arrival.airport];
  if (!airportInfo) {
    console.log(`❌ Unknown airport code: ${arrival.airport}`);
    console.log(`Available codes starting with J: ${Object.keys(airportData).filter(code => code.startsWith('J')).slice(0, 10).join(', ')}`);
    return false;
  }
  
  console.log(`✅ Found airport: ${airportInfo.airport} in ${airportInfo.country}`);
  
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
    
    // Handle Slack URL verification challenge
    if (req.body.type === 'url_verification') {
      return res.json({ challenge: req.body.challenge });
    }
    
    // Handle Slack events
    if (req.body.type === 'event_callback') {
      const event = req.body.event;
      
      // Only process message events
      if (event.type !== 'message' || event.subtype) {
        return res.json({ status: 'ignored', reason: 'Not a regular message' });
      }
      
      // Extract message text
      const messageText = event.text || '';
      
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
        return res.json({ status: 'ignored', reason: 'Invalid JSON format' });
      }
      
      // Validate booking data structure
      if (!bookingData.booking_id || !bookingData.arrival?.airport || !bookingData.date || !bookingData.status) {
        console.log('Invalid booking data structure:', bookingData);
        return res.json({ status: 'ignored', reason: 'Invalid booking format' });
      }
      
      // Process the booking
      const processed = processBooking(bookingData);
      
      if (processed) {
        console.log(`✅ Processed booking: ${bookingData.booking_id} → ${bookingData.arrival.airport}`);
        const airportInfo = airportData[bookingData.arrival.airport];
        
        res.json({ 
          status: 'processed', 
          booking: bookingData,
          totalBookings: dailyData.totalBookings,
          destination: `${bookingData.arrival.airport} - ${airportInfo?.airport}`,
          country: airportInfo?.country
        });
      } else {
        console.log(`❌ Booking not processed: ${bookingData.booking_id}`);
        res.json({ 
          status: 'not_processed', 
          booking: bookingData,
          reason: 'Booking must be confirmed status and from today'
        });
      }
    } else {
      // Not an event we care about
      res.json({ status: 'ignored', reason: 'Not a message event' });
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