-- Migration 006: Website-to-SMS inquiry tracking and idempotency

CREATE TABLE IF NOT EXISTS website_text_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key UUID UNIQUE NOT NULL,
  request_fingerprint CHAR(64) NOT NULL,
  client_ip_hash CHAR(64) NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(30) NOT NULL,
  listing_slug VARCHAR(100) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL,
  pets INTEGER NOT NULL DEFAULT 0,
  infants INTEGER NOT NULL DEFAULT 0,
  message TEXT NOT NULL DEFAULT '',
  source_path TEXT NOT NULL DEFAULT '/',
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'ready', 'failed')),
  hostaway_reservation_id BIGINT,
  hostaway_conversation_id BIGINT,
  sms_message_id BIGINT,
  sms_status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_text_inquiries_phone_created
ON website_text_inquiries(guest_phone, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_text_inquiries_ip_created
ON website_text_inquiries(client_ip_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_text_inquiries_hostaway_reservation
ON website_text_inquiries(hostaway_reservation_id);
