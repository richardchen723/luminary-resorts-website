-- Migration 005: Coupon codes
-- Adds coupon management and redemption tracking for checkout discounts

CREATE TABLE IF NOT EXISTS coupon_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(32) UNIQUE NOT NULL,
  normalized_code VARCHAR(32) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percent')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  expires_at TIMESTAMP WITH TIME ZONE,
  usage_mode VARCHAR(20) NOT NULL DEFAULT 'single_use' CHECK (usage_mode IN ('single_use', 'multi_use')),
  max_redemptions INTEGER CHECK (max_redemptions IS NULL OR max_redemptions > 0),
  redemptions_count INTEGER NOT NULL DEFAULT 0 CHECK (redemptions_count >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_codes_normalized_code ON coupon_codes(normalized_code);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_active ON coupon_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_expires_at ON coupon_codes(expires_at);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupon_codes(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'redeemed', 'released')),
  coupon_code VARCHAR(32) NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('fixed', 'percent')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id ON coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_guest_email ON coupon_redemptions(guest_email);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_status ON coupon_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_booking_id ON coupon_redemptions(booking_id);

DROP TRIGGER IF EXISTS update_coupon_codes_updated_at ON coupon_codes;

CREATE TRIGGER update_coupon_codes_updated_at BEFORE UPDATE ON coupon_codes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
