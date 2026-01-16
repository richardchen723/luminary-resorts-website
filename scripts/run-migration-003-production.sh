#!/bin/bash
# Script to run Migration 003 on production database
# Usage: POSTGRES_URL="your_production_connection_string" ./scripts/run-migration-003-production.sh

set -e

if [ -z "$POSTGRES_URL" ]; then
  echo "❌ Error: POSTGRES_URL environment variable is required"
  echo ""
  echo "Usage:"
  echo "  POSTGRES_URL='your_production_connection_string' ./scripts/run-migration-003-production.sh"
  echo ""
  echo "To get your production POSTGRES_URL:"
  echo "  1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables"
  echo "  2. Copy the POSTGRES_URL value for Production"
  echo "  3. Run this script with that URL"
  exit 1
fi

echo "🚀 Running Migration 003: Affiliate Marketing System on production database..."
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo "❌ Error: psql is not installed"
  echo "Install PostgreSQL client tools to use this script"
  echo "Or use the migration API endpoint instead"
  exit 1
fi

# Run the migration SQL file
psql "$POSTGRES_URL" -f lib/db/migrations/003_affiliate_marketing.sql

echo ""
echo "✅ Migration 003 completed successfully!"
echo ""
echo "Verifying tables..."
psql "$POSTGRES_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('admin_users', 'influencers', 'incentive_rules', 'booking_attributions', 'commission_ledger', 'incentive_audit_log') ORDER BY table_name;"

echo ""
echo "🎉 Migration verification complete!"
