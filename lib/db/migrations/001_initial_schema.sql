-- Initial database schema for Luminary Resorts booking system
-- PostgreSQL schema

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  hostaway_reservation_id INTEGER UNIQUE,
  listing_id INTEGER NOT NULL,
  listing_map_id INTEGER NOT NULL,
  slug VARCHAR(50) NOT NULL,
  
  -- Guest information
  guest_first_name VARCHAR(100) NOT NULL,
  guest_last_name VARCHAR(100) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50) NOT NULL,
  guest_address TEXT,
  guest_city VARCHAR(100),
  guest_state VARCHAR(50),
  guest_zip_code VARCHAR(20),
  guest_country VARCHAR(2) NOT NULL DEFAULT 'US',
  
  -- Booking details
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  number_of_guests INTEGER NOT NULL,
  adults INTEGER NOT NULL,
  children INTEGER,
  infants INTEGER,
  pets INTEGER,
  
  -- Pricing
  total_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  nightly_rate DECIMAL(10, 2) NOT NULL,
  cleaning_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  channel_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Status
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'refunded')),
  reservation_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (reservation_status IN ('pending', 'confirmed', 'cancelled', 'modified')),
  
  -- Metadata
  stripe_metadata JSONB,
  hostaway_metadata JSONB,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Booking modifications table (for tracking changes)
CREATE TABLE IF NOT EXISTS booking_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  modification_type VARCHAR(20) NOT NULL CHECK (modification_type IN ('created', 'modified', 'cancelled')),
  changes JSONB NOT NULL,
  modified_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Calendar cache table (for caching Hostaway calendar data)
CREATE TABLE IF NOT EXISTS calendar_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id INTEGER NOT NULL,
  date DATE NOT NULL,
  available BOOLEAN NOT NULL,
  price DECIMAL(10, 2),
  currency VARCHAR(3),
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  UNIQUE(listing_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent_id ON bookings(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hostaway_reservation_id ON bookings(hostaway_reservation_id);
CREATE INDEX IF NOT EXISTS idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_slug ON bookings(slug);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings(guest_email);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(listing_id, arrival_date, departure_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_reservation_status ON bookings(reservation_status);

CREATE INDEX IF NOT EXISTS idx_booking_modifications_booking_id ON booking_modifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_created_at ON booking_modifications(created_at);

CREATE INDEX IF NOT EXISTS idx_calendar_cache_listing_date ON calendar_cache(listing_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_cache_expires_at ON calendar_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_calendar_cache_listing_available ON calendar_cache(listing_id, available, date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
