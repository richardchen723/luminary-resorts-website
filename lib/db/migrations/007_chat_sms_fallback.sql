-- Migration 007: Webchat presence and unread-reply SMS fallback

ALTER TABLE guest_chat_threads
ADD COLUMN IF NOT EXISTS webchat_opened_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE guest_chat_threads
ADD COLUMN IF NOT EXISTS webchat_last_seen_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE guest_chat_threads
ADD COLUMN IF NOT EXISTS webchat_closed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE guest_chat_messages
ADD COLUMN IF NOT EXISTS hostaway_communication_type VARCHAR(20);

ALTER TABLE guest_chat_messages
ADD COLUMN IF NOT EXISTS sms_fallback_message_id BIGINT;

ALTER TABLE guest_chat_messages
ADD COLUMN IF NOT EXISTS sms_fallback_status VARCHAR(20);

ALTER TABLE guest_chat_messages
ADD COLUMN IF NOT EXISTS sms_fallback_attempt_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE guest_chat_messages
ADD COLUMN IF NOT EXISTS sms_fallback_attempted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE guest_chat_messages
ADD COLUMN IF NOT EXISTS sms_fallback_sent_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE guest_chat_messages
ADD COLUMN IF NOT EXISTS sms_fallback_error TEXT;

CREATE INDEX IF NOT EXISTS idx_guest_chat_threads_webchat_presence
ON guest_chat_threads(webchat_last_seen_at, webchat_closed_at);

CREATE INDEX IF NOT EXISTS idx_guest_chat_messages_sms_fallback
ON guest_chat_messages(thread_id, created_at ASC)
WHERE author_type = 'staff' AND sms_fallback_sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_guest_chat_messages_hostaway_message
ON guest_chat_messages(thread_id, hostaway_message_id)
WHERE hostaway_message_id IS NOT NULL;
