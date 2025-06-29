#!/bin/bash

echo "🎬 Travel Dashboard Animation Tester"
echo "====================================="
echo

# Base URL
URL="https://travel-dashboard-gold.vercel.app/api/slack-webhook"

# Function to send a booking
send_booking() {
    local booking_id=$1
    local airport=$2
    local airport_name=$3
    
    echo "✈️  Sending booking $booking_id to $airport ($airport_name)..."
    
    curl -s -X POST "$URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"type\": \"event_callback\",
        \"event\": {
          \"type\": \"message\",
          \"text\": \"{\\\"booking_id\\\": \\\"$booking_id\\\", \\\"arrival\\\": {\\\"airport\\\": \\\"$airport\\\"}, \\\"date\\\": \\\"$(date +%Y-%m-%d)\\\", \\\"status\\\": \\\"confirmed\\\"}\"
        }
      }" | jq -r '.status + " - " + .destination'
    
    echo "⏱️  Waiting 5 seconds before next booking..."
    sleep 5
}

echo "🌍 Sending bookings to different continents for animation demo..."
echo

# Send bookings to different continents
send_booking "DEMO001" "JFK" "New York JFK"
send_booking "DEMO002" "LHR" "London Heathrow" 
send_booking "DEMO003" "NRT" "Tokyo Narita"
send_booking "DEMO004" "SYD" "Sydney Airport"
send_booking "DEMO005" "CAI" "Cairo Airport"

echo
echo "🎯 All bookings sent! Check your dashboard at:"
echo "   https://travel-dashboard-gold.vercel.app"
echo
echo "🔄 You can also check recent bookings directly:"
echo "   curl https://travel-dashboard-gold.vercel.app/api/recent-bookings | jq '.'" 