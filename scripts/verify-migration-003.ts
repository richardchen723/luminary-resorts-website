/**
 * Verify Migration 003 tables were created
 */

import { query } from "../lib/db/client"
import { isDatabaseAvailable } from "../lib/db/client"

async function verifyMigration() {
  if (!isDatabaseAvailable()) {
    console.error("Database not available")
    process.exit(1)
  }

  const expectedTables = [
    "admin_users",
    "influencers",
    "incentive_rules",
    "booking_attributions",
    "commission_ledger",
    "incentive_audit_log",
  ]

  try {
    const result = await query<{ table_name: string }>(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public'
       ORDER BY table_name`
    )

    const existingTables = result.rows.map((row) => row.table_name)
    console.log("\n📊 All tables in database:")
    existingTables.forEach((table) => console.log(`  - ${table}`))

    console.log("\n✅ Checking Migration 003 tables:")
    let allPresent = true
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        console.log(`  ✅ ${table}`)
      } else {
        console.log(`  ❌ ${table} - MISSING`)
        allPresent = false
      }
    }

    // Check owner user
    console.log("\n✅ Checking owner user:")
    const ownerResult = await query<{ email: string; role: string; approval_status: string }>(
      "SELECT email, role, approval_status FROM admin_users WHERE email = 'yunhang.chen@gmail.com'"
    )
    if (ownerResult.rows.length > 0) {
      const owner = ownerResult.rows[0]
      console.log(`  ✅ Owner user exists: ${owner.email}`)
      console.log(`     Role: ${owner.role}`)
      console.log(`     Status: ${owner.approval_status}`)
    } else {
      console.log("  ❌ Owner user not found")
      allPresent = false
    }

    if (allPresent) {
      console.log("\n🎉 Migration 003 verification: SUCCESS")
      process.exit(0)
    } else {
      console.log("\n⚠️  Migration 003 verification: SOME TABLES MISSING")
      process.exit(1)
    }
  } catch (error: any) {
    console.error("Error verifying migration:", error)
    process.exit(1)
  }
}

verifyMigration()
