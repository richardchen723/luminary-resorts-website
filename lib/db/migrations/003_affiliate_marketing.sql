-- Migration 003: Affiliate Marketing System
-- Creates tables for influencer/affiliate marketing, admin users, and commission tracking

-- Admin Users (authentication + authorization)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended')),
  approved_by UUID REFERENCES admin_users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_approval_status ON admin_users(approval_status);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- Influencers
CREATE TABLE IF NOT EXISTS influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  instagram_handle VARCHAR(100),
  tiktok_handle VARCHAR(100),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_influencers_referral_code ON influencers(referral_code);
CREATE INDEX IF NOT EXISTS idx_influencers_status ON influencers(status);
CREATE INDEX IF NOT EXISTS idx_influencers_email ON influencers(email);

-- Incentive Rules (one active per influencer, with history)
CREATE TABLE IF NOT EXISTS incentive_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  guest_discount_type VARCHAR(20) NOT NULL CHECK (guest_discount_type IN ('percent', 'fixed')),
  guest_discount_value DECIMAL(10, 2) NOT NULL CHECK (guest_discount_value >= 0),
  influencer_commission_type VARCHAR(20) NOT NULL CHECK (influencer_commission_type IN ('percent', 'fixed')),
  influencer_commission_value DECIMAL(10, 2) NOT NULL CHECK (influencer_commission_value >= 0),
  effective_start_date DATE,
  effective_end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Partial unique index to ensure only one active incentive per influencer
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_incentive 
ON incentive_rules(influencer_id) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_incentive_rules_influencer_id ON incentive_rules(influencer_id);
CREATE INDEX IF NOT EXISTS idx_incentive_rules_active ON incentive_rules(influencer_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_incentive_rules_dates ON incentive_rules(effective_start_date, effective_end_date);

-- Booking Attribution (links bookings to influencers)
CREATE TABLE IF NOT EXISTS booking_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id),
  referral_code VARCHAR(50) NOT NULL,
  guest_discount_applied DECIMAL(10, 2) NOT NULL DEFAULT 0,
  guest_discount_type VARCHAR(20) NOT NULL,
  commission_owed DECIMAL(10, 2) NOT NULL DEFAULT 0,
  commission_type VARCHAR(20) NOT NULL,
  revenue_basis DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(booking_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_attributions_booking_id ON booking_attributions(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_attributions_influencer_id ON booking_attributions(influencer_id);
CREATE INDEX IF NOT EXISTS idx_booking_attributions_created_at ON booking_attributions(created_at);

-- Commission Ledger (tracks owed vs paid)
CREATE TABLE IF NOT EXISTS commission_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_attribution_id UUID NOT NULL REFERENCES booking_attributions(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'owed' CHECK (status IN ('owed', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  paid_by UUID REFERENCES admin_users(id),
  payout_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commission_ledger_attribution_id ON commission_ledger(booking_attribution_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_influencer_id ON commission_ledger(influencer_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_status ON commission_ledger(status);

-- Audit Log (minimal - who changed incentives)
CREATE TABLE IF NOT EXISTS incentive_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES influencers(id),
  incentive_rule_id UUID REFERENCES incentive_rules(id),
  action VARCHAR(50) NOT NULL,
  changed_by UUID NOT NULL REFERENCES admin_users(id),
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incentive_audit_log_influencer_id ON incentive_audit_log(influencer_id);
CREATE INDEX IF NOT EXISTS idx_incentive_audit_log_created_at ON incentive_audit_log(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencers_updated_at BEFORE UPDATE ON influencers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incentive_rules_updated_at BEFORE UPDATE ON incentive_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_ledger_updated_at BEFORE UPDATE ON commission_ledger
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initialize owner user (yunhang.chen@gmail.com)
-- This will be idempotent - if owner already exists, it won't create a duplicate
INSERT INTO admin_users (email, name, role, approval_status, approved_at)
VALUES ('yunhang.chen@gmail.com', 'Yunhang Chen', 'owner', 'approved', NOW())
ON CONFLICT (email) DO UPDATE
SET role = 'owner', approval_status = 'approved'
WHERE admin_users.email = 'yunhang.chen@gmail.com';
