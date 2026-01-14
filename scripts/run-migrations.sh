#!/bin/bash
# Database Migration Runner
# This script helps you run migrations in your database

echo "=========================================="
echo "Database Migration Helper"
echo "=========================================="
echo ""
echo "This script will help you copy migration SQL to your clipboard."
echo "Then you can paste it into your database SQL editor."
echo ""
echo "Which migration would you like to prepare?"
echo "1) Initial Schema (001_initial_schema.sql)"
echo "2) Calendar Reservations (002_add_calendar_reservations.sql)"
echo "3) Both migrations"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo ""
    echo "Copying Migration 001 to clipboard..."
    if command -v pbcopy &> /dev/null; then
      cat lib/db/migrations/001_initial_schema.sql | pbcopy
      echo "✅ Migration 001 copied to clipboard!"
      echo "Paste it into your database SQL editor and run it."
    else
      echo "Migration 001 content:"
      echo "=========================================="
      cat lib/db/migrations/001_initial_schema.sql
      echo "=========================================="
      echo "Copy the above SQL and paste it into your database SQL editor."
    fi
    ;;
  2)
    echo ""
    echo "Copying Migration 002 to clipboard..."
    if command -v pbcopy &> /dev/null; then
      cat lib/db/migrations/002_add_calendar_reservations.sql | pbcopy
      echo "✅ Migration 002 copied to clipboard!"
      echo "Paste it into your database SQL editor and run it."
    else
      echo "Migration 002 content:"
      echo "=========================================="
      cat lib/db/migrations/002_add_calendar_reservations.sql
      echo "=========================================="
      echo "Copy the above SQL and paste it into your database SQL editor."
    fi
    ;;
  3)
    echo ""
    echo "Copying both migrations to clipboard..."
    if command -v pbcopy &> /dev/null; then
      (cat lib/db/migrations/001_initial_schema.sql; echo ""; echo "-- Migration 002"; cat lib/db/migrations/002_add_calendar_reservations.sql) | pbcopy
      echo "✅ Both migrations copied to clipboard!"
      echo "Paste them into your database SQL editor and run them one at a time."
    else
      echo "Migration 001:"
      echo "=========================================="
      cat lib/db/migrations/001_initial_schema.sql
      echo ""
      echo "Migration 002:"
      echo "=========================================="
      cat lib/db/migrations/002_add_calendar_reservations.sql
      echo "=========================================="
      echo "Copy the above SQL and paste it into your database SQL editor."
    fi
    ;;
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

echo ""
echo "Next steps:"
echo "1. Open your database dashboard (Neon, Supabase, etc.)"
echo "2. Go to SQL Editor"
echo "3. Paste the migration SQL"
echo "4. Run/Execute it"
echo "5. Verify success"
echo ""
echo "After running migrations, verify with:"
echo "  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
echo ""
echo "You should see: bookings, booking_modifications, calendar_cache"
