-- Migration 004: Guest chat threads and messages

CREATE TABLE IF NOT EXISTS guest_chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_token VARCHAR(255) UNIQUE NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  status VARCHAR(30) NOT NULL DEFAULT 'waiting_on_team'
    CHECK (status IN ('waiting_on_team', 'waiting_on_guest', 'closed', 'spam')),
  intent VARCHAR(30) NOT NULL DEFAULT 'general'
    CHECK (intent IN ('availability', 'cabin_question', 'special_request', 'general')),
  source_path TEXT,
  source_type VARCHAR(100),
  listing_slug VARCHAR(100),
  cabin_name VARCHAR(255),
  check_in DATE,
  check_out DATE,
  guests INTEGER,
  pets INTEGER,
  infants INTEGER,
  assigned_admin_user_id UUID REFERENCES admin_users(id),
  hostaway_reservation_id INTEGER,
  last_guest_read_at TIMESTAMP WITH TIME ZONE,
  last_staff_read_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guest_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES guest_chat_threads(id) ON DELETE CASCADE,
  author_type VARCHAR(20) NOT NULL
    CHECK (author_type IN ('guest', 'staff', 'system')),
  admin_user_id UUID REFERENCES admin_users(id),
  body TEXT NOT NULL,
  hostaway_message_id INTEGER,
  hostaway_sync_status VARCHAR(20) NOT NULL DEFAULT 'not_applicable'
    CHECK (hostaway_sync_status IN ('not_applicable', 'mirrored', 'failed')),
  hostaway_sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_chat_threads_guest_email
ON guest_chat_threads(guest_email);

CREATE INDEX IF NOT EXISTS idx_guest_chat_threads_status_updated
ON guest_chat_threads(status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_guest_chat_threads_assigned_admin
ON guest_chat_threads(assigned_admin_user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_guest_chat_threads_listing_slug
ON guest_chat_threads(listing_slug, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_guest_chat_messages_thread_created
ON guest_chat_messages(thread_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_guest_chat_messages_thread_author_created
ON guest_chat_messages(thread_id, author_type, created_at DESC);
