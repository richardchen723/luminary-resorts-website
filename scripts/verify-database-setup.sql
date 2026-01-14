-- Database Setup Verification Script
-- Run this in your database SQL editor to verify everything is set up correctly

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected output:
-- booking_modifications
-- bookings
-- calendar_cache

-- 2. Check bookings table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- 3. Check calendar_cache has the new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'calendar_cache'
AND column_name IN ('minimum_stay', 'reservations');

-- Expected: minimum_stay (integer), reservations (jsonb)

-- 4. Check indexes exist
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('bookings', 'calendar_cache', 'booking_modifications')
ORDER BY tablename, indexname;

-- 5. Test insert (will be rolled back)
BEGIN;
INSERT INTO calendar_cache (listing_id, date, available, price, currency, cached_at, expires_at)
VALUES (999999, CURRENT_DATE, true, 100.00, 'USD', NOW(), NOW() + INTERVAL '1 day');
ROLLBACK;

-- If all above queries work, your database is set up correctly!
