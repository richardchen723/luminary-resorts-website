# Run Database Migrations

The migration API endpoint has been deployed! Here's how to run it:

## Option 1: Via Browser (Easiest)

1. **Get your production URL:**
   ```bash
   vercel ls --prod
   ```
   Look for the latest production deployment URL.

2. **Open the migration endpoint in your browser:**
   ```
   https://your-deployment-url.vercel.app/api/migrations/run
   ```
   
   Example:
   ```
   https://luminary-resorts-ui-2-armxcjg3l-richardchen-6494s-projects.vercel.app/api/migrations/run
   ```

3. **You'll be prompted to authenticate with Vercel** - click through the authentication

4. **The migration will run automatically** - you should see a JSON response with results

## Option 2: Via cURL (After Authentication)

If you have a bypass token, you can use:

```bash
curl -X POST "https://your-deployment-url.vercel.app/api/migrations/run?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_BYPASS_TOKEN"
```

## What the Migration Does

The endpoint will:
1. ✅ Create `bookings` table
2. ✅ Create `booking_modifications` table  
3. ✅ Create `calendar_cache` table
4. ✅ Add indexes for performance
5. ✅ Add `minimum_stay` and `reservations` columns to `calendar_cache`
6. ✅ Verify all tables were created

## Expected Response

On success, you'll see:
```json
{
  "success": true,
  "message": "Migrations completed",
  "results": [
    "✅ Migration 001 completed successfully",
    "✅ Migration 002 completed successfully",
    "✅ Verified tables: bookings, booking_modifications, calendar_cache"
  ]
}
```

## Verify Migrations Worked

After running migrations, verify in your database:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should show:
- `bookings`
- `booking_modifications`
- `calendar_cache`

## Troubleshooting

**If you get authentication errors:**
- Make sure you're logged into Vercel
- Try accessing the URL directly in your browser
- The browser will handle Vercel authentication automatically

**If migrations fail:**
- Check Vercel function logs for detailed error messages
- Verify `POSTGRES_URL` is set correctly in environment variables
- Ensure your database allows connections from Vercel

## After Migrations

Once migrations are complete:
1. ✅ Your database is ready
2. ✅ Data will persist automatically
3. ✅ Test by visiting a cabin page (calendar should cache)
4. ✅ Test by completing a booking (should save to database)
