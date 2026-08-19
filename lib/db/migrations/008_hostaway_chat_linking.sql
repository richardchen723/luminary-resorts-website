-- Migration 008: Safe Hostaway linking retries for guest chat threads

ALTER TABLE guest_chat_threads
ADD COLUMN IF NOT EXISTS hostaway_link_status VARCHAR(20) NOT NULL DEFAULT 'pending'
  CHECK (hostaway_link_status IN ('pending', 'linking', 'linked', 'failed'));

ALTER TABLE guest_chat_threads
ADD COLUMN IF NOT EXISTS hostaway_link_attempted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE guest_chat_threads
ADD COLUMN IF NOT EXISTS hostaway_link_error TEXT;

UPDATE guest_chat_threads
SET hostaway_link_status = 'linked',
    hostaway_link_error = NULL
WHERE hostaway_reservation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_guest_chat_threads_hostaway_link_retry
ON guest_chat_threads(hostaway_link_status, hostaway_link_attempted_at)
WHERE hostaway_reservation_id IS NULL;
