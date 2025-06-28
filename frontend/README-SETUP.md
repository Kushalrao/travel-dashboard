# 🌍 Travel Dashboard Frontend Setup

This is the React frontend for the Travel Booking Dashboard that provides real-time visualization of booking data with interactive charts and Google Maps integration.

## 🚀 Features

- **Real-time Dashboard**: Live booking statistics with auto-refresh every 30 seconds
- **Interactive Charts**: Bar charts and doughnut charts for data visualization
- **Google Maps Integration**: Interactive map with custom markers showing booking counts
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Live Data**: Connects to your Node.js backend API for real-time updates

## 📋 Prerequisites

1. **Backend Server**: Make sure your Node.js backend is running on port 3000
2. **Google Maps API Key** (optional but recommended for full functionality)

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Google Maps (Optional)

To enable the interactive Google Maps feature:

1. **Get a Google Maps API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Maps JavaScript API"
   - Create credentials (API Key)
   - Copy your API key

2. **Configure Environment Variables**:
   ```bash
   # Create a .env file in the frontend directory
   echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here" > .env
   ```

   Replace `your_api_key_here` with your actual Google Maps API key.

### 3. Start the Development Server
```bash
npm start
```

The frontend will open at `http://localhost:3001` (or the next available port).

## 🗺️ Google Maps Setup (Detailed)

### Getting Your API Key

1. **Visit Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: Create a new project or select existing
3. **Enable APIs**: 
   - Navigate to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"
4. **Create Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated key

### Security (Important!)

For production, restrict your API key:
1. In Google Cloud Console, go to "Credentials"
2. Click on your API key
3. Under "Application restrictions", select "HTTP referrers"
4. Add your domain (e.g., `https://yourdomain.com/*`)

### Free Tier Limits

Google Maps offers $200 free credit monthly, which covers:
- ~28,000 map loads per month
- Plenty for development and small-scale production

## 🎨 Dashboard Features

### Without Google Maps API Key
- **Dashboard Analytics**: Full statistics and charts
- **Location List**: Text-based list of booking locations
- **Setup Instructions**: Clear guidance to enable maps

### With Google Maps API Key
- **Interactive Map**: Full Google Maps with custom markers
- **Booking Markers**: Circular markers showing booking counts
- **Info Windows**: Click markers for detailed location info
- **Auto-fitting**: Map automatically adjusts to show all locations

## 📊 Dashboard Components

### Key Metrics Cards
- Total bookings today
- Top airport
- Top country  
- Top continent

### Charts
- **Bar Chart**: Top destination airports
- **Doughnut Chart**: Bookings by continent

### Top Lists
- Top 5 countries with booking counts
- Top 5 airports with details

### Live Map
- Custom markers with booking counts
- Clickable info windows
- Auto-refresh with new data

## 🔄 Data Flow

1. **Backend API**: Fetches data from `http://localhost:3000/api/`
2. **Auto-refresh**: Updates every 30 seconds
3. **Error Handling**: Graceful fallbacks if backend is offline
4. **Loading States**: Smooth loading indicators

## 🎯 API Endpoints Used

- `GET /api/dashboard` - Main dashboard statistics
- `GET /api/map` - Location data for map markers

## 🛠️ Development

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.js      # Main dashboard component
│   │   └── MapComponent.js   # Google Maps integration
│   ├── App.js               # Main app component
│   ├── App.css              # Styling
│   └── index.js             # React entry point
├── public/
└── package.json
```

### Styling
- Modern CSS with gradients and animations
- Responsive design for all screen sizes
- Glass-morphism effects with backdrop blur
- Smooth hover transitions and loading states

### Dependencies
- **React**: Frontend framework
- **Chart.js + react-chartjs-2**: Charts and visualizations
- **@googlemaps/react-wrapper**: Google Maps integration
- **Axios**: HTTP client for API calls

## 🚨 Troubleshooting

### Backend Connection Issues
- Ensure backend server is running on port 3000
- Check CORS configuration in backend
- Verify API endpoints are accessible

### Google Maps Not Loading
- Check API key is correctly set in `.env`
- Verify Maps JavaScript API is enabled
- Check browser console for API errors
- Ensure API key has proper permissions

### Charts Not Displaying
- Verify Chart.js is properly imported
- Check data format from backend API
- Look for console errors

## 🌟 Next Steps

1. **Test with Sample Data**: Use the backend's test endpoint to create sample bookings
2. **Customize Styling**: Modify `App.css` to match your brand
3. **Add Features**: Consider adding filters, date ranges, or export functionality
4. **Deploy**: Deploy to Netlify, Vercel, or your preferred hosting platform

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify backend server is running and accessible
3. Ensure all dependencies are installed
4. Check API key configuration for Google Maps

Happy coding! 🚀 