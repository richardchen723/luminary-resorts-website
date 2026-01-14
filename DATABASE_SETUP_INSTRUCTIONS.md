# Database Setup Instructions

Follow these steps to set up your database for data persistence.

## Step 1: Run Database Migrations

### Migration 1: Initial Schema

1. Open your database dashboard (Neon, Supabase, etc.)
2. Go to **SQL Editor** or **Query** tab
3. Copy the entire contents of `lib/db/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run** or **Execute**
6. Verify success (should show "Success" or no errors)

### Migration 2: Calendar Reservations

1. In the same SQL Editor
2. Copy the entire contents of `lib/db/migrations/002_add_calendar_reservations.sql`
3. Paste into the SQL editor
4. Click **Run** or **Execute**
5. Verify success

### Verify Migrations

Run the verification script:
1. Open `scripts/verify-database-setup.sql`
2. Copy and run it in your database SQL editor
3. Check that all tables and columns exist

## Step 2: Verify Environment Variable

### Check in Vercel Dashboard:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `POSTGRES_URL` (or `DATABASE_URL`) is set
3. It should be set for: Production, Preview, Development

### Check via CLI:
```bash
vercel env ls
```

Look for `POSTGRES_URL` or `DATABASE_URL` in the output.

## Step 3: Redeploy Application

After setting up the database and environment variables, redeploy:

```bash
vercel --prod
```

Or trigger a redeploy from Vercel Dashboard.

## Step 4: Test Data Persistence

### Test 1: Calendar Cache
1. Visit a cabin detail page: `https://your-site.vercel.app/stay/dew`
2. Calendar should load
3. Check database:
   ```sql
   SELECT COUNT(*) FROM calendar_cache;
   ```
   Should show rows if calendar sync is working.

### Test 2: Booking Creation
1. Complete a test booking with Stripe test card
2. Check database:
   ```sql
   SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1;
   ```
   Should show the booking record.

### Test 3: Check Function Logs
- Vercel Dashboard → Deployments → Latest → Functions tab
- Look for database errors
- Should see successful database operations

## Troubleshooting

### Database Connection Errors

If you see "Database is not configured":
- Verify `POSTGRES_URL` is set in Vercel environment variables
- Redeploy after adding the variable
- Check the connection string is correct

### Migration Errors

If migrations fail:
- Check database permissions
- Verify you're using PostgreSQL (not MySQL or SQLite)
- Check for syntax errors in SQL

### Data Not Persisting

If data isn't being saved:
1. Verify tables exist (run verification script)
2. Check function logs for errors
3. Verify environment variable is set correctly
4. Test database connection manually

## Quick Checklist

- [ ] Migration 001 executed successfully
- [ ] Migration 002 executed successfully
- [ ] Tables verified (bookings, calendar_cache, booking_modifications)
- [ ] `POSTGRES_URL` set in Vercel environment variables
- [ ] Application redeployed
- [ ] Calendar cache working (data in `calendar_cache` table)
- [ ] Booking creation working (data in `bookings` table)
