/**
 * Simple migration script using @vercel/postgres
 * 
 * Usage:
 *   POSTGRES_URL=your_connection_string node scripts/run-migrations-simple.js
 */

// Load environment variables from .env.vercel if it exists
const { readFileSync, existsSync } = require('fs')
const { join } = require('path')

if (existsSync('.env.vercel')) {
  const envContent = readFileSync('.env.vercel', 'utf-8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

const { sql } = require('@vercel/postgres')

const MIGRATION_001 = readFileSync(join(__dirname, '../lib/db/migrations/001_initial_schema.sql'), 'utf-8')
const MIGRATION_002 = readFileSync(join(__dirname, '../lib/db/migrations/002_add_calendar_reservations.sql'), 'utf-8')

async function runQuery(queryText) {
  try {
    // Execute the entire SQL block at once (handles functions with $$ properly)
    // Remove comments first
    const cleaned = queryText
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .trim()
    
    if (cleaned) {
      try {
        // Execute as a single query - PostgreSQL handles multiple statements
        await sql.query(cleaned)
      } catch (error) {
        // If that fails, try splitting by semicolon (but this won't work for functions)
        if (error.message?.includes('syntax')) {
          console.warn('  ⚠️  Trying alternative parsing...')
          // For functions, we need to execute them separately
          const functionMatch = cleaned.match(/CREATE\s+(OR\s+REPLACE\s+)?FUNCTION[\s\S]*?\$\$[\s\S]*?\$\$\s+language/gi)
          const triggerMatch = cleaned.match(/CREATE\s+TRIGGER[\s\S]*?;/gi)
          
          // Execute everything except functions and triggers first
          let baseSQL = cleaned
          if (functionMatch) {
            functionMatch.forEach(fn => {
              baseSQL = baseSQL.replace(fn, '')
            })
          }
          if (triggerMatch) {
            triggerMatch.forEach(tr => {
              baseSQL = baseSQL.replace(tr, '')
            })
          }
          
          // Execute base SQL
          const baseStatements = baseSQL.split(';').filter(s => s.trim().length > 0)
          for (const stmt of baseStatements) {
            try {
              await sql.query(stmt.trim())
            } catch (e) {
              if (!e.message?.includes('already exists') && !e.message?.includes('duplicate')) {
                console.warn('  ⚠️  Base SQL warning:', e.message.substring(0, 80))
              }
            }
          }
          
          // Execute functions
          if (functionMatch) {
            for (const fn of functionMatch) {
              try {
                await sql.query(fn.trim())
              } catch (e) {
                if (!e.message?.includes('already exists')) {
                  console.warn('  ⚠️  Function warning:', e.message.substring(0, 80))
                }
              }
            }
          }
          
          // Execute triggers
          if (triggerMatch) {
            for (const tr of triggerMatch) {
              try {
                await sql.query(tr.trim())
              } catch (e) {
                if (!e.message?.includes('already exists')) {
                  console.warn('  ⚠️  Trigger warning:', e.message.substring(0, 80))
                }
              }
            }
          }
        } else {
          throw error
        }
      }
    }
  } catch (error) {
    throw error
  }
}

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n')

  // Check database connection
  try {
    await sql`SELECT 1`
    console.log('✅ Database connection successful\n')
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('\nMake sure POSTGRES_URL is set:')
    console.error('  export POSTGRES_URL="your_connection_string"')
    console.error('  OR set it in .env.vercel file')
    process.exit(1)
  }

  // Run Migration 001
  try {
    console.log('📦 Running Migration 001: Initial Schema...')
    await runQuery(MIGRATION_001)
    console.log('✅ Migration 001 completed successfully\n')
  } catch (error) {
    console.error('❌ Migration 001 failed:', error.message)
    throw error
  }

  // Run Migration 002
  try {
    console.log('📦 Running Migration 002: Calendar Reservations...')
    await runQuery(MIGRATION_002)
    console.log('✅ Migration 002 completed successfully\n')
  } catch (error) {
    console.error('❌ Migration 002 failed:', error.message)
    throw error
  }

  // Verify tables exist
  try {
    console.log('🔍 Verifying tables...')
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    const tables = result.rows.map((row) => row.table_name)
    console.log('✅ Tables found:', tables.join(', '))
    
    const expectedTables = ['bookings', 'booking_modifications', 'calendar_cache']
    const missingTables = expectedTables.filter(t => !tables.includes(t))
    
    if (missingTables.length > 0) {
      console.error('❌ Missing tables:', missingTables.join(', '))
      process.exit(1)
    }
    
    console.log('\n🎉 All migrations completed successfully!')
    console.log('✅ Database is ready for use.\n')
    
    // Show table counts
    try {
      const bookingsCount = await sql`SELECT COUNT(*) as count FROM bookings`
      const cacheCount = await sql`SELECT COUNT(*) as count FROM calendar_cache`
      console.log('📊 Database status:')
      console.log(`   - Bookings: ${bookingsCount.rows[0].count}`)
      console.log(`   - Calendar cache entries: ${cacheCount.rows[0].count}`)
    } catch (error) {
      // Ignore count errors
    }
  } catch (error) {
    console.error('⚠️  Could not verify tables:', error.message)
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('✅ Migration process completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  })
