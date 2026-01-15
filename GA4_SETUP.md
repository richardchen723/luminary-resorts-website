# GA4 Setup Instructions

## Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Admin" (gear icon)
3. In the "Property" column, click "Create Property"
4. Enter property name: "Luminary Resorts"
5. Select timezone: Central Time (US & Canada)
6. Select currency: USD
7. Click "Next" and complete the setup
8. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

## Step 2: Add Measurement ID to Environment Variables (Optional)

Your GA4 Measurement ID is already hardcoded in the component: `G-VVQZVV2FTS`

**Optional:** If you want to override it via environment variable:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new variable:
   - **Name:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value:** `G-VVQZVV2FTS` (or a different ID if needed)
   - **Environment:** Production, Preview, Development (select all)
4. Save the variable

**Note:** The component will use `G-VVQZVV2FTS` by default if no environment variable is set.

## Step 3: Verify GA4 is Working

After deployment:

1. Visit your website
2. Open browser DevTools → Network tab
3. Filter for "gtag" or "collect"
4. You should see requests to `google-analytics.com`
5. In GA4, go to Reports → Realtime to see live traffic

## Step 4: Test Event Tracking

The following events are automatically tracked:

- **view_stay** - When user views a cabin page
  - Parameters: `cabin_slug`, `page_path`
  
- **select_dates** - When user selects check-in date
  - Parameters: `cabin_slug`, `check_in`
  
- **view_pricing** - When pricing is calculated/displayed
  - Parameters: `cabin_slug`, `nights`
  
- **start_checkout** - When user clicks "Book Now"
  - Parameters: `cabin_slug`, `total`
  
- **reservation_confirmed** - When booking is completed
  - Parameters: `cabin_slug`, `booking_id`

### Testing Events

1. Visit a cabin page (e.g., `/stay/dew`)
2. Select dates in the booking widget
3. View pricing
4. Click "Book Now"
5. Complete a test booking
6. Check GA4 → Reports → Realtime → Events to see events firing

## Step 5: Set Up Custom Reports (Optional)

### Booking Funnel Report

1. Go to GA4 → Explore → Create new exploration
2. Choose "Funnel exploration"
3. Add steps:
   - Step 1: `view_stay`
   - Step 2: `select_dates`
   - Step 3: `view_pricing`
   - Step 4: `start_checkout`
   - Step 5: `reservation_confirmed`
4. Save the report

### Cabin Performance Report

1. Go to GA4 → Explore → Create new exploration
2. Choose "Free form"
3. Add dimensions: `cabin_slug`
4. Add metrics: Event count, Users
5. Filter by event name: `view_stay`
6. Save the report

## Troubleshooting

### Events Not Showing

1. **Check Measurement ID:**
   - Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in Vercel
   - Check browser console for errors

2. **Check Ad Blockers:**
   - Disable ad blockers when testing
   - Some browsers block GA4 by default

3. **Check Network Requests:**
   - Open DevTools → Network
   - Look for requests to `google-analytics.com/g/collect`
   - Check response status (should be 200 or 204)

4. **Verify Script Loading:**
   - Check page source for GA4 script tag
   - Verify `window.gtag` is defined in console

### Common Issues

- **Events firing multiple times:** Check for duplicate GA4 components
- **Events not persisting:** Wait 24-48 hours for data to appear in standard reports
- **Realtime not showing:** Check that you're in the correct GA4 property

## Next Steps

1. Set up conversion events in GA4:
   - Mark `reservation_confirmed` as a conversion event
   - Set up goals for booking funnel completion

2. Create custom audiences:
   - Users who viewed pricing but didn't book
   - Users who started checkout but didn't complete

3. Set up data retention:
   - Go to Admin → Data Settings → Data Retention
   - Set to 14 months (maximum)

4. Link GA4 to Google Search Console:
   - Go to Admin → Search Console Links
   - Link your Search Console property
