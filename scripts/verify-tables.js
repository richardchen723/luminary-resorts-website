/**
 * Verify database tables and structure
 */

const { sql } = require('@vercel/postgres')
const { readFileSync, existsSync } = require('fs')

// Load environment variables
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

async function verifyTables() {
  console.log('🔍 Verifying database structure...\n')

  try {
    // Check tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log('✅ Tables found:', tables.rows.map(r => r.table_name).join(', '))
    
    // Check bookings table structure
    console.log('\n📋 Bookings table columns:')
    const bookingsCols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position
    `
    bookingsCols.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`)
    })
    
    // Check calendar_cache has new columns
    console.log('\n📋 Calendar_cache table columns:')
    const cacheCols = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'calendar_cache'
      ORDER BY ordinal_position
    `
    cacheCols.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`)
    })
    
    // Verify minimum_stay and reservations columns exist
    const hasMinimumStay = cacheCols.rows.some(c => c.column_name === 'minimum_stay')
    const hasReservations = cacheCols.rows.some(c => c.column_name === 'reservations')
    
    console.log('\n✅ Verification Results:')
    console.log(`   - minimum_stay column: ${hasMinimumStay ? '✅' : '❌'}`)
    console.log(`   - reservations column: ${hasReservations ? '✅' : '❌'}`)
    
    // Check indexes
    console.log('\n📊 Indexes:')
    const indexes = await sql`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('bookings', 'calendar_cache', 'booking_modifications')
      ORDER BY tablename, indexname
    `
    indexes.rows.forEach(idx => {
      console.log(`   - ${idx.tablename}.${idx.indexname}`)
    })
    
    if (hasMinimumStay && hasReservations) {
      console.log('\n🎉 All migrations verified successfully!')
      console.log('✅ Database is fully configured and ready for use.')
    } else {
      console.log('\n⚠️  Some columns are missing. Please re-run migrations.')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  }
}

verifyTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
