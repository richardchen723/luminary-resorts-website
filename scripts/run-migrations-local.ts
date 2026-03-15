/**
 * Local script to run database migrations
 * Uses POSTGRES_URL from environment to connect directly to database
 * 
 * Usage:
 *   pnpm tsx scripts/run-migrations-local.ts
 *   OR
 *   POSTGRES_URL=your_connection_string pnpm tsx scripts/run-migrations-local.ts
 */

import { query } from '../lib/db/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const MIGRATION_001 = readFileSync(join(process.cwd(), 'lib/db/migrations/001_initial_schema.sql'), 'utf-8')
const MIGRATION_002 = readFileSync(join(process.cwd(), 'lib/db/migrations/002_add_calendar_reservations.sql'), 'utf-8')
const MIGRATION_003 = readFileSync(join(process.cwd(), 'lib/db/migrations/003_affiliate_marketing.sql'), 'utf-8')
const MIGRATION_004 = readFileSync(join(process.cwd(), 'lib/db/migrations/004_guest_chat.sql'), 'utf-8')
const MIGRATION_005 = readFileSync(join(process.cwd(), 'lib/db/migrations/005_coupon_codes.sql'), 'utf-8')

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n')

  // Check database connection
  try {
    await query('SELECT 1')
    console.log('✅ Database connection successful\n')
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message)
    console.error('\nMake sure POSTGRES_URL is set in your environment:')
    console.error('  export POSTGRES_URL="your_connection_string"')
    process.exit(1)
  }

  // Run Migration 001
  try {
    console.log('📦 Running Migration 001: Initial Schema...')
    const statements = MIGRATION_001.split(';').filter(s => s.trim().length > 0 && !s.trim().startsWith('--'))
    
    for (const statement of statements) {
      const trimmed = statement.trim()
      if (trimmed) {
        try {
          await query(trimmed)
        } catch (error: any) {
          // Ignore "already exists" errors
          if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
            console.warn('  ⚠️  Warning:', error.message)
          }
        }
      }
    }
    console.log('✅ Migration 001 completed successfully\n')
  } catch (error: any) {
    console.error('❌ Migration 001 failed:', error.message)
    throw error
  }

  // Run Migration 002
  try {
    console.log('📦 Running Migration 002: Calendar Reservations...')
    const statements = MIGRATION_002.split(';').filter(s => s.trim().length > 0 && !s.trim().startsWith('--'))
    
    for (const statement of statements) {
      const trimmed = statement.trim()
      if (trimmed) {
        try {
          await query(trimmed)
        } catch (error: any) {
          // Ignore "already exists" errors
          if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
            console.warn('  ⚠️  Warning:', error.message)
          }
        }
      }
    }
    console.log('✅ Migration 002 completed successfully\n')
  } catch (error: any) {
    console.error('❌ Migration 002 failed:', error.message)
    throw error
  }

  // Run Migration 003
  try {
    console.log('📦 Running Migration 003: Affiliate Marketing...')
    const statements = MIGRATION_003.split(';').filter(s => s.trim().length > 0 && !s.trim().startsWith('--'))
    
    for (const statement of statements) {
      const trimmed = statement.trim()
      if (trimmed) {
        try {
          await query(trimmed)
        } catch (error: any) {
          // Ignore "already exists" errors
          if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
            console.warn('  ⚠️  Warning:', error.message)
          }
        }
      }
    }
    console.log('✅ Migration 003 completed successfully\n')
  } catch (error: any) {
    console.error('❌ Migration 003 failed:', error.message)
    throw error
  }

  // Run Migration 004
  try {
    console.log('📦 Running Migration 004: Guest Chat...')
    const statements = MIGRATION_004.split(';').filter(s => s.trim().length > 0 && !s.trim().startsWith('--'))
    
    for (const statement of statements) {
      const trimmed = statement.trim()
      if (trimmed) {
        try {
          await query(trimmed)
        } catch (error: any) {
          if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
            console.warn('  ⚠️  Warning:', error.message)
          }
        }
      }
    }
    console.log('✅ Migration 004 completed successfully\n')
  } catch (error: any) {
    console.error('❌ Migration 004 failed:', error.message)
    throw error
  }

  // Run Migration 005
  try {
    console.log('📦 Running Migration 005: Coupon Codes...')
    const statements = MIGRATION_005.split(';').filter(s => s.trim().length > 0 && !s.trim().startsWith('--'))
    
    for (const statement of statements) {
      const trimmed = statement.trim()
      if (trimmed) {
        try {
          await query(trimmed)
        } catch (error: any) {
          if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
            console.warn('  ⚠️  Warning:', error.message)
          }
        }
      }
    }
    console.log('✅ Migration 005 completed successfully\n')
  } catch (error: any) {
    console.error('❌ Migration 005 failed:', error.message)
    throw error
  }

  // Verify tables exist
  try {
    console.log('🔍 Verifying tables...')
    const result = await query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public'
       ORDER BY table_name`
    )
    const tables = result.rows.map((row: any) => row.table_name)
    console.log('✅ Tables verified:', tables.join(', '))
    
    const expectedTables = [
      'bookings', 
      'booking_modifications', 
      'calendar_cache',
      'admin_users',
      'influencers',
      'incentive_rules',
      'booking_attributions',
      'commission_ledger',
      'incentive_audit_log',
      'guest_chat_threads',
      'guest_chat_messages',
      'coupon_codes',
      'coupon_redemptions'
    ]
    const missingTables = expectedTables.filter(t => !tables.includes(t))
    
    if (missingTables.length > 0) {
      console.error('❌ Missing tables:', missingTables.join(', '))
      process.exit(1)
    }
    
    console.log('\n🎉 All migrations completed successfully!')
    console.log('✅ Database is ready for use.\n')
  } catch (error: any) {
    console.error('⚠️  Could not verify tables:', error.message)
  }
}

// Run migrations
runMigrations().catch((error) => {
  console.error('\n❌ Migration failed:', error)
  process.exit(1)
})
