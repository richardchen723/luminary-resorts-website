# Calendar Sync Recommendation: API vs iCal

## Current Implementation

The website currently uses **Hostaway Calendar API** to check availability:
- Primary method: Pricing API (`getPricing()`) - checks if pricing is available
- Fallback method: Calendar API (`getCalendarAvailability()`) - checks date-by-date availability

## Recommendation: **Use Hostaway Calendar API** ✅

### Why Calendar API is Better for Website Availability

1. **Real-time Data** ⚡
   - Calendar API provides near real-time availability
   - No sync delay (unlike iCal which syncs every 30-60 minutes)

2. **Already Implemented** ✅
   - `getCalendarAvailability()` function already exists
   - Currently used as fallback, but works reliably
   - No additional setup needed

3. **More Reliable** 🎯
   - Direct API call = immediate response
   - No parsing required (unlike iCal format)
   - Better error handling

4. **Includes Pricing** 💰
   - Can get pricing data along with availability
   - Single API call for both pieces of information

5. **Better Performance** 🚀
   - Can cache API responses
   - No need to download and parse entire calendar files
   - Only fetches date ranges needed

### Why NOT Use iCal Import

1. **Sync Delay** ⏱️
   - Hostaway exports iCal every 60-180 minutes
   - Not suitable for real-time availability checks
   - Users might see outdated availability

2. **Full Calendar Download** 📥
   - Would need to download entire calendar
   - Parse iCal format
   - Store and update regularly
   - More complex implementation

3. **Redundant** 🔄
   - Calendar API already provides the same data
   - iCal would duplicate functionality
   - More maintenance overhead

## Recommended Approach

### Use Calendar API as Primary Method

Update `lib/availability.ts` to use Calendar API as the primary method:

```typescript
// Primary: Use Calendar API for accurate availability
const calendar = await getCalendarAvailability(listingId, startDate, endDate)

// Check if all dates in range are available
const dateRange = getDateRange(startDate, endDate)
isAvailable = dateRange.every((date) => {
  const entry = calendar[date]
  return entry?.available === 1
})

// Fallback: Use Pricing API for pricing information
const pricing = await getPricing(listingId, startDate, endDate, guests)
```

### Two-Way Sync Strategy

**Website → Hostaway (iCal Export)** ✅ Already implemented
- Our bookings → iCal feed → Hostaway imports
- Blocks dates in Hostaway calendar
- Use: `/api/ical/[listingId]`

**Hostaway → Website (Calendar API)** ✅ Already implemented
- Hostaway calendar → API calls → Website availability
- Shows real-time availability on website
- Use: `getCalendarAvailability()`

## Implementation Plan

### Option 1: Improve Current Implementation (Recommended)

1. **Make Calendar API Primary**
   - Update `checkCabinAvailability()` to use Calendar API first
   - Use Pricing API only for pricing information
   - Better accuracy for availability checks

2. **Add Caching**
   - Cache calendar responses for 5-10 minutes
   - Reduce API calls
   - Improve performance

3. **Better Error Handling**
   - Handle empty calendar responses
   - Fallback to pricing API if calendar fails
   - Log errors for monitoring

### Option 2: Hybrid Approach (If Calendar API is Unreliable)

1. **Use Calendar API for Real-time Checks**
   - Primary method for availability queries
   - Fast, real-time responses

2. **Use iCal Import for Backup**
   - Periodic sync (every hour)
   - Store in database
   - Use if API fails
   - More complex but more resilient

## Current Status

✅ **Calendar API**: Working (used as fallback)
✅ **iCal Export**: Implemented (for pushing bookings to Hostaway)
❓ **iCal Import**: Not needed (Calendar API is better)

## Conclusion

**Use Hostaway Calendar API** for syncing calendar data to your website. It's:
- Already implemented
- Real-time
- More reliable
- Better performance
- Includes pricing data

**Use iCal Export** (already done) for pushing your bookings to Hostaway.

**Don't use iCal Import** for website availability - Calendar API is superior for this use case.
