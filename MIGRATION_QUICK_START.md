# Quick Start: Run Database Migrations

Your `POSTGRES_URL` is already configured in Vercel! ✅

Now you just need to run the database migrations to create the tables.

## Option 1: Use the Helper Script (Easiest)

```bash
./scripts/run-migrations.sh
```

This will copy the migration SQL to your clipboard, then you can paste it into your database SQL editor.

## Option 2: Manual Copy-Paste

### Step 1: Open Migration File
Open `lib/db/migrations/001_initial_schema.sql` in your editor.

### Step 2: Copy Entire Contents
Select all (Cmd+A) and copy (Cmd+C).

### Step 3: Paste in Database SQL Editor
1. Open your database dashboard (Neon, Supabase, etc.)
2. Go to **SQL Editor** or **Query** tab
3. Paste the SQL
4. Click **Run** or **Execute**

### Step 4: Repeat for Migration 002
Do the same for `lib/db/migrations/002_add_calendar_reservations.sql`

## Verify Migrations Worked

Run this in your database SQL editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected output:**
- `booking_modifications`
- `bookings`
- `calendar_cache`

## After Migrations: Redeploy

Once migrations are complete, redeploy your app:

```bash
vercel --prod
```

Or trigger a redeploy from Vercel Dashboard.

## Test Data Persistence

1. Visit a cabin page - calendar should load and cache data
2. Complete a test booking - should save to database
3. Check database:
   ```sql
   SELECT COUNT(*) FROM calendar_cache;
   SELECT COUNT(*) FROM bookings;
   ```
