-- Migration 002: Add reservations and minimum_stay to calendar_cache table
-- This migration adds support for storing full calendar entry data including
-- reservations and minimum stay requirements for advanced calendar status logic

-- Add minimum_stay column
ALTER TABLE calendar_cache 
ADD COLUMN IF NOT EXISTS minimum_stay INTEGER;

-- Add reservations column (JSONB to store array of reservations)
ALTER TABLE calendar_cache 
ADD COLUMN IF NOT EXISTS reservations JSONB;

-- Add index for minimum_stay queries
CREATE INDEX IF NOT EXISTS idx_calendar_cache_minimum_stay 
ON calendar_cache(listing_id, minimum_stay, date);

-- Add index for reservations queries (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_calendar_cache_reservations 
ON calendar_cache USING GIN (reservations);
