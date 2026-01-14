# iCal Calendar Sync Setup for Hostaway

## Overview

This system generates iCal (iCalendar) feeds that Hostaway can import to automatically block dates based on bookings made through our Stripe payment system.

## How It Works

1. **Booking Created**: When a booking is created via Stripe payment, it's stored in our local database
2. **iCal Feed Generated**: Our API endpoint generates an iCal feed with blocked dates
3. **Hostaway Syncs**: Hostaway imports the iCal feed every 30-60 minutes
4. **Dates Blocked**: Booked dates appear as blocked in Hostaway calendar

## Setup Instructions

### Step 1: Get iCal URL for Each Listing

Each cabin has its own iCal feed URL:

- **Dew** (Listing ID: 472341): `https://yourdomain.com/api/ical/472341`
- **Sol** (Listing ID: 472340): `https://yourdomain.com/api/ical/472340`
- **Mist** (Listing ID: 472339): `https://yourdomain.com/api/ical/472339`
- **Moss** (Listing ID: 472338): `https://yourdomain.com/api/ical/472338`

### Step 2: Configure in Hostaway Dashboard

1. Log in to your Hostaway account
2. Navigate to **Channel Manager > Channels**
3. Click **Configure** for **Custom iCal**
4. For each listing:
   - Select the listing you want to map
   - Click **+ Add new**
   - Enter the iCal URL: `https://yourdomain.com/api/ical/[listingId]`
   - Provide a channel name (e.g., "Luminary Resorts Website")
   - Add description: "Direct bookings from our website"
   - Configure filters (optional):
     - Ignore events with specific phrases if needed
   - Click **Save**

### Step 3: Verify Sync

1. Create a test booking through your website
2. Wait 30-60 minutes for Hostaway to sync
3. Check Hostaway calendar - the dates should appear as blocked
4. Verify the blocked dates match your booking

## iCal Format Details

The iCal feed includes:
- **Event Type**: Blocked dates (not available for booking)
- **Summary**: "Blocked - [Cabin Name]"
- **Description**: Guest name (if available)
- **Date Range**: Start date to end date (exclusive)

## Sync Frequency

- **Hostaway Import**: Every 30-60 minutes
- **Our Feed Cache**: 5 minutes (to reduce server load)
- **Real-time Updates**: Not available (limited by Hostaway sync frequency)

## Testing

### Test iCal Feed Locally

```bash
# Test Dew cabin iCal feed
curl http://localhost:3000/api/ical/472341

# Should return iCal format:
# BEGIN:VCALENDAR
# VERSION:2.0
# ...
```

### Test in Calendar App

1. Copy the iCal URL
2. Add to Google Calendar, Apple Calendar, or Outlook
3. Verify events appear correctly
4. Check date ranges and formatting

## Troubleshooting

### Dates Not Appearing in Hostaway

1. **Check iCal URL**: Verify the URL is accessible and returns valid iCal format
2. **Check Hostaway Configuration**: Ensure the iCal connection is active
3. **Wait for Sync**: Hostaway syncs every 30-60 minutes, not real-time
4. **Check Filters**: Verify Hostaway isn't filtering out events
5. **Check Logs**: Review server logs for errors generating iCal feed

### Invalid iCal Format

1. **Validate Format**: Use an iCal validator to check the output
2. **Check Date Format**: Ensure dates are in YYYYMMDD format (no dashes)
3. **Check Escaping**: Special characters should be properly escaped
4. **Check Line Endings**: Should use `\r\n` (CRLF) line endings

### Database Connection Issues

1. **Check Database**: Ensure database is accessible
2. **Check Query**: Verify bookings are being retrieved correctly
3. **Check Logs**: Review error logs for database connection issues

## Security Considerations

- iCal feeds are publicly accessible (required for Hostaway to import)
- No sensitive payment information is included
- Only booking dates and guest names (optional) are included
- Consider adding authentication if needed (though Hostaway may not support it)

## Future Enhancements

- Add authentication token to iCal URLs
- Support multiple calendar feeds (bookings, maintenance, etc.)
- Add webhook to trigger immediate sync (if Hostaway supports it)
- Add admin interface to view/manage iCal feeds
