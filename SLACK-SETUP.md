# 🤖 Slack Integration Setup Guide

This guide will help you set up a Slack bot to automatically send booking data to your travel dashboard.

## 🎯 Overview

The Slack integration allows your team to send booking notifications to a Slack channel, which will automatically update your dashboard with real-time data.

## 📋 Prerequisites

- Slack workspace with admin permissions
- Your travel dashboard backend running on `http://localhost:3000`
- A dedicated Slack channel for booking notifications

## 🔧 Step 1: Create a Slack App

1. **Go to Slack API**: Visit [https://api.slack.com/apps](https://api.slack.com/apps)
2. **Create New App**: Click "Create New App" → "From scratch"
3. **App Details**:
   - **App Name**: `Travel Booking Bot`
   - **Workspace**: Select your workspace
   - Click "Create App"

## ⚙️ Step 2: Configure Bot Permissions

1. **OAuth & Permissions**: In your app settings, go to "OAuth & Permissions"
2. **Scopes**: Add these Bot Token Scopes:
   - `channels:read` - Read public channel info
   - `chat:write` - Send messages
   - `incoming-webhook` - Receive webhook data

3. **Install App**: Click "Install to Workspace" and authorize

## 🔗 Step 3: Set Up Incoming Webhooks

1. **Incoming Webhooks**: Go to "Incoming Webhooks" in app settings
2. **Activate**: Turn on "Activate Incoming Webhooks"
3. **Add Webhook**: Click "Add New Webhook to Workspace"
4. **Select Channel**: Choose your booking notifications channel
5. **Copy URL**: Save the webhook URL (starts with `https://hooks.slack.com/...`)

## 📡 Step 4: Configure Your Backend

Add your Slack webhook URL to your backend environment:

```bash
# In your main project directory
echo "SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL" >> .env
```

## 🧪 Step 5: Test the Integration

### Test 1: Send a Test Message to Slack
```bash
# Test sending a message to your Slack channel
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-type: application/json' \
  -d '{"text":"🧪 Travel Dashboard Bot is connected!"}'
```

### Test 2: Send Booking Data via Slack
Post this message in your Slack channel to test:

```json
{
  "booking_id": "SLACK001",
  "arrival": {"airport": "LAX"},
  "date": "2025-06-28",
  "status": "confirmed"
}
```

## 📨 Booking Message Format

Your team should send booking notifications in this JSON format:

### ✅ Valid Booking Message
```json
{
  "booking_id": "TRV-2025-001",
  "arrival": {"airport": "DXB"},
  "date": "2025-06-28",
  "status": "confirmed"
}
```

### 📝 Message Fields
- **booking_id**: Unique identifier (string)
- **arrival.airport**: 3-letter IATA airport code
- **date**: Booking date in YYYY-MM-DD format
- **status**: Must be "confirmed" (others are ignored)

### 🌍 Supported Airports
Your dashboard supports 6,072 airports worldwide. Common examples:
- **DXB** - Dubai International Airport
- **JFK** - John F Kennedy International Airport  
- **LHR** - London Heathrow Airport
- **LAX** - Los Angeles International Airport
- **NRT** - Tokyo Narita International Airport
- **CDG** - Charles de Gaulle Airport (Paris)

## 🔄 Step 6: Update Backend for Slack Processing

The backend is already set up with a Slack webhook endpoint. To enable full processing, update the endpoint:

```javascript
// In index.js - the Slack webhook endpoint is ready
app.post('/api/slack-webhook', (req, res) => {
  // Processes Slack messages and extracts booking data
  // Validates and aggregates booking information
  // Updates dashboard counters in real-time
});
```

## 📊 Step 7: Monitor Your Dashboard

Once Slack integration is active:

1. **Real-time Updates**: Dashboard refreshes every 30 seconds
2. **Live Counters**: See booking counts update automatically  
3. **Geographic Data**: View bookings by airport, country, continent
4. **Visual Analytics**: Charts update with new booking data

## 🎯 Usage Workflow

### For Your Team:
1. **Book Travel**: Complete travel booking process
2. **Notify Slack**: Post booking JSON to designated channel
3. **Automatic Processing**: Backend processes and validates data
4. **Dashboard Update**: Data appears on dashboard within 30 seconds

### For Managers:
1. **Monitor Dashboard**: View real-time booking analytics
2. **Track Trends**: See popular destinations and booking patterns
3. **Geographic Insights**: Understand travel distribution by region

## 🚨 Troubleshooting

### Slack Messages Not Appearing on Dashboard
- ✅ Check webhook URL is correct in `.env` file
- ✅ Verify backend server is running on port 3000
- ✅ Ensure booking status is "confirmed"
- ✅ Confirm date is today's date (YYYY-MM-DD)
- ✅ Validate IATA airport code is recognized

### Invalid Airport Codes
- Use 3-letter IATA codes (not city names)
- Check [IATA airport codes](https://www.iata.org/en/publications/directories/code-search/) for valid codes
- Dashboard will ignore bookings with unrecognized airports

### Date Issues
- Only today's bookings are processed
- Use YYYY-MM-DD format exactly
- Past or future dates are automatically filtered out

## 🔐 Security Best Practices

1. **Webhook URL**: Keep your Slack webhook URL private
2. **Channel Access**: Limit booking channel to authorized team members
3. **Data Validation**: Backend validates all incoming booking data
4. **Environment Variables**: Store sensitive config in `.env` file

## 📈 Advanced Features (Optional)

### Custom Slack Commands
Set up slash commands for quick booking entry:
```
/book DXB 2025-06-28 confirmed
```

### Automated Notifications
Configure alerts for:
- High booking volume days
- New destination countries
- Booking milestones

### Integration with Travel Systems
Connect with existing travel booking platforms:
- Expedia API integration
- Corporate travel systems
- Booking confirmation emails

## 🎉 Success Metrics

Once integrated, you'll see:
- ✅ Real-time booking data flowing from Slack
- ✅ Dashboard updating automatically
- ✅ Geographic insights and analytics
- ✅ Team adoption of the notification system

---

**Ready to connect your team's travel bookings to beautiful real-time analytics!** 🚀

*Need help? Check that your backend is running and webhook URL is configured correctly.* 