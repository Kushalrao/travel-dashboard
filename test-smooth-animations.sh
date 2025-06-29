#!/bin/bash

echo "🎬 Smooth Animation System Tester"
echo "=================================="
echo "Testing tile loading + airplane markers"
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
    
    echo "⏱️  Waiting 3 seconds before next booking..."
    sleep 3
}

echo "🌍 Testing smooth animations across different continents..."
echo "📍 Each animation should:"
echo "   1. Wait for tiles to load during zoom-in"
echo "   2. Show airplane marker for 3 seconds"
echo "   3. Wait for tiles to load during zoom-out"
echo "   4. Pre-cache tiles for next booking in queue"
echo

# Send bookings to test the system
send_booking "SMOOTH001" "LHR" "London Heathrow (Europe)"
send_booking "SMOOTH002" "NRT" "Tokyo Narita (Asia)"
send_booking "SMOOTH003" "LAX" "Los Angeles (North America)"
send_booking "SMOOTH004" "SYD" "Sydney (Australia)"

echo
echo "🎯 All test bookings sent!"
echo "📱 Visit dashboard: https://travel-dashboard-gold.vercel.app"
echo
echo "🔍 Expected behavior:"
echo "   - Smooth zoom animations (no blank tiles)"
echo "   - Airplane markers always visible"
echo "   - ~7+ seconds per animation"
echo "   - Queue processes in order"
echo
echo "🐛 Check browser console for debug logs:"
echo "   - Tile loading confirmations"
echo "   - Animation step progress"
echo "   - Pre-caching status" 